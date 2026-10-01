// KERNEL_USER_AUTHOR_V1 — escribe el mensaje del usuario al grafo.
//
// El usuario no habla "al LLM": habla al grafo. Su mensaje es un Thought
// con role "intent", actor "user", atencion scope "turn", author "user".

import { randomUUID } from "node:crypto";
import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface UserAuthorDeps {
  kernel: Kernel;
}

export class UserAuthor {
  constructor(private readonly deps: UserAuthorDeps) {}

  async write(ctx: KernelContext, turnId: string, message: string): Promise<Thought> {
    return this.deps.kernel.appendThought(ctx, {
      turnId,
      actor: { kind: "user", id: ctx.owner },
      role: "intent",
      content: message,
      attention: {
        id: randomUUID(),
        author: "user",
        primary: ctx.owner,
        secondary: [],
        query: message.slice(0, 500),
        matched: [],
        ignored: [],
        intent: "user.message",
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