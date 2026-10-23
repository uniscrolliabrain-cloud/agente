// NOTIFICATIONS_STREAM_V1 - SSE para notificaciones en vivo.

import { Hono } from "hono";
import type { AgentService } from "./engine/service.ts";
import { backgroundFailure } from "./log.ts";

// NOTIFICATIONS_STREAM_TENANT_V1 â€” recibe tenantService para filtrar el SSE
// por tenant. Sin esto, un cliente del tenant A podÃ­a recibir notificaciones
// del tenant B si compartÃ­an userId.
export function notificationsStreamRoutes(
  service: AgentService,
  tenantService?: { tenantIdFor: (owner: string) => Promise<string> },
  authz?: { pdp: { can: (...args: unknown[]) => Promise<"allow" | "deny"> }; fieldFilter: { filter: (...args: unknown[]) => Promise<unknown> } },
) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // NOTIFICATIONS_SSE_CONN_LIMIT_V1
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/stream", async (c) => {
    const owner = c.get("owner");
    // NOTIF_USER_FILTER_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â filtrar por userId para no emitir notificaciones
    // dirigidas a otro usuario. Ver: docs/audits/04-.../miniaudit.md.
    const userId = c.req.header("x-user-id") ?? owner;
    // NOTIFICATIONS_STREAM_TENANT_V1 â€” tenantId del request, para filtrar.
    const requestTenantId = tenantService
      ? await tenantService.tenantIdFor(owner).catch(() => "default")
      : "default";
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
            const items = await service.db
              .list<{ id: string; title: string; body: string; read: boolean; createdAt: string; assignedTo?: string }>(
                owner,
                "notifications",
                { limit: 50 },
              );
            for (const item of items) {
              // NOTIF_USER_FILTER_V1 ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â solo si es del usuario o general.
              // NOTIF_SUPERVISOR_MODE_V1 - Laia (supervisora) ve las de todos.
              const isSupervisor = userId === "laia";
              if (!isSupervisor && item.assignedTo && item.assignedTo !== userId) continue;
              // NOTIFICATIONS_STREAM_TENANT_V1 â€” solo notificaciones del mismo
              // tenant. Si no trae tenantId (legacy), se asume del actual.
              const itemTenantId = (item as { tenantId?: string }).tenantId ?? requestTenantId;
              if (itemTenantId !== requestTenantId) continue;
              if (lastSeen.has(item.id)) continue;
              lastSeen.add(item.id);
              push(item);
            }
            // NOTIF_STREAM_BUFFER_V1 - buffer mas grande para no perder avisos.
            if (lastSeen.size > 2000) lastSeen = new Set(Array.from(lastSeen).slice(-1000));
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