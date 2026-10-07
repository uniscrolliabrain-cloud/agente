// FIX_02_ROUTES_VIEWS_V3 - endpoint resolve real.
import { Hono } from "hono";
import { z } from "zod";
import { resolveView } from "../engine/views/resolver.ts";

// VIEW_INTENTS_V1 - intenciones reales del resolver.
import { registerIntent, clearIntents } from "../engine/views/resolver.ts";

function registerDefaultIntents() {
  clearIntents();
  registerIntent(/\b(dashboard|panel|resumen|kpis)\b/, async () => ({
    kind: "dashboard",
    title: "Panel",
    kpis: [
      { label: "Tareas activas", value: 0 },
      { label: "Completadas hoy", value: 0 },
      { label: "Fallos recientes", value: 0 },
    ],
  }));
  registerIntent(/\b(cola|queue|pendientes|bandeja)\b/, async () => ({
    kind: "queue",
    title: "Pendientes",
    items: [],
  }));
  registerIntent(/\b(tabla|listado|lista)\b/, async () => ({
    kind: "table",
    title: "Listado",
    columns: [{ key: "name", label: "Nombre", type: "text", align: "left" }],
    rows: [],
  }));
  registerIntent(/\b(detalle|ficha)\b/, async () => ({
    kind: "detail",
    title: "Detalle",
    properties: [],
  }));
  registerIntent(/\b(formulario|alta|crear)\b/, async () => ({
    kind: "form",
    title: "Formulario",
    entityType: "entity",
    fields: [],
    submitLabel: "Guardar",
  }));
}

registerDefaultIntents();

export function viewsRoutes() {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.post("/resolve", async (c) => {
    const body = z.object({ intent: z.string().min(1).max(1000) }).parse(await c.req.json());
    const spec = await resolveView(c.get("owner"), body.intent);
    return c.json({ spec });
  });
  return app;
}