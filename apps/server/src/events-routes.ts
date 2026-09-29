import { Hono } from "hono";
import { z } from "zod";
import type { EventBus } from "./engine/events/index.ts";
import { SYSTEM_EVENT_TYPES } from "./engine/events/index.ts";

const filterSchema = z.object({
  type: z.enum(SYSTEM_EVENT_TYPES).optional(),
  taskId: z.string().max(200).optional(),
  since: z.iso.datetime({ offset: true }).optional(),
  until: z.iso.datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export function eventsRoutes(bus: EventBus) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/", async (c) => {
    const filter = filterSchema.parse(c.req.query());
    const events = await bus.list(c.get("owner"), {
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.since ? { since: filter.since } : {}),
      ...(filter.until ? { until: filter.until } : {}),
      ...(filter.limit ? { limit: filter.limit } : {}),
      ...(filter.taskId ? { sourceId: filter.taskId } : {}),
    });
    return c.json({ events });
  });

  app.get("/aggregate", async (c) => {
    const query = z.object({ hours: z.coerce.number().int().min(1).max(720).default(24) }).parse(c.req.query());
    const aggregates = await bus.aggregate(c.get("owner"), query.hours);
    return c.json({ hours: query.hours, aggregates });
  });

  app.get("/schemas", async (c) => {
    return c.json({
      types: SYSTEM_EVENT_TYPES,
      version: "1.0",
    });
  });

  app.get("/timeline", async (c) => {
    const query = z.object({ hours: z.coerce.number().int().min(1).max(720).default(24) }).parse(c.req.query());
    const events = await bus.list(c.get("owner"), { limit: 200 });
    const since = Date.now() - query.hours * 3600000;
    const buckets = new Map<string, number>();
    for (const event of events) {
      const ts = Date.parse(event.emittedAt);
      if (Number.isNaN(ts) || ts < since) continue;
      const hour = new Date(ts).toISOString().slice(0, 13);
      buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
    }
    const timeline = [...buckets]
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
    return c.json({ hours: query.hours, timeline });
  });

  return app;
}