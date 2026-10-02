// BUSINESS_OS_ORCHESTRATOR_V1 - ciclo completo Goal -> Verify -> Replan.

import type {
  ExecutionContext,
  Goal,
} from "../../../../../packages/domain/src/index.ts";

export interface GoalResult {
  status: "achieved" | "partial" | "blocked" | "failed";
  summary: string;
}

export interface OrchestratorDeps {
  // ORCHESTRATOR_LEARNING_WIRE_V1 - observador opcional.
  observer?: {
    observe(input: {
      tenantId: string;
      goal: Goal;
      plan: import("../../../../../packages/domain/src/plan.ts").Plan;
      outcome: import("../../../../../packages/domain/src/outcome.ts").Outcome;
    }): Promise<void>;
  };
  context: {
    assemble(
      owner: string,
      input: { roleId: string; entityId?: string; query: string },
    ): Promise<Record<string, unknown>>;
  };
  capabilities: { list(filter?: { tag?: string }): Promise<Array<{ id: string; kind: string }>> };
  planner: { plan(input: { goal: Goal; context: Record<string, unknown>; capabilities: Array<{ id: string; kind: string }> }): Promise<import("../../../../../packages/domain/src/plan.ts").Plan> };
  executor: {
    execute(
      ctx: ExecutionContext,
      plan: import("../../../../../packages/domain/src/plan.ts").Plan,
    ): Promise<{ status: "succeeded" | "failed"; steps: Array<{ id: string; status: string }> }>;
  };
  verifier: {
    verify(goal: Goal, outcome: import("../../../../../packages/domain/src/outcome.ts").Outcome): Promise<import("../../../../../packages/domain/src/verification.ts").VerificationResult>;
  };
  replanner: {
    replan(input: {
      goal: Goal;
      previousPlan: import("../../../../../packages/domain/src/plan.ts").Plan;
      failedStepId: string;
      error: string;
    }): Promise<import("../../../../../packages/domain/src/plan.ts").Plan | null>;
  };
}

export class BusinessOSOrchestrator {
  constructor(private readonly deps?: OrchestratorDeps) {}

  async runGoal(
    ctx: ExecutionContext,
    goal: Goal,
  ): Promise<GoalResult> {
    // ORCHESTRATOR_REAL_V1 - ciclo completo si hay deps cableadas.
    if (!this.deps) {
      return {
        status: "blocked",
        summary: `Orquestador sin deps (goal ${goal.id})`,
      };
    }

    const context = await this.deps.context.assemble(ctx.owner, {
      roleId: ctx.roleId ?? "default",
      query: goal.description || goal.title,
    });

    const capabilities = await this.deps.capabilities.list();

    const plan = await this.deps.planner.plan({ goal, context, capabilities });

    const execution = await this.deps.executor.execute(ctx, plan);

    // Por ahora sintetizamos un Outcome simple desde la ejecución.
    const outcome: import("../../../../../packages/domain/src/outcome.ts").Outcome = {
      status: execution.status === "succeeded" ? "achieved" : "failed",
      summary: `Ejecutados ${execution.steps.length} pasos`,
      evidence: [],
      metrics: [],
      verified: false,
    };

    const verification = await this.deps.verifier.verify(goal, outcome);

    // ORCHESTRATOR_LEARNING_WIRE_V1 - observar el resultado.
    if (this.deps.observer) {
      await this.deps.observer
        .observe({ tenantId: ctx.tenantId, goal, plan, outcome })
        .catch(() => {});
    }

    if (verification.verified) {
      return { status: "achieved", summary: verification.reason };
    }

    // Replanificar
    const failed = execution.steps.find((s) => s.status === "failed");
    if (failed) {
      const nextPlan = await this.deps.replanner.replan({
        goal,
        previousPlan: plan,
        failedStepId: failed.id,
        error: "step failed",
      });
      if (nextPlan) {
        return {
          status: "partial",
          summary: `Replanificado a plan ${nextPlan.id}`,
        };
      }
    }

    return { status: "blocked", summary: verification.reason };
  }
}