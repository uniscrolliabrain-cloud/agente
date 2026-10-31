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
import { TenantScopedStore } from "./db-tenant.ts";
import { AppError } from "./errors.ts";
import { RateLimiter } from "./rate-limit.ts";
import { currentTenantScope, runInTenantScope } from "./tenant-scope.ts";
import { WhatsAppOutbound, whatsappApprovalInput, type OutboundIdentity } from "./engine/whatsapp-outbound.ts";
import { bindingFor, enqueueIncoming, extractIncomingMessages, validateBinding, whatsappBindings, type InboundService, type WhatsAppProvider } from "./engine/whatsapp-inbound.ts";

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

/** Each approval names the exact revision and uses a tenant-scoped durable decision. */
export function whatsappRoutes(service: Pick<AgentService, "db" | "config" | "tenantService">) {
  const app = new Hono<{ Variables: { owner: string; outboundIdentity: OutboundIdentity } }>();
  app.use("*", async (c, next) => {
    const owner = c.get("owner");
    if (!owner) throw new AppError("Sesion requerida", 401);
    if (!(service.db instanceof TenantScopedStore)) throw new AppError("WhatsApp requiere almacenamiento aislado por empresa", 503);
    const scope = currentTenantScope();
    let tenantId = scope?.tenantId;
    if (scope && scope.actorId !== owner) throw new AppError("Actor de aprobacion no valido", 403);
    if (!tenantId) {
      // Session mode must have an explicit, unambiguous membership; never use the default resolver.
      const memberships = await service.tenantService?.membershipsFor(owner) ?? [];
      const tenants = [...new Set(memberships.map((m) => m.tenantId))];
      if (tenants.length !== 1) throw new AppError("Selecciona una empresa con una sesion autorizada", 409);
      tenantId = tenants[0];
    }
    const identity = { tenantId, owner, actorId: owner };
    c.set("outboundIdentity", identity);
    await runInTenantScope({ tenantId, actorId: owner }, next);
  });
  const outbound = () => new WhatsAppOutbound(service.db, {
    encryptionKey: service.config.encryptionKey,
    enabled: service.config.mode === "live" && process.env.WHATSAPP_OUTBOUND_ENABLED === "true",
  });
  app.get("/inbox", async (c) => c.json({ messages: await outbound().inbox(c.get("outboundIdentity")) }));
  app.post("/inbox/:id/draft", async (c) => {
    const body = await c.req.json().catch(() => { throw new AppError("JSON de respuesta requerido", 422); });
    const draft = await outbound().createReply(c.get("outboundIdentity"), c.req.param("id"), body, c.req.header("Idempotency-Key") ?? "");
    return c.json({ draft }, 201);
  });
  app.get("/connection", async (c) => c.json(await outbound().connectionStatus(c.get("outboundIdentity"))));
  app.get("/drafts", async (c) => c.json({ drafts: await outbound().drafts(c.get("outboundIdentity")) }));
  app.post("/drafts", async (c) => {
    const body = await c.req.json().catch(() => { throw new AppError("JSON no valido", 400); });
    const draft = await outbound().createDraft(c.get("outboundIdentity"), body, c.req.header("Idempotency-Key") ?? "");
    return c.json({ draft }, 201);
  });
  app.post("/drafts/:id/send", async (c) => {
    const body = await c.req.json().catch(() => { throw new AppError("JSON de aprobacion requerido", 422); });
    const approval = whatsappApprovalInput.safeParse(body);
    if (!approval.success) throw new AppError("La aprobacion requiere la revision exacta del borrador", 422);
    const result = await outbound().approve(c.get("outboundIdentity"), c.req.param("id"), approval.data.revision);
    return c.json(result, result.status === "dispatching" ? 202 : 200);
  });
  app.post("/drafts/:id/reject", async (c) => {
    const body = await c.req.json().catch(() => { throw new AppError("JSON de aprobacion requerido", 422); });
    const approval = whatsappApprovalInput.safeParse(body);
    if (!approval.success) throw new AppError("El rechazo requiere la revision exacta del borrador", 422);
    return c.json(await outbound().reject(c.get("outboundIdentity"), c.req.param("id"), approval.data.revision));
  });
  app.post("/drafts/:id/reconcile", async (c) => {
    const body = await c.req.json().catch(() => { throw new AppError("JSON de reconciliacion requerido", 422); });
    return c.json(await outbound().reconcile(c.get("outboundIdentity"), c.req.param("id"), body));
  });
  return app;
}
