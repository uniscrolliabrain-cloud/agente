// KERNEL_PRESENTER_V1 — decide que contar al usuario.

import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought, ThoughtRole } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface PresenterDeps {
  kernel: Kernel;
}

export interface Presentation {
  turnId: string;
  thoughtId: string;
  role: ThoughtRole;
  content: Thought["content"];
  actor: Thought["actor"];
  reason: string;
}

const PRIORITY: ThoughtRole[] = [
  "response",
  "display",
  "confirmation",
  "correction",
  "reasoning",
  "critic",
  "verifier",
  "observation",
  "action",
  "reflection",
  "delegation",
  "query",
  "intent",
];

function pickByPriority(thoughts: Thought[]): { thought: Thought; reason: string } | undefined {
  for (const role of PRIORITY) {
    const found = thoughts.find((t) => t.role === role);
    if (found) return { thought: found, reason: `selected role ${role} by priority` };
  }
  const last = thoughts[thoughts.length - 1];
  return last ? { thought: last, reason: "selected last thought as fallback" } : undefined;
}

export class Presenter {
  constructor(private readonly deps: PresenterDeps) {}

  async present(ctx: KernelContext, turnId: string): Promise<Presentation | undefined> {
    const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
    if (thoughts.length === 0) return undefined;
    const picked = pickByPriority(thoughts);
    if (!picked) return undefined;
    const { thought, reason } = picked;
    return {
      turnId,
      thoughtId: thought.id,
      role: thought.role,
      content: thought.content,
      actor: thought.actor,
      reason,
    };
  }
}