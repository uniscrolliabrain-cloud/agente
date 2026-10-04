import { Hono } from "hono";
import { z } from "zod";
import type { EventBus } from "./engine/events/index.ts";
import { SYSTEM_EVENT_TYPES } from "./engine/events/index.ts";
import { globalSubscribers } from "./engine/events/subscriber.ts";

// A2_SINCE_V1 - sinceId para polling incremental. since (datetime) se mantiene.
// EVENTS_SINCE_ID_V1 — el filtro now se aplica en el list de abajo.
  // Ver: docs/audits/08-bus-de-eventos/miniaudit.md.
  const filterSchema = z.object({
  type: z.enum(SYSTEM_EVENT_TYPES).optional(),
  taskId: z.string().max(200).optional(),
  since: z.iso.datetime({ offset: true }).optional(),
  sinceId: z.string().max(50).optional(),
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

  // EVENTS_STREAM_SSE_V1 — SSE en vivo de eventos del owner.
  // Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Sin SSE"),
  // roadmap §8 ("GET /api/events/stream con SSE funcionando").
  app.get("/stream", async (c) => {
    const owner = c.get("owner");
    // Filtro opcional por tipo, comma-separated.
    const typesParam = c.req.query("types");
    const types = typesParam
      ? typesParam.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;

    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");
    c.header("X-Accel-Buffering", "no");

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        send("ready", { ok: true, at: new Date().toISOString() });

        // Heartbeat cada 15s para que proxies no cierren la conexión.
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
          } catch {
            /* controller cerrado */
          }
        }, 15_000);

        const handle = globalSubscribers.subscribe(
          owner,
          (event) => {
            try {
              send("event", event);
            } catch {
              /* subscriber roto, el heartbeat lo limpiará */
            }
          },
          types ? { types } : {},
        );

        c.req.raw.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          handle.unsubscribe();
          try {
            controller.close();
          } catch {
            /* ya cerrado */
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
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