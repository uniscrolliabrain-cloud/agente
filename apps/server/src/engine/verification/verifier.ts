// VERIFIER_V1 - determina si un Outcome cumple un Goal.

import type {
  Goal,
  Outcome,
  VerificationResult,
} from "../../../../../packages/domain/src/index.ts";
import type { OutcomeMetric } from "../../../../../packages/domain/src/outcome.ts";

export interface Verifier {
  verify(goal: Goal, outcome: Outcome): Promise<VerificationResult>;
}

export class DeterministicVerifier implements Verifier {
  async verify(goal: Goal, outcome: Outcome): Promise<VerificationResult> {
    const satisfied: string[] = [];
    const failed: string[] = [];
    const missing: string[] = [];

    for (const criterion of goal.successCriteria) {
      const metric: OutcomeMetric | undefined = outcome.metrics.find((m) => m.key === criterion.key);
      if (!metric) {
        missing.push(criterion.key);
        continue;
      }
      const ok = this.evaluate(metric.value, criterion.operator, criterion.value);
      if (ok) satisfied.push(criterion.id);
      else failed.push(criterion.id);
    }

    // VERIFIER_CRITERIA_REQUIRED_V1 - un goal sin criterios no se puede
    // verificar. Antes el bucle vacio dejaba `failed` y `missing` a cero y el
    // veredicto era `verified: true`: el ciclo del Business OS firmaba exito
    // sin haber comprobado nada.
    const hasCriteria = goal.successCriteria.length > 0;
    const verified = hasCriteria && failed.length === 0 && missing.length === 0;
    return {
      verified,
      reason: !hasCriteria
        ? "El goal no declara criterios de exito: no se puede verificar"
        : verified
          ? `Se cumplen ${satisfied.length} criterios`
          : `Fallan ${failed.length} y faltan ${missing.length} criterios`,
      missing,
      satisfiedCriteria: satisfied,
      failedCriteria: failed,
      confidence: 1,
      method: "deterministic",
      verifiedAt: new Date().toISOString(),
    };
  }

  private evaluate(actual: number, op: string, expected: unknown): boolean {
    const exp = typeof expected === "number" ? expected : Number(expected);
    if (!Number.isFinite(exp)) return false;
    switch (op) {
      case ">=": return actual >= exp;
      case "<=": return actual <= exp;
      case "==": return actual === exp;
      case "!=": return actual !== exp;
      case ">": return actual > exp;
      case "<": return actual < exp;
      default: return false;
    }
  }
}