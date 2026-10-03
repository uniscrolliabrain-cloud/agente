// D2_VIEWS_ENDPOINT_V2 - endpoint real usando resolveView.
// ROUTES_VIEWS_V2 — Hono, no Fastify.
//
// El fichero original importaba FastifyInstance de "fastify", que no esta
// en package.json. El repo usa Hono en todas las rutas. Se reescribe con Hono.
//
// Contrato:
//   POST /api/views/resolve
//   body: { intent: string, context?: Record<string, unknown> }
//   devuelve: { spec: ViewSpec } con un spec minimo valido.
//
// TODO(VIEWS_RESOLVER_V1): sustituir el stub por IntentResolver + Views.readView.
// Por ahora respeta el contrato minimo de ViewSpec para que el frontend pinte
// el fallback.

import { Hono } from "hono";
import { z } from "zod";

const bodySchema = z.object({
  intent: z.string().min(1).max(1000),
  context: z.record(z.string(), z.unknown()).optional(),
});

export function viewsRoutes() {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.post("/resolve", async (c) => {
    const parsed = bodySchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json({ error: parsed.error.message }, 400);
    const { intent } = parsed.data;
    const owner = c.get("owner");

    // Placeholder que respeta el contrato minimo de ViewSpec.
    const spec = {
      id: `view_${Date.now()}`,
      kind: "collection" as const,
      layout: "list" as const,
      title: intent.slice(0, 80),
      columns: [{ key: "id", label: "ID", type: "text" as const }],
      dataSource: [
        {
          kind: "business-graph" as const,
          query: intent,
          tenantId: owner,
          bindings: {},
        },
      ],
      provenance: { intent, source: "views.resolve.stub" },
    };
    return c.json({ spec });
  });

  return app;
}