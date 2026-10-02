// CAPABILITY_RUNNER_V2 - ejecuta capabilities por id.

import type { ExecutionContext, PlanStep } from "../../../../../packages/domain/src/index.ts";
import type { CapabilityRegistry } from "../capabilities/registry.ts";
import type { StepRunner } from "./executor.ts";
import type { ToolExecutor } from "./tool-executors.ts";

export class CapabilityRunner implements StepRunner {
  constructor(
    private readonly registry: CapabilityRegistry,
    private readonly executors: Map<string, ToolExecutor>,
  ) {}

  async run(ctx: ExecutionContext, step: PlanStep): Promise<void> {
    if (!step.capabilityId) throw new Error(`Step ${step.id} has no capabilityId`);
    const capability = await this.registry.get(step.capabilityId);
    if (!capability) throw new Error(`Capability ${step.capabilityId} not found`);
    const exec = this.executors.get(capability.id);
    if (!exec) throw new Error(`No executor for capability ${capability.id}`);
    await exec.run(ctx, capability.id, step.inputs);
  }
}