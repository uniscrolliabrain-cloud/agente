// STATE_CHANGED_CONSUMER_V1
import type { Store } from "../../../db.ts";
import type { SystemEvent } from "../types.ts";
import { globalSubscribers } from "../subscriber.ts";

export function startStateChangedConsumer(
  owners: string[],
  db: Store,
): { stop(): void } {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (event.type !== "state.changed") return;
      const p = event.payload as Record<string, unknown>;
      void db
        .put(event.tenantId, "state-transition-log", {
          id: `st-${event.id}`,
          tenantId: event.tenantId,
          owner: event.owner,
          entityId: typeof p.entityId === "string" ? p.entityId : "",
          stateMachine: typeof p.stateMachine === "string" ? p.stateMachine : "",
          from: typeof p.from === "string" ? p.from : "",
          to: typeof p.to === "string" ? p.to : "",
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