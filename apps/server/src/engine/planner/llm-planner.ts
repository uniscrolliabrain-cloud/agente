// LLM_PLANNER_V2 - genera planes con el modelo real. Mismo patron que conversation.ts.

import { EventType, type RunAgentInput } from "@ag-ui/core";
import { randomUUID } from "node:crypto";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { modelChain, runWithModelFallback } from "../model-chain.ts";
import type { Config } from "../../config.ts";
import type { Goal, Plan } from "../../../../../packages/domain/src/index.ts";
import type { Planner, PlannerInput } from "./planner.ts";
import { parsePlannerResponse } from "./planner.ts";

export class LlmPlanner implements Planner {
  constructor(
    private readonly config: Config,
    private readonly fallback?: Planner,
  ) {}

  async plan(input: PlannerInput): Promise<Plan> {
    if (!this.config.model) {
      if (this.fallback) return this.fallback.plan(input);
      throw new Error("No model configured and no fallback");
    }

    const capabilities = input.capabilities
      .map((c) => `- ${c.id} (${c.kind})`)
      .join("\n");

    const instruction = [
      "Eres un planificador. Devuelve SOLO un array JSON de pasos.",
      `Objetivo: ${input.goal.title}`,
      `Descripcion: ${input.goal.description}`,
      `Criterios de exito: ${JSON.stringify(input.goal.successCriteria)}`,
      "Capabilities disponibles:",
      capabilities || "(ninguna)",
      "",
      "Formato de cada paso: {id, title, capabilityId, inputs, dependsOn}",
      "Maximo 10 pasos. Solo JSON.",
    ].join("\n");

    const runInput: RunAgentInput = {
      threadId: `planner-${randomUUID()}`,
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
        prompt: "Respondes solo con JSON valido, sin texto adicional.",
      });

    let text = "";
    const run = runWithModelFallback(modelChain(this.config), createAgent, runInput);
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        run.abort();
        reject(new Error("planner timed out"));
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
        error: (error) => {
          clearTimeout(timeout);
          reject(error);
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
    if (parsed) return parsed;
    if (this.fallback) return this.fallback.plan(input);
    throw new Error("Planner produced no valid plan");
  }
}