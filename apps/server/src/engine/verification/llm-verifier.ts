// LLM_VERIFIER_V1 - segunda capa de verificacion. Evalua si el Outcome
// satisface el Goal usando un modelo. La primera capa sigue siendo
// DeterministicVerifier.

import type {
  Goal,
  Outcome,
  VerificationResult,
} from "../../../../../packages/domain/src/index.ts";
import type { Verifier } from "./verifier.ts";

export class LlmVerifier implements Verifier {
  constructor(private readonly inner: Verifier) {}

  async verify(goal: Goal, outcome: Outcome): Promise<VerificationResult> {
    // Primero deterministico.
    const base = await this.inner.verify(goal, outcome);
    if (base.verified) return base;

    // Si falla lo deterministico, ampliamos con razonamiento.
    // El LLM solo se llama si hay criterios no cumplidos y hay evidencia
    // disponible para razonar.
    if (outcome.evidence.length === 0) return base;

    // Fase 5: no llamamos al LLM todavia. Marcamos el resultado como
    // "hybrid" para que el caller sepa que el deterministico fallo pero
    // hay evidencia que un LLM podria interpretar.
    return {
      ...base,
      method: "hybrid",
      reason: `${base.reason} (pendiente revision LLM)`,
    };
  }
}