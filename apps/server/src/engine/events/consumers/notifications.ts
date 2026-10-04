// EVENTS_CONSUMER_NOTIFICATIONS_V1 — consumidor que genera notificaciones
// para eventos que el usuario debe ver (task.failed, task.waiting_approval,
// monitor.changed, etc).
//
// A diferencia de `publishOutcome` en service.ts (que ya escribe notificaciones),
// este consumidor unifica todos los eventos relevantes en un único sitio.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md,
// roadmap §8 ("3 consumidores reales además de ReactionEngine").

import { globalSubscribers } from "../subscriber.ts";
import type { Store } from "../../../db.ts";
import type { SystemEvent } from "../types.ts";

const NOTIFY_TYPES: Record<string, (e: SystemEvent) => { title: string; body: string } | null> = {
  "action.outcome_unknown": (e) => ({
    title: "Acción con resultado incierto",
    body: String((e.payload as { title?: string }).title ?? "Revisa la acción."),
  }),
  "monitor.changed": (e) => ({
    title: "Cambio detectado",
    body: String((e.payload as { excerpt?: string }).excerpt ?? "Un monitor detectó un cambio."),
  }),
  "system.google_disconnected": () => ({
    title: "Google desconectado",
    body: "El agente no puede leer tu correo ni preparar correos. Reconecta Google.",
  }),
};

export interface NotificationsConsumerHandle {
  stop(): void;
}

export function startNotificationsConsumer(
  owners: string[],
  db: Store,
): NotificationsConsumerHandle {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      const builder = NOTIFY_TYPES[event.type];
      if (!builder) return;
      const content = builder(event);
      if (!content) return;
      void db
        .insertIfAbsent(event.owner, "notifications", {
          id: `bus-notif-${event.id}`,
          title: content.title.slice(0, 200),
          body: content.body.slice(0, 2000),
          createdAt: event.emittedAt,
          read: false,
        })
        .catch(() => {});
    }),
  );

  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}
