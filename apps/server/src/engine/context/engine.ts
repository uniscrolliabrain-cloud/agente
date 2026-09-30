import type { AgentMemory, AgentRole, MemoryCategory } from "../../../../../packages/domain/src/agent.ts";
import type { BusinessEntity, BusinessRelation } from "../../../../../packages/domain/src/business.ts";
import type { Store } from "../../db.ts";
import type { BusinessGraph } from "../business/graph.ts";
import type { EventBus, SystemEvent } from "../events/index.ts";
import type { MemoryService, RecallResult } from "../memory.ts";

// CONTEXT_ENGINE_V1 — ensambla el contexto completo para una ejecucion.
// Envuelve a MemoryService.recall (semantico) y anade: rol, entidad,
// relaciones, eventos recientes. El resultado es un paquete tipado que
// el runtime del agente usa para decidir que mostrar y como actuar.

export interface ContextPackage {
  role: {
    id: string;
    name: string;
    tone: string;
    objetivo: string;
    memories: AgentMemory[];
  };
  entity?: BusinessEntity;
  relations: BusinessRelation[];
  events: SystemEvent[];
  recall: RecallResult;
  metadata: {
    assembledAt: string;
  };
}

export interface AssembleInput {
  roleId: string;
  entityId?: string;
  query: string;
  eventLimit?: number;
  history?: string[];
}

const DEFAULT_EVENT_LIMIT = 20;

export class ContextEngine {
  constructor(
    private readonly db: Store,
    private readonly graph: BusinessGraph,
    private readonly memory: MemoryService,
    private readonly bus?: EventBus,
  ) {}

  async assemble(owner: string, input: AssembleInput): Promise<ContextPackage> {
    const role = await this.db.get<AgentRole>(owner, "agent-roles", input.roleId);
    if (!role) throw new Error(`Role not found: ${input.roleId}`);
    const storedMemories = (await this.db.list<AgentMemory>(owner, "memories")).filter(
      (m) => m.roleId === role.id,
    );
    // CONTEXT_INLINE_ROLE_MEMORIES — las memorias inline del rol ({kind, text}) son su canon
    // (identidad/dominio/preferencias/historial). Hasta ahora assemble solo miraba la coleccion
    // "memories", asi que un rol sin seedear llegaba al contexto sin ninguna memoria. Se
    // materializan aqui con la misma categoria que usa el seed (rol-<kind>, declarada en el
    // dominio) y se saltan las que ya estan guardadas para no duplicar el texto si el rol ya
    // fue seedeado.
    const seen = new Set(storedMemories.map((m) => m.text.trim().toLowerCase()));
    const now = new Date().toISOString();
    const inlineMemories: AgentMemory[] = (role.memories ?? [])
      .map((m, index) => ({ m, index }))
      .filter(({ m }) => !seen.has(m.text.trim().toLowerCase()))
      .map(({ m, index }) => ({
        id: `role:${role.id}:${index}`,
        text: m.text,
        source: `Rol ${role.name}`,
        category: `rol-${m.kind}` as MemoryCategory,
        roleId: role.id,
        createdAt: role.createdAt ?? now,
      }));
    const roleMemories = [...inlineMemories, ...storedMemories];
    const entity = input.entityId
      ? await this.graph.getEntity(owner, input.entityId)
      : null;
    const relations = entity
      ? await this.graph.listRelations(owner, entity.id)
      : [];
    const events = entity
      ? (await this.bus?.list(owner, { limit: input.eventLimit ?? DEFAULT_EVENT_LIMIT })) ?? []
      : [];
    const recall = await this.memory.recall(owner, input.query, {
      ...(input.history ? { history: input.history } : {}),
    });
    const pkg: ContextPackage = {
      role: {
        id: role.id,
        name: role.name,
        tone: role.tone,
        objetivo: role.objetivo,
        memories: roleMemories,
      },
      ...(entity ? { entity } : {}),
      relations,
      events,
      recall,
      metadata: { assembledAt: new Date().toISOString() },
    };
    await this.bus?.emit(owner, "context.assembled", { kind: "context", id: input.roleId }, {
      roleId: role.id,
      entityCount: entity ? 1 : 0,
      relationCount: relations.length,
      knowledgeCount: roleMemories.length + events.length,
      policyCount: 0,
    });
    return pkg;
  }
}
