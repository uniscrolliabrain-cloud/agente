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
  /** CONSOLIDATE_TENANT_V1 - tenant al que pertenece el grupo. */
  tenantId: string;
}

export interface ContradictionPair {
  a: string;
  b: string;
  reason: string;
  /** CONSOLIDATE_TENANT_V1 - tenant al que pertenecen los dos thoughts. */
  tenantId: string;
}

export interface ConsolidationResult {
  duplicateGroups: DuplicateGroup[];
  // CONSOLIDATE_HONEST_NAME_V1 - renombrado a textualNegations porque la
  // deteccion es solo negacion explicita ('no X' vs 'X'). No detecta
  // contradicciones semanticas reales. El nombre anterior mentia.
  textualNegations: ContradictionPair[];
  reason: string;
  /** CONSOLIDATE_TENANT_V1 - tenants vistos en la lista, para debug. */
  tenants: string[];
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

/**
 * CONSOLIDATE_NEGATION_V2 - deteccion de negacion mas robusta.
 *
 * Antes era solo `no X` vs `X` y `no X` vs `no X`. Ahora:
 *   - Normaliza espacios multiples y signos finales.
 *   - Detecta "no X", "not X", "sin X", "nunca X" como negacion.
 *   - Ignora puntuacion final (. ; , :) al comparar.
 *   - Ignora diferencias de mayusculas ya (toLowerCase).
 *
 * Lo que sigue siendo heuristica: no detecta negaciones complejas
 * ("no es el caso que X"). Eso necesita LLM y queda fuera del scope.
 */
const NEGATION_PREFIXES = ["no ", "not ", "sin ", "nunca "];

function stripFinalPunctuation(s: string): string {
  return s.replace(/[.,;:!?]+$/g, "").trim();
}

// CONSOLIDATE_DEDUP_FIX_V1 - la segunda definicion de normalizeContent
// (linea 78 original) chocaba con la de arriba (linea 45).
// Renombrada a normalizeContentString para uso exclusivo de isNegationPair.
function normalizeContentString(s: string): string {
  return stripFinalPunctuation(s.trim().toLowerCase().replace(/\s+/g, " "));
}

function isNegationPair(a: Thought, b: Thought): string | undefined {
  if (a.role !== b.role) return undefined;
  if (typeof a.content !== "string" || typeof b.content !== "string") return undefined;
  const ca = normalizeContentString(a.content);
  const cb = normalizeContentString(b.content);
  if (!ca || !cb) return undefined;
  if (ca === cb) return undefined; // no es contradiccion, es duplicado
  for (const prefix of NEGATION_PREFIXES) {
    if (ca === prefix + cb) {
      return `negacion explicita: "${ca}" vs "${cb}"`;
    }
    if (cb === prefix + ca) {
      return `negacion explicita: "${cb}" vs "${ca}"`;
    }
  }
  // Doble negacion: "no X" vs "no Y" donde X === Y ya se cubre arriba.
  // "no no X" vs "X" tambien se cubre con el loop porque
  // "no no X" === "no " + "no X".
  return undefined;
}

export function consolidate(thoughts: Thought[]): ConsolidationResult {
  // CONSOLIDATE_TENANT_V1 - agrupar por tenant antes de todo.
  // Cierra #205: antes, dos tenants con el mismo thought se consolidaban
  // como duplicados. Ahora cada tenant tiene su propio bucket.
  const byTenant = new Map<string, Thought[]>();
  for (const t of thoughts) {
    const list = byTenant.get(t.tenantId) ?? [];
    list.push(t);
    byTenant.set(t.tenantId, list);
  }

  const duplicateGroups: DuplicateGroup[] = [];
  const textualNegations: ContradictionPair[] = [];

  for (const [tenantId, tenantThoughts] of byTenant) {
    // Duplicados dentro del tenant.
    const byKey = new Map<string, Thought[]>();
    for (const t of tenantThoughts) {
      const k = key(t);
      const list = byKey.get(k) ?? [];
      list.push(t);
      byKey.set(k, list);
    }
    for (const [k, list] of byKey) {
      if (list.length < 2) continue;
      const [survivor, ...rest] = list;
      duplicateGroups.push({
        key: k,
        thoughtIds: list.map((t) => t.id),
        survivor: survivor.id,
        discarded: rest.map((t) => t.id),
        tenantId,
      });
    }

    // Contradicciones dentro del tenant.
    for (let i = 0; i < tenantThoughts.length; i++) {
      for (let j = i + 1; j < tenantThoughts.length; j++) {
        const reason = isNegationPair(tenantThoughts[i], tenantThoughts[j]);
        if (reason) {
          textualNegations.push({
            a: tenantThoughts[i].id,
            b: tenantThoughts[j].id,
            reason,
            tenantId,
          });
        }
      }
    }
  }

  return {
    duplicateGroups,
    textualNegations,
    tenants: [...byTenant.keys()],
    reason: `heuristica determinista: ${duplicateGroups.length} grupos de duplicados, ${textualNegations.length} pares con negacion explicita en ${byTenant.size} tenant(s)`, // CONSOLIDATE_REASON_V1
  };
}