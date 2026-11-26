// EXECUTION_OUTCOME_CONTRACT_V1 - taxonomia unica del resultado de un efecto.
//
// Un error del adaptador NO demuestra por si solo que el efecto no ocurrio. El
// unico camino a `retrySafe` es una declaracion positiva del adaptador de que
// la operacion fue rechazada antes de despacharse o fallo sin efecto. Todo lo
// demas se conserva como resultado desconocido y exige conciliacion.
//
// Contrato para Trans03 (adaptadores): un adaptador declara el resultado
// mediante `outcome` en el error o en el valor devuelto. Los campos legacy
// `outcomeUnknown`/`code: "outcome_unknown"` siguen reconociendose como
// desconocidos, nunca como exito ni como ausencia de efecto.

/** Clases de resultado admitidas en el limite del efecto. */
export type AdapterOutcomeClass =
  /** Rechazo confirmado antes de enviar la operacion al proveedor. */
  | "rejected_before_dispatch"
  /** Fallo confirmado por el adaptador con evidencia de que no hubo efecto. */
  | "failed_without_effect"
  /** El proveedor acepto la operacion; la confirmacion aun no existe. */
  | "accepted"
  /** El efecto esta confirmado por el proveedor. */
  | "confirmed"
  /** No hay evidencia suficiente para afirmar si hubo efecto. */
  | "unknown";

export interface AdapterOutcomeDeclaration {
  outcome?: AdapterOutcomeClass;
  outcomeUnknown?: boolean;
  code?: string;
  status?: number;
}

export interface AdapterFailureClassification {
  outcome: AdapterOutcomeClass;
  /** Solo `true` con evidencia positiva de ausencia de efecto. */
  retrySafe: boolean;
  reason: string;
}

const POSITIVE_NO_EFFECT = new Set<AdapterOutcomeClass>([
  "rejected_before_dispatch",
  "failed_without_effect",
]);

function declarationOf(error: unknown): AdapterOutcomeDeclaration | undefined {
  if (!error || typeof error !== "object") return undefined;
  return error as AdapterOutcomeDeclaration;
}

/**
 * EXECUTION_OUTCOME_ERROR_V1 - clasifica un fallo del adaptador.
 *
 * Un 4xx del proveedor es un rechazo confirmado (no hubo efecto) solo cuando el
 * adaptador lo declara; por si solo, un `status` numerico no basta: un timeout
 * tambien puede llevar un status. Por eso `status` no se usa como evidencia.
 */
export function classifyAdapterFailure(error: unknown): AdapterFailureClassification {
  const declared = declarationOf(error);
  const outcome = declared?.outcome;
  if (outcome && POSITIVE_NO_EFFECT.has(outcome)) {
    return {
      outcome,
      retrySafe: true,
      reason: `adapter declared ${outcome}`,
    };
  }
  if (outcome === "accepted") {
    return { outcome: "accepted", retrySafe: false, reason: "adapter declared accepted" };
  }
  if (outcome === "unknown" || declared?.outcomeUnknown === true || declared?.code === "outcome_unknown") {
    return { outcome: "unknown", retrySafe: false, reason: "adapter declared unknown outcome" };
  }
  // Un error generico posterior al despacho, o una declaracion contradictoria
  // (`confirmed` en un error), no prueba ausencia de efecto.
  return {
    outcome: "unknown",
    retrySafe: false,
    reason: outcome
      ? `adapter declared ${outcome} on failure; treated as unknown`
      : "unclassified adapter error; absence of effect is not proven",
  };
}

/** Declaracion de resultado de un adaptador que si termino bien. */
export interface DeclaredOutcome<T = unknown> {
  outcome: AdapterOutcomeClass;
  value?: T;
}

/** EXECUTION_OUTCOME_CONFIRMED_V1 - el adaptador confirma el efecto. */
export function confirmed<T>(value?: T): DeclaredOutcome<T> {
  return { outcome: "confirmed", value };
}

/** EXECUTION_OUTCOME_ACCEPTED_V1 - el proveedor acepto, no confirmo. */
export function accepted<T>(value?: T): DeclaredOutcome<T> {
  return { outcome: "accepted", value };
}

/**
 * EXECUTION_OUTCOME_RESULT_V1 - clasifica el valor devuelto por un adaptador.
 *
 * EXECUTION_OUTCOME_RESULT_EXPLICIT_V1 - un valor devuelto NO es prueba de
 * exito. Sin discriminante explicito no se puede saber si el proveedor confirmo
 * el efecto, si solo lo acepto o si el adaptador no lo sabe, asi que se conserva
 * como `unknown` y el paso exige conciliacion. El adaptador declara con
 * `confirmed(...)` o `accepted(...)`; un exito que declare ausencia de efecto es
 * contradictorio y tambien queda desconocido.
 */
export function classifyAdapterResult(result: unknown): AdapterOutcomeClass {
  if (result && typeof result === "object") {
    const declared = (result as { outcome?: unknown }).outcome;
    if (declared === "accepted" || declared === "confirmed" || declared === "unknown") {
      return declared;
    }
  }
  return "unknown";
}

/** `true` si el estado del claim impide un nuevo envio automatico. */
export function requiresReconciliation(status: string | undefined): boolean {
  return status === "outcome_unknown" || status === "accepted";
}
