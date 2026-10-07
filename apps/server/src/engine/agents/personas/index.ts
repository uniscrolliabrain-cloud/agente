// PERSONAS_INDEX_V1 - contrato publico del modulo de personas.

export type {
  AgentSkin,
  AgentNode,
  AgentState,
  PersonaBundle,
} from "./types.ts";

// PERSONAS_RUNTIME_V1 - runtime: carga, registro y resolucion.
export { PersonaRegistry } from "./registry.ts";
export { bootstrapPersonas, bootstrapAllPersonas, type BootstrapResult } from "./bootstrap.ts";
export { resolveSkin, resolveAllSkins, defaultState, type ResolveSkinOptions } from "./resolver.ts";
export { loadAgentNode } from "./node.ts";
export {
  loadPersonaFile,
  loadStatsFile,
  listPersonaDirs,
  loadTenantPersonas,
  type LoadedTenant,
} from "./loader.ts";

// PERSONAS_STATS_V1 - calculo de stats desde datos reales.
export { computeStats } from "./stats.ts";

// PERSONAS_ACTIVITY_V1 - activity log por persona.
export {
  activityForPersona,
  type AgentActivityEntry,
  type ActivityKind,
} from "./activity.ts";