// KERNEL_FAST_AUTHOR_V1 — escribe la respuesta del fast LLM al grafo.

import { randomUUID } from "node:crypto";
import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface FastAuthorDeps {
  kernel: Kernel;
}

export class FastAuthor {
  constructor(private readonly deps: FastAuthorDeps) {}

  async writeResponse(
    ctx: KernelContext,
    turnId: string,
    response: string,
  ): Promise<Thought> {
    return this.deps.kernel.appendThought(ctx, {
      turnId,
      actor: { kind: "fast-llm", id: "fast" },
      role: "response",
      content: response,
      attention: {
        id: randomUUID(),
        author: "fast",
        primary: "response",
        secondary: [],
        query: "",
        matched: [],
        ignored: [],
        intent: "respond",
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