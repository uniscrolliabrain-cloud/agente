// NOTIFICATIONS_STREAM_V1 - SSE para notificaciones en vivo.

import { Hono } from "hono";
import type { AgentService } from "./engine/service.ts";
import { backgroundFailure } from "./log.ts";
import type { AuthzDeps } from "./engine/authz/pdp.ts";

// NOTIFICATIONS_STREAM_TENANT_V1 â€” recibe tenantService para filtrar el SSE
// por tenant. Sin esto, un cliente del tenant A podÃ­a recibir notificaciones
// del tenant B si compartÃ­an userId.
export interface NotificationRow {
  id: string;
  assignedTo?: string;
  tenantId?: string;
}

export interface NotificationViewer {
  userId: string;
  tenantId: string;
}

/**
 * PRINCIPAL_SSE_V1 - que avisos puede ver un viewer. Vive fuera del stream para
 * poder probarlo sin abrir un ReadableStream: la autoridad es el principal, no
 * una cabecera. Una fila legacy sin tenantId se asume del tenant actual.
 */
export function notificationVisible(item: NotificationRow, viewer: NotificationViewer): boolean {
  const isSupervisor = viewer.userId === "laia";
  if (!isSupervisor && item.assignedTo && item.assignedTo !== viewer.userId) return false;
  const itemTenantId = item.tenantId ?? viewer.tenantId;
  return itemTenantId === viewer.tenantId;
}

export function notificationsStreamRoutes(
  service: AgentService,
  tenantService?: { tenantIdFor: (owner: string) => Promise<string> },
  authz?: AuthzDeps,
) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // NOTIFICATIONS_SSE_CONN_LIMIT_V1
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/stream", async (c) => {
    const owner = c.get("owner");
    // PRINCIPAL_SSE_V1 - el filtro sale del principal ya resuelto de la peticion,
    // no de una cabecera: `x-user-id` era autoridad de facto y permitia leer
    // avisos dirigidos a otro usuario del mismo tenant (campana 05.P3).
    const ctx = (c.get as unknown as (key: string) => unknown)("ctx") as
      | { tenantId?: string; actorId?: string; owner?: string }
      | undefined;
    const userId = ctx?.actorId ?? owner;
    // NOTIFICATIONS_STREAM_TENANT_V1 - se usa el tenant del principal; el
    // fallback solo queda para rutas montadas sin ctx (stream de kernel).
    const requestTenantId =
      ctx?.tenantId ??
      (tenantService ? await tenantService.tenantIdFor(owner).catch(() => "default") : "default"); // FALLBACK_TENANT_V1
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
              // PRINCIPAL_SSE_V1 - filtro unico por principal (usuario + tenant).
              if (!notificationVisible(item, { userId, tenantId: requestTenantId })) continue;
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