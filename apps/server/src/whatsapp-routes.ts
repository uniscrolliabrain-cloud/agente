// WHATSAPP_ROUTES_V1 - aprobacion y envio de WhatsApp.

import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { AgentService } from "./engine/service.ts";
import { AppError } from "./errors.ts";

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

  // POST /api/whatsapp/webhook -> recibe de Evolution o de la Cloud API de Meta.
  // WHATSAPP_WEBHOOK_HMAC_V1
  //
  // WHATSAPP_WEBHOOK_HMAC_V2 - tres fallos de la version anterior:
  //  1. leia WHATSAPP_WEBHOOK_SECRET, un nombre que no aparece en .env.example ni en
  //     secrets-check. El usuario configuraba WHATSAPP_APP_SECRET (el documentado) y
  //     `expected` quedaba undefined: el webhook aceptaba cualquier peticion.
  //  2. calculaba sha256(raw + secret), que no es la firma que envia Meta
  //     (HMAC-SHA256 con el app secret como clave). Nunca habria validado nada.
  //  3. comparaba con !==, filtrando el resultado por tiempo.
  // Ahora: nombre documentado, firma real y fail-closed sin secreto.
  app.post("/webhook", async (c) => {
    const expected =
      process.env.WHATSAPP_APP_SECRET?.trim() || process.env.WHATSAPP_WEBHOOK_SECRET?.trim();
    if (!expected)
      throw new AppError("WhatsApp webhook no configurado (falta WHATSAPP_APP_SECRET)", 503);
    const raw = await c.req.text();
    const signature = c.req.header("x-hub-signature-256") ?? c.req.header("x-signature");
    if (!signature) throw new AppError("Missing webhook signature", 401);
    // Meta manda hex; Evolution manda base64. Se aceptan las dos formas.
    const digest = createHmac("sha256", expected).update(raw).digest();
    const provided = signature.replace(/^sha256=/, "").trim();
    const candidates = [digest.toString("hex"), digest.toString("base64")];
    const providedBuf = Buffer.from(provided);
    const match = candidates.some((candidate) => {
      const buf = Buffer.from(candidate);
      return providedBuf.length === buf.length && timingSafeEqual(providedBuf, buf);
    });
    if (!match) throw new AppError("Invalid webhook signature", 401);
    const body = await c.req.json().catch(() => ({}));
    const from = (body as { data?: { key?: { remoteJid?: string }; message?: { conversation?: string } } }).data?.key?.remoteJid;
    const text = (body as { data?: { message?: { conversation?: string } } }).data?.message?.conversation;
    if (!from || !text) return c.json({ ok: true, ignored: true });
    // Crea una tarea de SOP para responder.
    const task = await service.createTask("system", {
      kind: "sop",
      prompt: `Responder WhatsApp de ${from}: ${text.slice(0, 200)}`,
      input: { sopId: "responder-whatsapp", from, text },
    });
    return c.json({ ok: true, taskId: task.id });
  });

  return app;
}