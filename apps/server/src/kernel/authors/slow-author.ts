// KERNEL_SLOW_AUTHOR_V1 — escribe el razonamiento del slow LLM al grafo.

import { randomUUID } from "node:crypto";
import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface SlowAuthorDeps {
  kernel: Kernel;
}

export class SlowAuthor {
  constructor(private readonly deps: SlowAuthorDeps) {}

  async writeReasoning(
    ctx: KernelContext,
    turnId: string,
    reasoning: string,
  ): Promise<Thought> {
    return this.deps.kernel.appendThought(ctx, {
      turnId,
      actor: { kind: "slow-llm", id: "slow" },
      role: "reasoning",
      content: reasoning,
      attention: {
        id: randomUUID(),
        author: "slow",
        primary: "reasoning",
        secondary: [],
        query: "",
        matched: [],
        ignored: [],
        intent: "reason",
        confidence: 1,
        scope: "turn",
        timestamp: new Date().toISOString(),
        metadata: {},
      },
      context: { entities: [], policies: [], skills: [], priorThoughts: [] },
      edges: [],
    });
  }

  async writeDelegation(
    ctx: KernelContext,
    turnId: string,
    delegation: string,
  ): Promise<Thought> {
    return this.deps.kernel.appendThought(ctx, {
      turnId,
      actor: { kind: "slow-llm", id: "slow" },
      role: "delegation",
      content: delegation,
      attention: {
        id: randomUUID(),
        author: "slow",
        primary: "delegation",
        secondary: [],
        query: "",
        matched: [],
        ignored: [],
        intent: "delegate",
        confidence: 1,
        scope: "turn",
        timestamp: new Date().toISOString(),
        metadata: {},
      },
      context: { entities: [], policies: [], skills: [], priorThoughts: [] },
      edges: [],
    });
  }
}