// KERNEL_RULES_V1 — reglas explicitas de promocion.
//
// Cada regla tiene id, description, y matches(thought). Determinista,
// auditable, testeable. Sin LLM, sin heuristica difusa. El PromotionResult
// incluye que regla aplico a cada Thought, para que la decision sea
// reconstruible desde el audit trail.
//
// El orden importa: la primera regla que matchea decide.

import type { Thought, ThoughtRole } from "./thought.ts";
import { isFocusedOn, topMatched } from "./attention.ts";

export interface PromotionRule {
  id: string;
  description: string;
  matches(thought: Thought): boolean;
}

function hasContent(thought: Thought): boolean {
  if (typeof thought.content === "string") return thought.content.trim().length > 0;
  return Object.keys(thought.content).length > 0;
}

const SURVIVOR_ROLES: ReadonlySet<ThoughtRole> = new Set([
  "observation",
  "action",
  "response",
  "reflection",
  "confirmation",
  "correction",
  "critic",
  "verifier",
]);

export const RULES: readonly PromotionRule[] = [
  {
    id: "survive_actionable_role_with_content",
    description:
      "Sobrevive si el Thought tiene rol accionable (observation, action, response, reflection, confirmation, correction, critic, verifier) y contenido no vacio.",
    matches: (t) => hasContent(t) && SURVIVOR_ROLES.has(t.role),
  },
  // RULES_CONFIRM_CORRECTION_V1 — confirmation y correction requieren que
  // el nodo que confirman/corrigen esté presente en `matched`. Si no,
  // no sobreviven.
  // Ver: auditoría profunda 09.
  {
    id: "survive_confirmation_with_target",
    description:
      "Sobrevive si el rol es confirmation y el nodo confirmado está en matched.",
    matches: (t) =>
      t.role === "confirmation" &&
      hasContent(t) &&
      t.attention.matched.length > 0,
  },
  {
    id: "survive_correction_with_target",
    description:
      "Sobrevive si el rol es correction y hay un nodo matched al que corrige.",
    matches: (t) =>
      t.role === "correction" &&
      hasContent(t) &&
      t.attention.matched.length > 0,
  },
  {
    id: "survive_high_confidence_primary",
    description:
      "Sobrevive si la atencion tiene confianza >= 0.9 y el primary esta en matched.",
    matches: (t) =>
      hasContent(t) &&
      t.attention.confidence >= 0.9 &&
      t.attention.matched.some((m) => m.node === t.attention.primary),
  },
  {
    id: "discard_delegation_internal",
    description:
      "Se descarta si el rol es delegation y el contenido es interno (no es respuesta al usuario).",
    matches: (t) => t.role === "delegation",
  },
  {
    id: "discard_empty",
    description: "Se descarta si el contenido esta vacio.",
    matches: (t) => !hasContent(t),
  },
  {
    id: "discard_reasoning_noise",
    description:
      "Se descarta si el rol es reasoning y no tiene matched (razonamiento sin anclaje a datos).",
    matches: (t) => t.role === "reasoning" && t.attention.matched.length === 0,
  },
  // RULES_ATTENTION_V1 — regla de promoción basada en atención.
  // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md ("Rules.ts sin atención"),
  // roadmap §8 ("Rules.classify con isFocusedOn").
  {
    id: "survive_high_attention_focus",
    description:
      "Sobrevive si la atención está claramente centrada en un nodo (isFocusedOn >= 0.7) y el contenido no está vacío.",
    matches: (t) =>
      hasContent(t) &&
      topMatched(t.attention, 1).some((m) => isFocusedOn(t.attention, m.node, 0.7)),
  },
];

export interface RuleOutcome {
  rule: PromotionRule;
  survives: boolean;
}

export function classify(thought: Thought): RuleOutcome | undefined {
  for (const rule of RULES) {
    if (rule.matches(thought)) {
      return {
        rule,
        survives: rule.id.startsWith("survive_"),
      };
    }
  }
  return undefined;
}

/**
 * RULES_TENANT_GUARD_V1 - classify con verificacion de tenant.
 *
 * Cierra #206: rules.ts no verificaba el tenant. Un thought de otro tenant
 * podia colarse si el caller pasaba una lista mezclada. Ahora, si el thought
 * no pertenece al tenant esperado, se descarta con una regla sintetica.
 *
 * No forma parte de RULES porque no es una regla de negocio: es un guard.
 * Se aplica antes del classify normal.
 */
export interface TenantGuardResult {
  allowed: boolean;
  reason?: string;
}

export function checkTenant(thought: Thought, expectedTenantId: string): TenantGuardResult {
  if (!expectedTenantId) return { allowed: true };
  if (thought.tenantId === expectedTenantId) return { allowed: true };
  return {
    allowed: false,
    reason: `thought ${thought.id} pertenece a tenant ${thought.tenantId}, esperado ${expectedTenantId}`,
  };
}

export function classifyWithTenant(
  thought: Thought,
  expectedTenantId: string,
): RuleOutcome | undefined {
  const guard = checkTenant(thought, expectedTenantId);
  if (!guard.allowed) {
    return {
      rule: {
        id: "discard_tenant_mismatch",
        description: `Descartado: ${guard.reason}`,
        matches: () => true,
      },
      survives: false,
    };
  }
  return classify(thought);
}