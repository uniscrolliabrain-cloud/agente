// ORCHESTRATOR_REAL_DEPS_V2 - planner y replanner reales con fallback.
// ORCHESTRATOR_GUARDRAILS_V1 - cada paso pasa por GuardrailService.
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
  guardrails?: { checkTaskCreation: (tenantId: string, current: number) => Promise<void> };
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
      input: { roleId: string; entityId?: string; query: string; actorId?: string; sessionId?: string },
    ): Promise<Record<string, unknown>>;
  };
  capabilities: { list(filter?: { tag?: string }): Promise<Array<{ id: string; kind: string }>> };
  planner: { plan(input: { goal: Goal; context: Record<string, unknown>; capabilities: Array<{ id: string; kind: string }> }): Promise<import("../../../../../packages/domain/src/plan.ts").Plan> };
  executor: {
    execute(
      ctx: ExecutionContext,
      plan: import("../../../../../packages/domain/src/plan.ts").Plan,
    ): Promise<{ status: "succeeded" | "failed" | "blocked"; steps: Array<{ id: string; status: string }> }>;
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

    // ORCHESTRATOR_ACTOR_PROPAGATE_V1 - propaga actorId y sessionId si estan.
    const context = await this.deps.context.assemble(ctx.owner, {
      roleId: ctx.roleId ?? "default",
      query: goal.description || goal.title,
      ...(ctx.actorId ? { actorId: ctx.actorId } : {}),
      ...(ctx.sessionId ? { sessionId: ctx.sessionId } : {}),
    });

    const capabilities = await this.deps.capabilities.list();

    const plan = await this.deps.planner.plan({ goal, context, capabilities });

    // ORCHESTRATOR_GUARDRAILS_CALL_V1 - verifica cuota antes de ejecutar.
    if (this.deps.guardrails) {
      await this.deps.guardrails.checkTaskCreation(ctx.tenantId, 0);
    }
    const execution = await this.deps.executor.execute(ctx, plan);

    // ORCHESTRATOR_OUTCOME_EVIDENCE_V1 - outcome honesto: evidence como observation (no fact), blocked si all-skipped.
    const allSkipped = execution.steps.length > 0 && execution.steps.every((s) => s.status === "skipped");
    const evidence: Array<import("../../../../../packages/domain/src/outcome.ts").OutcomeEvidence> = execution.steps
      .filter((s) => s.status === "succeeded")
      .map((s) => ({
        id: `step:${s.id}`,
        kind: "observation" as const,
        source: `step:${s.id}`,
        timestamp: new Date().toISOString(),
      }));
    // ORCHESTRATOR_BLOCKED_AND_HONEST_SUMMARY_V1 - usa execution.status (ahora con blocked) y allSkipped.
    const outcome: import("../../../../../packages/domain/src/outcome.ts").Outcome = {
      status: execution.status === "blocked" || allSkipped ? "blocked" : execution.status === "succeeded" ? "achieved" : "failed",
      summary: `Ejecutados ${execution.steps.length} pasos`,
      evidence,
      metrics: [],
      verified: false,
    };

    const verification = await this.deps.verifier.verify(goal, outcome);
    // ORCHESTRATOR_OUTCOME_VERIFIED_V1 - si el verifier verifica, marcar outcome.verified.
    if (verification.verified) {
      outcome.verified = true;
      outcome.verifiedAt = new Date().toISOString();
      outcome.verificationNote = verification.reason;
    }

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
        // ORCHESTRATOR_BLOCKED_AND_HONEST_SUMMARY_V1 - el plan revisado NO se ejecuta automaticamente.
        return {
          status: "partial",
          summary: `Plan revisado, pendiente de aprobacion: ${nextPlan.id}`,
        };
      }
    }

    return { status: "blocked", summary: verification.reason };
  }
}