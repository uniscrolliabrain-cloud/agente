// KERNEL_TURN_CONSUMER_V2 - indice global por tenant.

import type { Store } from "../../db.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { globalSubscribers } from "../../engine/events/subscriber.ts";

// KERNEL_TURN_INDEX_LRU_V1 - LRU en memoria.
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
  db: Store,
  _owners: string[] = [],
): { stop(): void } {
  const handle = globalSubscribers.subscribeAll((event: SystemEvent) => {
    if (event.type !== "kernel.turn.opened") return;
    const p = event.payload as Record<string, unknown>;
    const turnId = typeof p.turnId === "string" ? p.turnId : "";
    if (!turnId) return;
    if (!turnLruTouch(`${event.tenantId}:${turnId}`)) return;
    void db
      .put(event.tenantId, "kernel-turn-index", {
        id: turnId,
        tenantId: event.tenantId,
        owner: event.owner,
        triggers: Array.isArray(p.triggers) ? p.triggers : [],
        openedAt: event.emittedAt,
      })
      .catch(() => {});
  });
  return {
    stop() {
      handle.unsubscribe();
    },
  };
}
