// B101b_APPLIED
import { randomUUID } from "node:crypto";
import {
  type BusinessEntity,
  type BusinessRelation,
  businessEntitySchema,
  businessRelationSchema,
} from "../../../../../packages/domain/src/business.ts";
import type { Store } from "../../db.ts";
import { AppError } from "../../errors.ts";
import type { EventBus } from "../events/index.ts";
import type { StateMachineRegistry } from "../state-machines.ts";

const ENTITY_KIND = "business-entities";
const RELATION_KIND = "business-relations";

export interface CreateEntityInput {
  id?: string;
  type: string;
  name: string;
  status?: string;
  properties?: Record<string, unknown>;
  actor: string;
  source: string;
  confidence?: number;
}

export interface UpdateEntityInput {
  name?: string;
  status?: string;
  properties?: Record<string, unknown>;
  actor: string;
  source: string;
  confidence?: number;
}

export interface CreateRelationInput {
  id?: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  properties?: Record<string, unknown>;
  actor: string;
  source: string;
}

export interface Neighborhood {
  entities: BusinessEntity[];
  relations: BusinessRelation[];
}

export class BusinessGraph {
  constructor(
    private readonly db: Store,
    private readonly bus?: EventBus,
    private readonly stateMachines?: StateMachineRegistry,
  ) {}

  async createEntity(owner: string, input: CreateEntityInput): Promise<BusinessEntity> {
    const id = input.id ?? randomUUID();
    const existing = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
    if (existing) throw new AppError(`Entity already exists: ${id}`, 409);
    const entity = businessEntitySchema.parse({
      id,
      type: input.type,
      name: input.name,
      ...(input.status ? { status: input.status } : {}),
      properties: input.properties ?? {},
      schemaVersion: "1.0",
      provenance: {
        source: input.source,
        actor: input.actor,
        updatedAt: new Date().toISOString(),
        ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
      },
    });
    await this.db.insertIfAbsent(owner, ENTITY_KIND, entity);
    await this.bus?.emit(owner, "entity.created", { kind: "entity", id: entity.id }, {
      entityId: entity.id,
      entityType: entity.type,
      version: 1,
    });
    return entity;
  }

  async updateEntity(owner: string, id: string, patch: UpdateEntityInput): Promise<BusinessEntity> {
    const current = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
    if (!current) throw new AppError(`Entity not found: ${id}`, 404);
    // B101b — si la entidad declara stateMachineId y este patch cambia status,
    // validamos la transicion via StateMachineRegistry. Sin stateMachineId o sin
    // registry, comportamiento previo.
    if (
      this.stateMachines &&
      current.stateMachineId &&
      patch.status !== undefined &&
      patch.status !== current.status
    ) {
      const from = current.status ?? "";
      await this.stateMachines.apply(owner, current.stateMachineId, id, from, patch.status, patch.actor);
    }
    const next = businessEntitySchema.parse({
      ...current,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      properties: { ...current.properties, ...(patch.properties ?? {}) },
      provenance: {
        source: patch.source,
        actor: patch.actor,
        updatedAt: new Date().toISOString(),
        ...(patch.confidence !== undefined ? { confidence: patch.confidence } : {}),
      },
    });
    await this.db.put(owner, ENTITY_KIND, next);
    await this.bus?.emit(owner, "entity.updated", { kind: "entity", id }, {
      entityId: id,
      entityType: next.type,
      version: 1,
      changedFields: Object.keys(patch).filter((key) => key !== "actor" && key !== "source"),
    });
    return next;
  }

  async getEntity(owner: string, id: string): Promise<BusinessEntity | null> {
    return this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
  }

  async listEntities(owner: string, type?: string): Promise<BusinessEntity[]> {
    const all = await this.db.list<BusinessEntity>(owner, ENTITY_KIND);
    return type ? all.filter((entity) => entity.type === type) : all;
  }

  async deleteEntity(owner: string, id: string, actor: string): Promise<void> {
    const current = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
    if (!current) throw new AppError(`Entity not found: ${id}`, 404);
    const relations = await this.db.list<BusinessRelation>(owner, RELATION_KIND);
    for (const relation of relations) {
      if (relation.fromEntityId === id || relation.toEntityId === id) {
        await this.db.remove(owner, RELATION_KIND, relation.id);
        await this.bus?.emit(owner, "relation.deleted", { kind: "relation", id: relation.id }, {
          relationId: relation.id,
        });
      }
    }
    await this.db.remove(owner, ENTITY_KIND, id);
    await this.bus?.emit(owner, "entity.deleted", { kind: "entity", id }, {
      entityId: id,
      entityType: current.type,
    });
    void actor;
  }

  async createRelation(owner: string, input: CreateRelationInput): Promise<BusinessRelation> {
    const id = input.id ?? randomUUID();
    const from = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, input.fromEntityId);
    if (!from) throw new AppError(`From entity not found: ${input.fromEntityId}`, 404);
    const to = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, input.toEntityId);
    if (!to) throw new AppError(`To entity not found: ${input.toEntityId}`, 404);
    const relation = businessRelationSchema.parse({
      id,
      fromEntityId: input.fromEntityId,
      toEntityId: input.toEntityId,
      type: input.type,
      properties: input.properties ?? {},
      provenance: {
        source: input.source,
        actor: input.actor,
        updatedAt: new Date().toISOString(),
      },
    });
    await this.db.insertIfAbsent(owner, RELATION_KIND, relation);
    await this.bus?.emit(owner, "relation.created", { kind: "relation", id: relation.id }, {
      relationId: relation.id,
      fromEntityId: relation.fromEntityId,
      toEntityId: relation.toEntityId,
      relationType: relation.type,
    });
    return relation;
  }

  async listRelations(owner: string, entityId?: string): Promise<BusinessRelation[]> {
    const all = await this.db.list<BusinessRelation>(owner, RELATION_KIND);
    if (!entityId) return all;
    return all.filter(
      (relation) => relation.fromEntityId === entityId || relation.toEntityId === entityId,
    );
  }

  async neighborhood(owner: string, entityId: string, depth = 1): Promise<Neighborhood> {
    const entities = await this.listEntities(owner);
    const relations = await this.listRelations(owner);
    const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
    const found = new Set<string>([entityId]);
    let frontier = new Set<string>([entityId]);
    for (let level = 0; level < depth; level += 1) {
      const next = new Set<string>();
      for (const relation of relations) {
        if (!frontier.has(relation.fromEntityId) && !frontier.has(relation.toEntityId)) continue;
        next.add(relation.fromEntityId);
        next.add(relation.toEntityId);
      }
      for (const id of next) if (!found.has(id)) found.add(id);
      frontier = next;
      if (next.size === 0) break;
    }
    return {
      entities: [...found]
        .map((id) => entityMap.get(id))
        .filter((entity): entity is BusinessEntity => Boolean(entity)),
      relations: relations.filter(
        (relation) => found.has(relation.fromEntityId) && found.has(relation.toEntityId),
      ),
    };
  }
}
