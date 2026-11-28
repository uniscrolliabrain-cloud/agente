// KERNEL_TELEMETRY_HOOKS_V1 - lado Trans01 del contrato T04-H01.
//
// La observabilidad nunca decide, nunca bloquea y nunca cambia el resultado de
// una operacion. Los hooks son sincronos y baratos: el sink se invoca sin
// `await`, cualquier fallo se descarta y la etapa se publica despues del
// resultado durable (commit, denegacion o reconciliacion), no antes.
//
// Allowlist de atributos (T04-H01): etapa, estado enumerado, duracion,
// capability registrada y clase de error. Nunca tenant, owner, actor, payload,
// prompt ni credenciales. `correlationId` es un enlace interno: el sink puede
// usarlo para correlacionar trazas, pero no debe exportarlo como etiqueta.

export type KernelStage =
  | "kernel.decision"
  | "kernel.denial"
  | "runtime.claim"
  | "runtime.result"
  | "runtime.reconciliation"
  | "bus.commit"
  | "bus.rollback";

export type KernelStageStatus = "ok" | "denied" | "failed" | "unknown";

export interface KernelObservation {
  stage: KernelStage;
  status: KernelStageStatus;
  durationMs: number;
  /** Enlace interno de correlacion; no es una etiqueta exportable. */
  correlationId?: string;
  /** Id de capability registrada, no un payload ni un identificador de negocio. */
  capabilityId?: string;
  /** Clase de error enumerada, sin mensaje del proveedor. */
  errorClass?: string;
}

export interface KernelTelemetrySink {
  record(observation: KernelObservation): void | Promise<void>;
}

const sinks = new Set<KernelTelemetrySink>();

/** Registra un sink. Devuelve la funcion para retirarlo (rollback explicito). */
export function registerKernelTelemetrySink(sink: KernelTelemetrySink): () => void {
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
}

/**
 * KERNEL_TELEMETRY_NONBLOCKING_V1 - publica una observacion sin esperar al
 * sink. Un sink caido o lento no puede retrasar el runtime ni cambiar su
 * resultado; el error se descarta a proposito.
 */
export function observeKernel(observation: KernelObservation): void {
  if (sinks.size === 0) return;
  for (const sink of sinks) {
    try {
      const pending = sink.record({ ...observation });
      if (pending && typeof (pending as Promise<void>).catch === "function") {
        void (pending as Promise<void>).catch(() => {});
      }
    } catch {
      // La observabilidad no interrumpe la operacion observada.
    }
  }
}

/** Bounded local metrics sink. No payloads, identifiers or I/O on producer path. */
export function startKernelMetricsSink(registry: import("../../metrics/registry.ts").MetricsRegistry, capacity = 256) {
  if (!Number.isSafeInteger(capacity) || capacity < 1) throw new RangeError("Invalid telemetry queue capacity");
  registry.counter("agente_kernel_observations_total", "Durable kernel stage observations");
  registry.counter("agente_kernel_telemetry_dropped_total", "Rejected or dropped local telemetry observations");
  registry.histogram("agente_kernel_stage_duration_ms", "Durable kernel stage duration in milliseconds");
  const stages = new Set<KernelStage>(["kernel.decision", "kernel.denial", "runtime.claim", "runtime.result", "runtime.reconciliation", "bus.commit", "bus.rollback"]);
  const statuses = new Set<KernelStageStatus>(["ok", "denied", "failed", "unknown"]);
  const queue: Array<Pick<KernelObservation, "stage" | "status" | "durationMs">> = [];
  let scheduled: ReturnType<typeof setImmediate> | undefined;
  let stopped = false;
  const flush = () => {
    if (scheduled) clearImmediate(scheduled);
    scheduled = undefined;
    for (const item of queue.splice(0)) {
      const labels = { stage: item.stage, status: item.status };
      registry.inc("agente_kernel_observations_total", labels);
      registry.observe("agente_kernel_stage_duration_ms", item.durationMs, labels);
    }
  };
  const unregister = registerKernelTelemetrySink({ record(observation) {
    if (stopped) return;
    if (queue.length >= capacity || !stages.has(observation.stage) || !statuses.has(observation.status) ||
        !Number.isFinite(observation.durationMs) || observation.durationMs < 0) {
      registry.inc("agente_kernel_telemetry_dropped_total");
      return;
    }
    queue.push({ stage: observation.stage, status: observation.status, durationMs: observation.durationMs });
    if (!scheduled) { scheduled = setImmediate(flush); scheduled.unref(); }
  } });
  return { flush, stop() { stopped = true; unregister(); flush(); } };
}
