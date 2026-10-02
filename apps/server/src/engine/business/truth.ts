import type { BusinessEntity } from "../../../../../packages/domain/src/business.ts";
import type { BusinessGraph } from "./graph.ts";
import { TruthResolver } from "./truth-resolver.ts";

export interface TruthValue {
  value: unknown;
  source: string;
  actor: string;
  updatedAt: string;
  confidence?: number;
}

export interface EntityTruth {
  entityId: string;
  type: string;
  name: string;
  status?: string;
  properties: Record<string, TruthValue>;
  provenance: {
    source: string;
    actor: string;
    updatedAt: string;
    confidence?: number;
  };
}

export class BusinessTruth {
  constructor(private readonly graph: BusinessGraph) {}

  async forEntity(owner: string, entityId: string): Promise<EntityTruth | null> {
    const entity = await this.graph.getEntity(owner, entityId);
    if (!entity) return null;
    return this.project(entity);
  }

  // TRUTH_RESOLVER_WIRE_V1 - resuelve un campo entre varios candidatos.
  resolveField(field: string, candidates: import("../../../../../packages/domain/src/truth.ts").TruthCandidate[]) {
    return new TruthResolver().resolve(field, candidates);
  }

  project(entity: BusinessEntity): EntityTruth {
    const properties: Record<string, TruthValue> = {};
    for (const [key, value] of Object.entries(entity.properties)) {
      properties[key] = {
        value,
        source: entity.provenance.source,
        actor: entity.provenance.actor,
        updatedAt: entity.provenance.updatedAt,
        ...(entity.provenance.confidence !== undefined
          ? { confidence: entity.provenance.confidence }
          : {}),
      };
    }
    return {
      entityId: entity.id,
      type: entity.type,
      name: entity.name,
      ...(entity.status ? { status: entity.status } : {}),
      properties,
      provenance: entity.provenance,
    };
  }
}
