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