// TRUTH_RESOLVER_V1 - resuelve entre múltiples fuentes de verdad.

import type {
  KnowledgeKind,
  TruthCandidate,
  TruthResolution,
} from "../../../../../packages/domain/src/truth.ts";

import { truthCandidateSchema } from "../../../../../packages/domain/src/truth.ts";

export class TruthResolver {
  constructor(private readonly clock = () => Date.now()) {}
  resolve(field: string, candidates: TruthCandidate[]): TruthResolution {
    if (candidates.length === 0) {
      throw new Error(`No candidates for field ${field}`);
    }

    truthCandidateSchema.shape.field.parse(field);
    const now = this.clock();
    if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) throw Error("TRUTH_CLOCK_INVALID");
    const scored = candidates
      .map((raw) => {
        const c = truthCandidateSchema.parse(raw);
        if (c.field !== field) throw Error("TRUTH_FIELD_MISMATCH");
        return { ...c, score: c.reliability * c.confidence * freshness(c.observedAt, now) };
      })
      .sort((a, b) => b.score - a.score);

    const winner = scored[0];
    // TRUTH_KIND_WIRE_V1 - el tipo de conocimiento viaja tipado; el resolver
    // no inventa un cuarto kind.
    const kind: KnowledgeKind = winner.kind;
    const conflicts = scored.slice(1).filter((c) => JSON.stringify(c.value) !== JSON.stringify(winner.value));

    return {
      field,
      value: winner.value,
      source: winner.source,
      confidence: winner.confidence,
      kind,
      resolvedAt: new Date(now).toISOString(),
      conflicts: conflicts.slice(0, 10),
      wasConflict: conflicts.length > 0,
    };
  }
}

function freshness(observedAt: string, now: number): number {
  // Clock skew can make a source current, never more reliable than current.
  const ageMs = Math.max(0, now - Date.parse(observedAt));
  const ageDays = ageMs / 86400000;
  return Math.max(0.1, 1 - ageDays / 30);
}