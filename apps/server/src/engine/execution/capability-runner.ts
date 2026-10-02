// CAPABILITY_RUNNER_V1 - ejecuta capabilities del registry como steps de un plan.

import type { ExecutionContext, PlanStep } from "../../../../../packages/domain/src/index.ts";
import type { CapabilityRegistry } from "../capabilities/registry.ts";
import type { StepRunner } from "./executor.ts";

export interface ToolExecutor {
  run(
    ctx: ExecutionContext,
    capabilityId: string,
    inputs: Record<string, unknown>,
  ): Promise<unknown>;
}

export class CapabilityRunner implements StepRunner {
  constructor(
    private readonly registry: CapabilityRegistry,
    private readonly toolExecutors: Map<string, ToolExecutor>,
  ) {}

  async run(ctx: ExecutionContext, step: PlanStep): Promise<void> {
    if (!step.capabilityId) {
      throw new Error(`Step ${step.id} has no capabilityId`);
    }
    const capability = await this.registry.get(step.capabilityId);
    if (!capability) {
      throw new Error(`Capability ${step.capabilityId} not found`);
    }
    const executor = this.toolExecutors.get(capability.kind);
    if (!executor) {
      throw new Error(`No executor for kind ${capability.kind}`);
    }
    await executor.run(ctx, capability.id, step.inputs);
  }
}