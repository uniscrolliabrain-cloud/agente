// PERSONAS_RESOLVER_V1 - compone AgentSkin desde el registry.
//
// Una persona registrada es estatica (persona.json + stats.json). Un
// AgentSkin es dinamico: se compone al abrir un turno y se descarta al
// cerrarlo.
//
// PERSONAS_RESOLVER_REFRESH_STATS_V1 - si options.refreshStats es true,
// el resolver recalcula los stats desde las tareas antes de devolver el
// skin. Por defecto false (performance).

import type { PersonaRegistry } from "./registry.ts";
import type { AgentSkin, AgentState } from "./types.ts";
import type { Store } from "../../../db.ts";
import { computeStats } from "./stats.ts";

export function defaultState(): AgentState {
  return {
    mood: "neutral",
    focus: [],
    activeLanes: [],
  };
}

export interface ResolveSkinOptions {
  stateOverride?: Partial<AgentState>;
  /** Si true, recalcula stats desde las tareas. */
  refreshStats?: boolean;
  /** Store para refreshStats. Obligatorio si refreshStats=true. */
  db?: Store;
  /** Owner de las tareas. */
  owner?: string;
}

export async function resolveSkin(
  registry: PersonaRegistry,
  tenantId: string,
  personaId: string,
  options: ResolveSkinOptions = {},
): Promise<AgentSkin | null> {
  const entry = registry.get(tenantId, personaId);
  if (!entry) return null;

  let stats = entry.stats;
  if (options.refreshStats && options.db && options.owner) {
    try {
      stats = await computeStats(
        options.db,
        options.owner,
        personaId,
        entry.stats.archetype,
      );
      registry.updateStats(tenantId, personaId, stats);
    } catch {
      // Si falla el recalculo, usamos la ultima snapshot conocida.
    }
  }

  const state: AgentState = {
    ...defaultState(),
    ...(options.stateOverride ?? {}),
  };

  return {
    personaId: entry.persona.id,
    persona: entry.persona,
    stats,
    state,
    nodeId: entry.persona.id,
  };
}

export function resolveAllSkins(
  registry: PersonaRegistry,
  tenantId: string,
): AgentSkin[] {
  const list = registry.list(tenantId);
  return list.map((entry) => ({
    personaId: entry.persona.id,
    persona: entry.persona,
    stats: entry.stats,
    state: defaultState(),
    nodeId: entry.persona.id,
  }));
}