// EVENTS_CONSUMER_METRICS_V1 — consumidor del bus que alimenta métricas.
//
// A diferencia de ReactionEngine (que ejecuta acciones), este consumidor
// solo incrementa contadores. Es de solo lectura y no puede fallar de forma
// que rompa el bus.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Solo ReactionEngine lo lee"),
// roadmap §8 ("3 consumidores reales además de ReactionEngine").

import { globalSubscribers } from "../subscriber.ts";
import { globalMetrics } from "../../../metrics/registry.ts";
import type { SystemEvent } from "../types.ts";

export interface MetricsConsumerHandle {
  stop(): void;
}

export function startMetricsConsumer(owners: string[]): MetricsConsumerHandle {
  // Contadores por tipo de evento.
  globalMetrics.counter(
    "openmuse_events_total",
    "Eventos emitidos por tipo y owner",
  );
  globalMetrics.counter(
    "openmuse_event_failures_total",
    "Eventos con payload inválido (no debería ocurrir)",
  );

  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      try {
        globalMetrics.inc("openmuse_events_total", {
          type: event.type,
          source: event.source.kind,
        });
      } catch {
        globalMetrics.inc("openmuse_event_failures_total", { type: event.type });
      }
    }),
  );

  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}
