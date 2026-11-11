import type { AgentMemory, AgentRole, MemoryCategory } from "../../../../../packages/domain/src/agent.ts";
import type { BusinessEntity, BusinessRelation } from "../../../../../packages/domain/src/business.ts";
import type { Store } from "../../db.ts";
import type { BusinessGraph } from "../business/graph.ts";
import type { EventBus, SystemEvent } from "../events/index.ts";
import type { MemoryService, RecallResult } from "../memory.ts";

// CONTEXT_ENGINE_V1 Ã¢â‚¬â€ ensambla el contexto completo para una ejecucion.
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
  // CONTEXT_EXECUTION_V1 (campana 13) - ejecucion vinculada al hilo: la
  // consulta puede citar el trabajo concreto y no la empresa entera.
  execution?: {
    id: string;
    title: string;
    status: string;
    sopId: string | null;
    entityId: string | null;
  };
  events: SystemEvent[];
  recall: RecallResult;
  // FIX_LEARNING_IN_PKG_V1 - facts aprendidos por LearningObserver.
  // Se calculaban en assemble() pero se descartaban al construir pkg.
  learning: Array<{ text: string; source: string; confidence: number }>;
  metadata: {
    assembledAt: string;
  };
}

export interface AssembleInput {
  roleId: string;
  entityId?: string;
  query: string;
  // CONTEXT_EXECUTION_INPUT_V1 (campana 13)
  executionId?: string;
  eventLimit?: number;
  history?: string[];
  /**
   * CONTEXT_PRIVATE_RECALL_V1 (campana 10) - user id del humano que pregunta.
   * Solo con el se recuperan sus recuerdos privados; el contexto de empresa
   * sigue siendo el mismo para todos los humanos del tenant.
   */
  viewerId?: string;
  /**
   * CONTEXT_SINGLE_RECALL_V1 - recall ya calculado por el caller. El chat
   * recuperaba memoria una vez para el bloque RAG y otra dentro de assemble.
   * Pasar el resultado evita la segunda llamada (embedding + busqueda).
   */
  recall?: RecallResult;
  // CONTEXT_BUDGET_V1 - presupuesto opcional por fuente.
  budget?: {
    roleTokens?: number;
    entityTokens?: number;
    memoryTokens?: number;
    eventTokens?: number;
    documentTokens?: number;
  };
}

const DEFAULT_EVENT_LIMIT = Number(process.env.CONTEXT_EVENT_LIMIT ?? "20") || 20; // FIX_12_13_EVENT_LIMIT_V1

export class ContextEngine {
  // CONTEXT_ROLE_CACHE_V1 - el chat ya leyo el rol antes de llamar a assemble;
  // volver a pedirlo era una segunda lectura por turno. Cache corto por
  // owner+rol: si el owner edita el rol, en 5 s se ve (y se puede bajar con
  // CONTEXT_ROLE_TTL_MS).
  private readonly roleCache = new Map<string, { at: number; role: AgentRole }>();
  private readonly roleTtlMs =
    Number(process.env.CONTEXT_ROLE_TTL_MS ?? "5000") || 5000;
  private async cachedRole(owner: string, roleId: string): Promise<AgentRole | null> {
    const key = `${owner}|${roleId}`;
    const hit = this.roleCache.get(key);
    if (hit && Date.now() - hit.at < this.roleTtlMs) return hit.role;
    const role = await this.db.get<AgentRole>(owner, "agent-roles", roleId);
    if (role) this.roleCache.set(key, { at: Date.now(), role });
    return role;
  }
  constructor(
    private readonly db: Store,
    private readonly graph: BusinessGraph,
    private readonly memory: MemoryService,
    private readonly bus?: EventBus,
  ) {}

  async assemble(owner: string, input: AssembleInput): Promise<ContextPackage> {
    // CONTEXT_ROLE_CACHE_V1 - lectura cacheada (ver campo roleCache).
    const role = await this.cachedRole(owner, input.roleId);
    if (!role) throw new Error(`Role not found: ${input.roleId}`);
    const storedMemories = (await this.db.list<AgentMemory>(owner, "memories")).filter(
      (m) => m.roleId === role.id,
    );
    // CONTEXT_INLINE_ROLE_MEMORIES Ã¢â‚¬â€ las memorias inline del rol ({kind, text}) son su canon
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
    // CONTEXT_EXECUTION_RESOLVE_V1 - solo la ejecucion del propio owner; una
    // ejecucion de otra empresa no se resuelve y el contexto sigue sin ella.
    const execution = input.executionId
      ? await this.db
          .get<{
            id: string;
            title: string;
            status: string;
            tenantId?: string;
            state: Record<string, unknown>;
          }>(owner, "tasks", input.executionId)
          .catch(() => null)
      : null;
    const relations = entity
      ? await this.graph.listRelations(owner, entity.id)
      : [];
    const events = entity
      ? (await this.bus?.list(owner, { sourceId: entity.id, limit: input.eventLimit ?? DEFAULT_EVENT_LIMIT })) ?? []
      : [];
    const recall =
      input.recall ??
      (await this.memory.recall(owner, input.query, {
        ...(input.history ? { history: input.history } : {}),
        ...(input.viewerId ? { privateOwner: input.viewerId } : {}),
      }));
    // CONTEXT_INCLUDE_LEARNING_V1 - antes LearningObserver escribia en
    // learning-facts y learning-patterns pero nadie los leia. El contexto
    // ahora incluye los hechos aprendidos relevantes (facts con source
    // goal:*) para que el LLM los vea. Tope de 10 facts por turno.
    let learningFacts: Array<{ text: string; source: string; confidence: number }> = [];
    try {
      // CONTEXT_ENGINE_INCLUDE_LEARNING_V1
      const all = await this.db.list<{ text: string; source: string; confidence: number; timesUsed: number }>(
        owner,
        "learning-facts",
        { limit: 100 },
      );
      const q = input.query.toLowerCase();
      // FIX_12_14_LEARNING_TTL_FILTER_V1 - ignorar facts con mas de 90 dias.
      const LEARNING_FACTS_TTL_MS = Number(process.env.LEARNING_FACTS_TTL_MS ?? "7776000000") || 7776000000;
      const cutoff = Date.now() - LEARNING_FACTS_TTL_MS;
      learningFacts = all
        .filter((f) => {
          const createdAtRaw = (f as unknown as { createdAt?: string }).createdAt;
          if (createdAtRaw && Date.parse(createdAtRaw) < cutoff) return false;
          const words = q.split(/\s+/).filter((w) => w.length > 2);
          const hay = f.text.toLowerCase();
          return words.some((w) => hay.includes(w));
        })
        .sort((a, b) => (b.confidence ?? 0.7) - (a.confidence ?? 0.7))
        .slice(0, 10);
    } catch {
      // CONTEXT_INCLUDE_LEARNING_V1 - best-effort.
      learningFacts = [];
    }
    const pkg: ContextPackage = {
      role: {
        id: role.id,
        name: role.name,
        tone: role.tone,
        objetivo: role.objetivo,
        memories: roleMemories,
      },
      ...(entity ? { entity } : {}),
      ...(execution
        ? {
            execution: {
              id: execution.id,
              title: execution.title,
              status: execution.status,
              sopId: typeof execution.state.sopId === "string" ? execution.state.sopId : null,
              entityId:
                typeof execution.state.entityId === "string" ? execution.state.entityId : null,
            },
          }
        : {}),
      relations,
      events,
      recall,
      learning: learningFacts,
      metadata: { assembledAt: new Date().toISOString() },
    };
    await this.bus?.emit(owner, "context.assembled", { kind: "context", id: input.roleId }, {
      roleId: role.id,
      entityCount: entity ? 1 : 0,
      relationCount: relations.length,
      knowledgeCount: roleMemories.length + events.length,
      policyCount: 0,
      ...(execution ? { executionId: execution.id } : {}),
    });
    return pkg;
  }
}
