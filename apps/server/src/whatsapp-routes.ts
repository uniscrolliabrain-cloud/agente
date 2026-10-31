// WHATSAPP_ROUTES_V1 - aprobacion y envio de WhatsApp.
//
// WHATSAPP_WEBHOOK_PUBLIC_V1 - este fichero exporta DOS routers porque tienen dos
// publicos distintos, y esa separacion es el punto:
//   whatsappWebhookRoutes -> lo llama el proveedor (Meta / Evolution), que no
//     puede mandar un Bearer. Se monta en app.ts ANTES del middleware de auth y
//     Meta usa HMAC del cuerpo; Evolution una cabecera dedicada por instancia.
//   whatsappRoutes        -> lo llama el panel. Requiere owner autenticado.
// Antes el webhook vivia dentro de whatsappRoutes, es decir detras del middleware
// de auth: en produccion Meta recibia 401 y el canal estaba muerto.

import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { AgentService } from "./engine/service.ts";
import { AppError } from "./errors.ts";
import { RateLimiter } from "./rate-limit.ts";
import { currentTenantScope, runInTenantScope } from "./tenant-scope.ts";
import { bindingFor, enqueueIncoming, extractIncomingMessages, validateBinding, whatsappBindings, type InboundService, type WhatsAppProvider } from "./engine/whatsapp-inbound.ts";
import { outboundClient, resolveOutboundChannel } from "./engine/whatsapp-outbound.ts";

// WHATSAPP_TIMING_SAFE_V1 - comparacion sin filtrar el resultado por tiempo.
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a.trim());
  const right = Buffer.from(b.trim());
  return left.length === right.length && timingSafeEqual(left, right);
}

export interface IncomingWhatsApp {
  id: string;
  from: string;
  text: string;
}

/** Compatibility helper; ingress always processes the entire validated batch. */
export function extractIncomingMessage(body: unknown): IncomingWhatsApp | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  try {
    const provider = "entry" in body ? "meta" : "evolution";
    const first = extractIncomingMessages(body, provider)[0];
    return first ? { id: first.id, from: first.from, text: first.text } : null;
  } catch {
    return null;
  }
}

/**
 * Router publico del proveedor. No lee c.get("owner") porque no hay sesion: la
 * autenticacion del proveedor es obligatoria antes de crear tareas.
 */
export function whatsappWebhookRoutes(service: InboundService) {
  const app = new Hono();
  // Limite por cuenta de proveedor autenticada: 120 llamadas por minuto.
  const limiter = new RateLimiter(120, 60_000);

  // GET /api/whatsapp/webhook -> handshake de la Cloud API de Meta.
  // Meta llama con hub.mode=subscribe y espera el hub.challenge en texto plano.
  app.get("/webhook", (c) => {
    const verifyToken =
      process.env.WHATSAPP_VERIFY_TOKEN?.trim() || process.env.WHATSAPP_WEBHOOK_TOKEN?.trim();
    if (!verifyToken)
      throw new AppError("WhatsApp webhook no esta configurado (falta WHATSAPP_VERIFY_TOKEN)", 503);
    const provided = c.req.query("hub.verify_token") ?? "";
    if (c.req.query("hub.mode") !== "subscribe" || !provided || !safeEqual(provided, verifyToken))
      throw new AppError("Invalid verify token", 403);
    return c.text(c.req.query("hub.challenge") ?? "");
  });

  // POST /api/whatsapp/webhook -> mensajes entrantes.
  // WHATSAPP_WEBHOOK_HMAC_V2 - la version anterior leia WHATSAPP_WEBHOOK_SECRET (un
  // nombre que no existia en .env.example ni en secrets-check), calculaba
  // sha256(cuerpo + secreto) — que no es la firma de Meta — y comparaba con !==.
  app.post("/webhook", async (c) => {
    const expected = process.env.WHATSAPP_APP_SECRET?.trim();
    if (!expected)
      throw new AppError("WhatsApp webhook no configurado (falta WHATSAPP_APP_SECRET)", 503);
    const raw = Buffer.from(await c.req.arrayBuffer());
    const signature = c.req.header("x-hub-signature-256");
    if (!signature) throw new AppError("Missing webhook signature", 401);
    const digest = `sha256=${createHmac("sha256", expected).update(raw).digest("hex")}`;
    if (!/^sha256=[a-f0-9]{64}$/.test(signature) || !safeEqual(signature, digest)) throw new AppError("Invalid webhook signature", 401);
    return c.json(await receive(JSON.parse(raw.toString("utf8")), "meta"));
  });

  // Evolution uses a configured per-instance custom header, NOT Meta's GET token
  // and NOT a presumed native base64 HMAC. Only inbound upserts are admitted.
  app.post("/incoming", async (c) => {
    const body: unknown = await c.req.json();
    const instance = body && typeof body === "object" && "instance" in body ? body.instance : undefined;
    if (typeof instance !== "string") throw new AppError("Evolution: instance requerida", 422);
    const binding = bindingFor(whatsappBindings(), "evolution", instance);
    const expected = binding.secretEnv ? process.env[binding.secretEnv]?.trim() : undefined;
    if (!expected || expected.length < 32) throw new AppError("Configura un secreto dedicado de Evolution de al menos 32 caracteres", 503);
    if (!safeEqual(c.req.header("x-webhook-secret") ?? "", expected)) throw new AppError("Invalid webhook secret", 401);
    return c.json(await receive(body, "evolution"));
  });

  async function receive(body: unknown, provider: WhatsAppProvider) {
    const messages = extractIncomingMessages(body, provider);
    if (!messages.length) return { ok: true, ignored: true, taskIds: [] };
    const bindings = whatsappBindings();
    const selected = messages.map((m) => ({ message: m, binding: bindingFor(bindings, provider, m.accountId) }));
    const channels = new Map(selected.map(({ binding }) => [JSON.stringify([provider, binding.accountId]), binding]));
    // Validate the whole batch before any inbox/task write; known tasks are not
    // acknowledged as delivered/sent, only durably queued for the configured SOP.
    for (const [key, binding] of channels) {
      if (!limiter.take(key).allowed) throw new AppError("Too many webhook calls", 429);
      await runInTenantScope({ tenantId: binding.tenantId, actorId: binding.owner }, () => validateBinding(service, binding));
    }
    const taskIds: string[] = [];
    for (const { message, binding } of selected) {
      taskIds.push(await runInTenantScope({ tenantId: binding.tenantId, actorId: binding.owner }, () => enqueueIncoming(service, binding, message)));
    }
    return { ok: true, status: "queued", taskId: taskIds[0], taskIds };
  }

  return app;
}

export interface WhatsAppDraft {
  id: string;
  to: string;
  text: string;
  status: string;
  /** Canal por el que debe salir. Ausente = unico canal de la empresa. */
  channelId?: string;
  tenantId?: string;
  providerId?: string;
  sentAt?: string;
  resolvedAt?: string;
  error?: string;
}

/** Router autenticado del panel: aprobacion de borradores. */
export function whatsappRoutes(service: AgentService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // GET /api/whatsapp/drafts -> drafts pendientes.
  app.get("/drafts", async (c) => {
    const owner = c.get("owner");
    const drafts = await service.db.list<{ id: string; to: string; text: string; status: string }>(
      owner,
      "whatsapp-drafts",
    );
    return c.json({ drafts });
  });

  // POST /api/whatsapp/drafts/:id/send -> aprueba y envia.
  //
  // WHATSAPP_DRAFT_CHANNEL_SEND_V1: antes se usaba `service.whatsapp`, el cliente
  // global del proceso. Con dos empresas eso respondia por el numero de la
  // empresa equivocada. Ahora el canal se resuelve con el tenant de la peticion
  // (runInTenantScope, app.ts:651) y el `channelId` del borrador.
  app.post("/drafts/:id/send", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const draft = await service.db.get<WhatsAppDraft>(owner, "whatsapp-drafts", id);
    if (!draft) throw new AppError("Draft not found", 404);
    if (draft.status !== "awaiting_review") throw new AppError("Draft already resolved", 409);
    const tenantId =
      currentTenantScope()?.tenantId ?? (await service.tenantService?.tenantIdFor(owner));
    if (!tenantId) throw new AppError("No se pudo resolver la empresa del borrador", 503);
    // Resolver antes del envio: un canal ajeno o no provisionado no debe
    // marcar el borrador como fallido, porque el mensaje nunca salio.
    const channel = resolveOutboundChannel(tenantId, draft.channelId);
    // Credenciales y forma del canal fuera del try: si faltan, el mensaje no
    // salio y el borrador no puede quedar "failed", solo pendiente.
    const sender = outboundClient(channel);
    try {
      const result = await sender.sendText(draft.to, draft.text);
      await service.db.put(owner, "whatsapp-drafts", {
        ...draft,
        status: result.accepted ? "sent" : "failed",
        sentAt: new Date().toISOString(),
        providerId: result.id,
        channelId: channel.accountId,
        tenantId,
      });
      return c.json({ ok: true, result });
    } catch (error) {
      // OutcomeUnknownError: la peticion pudo haber salido.
      const unknown = error instanceof Error && /outcome|network|timeout/i.test(error.message);
      await service.db.put(owner, "whatsapp-drafts", {
        ...draft,
        status: unknown ? "outcome_unknown" : "failed",
        error: error instanceof Error ? error.message : "unknown",
        resolvedAt: new Date().toISOString(),
      });
      throw error;
    }
  });

  // POST /api/whatsapp/drafts/:id/reject -> deniega.
  app.post("/drafts/:id/reject", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const draft = await service.db.get<{ status: string }>(owner, "whatsapp-drafts", id);
    if (!draft) throw new AppError("Draft not found", 404);
    await service.db.put(owner, "whatsapp-drafts", { ...draft, id, status: "rejected" });
    return c.json({ ok: true });
  });

  return app;
}
