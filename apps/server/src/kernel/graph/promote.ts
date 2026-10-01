// KERNEL_PROMOTE_V2 — promocion determinista con reglas explicitas.
//
// Cambios respecto a V1:
//   - Las reglas viven en rules.ts, no en un Set suelto.
//   - El PromotionResult incluye que regla aplico a cada Thought.
//   - Llama a consolidate() al final para fusionar duplicados y detectar
//     contradicciones antes de devolver el resultado.
//
// No escribe en ningun sitio todavia: la escritura real (business graph,
// memoria, policy, audit) es un bloque posterior.

import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "./thought.ts";
import type { Kernel } from "../kernel.ts";
import { classify } from "./rules.ts";
import { consolidate, type ConsolidationResult } from "./consolidate.ts";

export interface PromotionDeps {
  kernel: Kernel;
}

export interface PromotionCounts {
  intent: number;
  observation: number;
  reasoning: number;
  response: number;
  action: number;
  reflection: number;
  display: number;
  delegation: number;
  critic: number;
  verifier: number;
  query: number;
  confirmation: number;
  correction: number;
}

export interface PromotionDecision {
  thoughtId: string;
  ruleId: string;
  survives: boolean;
}

export interface PromotionResult {
  turnId: string;
  tenantId: string;
  owner: string;
  totalThoughts: number;
  counts: PromotionCounts;
  survivors: string[];
  discarded: string[];
  decisions: PromotionDecision[];
  consolidation?: ConsolidationResult;
  reason: string;
}

function emptyCounts(): PromotionCounts {
  return {
    intent: 0,
    observation: 0,
    reasoning: 0,
    response: 0,
    action: 0,
    reflection: 0,
    display: 0,
    delegation: 0,
    critic: 0,
    verifier: 0,
    query: 0,
    confirmation: 0,
    correction: 0,
  };
}

export class Promoter {
  constructor(private readonly deps: PromotionDeps) {}

  async promote(ctx: KernelContext, turnId: string): Promise<PromotionResult | undefined> {
    const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
    if (thoughts.length === 0) return undefined;
    const counts = emptyCounts();
    const survivors: string[] = [];
    const discarded: string[] = [];
    const decisions: PromotionDecision[] = [];
    for (const thought of thoughts) {
      counts[thought.role] += 1;
      const outcome = classify(thought);
      if (outcome) {
        decisions.push({
          thoughtId: thought.id,
          ruleId: outcome.rule.id,
          survives: outcome.survives,
        });
        if (outcome.survives) survivors.push(thought.id);
        else discarded.push(thought.id);
      } else {
        decisions.push({
          thoughtId: thought.id,
          ruleId: "no_rule_matched",
          survives: false,
        });
        discarded.push(thought.id);
      }
    }
    const consolidation = consolidate(thoughts);
    return {
      turnId,
      tenantId: thoughts[0].tenantId,
      owner: thoughts[0].owner,
      totalThoughts: thoughts.length,
      counts,
      survivors,
      discarded,
      decisions,
      consolidation,
      reason: `rules.ts aplicado en orden; ${survivors.length} sobreviven, ${discarded.length} descartados`,
    };
  }
}