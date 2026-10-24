// FORM_ROUTES_V1 - endpoints para construir y confirmar formularios.

import { Hono } from "hono";
import { z } from "zod";
import type { AgentService } from "./engine/service.ts";
import { FormBuilder } from "./engine/form-builder.ts";
import { AppError } from "./errors.ts";

export function formRoutes(service: AgentService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // GET /api/forms/:entityType -> construye un FormSpec vacio.
  app.get("/:entityType", async (c) => {
    const owner = c.get("owner");
    const entityType = c.req.param("entityType");
    const builder = new FormBuilder(service.db as never, service.graph, service.memory);
    const spec = await builder.build({ owner, entityType });
    return c.json({ spec });
  });

  // POST /api/forms/:entityType -> crea la entidad.
  app.post("/:entityType", async (c) => {
    const owner = c.get("owner");
    const entityType = c.req.param("entityType");
    const body = z
      .object({
        values: z.record(z.string(), z.unknown()),
        name: z.string().min(1).max(300),
      })
      .parse(await c.req.json());
    if (!service.graph) throw new AppError("graph not wired", 503);
    const entity = await service.graph.createEntity(owner, {
      type: entityType,
      name: body.name,
      properties: body.values,
      actor: owner,
      source: "form",
    });
    return c.json({ ok: true, entity }, 201);
  });

  // FORM_UNDO_V1 - elimina una entidad creada hace menos de 60s.
  app.delete("/:entityType/:entityId", async (c) => {
    const owner = c.get("owner");
    const entityId = c.req.param("entityId");
    if (!service.graph) throw new AppError("graph not wired", 503);
    const entity = await service.graph.getEntity(owner, entityId);
    if (!entity) throw new AppError("entity not found", 404);
    const ageMs = Date.now() - Date.parse(entity.provenance.updatedAt);
    if (ageMs > 60000) throw new AppError("no se puede deshacer después de 60s", 409);
    await service.graph.deleteEntity(owner, entityId, owner);
    return c.json({ ok: true });
  });

  return app;
}