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
