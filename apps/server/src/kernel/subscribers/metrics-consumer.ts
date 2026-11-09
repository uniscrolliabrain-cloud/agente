// KERNEL_METRICS_THOUGHTS_V2 - metricas globales por tenant.

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

export function startKernelMetricsConsumer(_owners: string[] = []): { stop(): void } {
  globalMetrics.counter("agente_kernel_thoughts_total", "Thoughts emitidos al bus por rol");
  globalMetrics.counter("agente_kernel_turns_total", "Turns abiertos al bus");
  const handle = globalSubscribers.subscribeAll((event: SystemEvent) => {
    if (THOUGHT_TYPES.has(event.type)) {
      const role = (event.payload as Record<string, unknown>).role;
      globalMetrics.inc("agente_kernel_thoughts_total", { role: String(role ?? "unknown") });
      return;
    }
    if (event.type === "kernel.turn.opened") {
      globalMetrics.inc("agente_kernel_turns_total", {
        owner: event.owner,
        tenantId: event.tenantId,
      });
    }
  });
  return {
    stop() {
      handle.unsubscribe();
    },
  };
}
