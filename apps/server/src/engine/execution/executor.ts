// EXECUTOR_V1 - ejecuta un Plan step a step con retry y compensacion.

import type { ExecutionContext, Plan } from "../../../../../packages/domain/src/index.ts";

export interface ExecutionResult {
  status: "succeeded" | "failed";
  steps: Array<{ id: string; status: string; error?: string }>;
}

export interface StepRunner {
  run(
    ctx: ExecutionContext,
    step: import("../../../../../packages/domain/src/plan.ts").PlanStep,
  ): Promise<void>;
}

export class Executor {
  constructor(private readonly runner?: StepRunner) {}

  async execute(ctx: ExecutionContext, plan: Plan): Promise<ExecutionResult> {
    if (!this.runner) {
      return {
        status: "failed",
        steps: plan.steps.map((s) => ({ id: s.id, status: "skipped", error: "no runner" })),
      };
    }

    const results: Array<{ id: string; status: string; error?: string }> = [];
    const completed: string[] = [];

    for (const step of plan.steps) {
      const depsOk = step.dependsOn.every((d) => completed.includes(d));
      if (!depsOk) {
        results.push({ id: step.id, status: "skipped", error: "deps not ready" });
        continue;
      }

      const maxAttempts = step.retry?.maxAttempts ?? 1;
      let succeeded = false;
      let lastError: string | undefined;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          await this.runner.run(ctx, step);
          succeeded = true;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : "step failed";
        }
      }

      if (succeeded) {
        results.push({ id: step.id, status: "succeeded" });
        completed.push(step.id);
      } else {
        results.push({ id: step.id, status: "failed", error: lastError });
        // EXECUTOR_COMPENSATION_V2 - ejecuta compensaciones en orden inverso.
        const toCompensate = [...completed].reverse();
        for (const id of toCompensate) {
          const prev = plan.steps.find((s) => s.id === id);
          if (prev?.compensation && this.runner) {
            try {
              await this.runner.run(ctx, {
                ...prev,
                id: `compensate-${prev.id}`,
                capabilityId: prev.compensation.capabilityId,
                inputs: prev.compensation.inputs,
              });
              results.push({ id: `compensate-${prev.id}`, status: "succeeded" });
            } catch (error) {
              results.push({
                id: `compensate-${prev.id}`,
                status: "failed",
                error: error instanceof Error ? error.message : "compensation failed",
              });
            }
          }
        }
        return { status: "failed", steps: results };
      }
    }

    return { status: "succeeded", steps: results };
  }
}