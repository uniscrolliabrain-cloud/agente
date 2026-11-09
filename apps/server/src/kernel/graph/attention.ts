// KERNEL_ATTENTION_V1 — scoring puro sobre AttentionVector.
//
// Funciones deterministas, sin estado. Reciben un AttentionVector ya
// validado por Zod y devuelven numeros o agregados. La logica de "que
// significa" vive en los autores y el presenter.

import { attentionVectorSchema, type AttentionVector, type IgnoredNode, type MatchedNode } from "./thought.ts";
// NODE_REF_ATTENTION_V1 - comparacion canonica entre autores y capas.
import { canonicalNode, sameNode } from "../../../../../packages/domain/src/node-ref.ts";

export function topMatched(vector: AttentionVector, n = 3): MatchedNode[] {
  return vector.matched.slice().sort((a, b) => b.weight - a.weight).slice(0, n);
}

export function totalAttention(vector: AttentionVector): number {
  return vector.matched.reduce((sum, m) => sum + m.weight, 0);
}

export function normalizedWeights(vector: AttentionVector): Record<string, number> {
  const total = totalAttention(vector);
  if (total <= 0) return {};
  const out: Record<string, number> = {};
  for (const m of vector.matched) {
    const key = canonicalNode(m.node);
    out[key] = (out[key] ?? 0) + m.weight / total;
  }
  return out;
}

export function matchScore(vector: AttentionVector, node: string): number {
  const found = vector.matched.find((m) => sameNode(m.node, node));
  return found ? found.weight : 0;
}

export function isFocusedOn(vector: AttentionVector, node: string, threshold = 0.7): boolean {
  return matchScore(vector, node) >= threshold;
}

export function attentionOverlap(a: AttentionVector, b: AttentionVector): number {
  // ATTENTION_OVERLAP_CANONICAL_V1 - antes comparaba claves de texto
  // normalizadas: `entity:acme` y `ACME` producian claves distintas y dos
  // autores hablando del mismo nodo parecian divergentes. Ahora empareja por
  // sameNode (kind + id) y aplica Jaccard ponderado.
  if (a.matched.length === 0 || b.matched.length === 0) return 0;
  const used = new Set<number>();
  let intersection = 0;
  for (const left of a.matched) {
    const index = b.matched.findIndex(
      (right, position) => !used.has(position) && sameNode(left.node, right.node),
    );
    if (index < 0) continue;
    used.add(index);
    intersection += Math.min(left.weight, b.matched[index].weight);
  }
  const union = totalAttention(a) + totalAttention(b) - intersection;
  return union > 0 ? intersection / union : 0;
}

  // ATTENTION_PAIRS_EXPORT_V1
export function divergence(a: AttentionVector, b: AttentionVector): number {
  return 1 - attentionOverlap(a, b);
}

export interface AttentionMetadata {
  attention: {
    id: string;
    author: string;
    primary: string;
    secondary: string[];
    query: string;
    intent: string;
    confidence: number;
    scope: string;
    timestamp: string;
    matched: MatchedNode[];
    ignored: IgnoredNode[];
    metadata: Record<string, unknown>;
  };
}

export function toMetadata(vector: AttentionVector): AttentionMetadata {
  return {
    attention: {
      id: vector.id,
      author: vector.author,
      primary: vector.primary,
      secondary: vector.secondary,
      query: vector.query,
      intent: vector.intent,
      confidence: vector.confidence,
      scope: vector.scope,
      timestamp: vector.timestamp,
      matched: vector.matched,
      ignored: vector.ignored,
      metadata: vector.metadata,
    },
  };
}

export function fromMetadata(input: unknown): AttentionVector | undefined {
  if (!input || typeof input !== "object") return undefined;
  const payload = (input as { attention?: unknown }).attention ?? input;
  // ATTENTION_FROM_METADATA_VALIDATE_V1 - validacion Zod real, no cast ciego.
  const parsed = attentionVectorSchema.safeParse(payload);
  return parsed.success ? parsed.data : undefined;
}