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

export async function loadAgentNode(
  db: Store,
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

  return {
    personaId: skin.personaId,
    tenantId,
    owner,
    turns: [],
    thoughts: [],
    memory,
  };
}