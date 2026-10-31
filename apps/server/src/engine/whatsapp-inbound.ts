import { createHash } from "node:crypto";
import { z } from "zod";
import { sopSchema } from "../../../../packages/domain/src/sop.ts";
import { AppError } from "../errors.ts";
import type { AgentService } from "./service.ts";

export type WhatsAppProvider = "meta" | "evolution";
export interface IncomingWhatsApp {
  provider: WhatsAppProvider;
  accountId: string;
  id: string;
  from: string;
  text: string;
}

const bindingSchema = z.object({
  provider: z.enum(["meta", "evolution"]),
  accountId: z.string().trim().min(1).max(200),
  tenantId: z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_-]+$/),
  owner: z.string().trim().min(1).max(200).refine((v) => v !== "system" && !v.includes(":")),
  sopId: z.string().trim().min(1).max(200),
  secretEnv: z.string().regex(/^WHATSAPP_[A-Z0-9_]+$/).optional(),
  // WHATSAPP_CHANNEL_CREDENTIAL_ENV_V1: nombre de la variable con la apikey de ESTE
  // canal. Antes toda respuesta salia con la WHATSAPP_API_KEY global, es decir
  // por la instancia del proceso y no por la del tenant del borrador. Es el
  // nombre, nunca el valor: el binding es configuracion, no un almacen de claves.
  apiKeyEnv: z.string().regex(/^WHATSAPP_[A-Z0-9_]+$/).optional(),
}).superRefine((b, ctx) => {
  if (b.provider === "evolution" && (!b.secretEnv || ["WHATSAPP_VERIFY_TOKEN", "WHATSAPP_WEBHOOK_TOKEN", "WHATSAPP_APP_SECRET"].includes(b.secretEnv))) {
    ctx.addIssue({ code: "custom", message: "Evolution requires a dedicated secretEnv" });
  }
  // Un mismo secreto no puede autenticar la entrada del proveedor y la salida
  // hacia el proveedor: reutilizarlo filtra uno de los dos usos.
  if (b.apiKeyEnv && (["WHATSAPP_VERIFY_TOKEN", "WHATSAPP_WEBHOOK_TOKEN", "WHATSAPP_APP_SECRET", "WHATSAPP_WEBHOOK_SECRET"].includes(b.apiKeyEnv) || b.apiKeyEnv === b.secretEnv)) {
    ctx.addIssue({ code: "custom", message: "apiKeyEnv must be a dedicated outbound credential" });
  }
});
export type WhatsAppBinding = z.infer<typeof bindingSchema>;

// WHATSAPP_BINDINGS_V1: trusted operator configuration, never inferred from sender.
export function whatsappBindings(): WhatsAppBinding[] {
  try {
    const bindings = z.array(bindingSchema).min(1).max(200).parse(JSON.parse(process.env.WHATSAPP_WEBHOOK_BINDINGS ?? "[]"));
    const channels = new Set<string>();
    const ownerTenants = new Map<string, string>();
    for (const b of bindings) {
      const channel = JSON.stringify([b.provider, b.accountId]);
      if (channels.has(channel)) throw new Error("duplicate channel");
      channels.add(channel);
      // This pilot uses a dedicated primary owner per tenant. Do not pretend the
      // background worker already supports one principal across several tenants.
      const previous = ownerTenants.get(b.owner);
      if (previous && previous !== b.tenantId) throw new Error("ambiguous execution owner");
      ownerTenants.set(b.owner, b.tenantId);
    }
    return bindings;
  } catch {
    throw new AppError("Configura WHATSAPP_WEBHOOK_BINDINGS con canales y responsables no ambiguos", 503);
  }
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function required(value: unknown, name: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new AppError(`WhatsApp: ${name} invalido`, 422);
  return value;
}

// WHATSAPP_BATCH_V1: validate the full supported batch before acknowledging it.
export function extractIncomingMessages(body: unknown, provider: WhatsAppProvider): IncomingWhatsApp[] {
  const root = record(body);
  if (!root) throw new AppError("WhatsApp: objeto JSON requerido", 422);
  const messages: IncomingWhatsApp[] = [];
  if (provider === "meta") {
    if (!Array.isArray(root.entry)) return [];
    for (const entry of root.entry) {
      const changes = record(entry)?.changes;
      if (!Array.isArray(changes)) continue;
      for (const change of changes) {
        const value = record(record(change)?.value);
        if (!Array.isArray(value?.messages)) continue;
        for (const raw of value.messages) {
          const msg = record(raw);
          if (!msg) throw new AppError("WhatsApp: mensaje invalido", 422);
          // Media/status processing is outside this text-only ingress.
          if (msg.type !== undefined && msg.type !== "text") continue;
          if (!record(msg.text)) continue;
          messages.push({
            provider,
            accountId: required(record(value.metadata)?.phone_number_id, "phone_number_id", 200),
            id: required(msg.id, "message id", 300),
            from: required(msg.from, "from", 200),
            text: required(record(msg.text)?.body, "text", 10000),
          });
        }
      }
    }
  } else {
    if (root.event !== "messages.upsert" && root.event !== "MESSAGES_UPSERT") return [];
    const accountId = required(root.instance, "instance", 200);
    for (const raw of Array.isArray(root.data) ? root.data : [root.data]) {
      const data = record(raw), key = record(data?.key), msg = record(data?.message);
      if (key?.fromMe === true) continue;
      const text = msg?.conversation ?? record(msg?.extendedTextMessage)?.text;
      if (text === undefined) continue;
      const from = required(key?.remoteJid, "remoteJid", 200);
      if (!from.endsWith("@s.whatsapp.net")) continue; // no group/self loops
      messages.push({ provider, accountId, id: required(key?.id, "message id", 300), from, text: required(text, "text", 10000) });
    }
  }
  if (messages.length > 100) throw new AppError("WhatsApp: lote demasiado grande", 413);
  return messages;
}

export function bindingFor(bindings: WhatsAppBinding[], provider: WhatsAppProvider, accountId: string): WhatsAppBinding {
  const binding = bindings.find((b) => b.provider === provider && b.accountId === accountId);
  if (!binding) throw new AppError("Canal WhatsApp no autorizado", 403);
  return binding;
}

export type InboundService = Pick<AgentService, "db" | "tenantService" | "createTask">;
interface InboxRecord extends IncomingWhatsApp {
  id: string;
  providerMessageId: string;
  tenantId: string;
  owner: string;
  sopId: string;
  status: "received" | "queued";
  receivedAt: string;
  taskId?: string;
}

export async function validateBinding(service: InboundService, binding: WhatsAppBinding): Promise<void> {
  if (!service.tenantService || await service.tenantService.tenantIdFor(binding.owner) !== binding.tenantId) {
    throw new AppError("El responsable WhatsApp no tiene este tenant primario; configura un responsable dedicado", 503);
  }
  const sop = sopSchema.safeParse(await service.db.get(binding.owner, "sops", binding.sopId));
  if (!sop.success || !sop.data.active) throw new AppError("La SOP del canal WhatsApp no esta provisionada y activa", 503);
}

// WHATSAPP_DURABLE_INBOX_V1: no in-memory replay cache, no destructive claim.
// A crash after inbox persistence or task creation is repaired by redelivery.
// createTask's atomic insert uses this stable operation id across all retries.
export async function enqueueIncoming(service: InboundService, binding: WhatsAppBinding, message: IncomingWhatsApp): Promise<string> {
  const id = createHash("sha256").update(JSON.stringify([binding.tenantId, binding.owner, message.provider, message.accountId, message.id])).digest("hex");
  const candidate: InboxRecord = {
    ...message,
    id,
    providerMessageId: message.id,
    tenantId: binding.tenantId,
    owner: binding.owner,
    sopId: binding.sopId,
    status: "received",
    receivedAt: new Date().toISOString(),
  };
  const inserted = await service.db.insertIfAbsent(binding.owner, "whatsapp-inbox", candidate);
  const inbox = inserted ?? await service.db.get<InboxRecord>(binding.owner, "whatsapp-inbox", id);
  if (!inbox) throw new AppError("No se pudo persistir el mensaje WhatsApp", 503);
  if (inbox.status === "queued" && inbox.taskId) return inbox.taskId;
  const task = await service.createTask(binding.owner, {
    kind: "sop",
    prompt: `Responder WhatsApp de ${inbox.from}: ${inbox.text.slice(0, 200)}`,
    input: {
      sopId: inbox.sopId,
      from: inbox.from,
      text: inbox.text,
      provider: inbox.provider,
      channelId: inbox.accountId,
      providerMessageId: inbox.providerMessageId,
      inboxId: id,
    },
  }, `whatsapp-inbound:${id}`);
  if (task.tenantId !== binding.tenantId) throw new AppError("La tarea WhatsApp no pertenece al tenant del canal", 503);
  await service.db.compareAndSwap<InboxRecord>(binding.owner, "whatsapp-inbox", id, { status: "received" }, {
    status: "queued", taskId: task.id,
  });
  return task.id;
}
