// KERNEL_USER_AUTHOR_V2 - escribe el mensaje del usuario al grafo con provenance.
//
// Cambios respecto a V1:
//   - Acepta threadId, messageId, parentThoughtId.
//   - La metadata del AttentionVector lleva threadId y messageId.
//   - El provenance lleva el source real (user.message) y el parentId si lo hay.
//
// Nota: el prompt del usuario NO se trunca aqui. El tope de tamano se aplica
// en el caller (conversation.ts) o en el schema del Thought.

import { randomUUID } from "node:crypto";
import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface UserAuthorDeps {
  kernel: Kernel;
}

export interface UserAuthorWriteInput {
  turnId: string;
  message: string;
  threadId?: string;
  messageId?: string;
  parentThoughtId?: string;
}

export class UserAuthor {
  constructor(private readonly deps: UserAuthorDeps) {}

  async write(ctx: KernelContext, input: UserAuthorWriteInput): Promise<Thought> {
    const now = new Date().toISOString();
    return this.deps.kernel.appendThought(ctx, {
      turnId: input.turnId,
      actor: { kind: "user", id: ctx.owner },
      role: "intent",
      content: input.message,
      attention: {
        id: randomUUID(),
        author: "user",
        primary: ctx.owner,
        secondary: [],
        query: input.message.slice(0, 500),
        // USER_AUTHOR_ATTENTION_V1 - matched real con thread y user.
        matched: [
          ...(input.threadId ? [{ node: `thread:${input.threadId}`, weight: 0.9, reason: "user in thread", metadata: {} }] : []),
          { node: `user:${ctx.owner}`, weight: 0.7, reason: "user identity", metadata: {} },
        ],
        ignored: [],
        intent: "user.message",
        confidence: 1,
        scope: "turn",
        timestamp: now,
        metadata: {
          ...(input.threadId ? { threadId: input.threadId } : {}),
          ...(input.messageId ? { messageId: input.messageId } : {}),
        },
      },
      context: { entities: [], policies: [], skills: [], priorThoughts: [] },
      edges: [],
      provenance: {
        source: "user.message",
        timestamp: now,
        ...(input.parentThoughtId ? { parentId: input.parentThoughtId } : {}),
      },
    });
  }
}
