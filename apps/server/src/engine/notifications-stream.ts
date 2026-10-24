// NOTIFICATIONS_STREAM_V2 — filtro por userId.
//
// V1 emitía todas las notificaciones del owner a todos los usuarios.
// V2 filtra: un usuario solo ve las notificaciones dirigidas a él
// (o las generales sin assignedTo).
//
// Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md
// ("Notificaciones dirigidas por userId"), roadmap §8.

import { Hono } from "hono";
import type { AgentService } from "./service.ts";
import { backgroundFailure } from "../log.ts";

export function notificationsStreamRoutes(service: AgentService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/stream", async (c) => {
    const owner = c.get("owner");
    // El userId del request viene del header de auth o del propio owner
    // (cuando solo hay un usuario). En deployments multi-usuario, el caller
    // pasa X-User-Id con el id del usuario autenticado.
    const userId = c.req.header("x-user-id") ?? owner;
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let lastSeen = new Set<string>();

        const push = (data: unknown, event = "notification") => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        push({ ok: true }, "ready");

        const tick = async () => {
          try {
            const items = await service.db.list<{
              id: string;
              title: string;
              body: string;
              read: boolean;
              createdAt: string;
              assignedTo?: string;
            }>(owner, "notifications", { limit: 50 });
            for (const item of items) {
              // USER_FILTER_V1 — solo emitir si es del usuario o general.
              if (item.assignedTo && item.assignedTo !== userId) continue;
              if (lastSeen.has(item.id)) continue;
              lastSeen.add(item.id);
              push(item);
            }
            if (lastSeen.size > 200) lastSeen = new Set(Array.from(lastSeen).slice(-100));
          } catch (error) {
            backgroundFailure("notifications stream tick", error);
          }
        };

        void tick();
        const timer = setInterval(() => { void tick(); }, 3000);

        c.req.raw.signal.addEventListener("abort", () => {
          clearInterval(timer);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  });

  return app;
}
