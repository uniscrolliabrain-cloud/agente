// WHATSAPP_ROUTES_V1 - aprobacion y envio de WhatsApp.
//
// WHATSAPP_WEBHOOK_PUBLIC_V1 - este fichero exporta DOS routers porque tienen dos
// publicos distintos, y esa separacion es el punto:
//   whatsappWebhookRoutes -> lo llama el proveedor (Meta / Evolution), que no
//     puede mandar un Bearer. Se monta en app.ts ANTES del middleware de auth y
//     su unica autenticacion es la firma HMAC del cuerpo.
//   whatsappRoutes        -> lo llama el panel. Requiere owner autenticado.
// Antes el webhook vivia dentro de whatsappRoutes, es decir detras del middleware
// de auth: en produccion Meta recibia 401 y el canal estaba muerto.

import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { AgentService } from "./engine/service.ts";
import { AppError } from "./errors.ts";
import { RateLimiter } from "./rate-limit.ts";

// WHATSAPP_TIMING_SAFE_V1 - comparacion sin filtrar el resultado por tiempo.
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a.trim());
  const right = Buffer.from(b.trim());
  return left.length === right.length && timingSafeEqual(left, right);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export interface IncomingWhatsApp {
  id: string;
  from: string;
  text: string;
}

/**
 * WHATSAPP_INBOUND_SHAPES_V1 - extrae el primer mensaje de texto de las dos formas
 * que llegan de verdad:
 *   Meta Cloud API: entry[].changes[].value.messages[] -> { from, id, text.body }
 *   Evolution API:  data.key.remoteJid + data.message.conversation
 * Devuelve null para todo lo que no sea un mensaje (statuses, acuses, JSON raro):
 * el webhook responde 200 e ignora, porque un 4xx hace que Meta reintente.
 */
export function extractIncomingMessage(body: unknown): IncomingWhatsApp | null {
  const root = asRecord(body);
  if (!root) return null;
  const entries = root.entry;
  if (Array.isArray(entries)) {
    for (const rawEntry of entries) {
      const changes = asRecord(rawEntry)?.changes;
      if (!Array.isArray(changes)) continue;
      for (const rawChange of changes) {
        const messages = asRecord(asRecord(rawChange)?.value)?.messages;
        if (!Array.isArray(messages)) continue;
        for (const rawMessage of messages) {
          const message = asRecord(rawMessage);
          if (!message) continue;
          const from = message.from;
          const text = asRecord(message.text)?.body;
          if (typeof from !== "string" || typeof text !== "string" || !text) continue;
          const id = message.id;
          return { id: typeof id === "string" && id ? id : `meta:${from}`, from, text };
        }
      }
    }
    return null;
  }
  const data = asRecord(root.data);
  const key = asRecord(data?.key);
  const message = asRecord(data?.message);
  const from = key?.remoteJid;
  const text = message?.conversation ?? asRecord(message?.extendedTextMessage)?.text;
  if (typeof from !== "string" || typeof text !== "string" || !text) return null;
  const id = key?.id;
  return { id: typeof id === "string" && id ? id : `evolution:${from}`, from, text };
}

/**
 * Router publico del proveedor. No lee c.get("owner") porque no hay sesion: la
 * firma HMAC es toda la autenticacion, y sin WHATSAPP_APP_SECRET falla cerrado.
 */
export function whatsappWebhookRoutes(service: AgentService) {
  const app = new Hono();
  // Endpoint publico: 30 llamadas por minuto y por IP.
  const limiter = new RateLimiter(30, 60_000);

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
    const address = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!limiter.take(address).allowed) throw new AppError("Too many webhook calls", 429);
    const raw = await c.req.text();
    const signature = c.req.header("x-hub-signature-256") ?? c.req.header("x-signature");
    if (!signature) throw new AppError("Missing webhook signature", 401);
    // Meta manda hex con prefijo sha256=; Evolution manda base64. Se aceptan las dos.
    const digest = createHmac("sha256", expected).update(raw).digest();
    const provided = signature.replace(/^sha256=/, "");
    const valid = (["hex", "base64"] as const).some((encoding) =>
      safeEqual(provided, digest.toString(encoding)),
    );
    if (!valid) throw new AppError("Invalid webhook signature", 401);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return c.json({ ok: true, ignored: true });
    }
    const incoming = extractIncomingMessage(parsed);
    if (!incoming) return c.json({ ok: true, ignored: true });
    // Crea una tarea de SOP para responder. El owner es "system" (no hay sesion).
    const task = await service.createTask("system", {
      kind: "sop",
      prompt: `Responder WhatsApp de ${incoming.from}: ${incoming.text.slice(0, 200)}`,
      input: {
        sopId: "responder-whatsapp",
        from: incoming.from,
        text: incoming.text,
        providerMessageId: incoming.id,
      },
    });
    return c.json({ ok: true, taskId: task.id });
  });

  return app;
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
  app.post("/drafts/:id/send", async (c) => {
    const owner = c.get("owner");
    const id = c.req.param("id");
    const draft = await service.db.get<{ id: string; to: string; text: string; status: string }>(
      owner,
      "whatsapp-drafts",
      id,
    );
    if (!draft) throw new AppError("Draft not found", 404);
    if (draft.status !== "awaiting_review") throw new AppError("Draft already resolved", 409);
    if (!service.whatsapp.configured) throw new AppError("WhatsApp no configurado", 503);
    try {
      const result = await service.whatsapp.sendText(draft.to, draft.text);
      await service.db.put(owner, "whatsapp-drafts", {
        ...draft,
        status: result.accepted ? "sent" : "failed",
        sentAt: new Date().toISOString(),
        providerId: result.id,
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
