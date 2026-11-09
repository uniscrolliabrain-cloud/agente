// KERNEL_AUDIT_CONSUMER_V2 - indice de auditoria global por tenant.

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

export function startKernelAuditConsumer(
  db: Store,
  _owners: string[] = [],
): { stop(): void } {
  const handle = globalSubscribers.subscribeAll((event: SystemEvent) => {
    if (!AUDITED.has(event.type)) return;
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
  });
  return {
    stop() {
      handle.unsubscribe();
    },
  };
}
