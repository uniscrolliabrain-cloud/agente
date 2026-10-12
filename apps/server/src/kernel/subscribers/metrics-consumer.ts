// KERNEL_METRICS_THOUGHTS_V1
import { globalMetrics } from "../../metrics/registry.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { globalSubscribers } from "../../engine/events/subscriber.ts";

const THOUGHT_TYPES = new Set([
  "kernel.thought.action",
  "kernel.thought.response",
  "kernel.thought.reflection",
  "kernel.thought.critic",
  "kernel.thought.delegation",
]);

export function startKernelMetricsConsumer(owners: string[]): { stop(): void } {
  globalMetrics.counter("openmuse_kernel_thoughts_total", "Thoughts emitidos al bus por rol");
  globalMetrics.counter("openmuse_kernel_turns_total", "Turns abiertos al bus");
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (THOUGHT_TYPES.has(event.type)) {
        const role = (event.payload as Record<string, unknown>).role;
        globalMetrics.inc("openmuse_kernel_thoughts_total", { role: String(role ?? "unknown") });
        return;
      }
      // KERNEL_METRICS_BY_OWNER_V1
      if (event.type === "kernel.turn.opened") {
        globalMetrics.inc("openmuse_kernel_turns_total", { owner: event.owner });
      }
    }),
  );
  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}