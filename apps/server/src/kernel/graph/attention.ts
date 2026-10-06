// KERNEL_ATTENTION_V1 — scoring puro sobre AttentionVector.
//
// Funciones deterministas, sin estado. Reciben un AttentionVector ya
// validado por Zod y devuelven numeros o agregados. La logica de "que
// significa" vive en los autores y el presenter.

import { attentionVectorSchema, type AttentionVector, type IgnoredNode, type MatchedNode } from "./thought.ts";

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
  for (const m of vector.matched) out[m.node] = m.weight / total;
  return out;
}

export function matchScore(vector: AttentionVector, node: string): number {
  const found = vector.matched.find((m) => m.node === node);
  return found ? found.weight : 0;
}

export function isFocusedOn(vector: AttentionVector, node: string, threshold = 0.7): boolean {
  return matchScore(vector, node) >= threshold;
}

export function attentionOverlap(a: AttentionVector, b: AttentionVector): number {
  const wa = normalizedWeights(a);
  const wb = normalizedWeights(b);
  const keysA = Object.keys(wa);
  const keysB = Object.keys(wb);
  if (keysA.length === 0 || keysB.length === 0) return 0;
  const all = new Set([...keysA, ...keysB]);
  let num = 0;
  let den = 0;
  for (const k of all) {
    const va = wa[k] ?? 0;
    const vb = wb[k] ?? 0;
    num += Math.min(va, vb);
    den += Math.max(va, vb);
  }
  return den > 0 ? num / den : 0;
}

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