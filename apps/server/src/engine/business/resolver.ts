// ENTITY_RESOLVER_V1 - resuelve entidades candidatas por email/name/cif.

import type { Store } from "../../db.ts";
import type { BusinessEntity } from "../../../../../packages/domain/src/business.ts";

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
    candidate: { name?: string; email?: string; cif?: string },
  ): Promise<Array<{ entityId: string; confidence: number; reasons: string[] }>> {
    const all = await this.db.list<BusinessEntity>(owner, "business-entities");
    const typed = all.filter((e) => e.type === type);
    const matches: Array<{ entityId: string; confidence: number; reasons: string[] }> = [];

    for (const entity of typed) {
      const reasons: string[] = [];
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
        matches.push({
          entityId: entity.id,
          confidence: Math.min(1, reasons.length * 0.4),
          reasons,
        });
      }
    }

    void tenantId;
    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }
}