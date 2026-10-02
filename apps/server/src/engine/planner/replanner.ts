// REPLANNER_V2 - genera plan nuevo tras fallo, usando el modelo real.

import { EventType, type RunAgentInput } from "@ag-ui/core";
import { randomUUID } from "node:crypto";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { modelChain, runWithModelFallback } from "../model-chain.ts";
import type { Config } from "../../config.ts";
import type { Goal, Plan } from "../../../../../packages/domain/src/index.ts";
import { parsePlannerResponse } from "./planner.ts";

export interface ReplannerInput {
  goal: Goal;
  previousPlan: Plan;
  failedStepId: string;
  error: string;
}

export interface Replanner {
  replan(input: ReplannerInput): Promise<Plan | null>;
}

export class StubReplanner implements Replanner {
  async replan(): Promise<Plan | null> {
    return null;
  }
}

export class LlmReplanner implements Replanner {
  constructor(
    private readonly config: Config,
    private readonly fallback: Replanner = new StubReplanner(),
  ) {}

  async replan(input: ReplannerInput): Promise<Plan | null> {
    if (!this.config.model) return this.fallback.replan(input);

    const failedStep = input.previousPlan.steps.find((s) => s.id === input.failedStepId);
    const instruction = [
      "Eres un planificador. El plan anterior fallo. Genera un plan NUEVO que evite el fallo.",
      `Objetivo: ${input.goal.title}`,
      `Paso fallido: ${failedStep?.title ?? input.failedStepId}`,
      `Error: ${input.error}`,
      `Plan anterior: ${JSON.stringify(input.previousPlan.steps.map((s) => ({ id: s.id, title: s.title, capabilityId: s.capabilityId })))}`,
      "",
      "Devuelve SOLO un array JSON con el plan nuevo. Max 10 pasos.",
    ].join("\n");

    const runInput: RunAgentInput = {
      threadId: `replanner-${randomUUID()}`,
      runId: randomUUID(),
      messages: [{ id: randomUUID(), role: "user", content: instruction }],
      state: {},
      tools: [],
      context: [],
      forwardedProps: {},
    };

    const createAgent = (model: string) =>
      new BuiltInAgent({
        model,
        maxSteps: 1,
        maxRetries: 0,
        tools: [],
        prompt: "Respondes solo con JSON valido.",
      });

    let text = "";
    const run = runWithModelFallback(modelChain(this.config), createAgent, runInput);
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        run.abort();
        reject(new Error("replanner timed out"));
      }, 60000);
      run.events.subscribe({
        next: (event) => {
          if (
            event.type === EventType.TEXT_MESSAGE_CONTENT &&
            "delta" in event &&
            typeof event.delta === "string"
          )
            text += event.delta;
        },
        error: (err) => {
          clearTimeout(timeout);
          reject(err);
        },
        complete: () => {
          clearTimeout(timeout);
          resolve();
        },
      });
    });

    const parsed = parsePlannerResponse(
      text,
      `plan-${randomUUID()}`,
      input.goal.tenantId,
      input.goal.owner,
      input.goal.id,
    );
    if (!parsed) return null;
    parsed.version = input.previousPlan.version + 1;
    parsed.previousPlanId = input.previousPlan.id;
    return parsed;
  }
}