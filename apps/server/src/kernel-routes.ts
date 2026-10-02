// KERNEL_ROUTES_V2 — rutas HTTP de debug del kernel.
//
// El fichero original era `export { viewsRoutes } from "./routes/views.ts"`
// y propagaba el error de fastify. Ahora expone kernelRoutes(kernel) con
// endpoints de debug del kernel cognitivo. No depende de fastify.
//
// Endpoints:
//   GET /api/kernel/turns/:turnId   -> thoughts del turno (debug)
//
// TODO(KERNEL_ROUTES_FULL_V1): anadir listado de turnos por owner y busqueda.

import { Hono } from "hono";
import type { Kernel } from "./kernel/index.ts";
import { kernelContextSchema } from "./kernel/index.ts";

export function kernelRoutes(kernel: Kernel) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/turns/:turnId", async (c) => {
    const owner = c.get("owner");
    const turnId = c.req.param("turnId");
    const ctx = kernelContextSchema.parse({
      tenantId: "default",
      owner,
      role: "admin",
      requestId: `kernel-routes:${turnId}`,
    });
    try {
      const thoughts = await kernel.thoughtsOf(ctx, turnId);
      return c.json({ turnId, thoughts });
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Kernel debug read failed" },
        500,
      );
    }
  });

  return app;
}