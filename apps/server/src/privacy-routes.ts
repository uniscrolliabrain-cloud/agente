import { Hono } from "hono";
import { type PrivacyRequest, privacyRequestInput } from "../../../packages/domain/src/privacy.ts";
import type { Actor } from "../../../packages/domain/src/actor.ts";
import type { TenantScopedStore } from "./db-tenant.ts";
import { AppError } from "./errors.ts";

export const privacyRequestKind = "privacy-request";

export function privacyRoutes(store: TenantScopedStore) {
  const app = new Hono<{ Variables: { ctx: { owner: string; actor: Actor } } }>();

  app.use("*", async (c, next) => {
    const { actor, owner } = c.get("ctx");
    if (actor.kind !== "human" || !actor.active || actor.userId !== owner) {
      return c.json({ error: "Se requiere una cuenta personal" }, 403);
    }
    await next();
  });

  app.get("/requests", async (c) => {
    return c.json(await store.list<PrivacyRequest>(c.get("ctx").owner, privacyRequestKind));
  });

  app.post("/requests", async (c) => {
    const parsed = privacyRequestInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Solicitud no válida" }, 400);

    const owner = c.get("ctx").owner;
    const { id, type } = parsed.data;
    const now = new Date().toISOString();
    const inserted = await store.insertIfAbsent<PrivacyRequest>(owner, privacyRequestKind, {
      id, type, status: "received", createdAt: now, updatedAt: now,
    });
    if (inserted) return c.json(inserted, 201);

    const existing = await store.get<PrivacyRequest>(owner, privacyRequestKind, id);
    if (!existing || existing.type !== type) throw new AppError("Identificador usado en otra solicitud", 409);
    return c.json(existing);
  });

  return app;
}
