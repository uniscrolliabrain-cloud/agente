// BILLING_ROUTES_V1 - Stripe webhook con verificacion de firma.

import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { backgroundFailure } from "./log.ts";

const stripeEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({ object: z.record(z.string(), z.unknown()) }),
});

export function billingRoutes(db: Store) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // POST /api/billing/webhook - recibe eventos de Stripe.
  app.post("/webhook", async (c) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new AppError("STRIPE_WEBHOOK_SECRET no configurado", 503);
    const signature = c.req.header("stripe-signature");
    if (!signature) throw new AppError("Missing Stripe-Signature", 401);

    const raw = await c.req.text();
    // Verificacion simplificada: el header contiene t=...,v1=...
    const parts = Object.fromEntries(signature.split(",").map((p) => p.split("=") as [string, string]));
    const timestamp = parts.t;
    const provided = parts.v1;
    if (!timestamp || !provided) throw new AppError("Malformed signature", 401);

    const payload = `${timestamp}.${raw}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (
      expected.length !== provided.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
    ) {
      throw new AppError("Signature mismatch", 403);
    }

    let parsed: z.infer<typeof stripeEventSchema>;
    try {
      parsed = stripeEventSchema.parse(JSON.parse(raw));
    } catch {
      throw new AppError("Invalid event payload", 400);
    }

    // Dedupe por event.id.
    const existing = await db.get<{ id: string }>("system", "stripe-events", parsed.id);
    if (existing) return c.json({ ok: true, deduped: true });

    await db.put("system", "stripe-events", {
      id: parsed.id,
      type: parsed.type,
      receivedAt: new Date().toISOString(),
      data: parsed.data.object,
    });

    return c.json({ ok: true });
  });

  // GET /api/billing/invoices?customerId=cus_...
  app.get("/invoices", async (c) => {
    const customerId = c.req.query("customerId");
    if (!customerId) throw new AppError("customerId required", 422);
    const events = await db
      .list<{ type: string; data: Record<string, unknown> }>("system", "stripe-events")
      .catch(() => []);
    const invoices = events
      .filter((e) => e.type === "invoice.paid" || e.type === "invoice.payment_failed")
      .map((e) => e.data)
      .filter((i) => i.customer === customerId);
    void backgroundFailure; // usado solo si falla mas arriba
    return c.json({ invoices });
  });

  return app;
}