// KERNEL_TURN_CONSUMER_V1
import type { Store } from "../../db.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { globalSubscribers } from "../../engine/events/subscriber.ts";

  // KERNEL_TURN_INDEX_RETENTION_V1
  // KERNEL_TURN_INDEX_LRU_V1 - LRU real en memoria.
const TURN_LRU_MAX = 500;
const turnLru = new Map<string, true>();
function turnLruTouch(key: string): boolean {
  if (turnLru.has(key)) return false;
  turnLru.set(key, true);
  if (turnLru.size > TURN_LRU_MAX) {
    const first = turnLru.keys().next().value;
    if (first !== undefined) turnLru.delete(first);
  }
  return true;
}
export function startKernelTurnConsumer(
  owners: string[],
  db: Store,
): { stop(): void } {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (event.type !== "kernel.turn.opened") return;
      const p = event.payload as Record<string, unknown>;
      const turnId = typeof p.turnId === "string" ? p.turnId : "";
      if (!turnId) return;
      // KERNEL_TURN_INDEX_DEDUPE_V1 + LRU.
      if (!turnLruTouch(`${event.tenantId}:${turnId}`)) return;
      // db.put ya es idempotente por (tenantId, kind, id)
      // KERNEL_TURN_INDEX_TENANT_FILTER_V1
      void db
        .put(event.tenantId, "kernel-turn-index", {
          id: turnId,
          tenantId: event.tenantId,
          owner: event.owner,
          triggers: Array.isArray(p.triggers) ? p.triggers : [],
          openedAt: event.emittedAt,
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