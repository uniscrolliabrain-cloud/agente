// COGNITION_ROUTES_V1 - API de tarjetas cognitivas del owner autenticado.
//
// No es una ruta de admin: cada usuario solo ve sus tarjetas y las de su
// tenant. El tenantId y el owner salen del middleware de auth de app.ts.

import { Hono, type Context } from "hono";
import { z } from "zod";
import { AppError } from "./errors.ts";
import type { CognitionCardStore } from "./kernel/cognition/card-store.ts";

type CognitionVariables = {
  owner: string;
  ctx?: { tenantId: string; actorId: string };
};

const limitSchema = z.coerce.number().int().min(1).max(200).default(50);
const threadSchema = z.string().min(1).max(200).optional();
const cardIdSchema = z.string().min(1).max(200);

export function cognitionRoutes(cards?: CognitionCardStore) {
  const app = new Hono<{ Variables: CognitionVariables }>();

  const scope = (c: Context<{ Variables: CognitionVariables }>) => {
    const owner = c.get("owner");
    const ctx = c.get("ctx");
    if (!owner || !ctx?.tenantId) {
      throw new AppError("Sesion sin owner o tenant", 401);
    }
    return { owner, tenantId: ctx.tenantId };
  };

  // GET /api/cognition/cards?threadId=&limit=
  app.get("/cards", async (c) => {
    const { owner, tenantId } = scope(c);
    const limit = limitSchema.parse(c.req.query("limit"));
    const threadId = threadSchema.parse(c.req.query("threadId"));
    if (!cards) return c.json({ cards: [] });
    const all = await cards.list(tenantId, owner, limit);
    const filtered = threadId
      ? all.filter((card) => !card.threadId || card.threadId === threadId)
      : all;
    return c.json({ cards: filtered });
  });

  // POST /api/cognition/cards/:id/useful - promueve la tarjeta a tenant.
  app.post("/cards/:id/useful", async (c) => {
    const { owner, tenantId } = scope(c);
    const id = cardIdSchema.parse(c.req.param("id"));
    if (!cards) throw new AppError("Cognition cards no configuradas", 503);
    const card = await cards.markUseful(tenantId, owner, id);
    if (!card) throw new AppError("Tarjeta no encontrada", 404);
    return c.json({ card });
  });

  return app;
}
