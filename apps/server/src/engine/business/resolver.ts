// ENTITY_RESOLVER_V1 - resuelve entidades candidatas por email/name/cif.
// ENTITY_RESOLUTION_WIRE_V1 - devuelve el contrato EntityMatch del dominio y
// sus MatchReason, en vez de una forma local paralela.

import type { Store } from "../../db.ts";
import type { BusinessEntity } from "../../../../../packages/domain/src/business.ts";
import type {
  EntityCandidate,
  EntityMatch,
  MatchReason,
} from "../../../../../packages/domain/src/entity-resolution.ts";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(s\.?l\.?|s\.?a\.?|inc|llc)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export class EntityResolver {
  constructor(private readonly db: Store) {}

  async findCandidates(
    tenantId: string,
    owner: string,
    type: string,
    candidate: Partial<EntityCandidate>,
  ): Promise<EntityMatch[]> {
    const all = await this.db.list<BusinessEntity>(owner, "business-entities");
    const typed = all.filter((e) => e.type === type);
    const matches: EntityMatch[] = [];

    for (const entity of typed) {
      const reasons: MatchReason[] = [];
      const props = entity.properties as Record<string, unknown>;

      if (candidate.email && props.email && String(props.email).toLowerCase() === candidate.email.toLowerCase()) {
        reasons.push("same_email");
      }
      if (candidate.cif && props.cif && String(props.cif).toUpperCase() === candidate.cif.toUpperCase()) {
        reasons.push("same_cif");
      }
      if (candidate.name && entity.name && normalize(entity.name) === normalize(candidate.name)) {
        reasons.push("normalized_name");
      }

      if (reasons.length > 0) {
        const confidence = Math.min(1, reasons.length * 0.4);
        matches.push({
          candidateId: candidate.id ?? `candidate:${type}`,
          existingId: entity.id,
          confidence,
          reasons,
          decision: confidence >= 0.8 ? "auto_merge" : "propose_merge",
        });
      }
    }

    void tenantId;
    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }
}
