// STATE_DENIED_CONSUMER_V1
import type { Store } from "../../../db.ts";
import { logWarn } from "../../../log.ts";
import type { SystemEvent } from "../types.ts";
import { globalSubscribers } from "../subscriber.ts";

export function startStateDeniedConsumer(
  owners: string[],
  db: Store,
): { stop(): void } {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (event.type !== "state.transition_denied") return;
      const p = event.payload as Record<string, unknown>;
      logWarn("state.transition_denied", {
        owner: event.owner,
        entityId: p.entityId,
        stateMachine: p.stateMachine,
        from: p.from,
        attempted: p.attempted,
        reason: p.reason,
      });
      void db
        .put(event.tenantId, "state-transition-log", {
          id: `std-${event.id}`,
          tenantId: event.tenantId,
          owner: event.owner,
          entityId: typeof p.entityId === "string" ? p.entityId : "",
          stateMachine: typeof p.stateMachine === "string" ? p.stateMachine : "",
          from: typeof p.from === "string" ? p.from : "",
          to: typeof p.attempted === "string" ? p.attempted : "",
          denied: true,
          reason: typeof p.reason === "string" ? p.reason : "",
          occurredAt: event.emittedAt,
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