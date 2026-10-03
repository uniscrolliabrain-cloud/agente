// PLANNER_CAPS_INJECT_V1 - capabilities como contexto explicito.
// PLANNER_V1 - genera un Plan desde un Goal + contexto + capabilities.

import type { Goal, Plan } from "../../../../../packages/domain/src/index.ts";

export interface PlannerInput {
  goal: Goal;
  context: Record<string, unknown>;
  capabilities: Array<{ id: string; kind: string }>;
}

export interface Planner {
  plan(input: PlannerInput): Promise<Plan>;
}

/** PLANNER_PARSE_V1 - parsea la respuesta del LLM a PlanStep[]. */
export function parsePlannerResponse(
  raw: string,
  planId: string,
  tenantId: string,
  owner: string,
  goalId: string,
): Plan | null {
  try {
    const trimmed = raw.trim();
    const jsonStart = trimmed.indexOf("[");
    const jsonEnd = trimmed.lastIndexOf("]");
    if (jsonStart < 0 || jsonEnd < 0) return null;
    const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
    if (!Array.isArray(parsed)) return null;
    const steps = parsed.slice(0, 50).map((s, i) => ({
      id: typeof s.id === "string" ? s.id : `step-${i}`,
      title: typeof s.title === "string" ? s.title.slice(0, 200) : `Step ${i + 1}`,
      capabilityId: typeof s.capabilityId === "string" ? s.capabilityId : undefined,
      inputs: typeof s.inputs === "object" && s.inputs !== null ? s.inputs : {},
      dependsOn: Array.isArray(s.dependsOn) ? s.dependsOn.slice(0, 20) : [],
      expectedOutcome: typeof s.expectedOutcome === "string" ? s.expectedOutcome.slice(0, 500) : undefined,
      status: "pending" as const,
    }));
    const now = new Date().toISOString();
    return {
      id: planId,
      tenantId,
      owner,
      goalId,
      version: 1,
      status: "draft",
      steps,
      reason: "Plan generado por LLM",
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}

export class StubPlanner implements Planner {
  async plan(input: PlannerInput): Promise<Plan> {
    const now = new Date().toISOString();
    return {
      id: `plan-${Date.now()}`,
      tenantId: input.goal.tenantId,
      owner: input.goal.owner,
      goalId: input.goal.id,
      version: 1,
      status: "draft",
      steps: [],
      reason: "stub planner: no implementado",
      createdAt: now,
      updatedAt: now,
    };
  }
}
// PLANNER_VALIDATE_POST_V1 - elimina o marca pasos con capabilityId
// inexistente. Se llama justo despues de parsear el plan del LLM.
export function validatePlanCapabilities<T extends { steps: Array<{ id: string; capabilityId?: string }> }>(
  plan: T,
  knownCapabilityIds: Set<string>,
): T {
  const valid = plan.steps.filter((s) => !s.capabilityId || knownCapabilityIds.has(s.capabilityId));
  return { ...plan, steps: valid };
}
// PLANNER_TOKEN_BUDGET_V1 - tope duro de pasos por plan.
export const MAX_PLAN_STEPS = 50;
export function enforcePlanBudget<T extends { steps: unknown[] }>(plan: T): T {
  if (plan.steps.length <= MAX_PLAN_STEPS) return plan;
  return { ...plan, steps: plan.steps.slice(0, MAX_PLAN_STEPS) };
}