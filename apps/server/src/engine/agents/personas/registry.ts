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
  activation: PersonaActivation;
}

// PERSONAS_INSTANCES_V1 - una persona cargada para una empresa concreta no es
// solo su JSON: lleva la activacion que el owner decidio y los humanos y SOPs
// que la pueden poner a trabajar (campana 09).
export interface PersonaActivation {
  /** El owner puede apagar una persona sin borrar su definicion. */
  enabled: boolean;
  /** SOPs asignadas a la empresa donde esta persona puede intervenir. */
  sopIds: string[];
  /** User ids humanos con membership en la empresa. Vacio = no puede trabajar. */
  owners: string[];
}

export type PersonaWorkBlock =
  | "persona_desconocida"
  | "persona_deshabilitada"
  | "sin_humano"
  | "sin_sop";

export interface PersonaWorkDecision {
  allowed: boolean;
  reason?: PersonaWorkBlock;
}

export class PersonaRegistry {
  private readonly byTenant = new Map<string, Map<string, RegisteredPersona>>();
  constructor(private readonly actors?: import("../../actors/service.ts").ActorService) {}

  register(
    tenantId: string,
    persona: AgentPersona,
    stats: AgentStats,
    activation?: Partial<PersonaActivation>,
  ): void {
    let tenantMap = this.byTenant.get(tenantId);
    if (!tenantMap) {
      tenantMap = new Map();
      this.byTenant.set(tenantId, tenantMap);
    }
    const flow = persona.reportsTo || persona.peers.length > 0
      ? { peers: persona.peers.map((p) => ({ actorId: p, personaId: p, kind: "agent" as const, role: "agent" as const, tenantId })) }
      : undefined;
    // PERSONA_ACTIVATION_V1 - sin activacion explicita manda el propio JSON
    // (`metadata.enabled`); una persona sin humanos asignados no trabaja igual.
    const resolved: PersonaActivation = {
      enabled: activation?.enabled ?? persona.metadata.enabled !== false,
      sopIds: activation?.sopIds ?? [],
      owners: activation?.owners ?? [],
    };
    tenantMap.set(persona.id, { persona, stats, activation: resolved, ...(flow ? { flow } : {}) });
  }

  activation(tenantId: string, personaId: string): PersonaActivation | undefined {
    return this.byTenant.get(tenantId)?.get(personaId)?.activation;
  }

  // PERSONAS_CAN_START_WORK_V1 - interseccion humano/agente/SOP/tenant:
  // la persona existe en ESTA empresa, esta encendida, hay un humano de la
  // empresa detras y la SOP esta asignada al tenant.
  canStartWork(
    tenantId: string,
    personaId: string,
    work: { owner: string; sopId?: string },
  ): PersonaWorkDecision {
    const entry = this.byTenant.get(tenantId)?.get(personaId);
    if (!entry) return { allowed: false, reason: "persona_desconocida" };
    if (!entry.activation.enabled) return { allowed: false, reason: "persona_deshabilitada" };
    if (!entry.activation.owners.includes(work.owner)) return { allowed: false, reason: "sin_humano" };
    if (work.sopId && !entry.activation.sopIds.includes(work.sopId)) {
      return { allowed: false, reason: "sin_sop" };
    }
    return { allowed: true };
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