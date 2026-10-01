// KERNEL_CONSOLIDATE_V1 — fusion de duplicados + deteccion de contradicciones.
//
// Al cerrar un turno, el grafo puede tener:
//   - Dos Thoughts del mismo autor con el mismo contenido (duplicado).
//   - Dos Thoughts que se contradicen (uno afirma X, otro afirma no-X).
//
// Este modulo:
//   - Agrupa duplicados por hash de (role, content normalizado).
//   - Detecta contradicciones por negacion explicita en el contenido
//     (heuristica simple: "no X" vs "X").
//   - Devuelve el resultado sin mutar el grafo (la mutacion es del
//     promoter cuando escriba a business graph / memoria / audit).
//
// No usa LLM. Es determinista. La deteccion de contradiccion es honesta
// sobre su limitacion: solo pilla negaciones explicitas simples.

import { createHash } from "node:crypto";
import type { Thought } from "./thought.ts";

export interface DuplicateGroup {
  key: string;
  thoughtIds: string[];
  survivor: string;
  discarded: string[];
}

export interface ContradictionPair {
  a: string;
  b: string;
  reason: string;
}

export interface ConsolidationResult {
  duplicateGroups: DuplicateGroup[];
  contradictions: ContradictionPair[];
  reason: string;
}

function normalizeContent(content: Thought["content"]): string {
  if (typeof content === "string") {
    return content.trim().toLowerCase().replace(/\s+/g, " ");
  }
  return JSON.stringify(content);
}

function key(thought: Thought): string {
  const norm = normalizeContent(thought.content);
  return createHash("sha256")
    .update(`${thought.role}:${thought.actor.kind}:${norm}`)
    .digest("hex")
    .slice(0, 32);
}

function isNegationPair(a: Thought, b: Thought): string | undefined {
  if (a.role !== b.role) return undefined;
  if (typeof a.content !== "string" || typeof b.content !== "string") return undefined;
  const ca = a.content.trim().toLowerCase();
  const cb = b.content.trim().toLowerCase();
  if (!ca || !cb) return undefined;
  if (ca === `no ${cb}` || cb === `no ${ca}`) {
    return `negacion explicita: "${ca}" vs "${cb}"`;
  }
  if (ca.startsWith("no ") && cb.startsWith("no ")) {
    const ra = ca.slice(3).trim();
    const rb = cb.slice(3).trim();
    if (ra === rb) return `doble negacion: "${ca}" vs "${cb}"`;
  }
  return undefined;
}

export function consolidate(thoughts: Thought[]): ConsolidationResult {
  const byKey = new Map<string, Thought[]>();
  for (const t of thoughts) {
    const k = key(t);
    const list = byKey.get(k) ?? [];
    list.push(t);
    byKey.set(k, list);
  }
  const duplicateGroups: DuplicateGroup[] = [];
  for (const [k, list] of byKey) {
    if (list.length < 2) continue;
    const [survivor, ...rest] = list;
    duplicateGroups.push({
      key: k,
      thoughtIds: list.map((t) => t.id),
      survivor: survivor.id,
      discarded: rest.map((t) => t.id),
    });
  }
  const contradictions: ContradictionPair[] = [];
  for (let i = 0; i < thoughts.length; i++) {
    for (let j = i + 1; j < thoughts.length; j++) {
      const reason = isNegationPair(thoughts[i], thoughts[j]);
      if (reason) {
        contradictions.push({ a: thoughts[i].id, b: thoughts[j].id, reason });
      }
    }
  }
  return {
    duplicateGroups,
    contradictions,
    reason: `heuristica determinista: ${duplicateGroups.length} grupos de duplicados, ${contradictions.length} pares contradictorios`,
  };
}