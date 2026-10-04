// EVENTS_CONSUMER_AUDIT_V1 — consumidor del bus que escribe audit entries
// para tipos de evento que no pasan por el kernel.
//
// El kernel ya escribe audit para turn/thought. Este consumidor cubre
// auth, policy, system y state transitions, que hoy no van a audit.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md,
// roadmap §8 ("3 consumidores reales además de ReactionEngine").

import { globalSubscribers } from "../subscriber.ts";
import type { Store } from "../../../db.ts";
import type { SystemEvent } from "../types.ts";

const AUDITED_TYPES = new Set([
  "auth.login",
  "auth.login_failed",
  "policy.denied",
  "state.changed",
  "state.transition_denied",
  "system.google_disconnected",
  "system.error",
]);

export interface AuditConsumerHandle {
  stop(): void;
}

export function startAuditConsumer(
  owners: string[],
  db: Store,
): AuditConsumerHandle {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (!AUDITED_TYPES.has(event.type)) return;
      // Escritura best-effort: no bloquea el bus.
      void db
        .put(event.tenantId, "audit-entries", {
          id: `bus-audit-${event.id}`,
          tenantId: event.tenantId,
          owner: event.owner,
          action: event.type,
          actor: { kind: event.source.kind, id: event.source.id },
          payload: event.payload,
          hash: "bus-consumer",
          timestamp: event.emittedAt,
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
