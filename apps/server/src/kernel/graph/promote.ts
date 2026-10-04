// PROMOTER_DESTINATIONS_REAL_V2 - response, memory, business-graph, audit, discard.
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

/**
 * PROMOTION_DESTINATION_V1 - destino explicito de un thought promovido.
 *
 * Antes, PromotionDecision solo decia survives/discarded. El caller no sabia
 * si el thought sobreviviente era una respuesta para el usuario, un hecho para
 * memoria, una entidad para business graph o una accion. Con destination
 * explicito, promote.ts deja de ser decorativo: el caller puede escribir en
 * cada destino real.
 */
export type PromotionDestination =
  | "response"          // al usuario por el presenter
  | "memory"            // AgentMemory
  | "business-graph"    // BusinessGraph entity
  | "audit"             // solo audit trail
  | "discard";          // no se escribe en ningun sitio

export interface PromotionDecision {
  thoughtId: string;
  ruleId: string;
  survives: boolean;
  destination: PromotionDestination;
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
  /** PROMOTION_DESTINATIONS_V1 - resumen por destino, para el caller. */
  destinations: {
    response: string[];
    memory: string[];
    businessGraph: string[];
    audit: string[];
  };
  consolidation?: ConsolidationResult;
  reason: string;
}

/**
 * PROMOTION_DESTINATION_RULE_V1 - decide destino de un thought segun su rol.
 *
 * Determinista. Sin LLM. La tabla es la politica:
 *   - response            -> al usuario (presenter)
 *   - confirmation        -> al usuario (confirmacion)
 *   - correction          -> al usuario (correccion)
 *   - observation         -> memoria (dato observado)
 *   - reflection          -> memoria (aprendizaje)
 *   - action              -> audit (ya se ejecuto, no se re-escribe)
 *   - critic / verifier   -> audit (juicio, no contenido)
 *   - intent              -> audit (input del usuario, ya esta en el chat)
 *   - reasoning           -> discard (razonamiento interno)
 *   - delegation          -> discard (coordinacion interna)
 *   - display / query     -> discard (efimeros)
 *   - confirmation ya arriba
 */
function classifyDestination(role: string): PromotionDestination {
  switch (role) {
    case "response":
    case "confirmation":
    case "correction":
      return "response";
    case "observation":
    case "reflection":
      return "memory";
    // PROMOTE_GRAPH_DESTINATION_V1 - los thoughts de tipo "action" que
    // describen una entidad o un hecho de negocio van al business graph en
    // lugar de solo al audit. El audit los sigue teniendo por separado.
    case "action":
      return "business-graph";
    case "critic":
    case "verifier":
    case "intent":
      return "audit";
    case "reasoning":
    case "delegation":
    case "display":
    case "query":
      return "discard";
    default:
      return "discard";
  }
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
    const destinations = {
      response: [] as string[],
      memory: [] as string[],
      businessGraph: [] as string[],
      audit: [] as string[],
    };
    for (const thought of thoughts) {
      counts[thought.role] += 1;
      const outcome = classify(thought);
      const destination: PromotionDestination =
        outcome && outcome.survives ? classifyDestination(thought.role) : "discard";
      if (outcome) {
        decisions.push({
          thoughtId: thought.id,
          ruleId: outcome.rule.id,
          survives: outcome.survives,
          destination,
        });
        if (outcome.survives) {
          survivors.push(thought.id);
          if (destination === "response") destinations.response.push(thought.id);
          else if (destination === "memory") destinations.memory.push(thought.id);
          else if (destination === "business-graph") destinations.businessGraph.push(thought.id);
          else if (destination === "audit") destinations.audit.push(thought.id);
        } else {
          discarded.push(thought.id);
        }
      } else {
        decisions.push({
          thoughtId: thought.id,
          ruleId: "no_rule_matched",
          survives: false,
          destination: "discard",
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
      destinations,
      consolidation,
      reason: `rules.ts aplicado en orden; ${survivors.length} sobreviven (${destinations.response.length} response, ${destinations.memory.length} memory, ${destinations.audit.length} audit), ${discarded.length} descartados`,
    };
  }
}