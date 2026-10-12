// KERNEL_THOUGHT_CONSUMER_V1
import type { Store } from "../../db.ts";
import type { StoreSink, StoreQuery } from "../../engine/events/sinks/store.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { globalSubscribers } from "../../engine/events/subscriber.ts";

const KERNEL_THOUGHT_TYPES = new Set([
  "kernel.thought.action",
  "kernel.thought.response",
  "kernel.thought.reflection",
  "kernel.thought.critic",
  "kernel.thought.delegation",
]);

  // KERNEL_THOUGHT_INDEX_RETENTION_V1
  // KERNEL_THOUGHT_INDEX_LRU_V1
export function startKernelThoughtConsumer(
  owners: string[],
  db: Store,
): { stop(): void } {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (!KERNEL_THOUGHT_TYPES.has(event.type)) return;
      const p = event.payload as Record<string, unknown>;
      const thoughtId = typeof p.thoughtId === "string" ? p.thoughtId : "";
      if (!thoughtId) return;
      // KERNEL_THOUGHT_INDEX_DEDUPE_V1
      // db.put ya es idempotente por (tenantId, kind, id)
      // KERNEL_THOUGHT_INDEX_TENANT_FILTER_V1
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
    }),
  );
  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}