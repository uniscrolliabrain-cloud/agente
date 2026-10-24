// PROVENANCE_RESOLVER_V1 - calcula chips de procedencia desde el provenance
// de una entidad o de una memoria.

import type { BusinessEntity } from "../../../../packages/domain/src/business.ts";
import type { AgentMemory } from "../../../../packages/domain/src/agent.ts";
import type { ProvenanceChipKind } from "../../../../packages/domain/src/context-chips.ts";

export function chipForEntity(entity: BusinessEntity | null): ProvenanceChipKind {
  if (!entity) return "missing";
  const c = entity.provenance.confidence;
  if (c === undefined) return "auto";
  if (c >= 0.85) return "alta";
  if (c >= 0.6) return "media";
  return "sugerido";
}

export function chipForMemory(memory: AgentMemory | null): ProvenanceChipKind {
  if (!memory) return "missing";
  if (memory.source === "User" || memory.source === "You") return "tu";
  if (memory.source?.startsWith("Rol ")) return "auto";
  if (memory.source?.startsWith("kernel:")) return "sugerido";
  return "auto";
}

export function chipForSource(source: string): ProvenanceChipKind {
  if (source === "User" || source === "You") return "tu";
  if (source.startsWith("sop:") || source.startsWith("task:")) return "auto";
  if (source.startsWith("kernel:")) return "sugerido";
  if (source.startsWith("catalog:")) return "auto";
  return "media";
}