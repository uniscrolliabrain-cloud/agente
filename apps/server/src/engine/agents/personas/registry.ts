// PERSONAS_REGISTRY_V1 - registro en memoria de personas por tenant.
//
// Estructura:
//   Map<tenantId, Map<personaId, { persona, stats }>>
//
// Es un cache de lectura. Se carga al arrancar el server desde disco
// (bootstrap.ts). Si el owner edita una persona, se recarga (endpoint
// en Macro D).

import type {
  AgentPersona,
  AgentStats,
} from "../../../../../../packages/domain/src/agent-persona.ts";

interface RegisteredPersona {
  persona: AgentPersona;
  stats: AgentStats;
  flow?: import("../../../../../../packages/domain/src/flow.ts").Flow;
}

export class PersonaRegistry {
  private readonly byTenant = new Map<string, Map<string, RegisteredPersona>>();
  constructor(private readonly actors?: import("../../actors/service.ts").ActorService) {}

  register(tenantId: string, persona: AgentPersona, stats: AgentStats): void {
    let tenantMap = this.byTenant.get(tenantId);
    if (!tenantMap) {
      tenantMap = new Map();
      this.byTenant.set(tenantId, tenantMap);
    }
    const flow = persona.reportsTo || persona.peers.length > 0
      ? { peers: persona.peers.map((p) => ({ actorId: p, personaId: p, kind: "agent" as const, role: "agent" as const, tenantId })) }
      : undefined;
    tenantMap.set(persona.id, { persona, stats, ...(flow ? { flow } : {}) });
  }

  get(tenantId: string, personaId: string): RegisteredPersona | undefined {
    return this.byTenant.get(tenantId)?.get(personaId);
  }

  // PERSONAS_REGISTRY_TENANT_INDEX_V1
  list(tenantId: string): RegisteredPersona[] {
    const tenantMap = this.byTenant.get(tenantId);
    if (!tenantMap) return [];
    return [...tenantMap.values()];
  }

  has(tenantId: string, personaId: string): boolean {
    return this.byTenant.get(tenantId)?.has(personaId) ?? false;
  }

  updateStats(tenantId: string, personaId: string, stats: AgentStats): boolean {
    const entry = this.byTenant.get(tenantId)?.get(personaId);
    if (!entry) return false;
    entry.stats = stats;
    return true;
  }

  clear(): void {
    this.byTenant.clear();
  }

  clearTenant(tenantId: string): void {
    this.byTenant.delete(tenantId);
  }
}