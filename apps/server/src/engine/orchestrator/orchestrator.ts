// BUSINESS_OS_ORCHESTRATOR_V1 - ciclo completo Goal -> Verify -> Replan.

import type {
  ExecutionContext,
  Goal,
} from "../../../../../packages/domain/src/index.ts";

export interface GoalResult {
  status: "achieved" | "partial" | "blocked" | "failed";
  summary: string;
}

export class BusinessOSOrchestrator {
  async runGoal(
    ctx: ExecutionContext,
    goal: Goal,
  ): Promise<GoalResult> {
    return {
      status: "blocked",
      summary: `Orquestador no cableado aun (goal ${goal.id} en tenant ${ctx.tenantId})`,
    };
  }
}