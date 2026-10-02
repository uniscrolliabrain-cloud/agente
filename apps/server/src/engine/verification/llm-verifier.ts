// LLM_VERIFIER_V2 - segunda capa real de verificacion. Solo se llama si el
// deterministico falla y hay evidencia. Timeout duro. Nunca rompe la tarea.

import { EventType, type RunAgentInput } from "@ag-ui/core";
import { randomUUID } from "node:crypto";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { modelChain, runWithModelFallback } from "../model-chain.ts";
import type { Config } from "../../config.ts";
import type {
  Goal,
  Outcome,
  VerificationResult,
} from "../../../../../packages/domain/src/index.ts";
import type { Verifier } from "./verifier.ts";

export class LlmVerifier implements Verifier {
  constructor(
    private readonly config: Config,
    private readonly inner: Verifier,
  ) {}

  async verify(goal: Goal, outcome: Outcome): Promise<VerificationResult> {
    const base = await this.inner.verify(goal, outcome);
    if (base.verified) return base;
    if (outcome.evidence.length === 0) return base;
    if (!this.config.model) return base;

    const instruction = [
      "Evalua si el Outcome satisface el Goal. Responde SOLO JSON:",
      '{"verified": bool, "reason": "string", "missing": ["..."]}',
      "",
      `Goal: ${goal.title}`,
      `Criterios: ${JSON.stringify(goal.successCriteria)}`,
      `Outcome: ${outcome.summary}`,
      `Metricas: ${JSON.stringify(outcome.metrics)}`,
      `Evidencia: ${outcome.evidence.map((e) => e.excerpt ?? "").join(" | ").slice(0, 4000)}`,
    ].join("\n");

    const runInput: RunAgentInput = {
      threadId: `verifier-${randomUUID()}`,
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
    try {
      const run = runWithModelFallback(modelChain(this.config), createAgent, runInput);
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          run.abort();
          reject(new Error("verifier timed out"));
        }, 45000);
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

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart < 0 || jsonEnd < 0) return base;
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      return {
        verified: Boolean(parsed.verified),
        reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 2000) : base.reason,
        missing: Array.isArray(parsed.missing) ? parsed.missing.slice(0, 50) : base.missing,
        satisfiedCriteria: base.satisfiedCriteria,
        failedCriteria: base.failedCriteria,
        confidence: 0.8,
        method: "hybrid",
        verifiedAt: new Date().toISOString(),
      };
    } catch {
      return base;
    }
  }
}