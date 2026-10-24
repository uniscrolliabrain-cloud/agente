// TRUTH_RESOLVER_V1 - resuelve entre múltiples fuentes de verdad.

import type { TruthCandidate, TruthResolution } from "../../../../../packages/domain/src/truth.ts";

export class TruthResolver {
  resolve(field: string, candidates: TruthCandidate[]): TruthResolution {
    if (candidates.length === 0) {
      throw new Error(`No candidates for field ${field}`);
    }

    const scored = candidates
      .map((c) => ({
        ...c,
        score: c.reliability * c.confidence * freshness(c.observedAt),
      }))
      .sort((a, b) => b.score - a.score);

    const winner = scored[0];
    const conflicts = scored.slice(1).filter((c) => JSON.stringify(c.value) !== JSON.stringify(winner.value));

    return {
      field,
      value: winner.value,
      source: winner.source,
      confidence: winner.confidence,
      kind: winner.kind,
      resolvedAt: new Date().toISOString(),
      conflicts: conflicts.slice(0, 10),
      wasConflict: conflicts.length > 0,
    };
  }
}

function freshness(observedAt: string): number {
  const ageMs = Date.now() - Date.parse(observedAt);
  const ageDays = ageMs / 86400000;
  return Math.max(0.1, 1 - ageDays / 30);
}