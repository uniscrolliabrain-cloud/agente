// KERNEL_THOUGHT_CONSUMER_V2 - indice global por tenant.
//
// Antes se suscribia por cada owner de una lista fija. Con owner != tenantId
// (usuario != empresa) el evento no llegaba y el indice quedaba vacio.
// Ahora subscribeAll + event.tenantId: no depende del arranque.

import type { Store } from "../../db.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { globalSubscribers } from "../../engine/events/subscriber.ts";

const KERNEL_THOUGHT_TYPES = new Set([
  "kernel.thought.action",
  "kernel.thought.response",
  "kernel.thought.reflection",
  "kernel.thought.critic",
  "kernel.thought.delegation",
]);

// KERNEL_THOUGHT_INDEX_LRU_V1 - LRU en memoria por tenant, 500 entradas.
const THOUGHT_LRU_MAX = 500;
const thoughtLru = new Map<string, true>();
function thoughtLruTouch(key: string): boolean {
  if (thoughtLru.has(key)) return false;
  thoughtLru.set(key, true);
  if (thoughtLru.size > THOUGHT_LRU_MAX) {
    const first = thoughtLru.keys().next().value;
    if (first !== undefined) thoughtLru.delete(first);
  }
  return true;
}

export function startKernelThoughtConsumer(
  db: Store,
  _owners: string[] = [],
): { stop(): void } {
  const handle = globalSubscribers.subscribeAll((event: SystemEvent) => {
    if (!KERNEL_THOUGHT_TYPES.has(event.type)) return;
    const p = event.payload as Record<string, unknown>;
    const thoughtId = typeof p.thoughtId === "string" ? p.thoughtId : "";
    if (!thoughtId) return;
    if (!thoughtLruTouch(`${event.tenantId}:${thoughtId}`)) return;
    void db
      .put(event.tenantId, "kernel-thought-index", {
        id: thoughtId,
        tenantId: event.tenantId,
        owner: event.owner,
        type: event.type,
        turnId: typeof p.turnId === "string" ? p.turnId : "",
        role: typeof p.role === "string" ? p.role : "",
        indexedAt: new Date().toISOString(),
      })
      .catch(() => {});
  });
  return {
    stop() {
      handle.unsubscribe();
    },
  };
}
