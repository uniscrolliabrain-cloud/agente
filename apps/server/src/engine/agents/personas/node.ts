// PERSONAS_NODE_V1 - carga el grafo cognitivo de una persona.
//
// Cada persona tiene su nodo: turns, thoughts, memoria. Aislado por
// personaId. Por ahora:
//   - turns y thoughts: vacios (el kernel aun no soporta personaId,
//     se activa en Macro E).
//   - memory: lee de AgentMemory filtrando por roleId == personaId.

import type { AgentMemory } from "../../../../../../packages/domain/src/agent.ts";
import type { Store } from "../../../db.ts";
import type { AgentNode, AgentSkin } from "./types.ts";

// PERSONAS_NODE_KERNEL_V1 - lee turns y thoughts del kernel por personaId.
export async function loadAgentNode(
  db: Store,
  kernel: import("../../../kernel/index.ts").Kernel,
  tenantId: string,
  owner: string,
  skin: AgentSkin,
  limit = 500,
): Promise<AgentNode> {
  let memory: AgentMemory[] = [];
  try {
    const all = await db.list<AgentMemory>(owner, "memories", { limit });
    memory = all.filter((m) => !m.roleId || m.roleId === skin.personaId);
  } catch {
    memory = [];
  }

  // PERSONAS_NODE_KERNEL_V1 - lee turns y thoughts del kernel.
  let turns: import("../../../kernel/graph/turn.ts").Turn[] = [];
  let thoughts: import("../../../kernel/graph/thought.ts").Thought[] = [];
  try {
    const ctx: import("../../../kernel/context/kernel-context.ts").KernelContext = {
      tenantId,
      owner,
      role: "system",
      requestId: `persona-node:${skin.personaId}:${Date.now()}`,
      personaId: skin.personaId,
    };
    turns = await kernel.listTurns(ctx, limit);
    for (const turn of turns) {
      const ts = await kernel.thoughtsOf(ctx, turn.id);
      thoughts.push(...ts);
    }
  } catch {
    // best-effort
  }

  return {
    personaId: skin.personaId,
    tenantId,
    owner,
    turns,
    thoughts,
    memory,
  };
}