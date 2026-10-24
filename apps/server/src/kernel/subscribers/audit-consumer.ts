// KERNEL_AUDIT_CONSUMER_V1
import type { Store } from "../../db.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { globalSubscribers } from "../../engine/events/subscriber.ts";

const AUDITED = new Set([
  "kernel.thought.action",
  "kernel.thought.critic",
  "kernel.turn.opened",
  "verification.disagreement",
  "policy.denied",
  "state.transition_denied",
]);

  // KERNEL_AUDIT_INDEX_ROTATION_V1
export function startKernelAuditConsumer(owners: string[], db: Store): { stop(): void } {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (!AUDITED.has(event.type)) return;
      // KERNEL_AUDIT_CONSUMER_DEDUPE_V1
      void db
        .put(event.tenantId, "kernel-audit-index", {
          id: `ka-${event.id}`,
          tenantId: event.tenantId,
          owner: event.owner,
          type: event.type,
          payload: event.payload,
          emittedAt: event.emittedAt,
          correlationId: event.correlationId ?? null,
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