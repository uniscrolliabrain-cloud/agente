// GRAPH_STATE_MACHINE_V2 - updateEntity valida contra el StateMachineRegistry.
// GRAPH_ENTITY_RESOLVER_V2 - busca duplicados por email, CIF, nombre normalizado.
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

  // GRAPH_RESOLVER_WIRE_V1 - busca duplicados por cif/email/name antes de crear.
  async createEntity(owner: string, input: CreateEntityInput): Promise<BusinessEntity> {
    // BUSINESS_SCHEMA_WIRE_V2 - validar contra el schema del tenant.
    await this.validateAgainstSchema(owner, input.type, input.properties ?? {});
    // GRAPH_RESOLVER_WIRE_V1 - solo si no hay id explicito, buscamos candidatos.
    const id = input.id ?? randomUUID();
    if (!input.id) {
      try {
        const { EntityResolver } = await import("./resolver.ts");
        const matches = await new EntityResolver(this.db).findCandidates(owner, owner, input.type, {
          ...(input.name ? { name: input.name } : {}),
          ...(typeof input.properties?.email === "string" ? { email: input.properties.email } : {}),
          ...(typeof input.properties?.cif === "string" ? { cif: input.properties.cif } : {}),
        });
        const strong = matches.find((m) => m.confidence >= 0.8);
        if (strong) {
          const found = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, strong.entityId);
          if (found) return found;
        }
      } catch {
        // best-effort: si el resolver falla, se crea igual.
      }
    }
    const existing = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
    if (existing) throw new AppError(`Entity already exists: ${id}`, 409);
    const entity = businessEntitySchema.parse({
      id,
      type: input.type,
      name: input.name,
      ...(input.status ? { status: input.status } : {}),
      properties: input.properties ?? {},
      schemaVersion: "1.0",
      // BUSINESS_GRAPH_VERSION_V1 - primera version.
      version: 1,
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
    const nextVersion = current.version + 1;
    const next = businessEntitySchema.parse({
      ...current,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      properties: { ...current.properties, ...(patch.properties ?? {}) },
      // BUSINESS_GRAPH_VERSION_V1 - version monotonica. Antes siempre 1.
      version: nextVersion,
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
      // BUSINESS_GRAPH_VERSION_V1 - la version real, no 1.
      version: nextVersion,
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

  // BUSINESS_SCHEMA_WIRE_V2 - valida el payload contra el schema del tenant.
  // Si no hay schema registrado o no hay definicion para ese type, deja pasar.
  private async validateAgainstSchema(
    owner: string,
    entityType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    let schema: { entities?: Array<{ type: string; fields?: Array<{ name: string; required?: boolean; type?: string; enumValues?: string[] }> }> } | null = null;
    try {
      schema = await this.db.get(owner, "business-schemas", "default");
    } catch {
      return;
    }
    if (!schema?.entities) return;
    const def = schema.entities.find((e) => e.type === entityType);
    if (!def) return;
    for (const field of def.fields ?? []) {
      const value = payload[field.name];
      if (field.required && (value === undefined || value === null)) {
        throw new AppError(`Entity ${entityType} requires field ${field.name}`, 422);
      }
      if (value === undefined || value === null) continue;
      if (field.type === "number" && typeof value !== "number") {
        throw new AppError(`Field ${field.name} must be number`, 422);
      }
      if (field.type === "boolean" && typeof value !== "boolean") {
        throw new AppError(`Field ${field.name} must be boolean`, 422);
      }
      if (field.type === "enum" && field.enumValues && !field.enumValues.includes(String(value))) {
        throw new AppError(`Field ${field.name} must be one of ${field.enumValues.join(", ")}`, 422);
      }
    }
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
    // BUSINESS_GRAPH_RELATION_RACE_V1 - antes emitiamos relation.created
    // aunque insertIfAbsent hubiera devuelto null (la relacion ya existia).
    // Eso corrompia el event log factual: decia "se creo" cuando no se creo.
    const inserted = await this.db.insertIfAbsent(owner, RELATION_KIND, relation);
    if (inserted) {
      await this.bus?.emit(owner, "relation.created", { kind: "relation", id: relation.id }, {
        relationId: relation.id,
        fromEntityId: relation.fromEntityId,
        toEntityId: relation.toEntityId,
        relationType: relation.type,
      });
    }
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
