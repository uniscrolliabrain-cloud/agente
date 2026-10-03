// WHATSAPP_ROUTES_V1 - aprobacion y envio de WhatsApp.

import { createHash } from "node:crypto";
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

  // POST /api/whatsapp/webhook -> recibe de Evolution.
  app.post("/webhook", async (c) => {
    const expected = process.env.WHATSAPP_WEBHOOK_SECRET;
    const signature = c.req.header("x-hub-signature-256") ?? c.req.header("x-signature");
    if (expected) {
      const raw = await c.req.text();
      const hmac = createHash("sha256").update(raw + expected).digest("hex");
      if (signature !== `sha256=${hmac}` && signature !== hmac) {
        throw new AppError("Invalid webhook signature", 401);
      }
    }
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