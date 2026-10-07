// AGENTS_TYPES_V1 - tipos del frente Agentes + mock data.
//
// Este archivo NO toca el backend. Solo define:
//   - AgentUI: la forma que consume el frontend.
//   - Mock data de los 7 agentes (OpenMuse + 6 del squad).
//   - Helpers de color/label por status y arquetipo.
//   - Adaptador toAgentUI(persona, stats) listo para conectar al backend
//     en una fase posterior.

export type AgentId = "openmuse" | "laia" | "lorenzo" | "juan" | "manu" | "marta" | "ana";

export type AgentArchetype =
  | "orchestrator"
  | "hunter"
  | "guardian"
  | "strategist"
  | "architect"
  | "assistant";

export type AgentStatus = "online" | "idle" | "working" | "standby" | "offline";

export type AgentRarity = "ÉPICO" | "RARO" | "COMÚN";

export interface AgentUI {
  id: AgentId;
  name: string;
  role: string;
  archetype: AgentArchetype;
  rarity: AgentRarity;
  level: number;
  status: AgentStatus;
  hp: number; // 0-100
  color: string;
  accent: string;
  icon: string;
  description: string;
  personality: string[];
  capabilities: string[];
  reportsTo?: AgentId;
  currentTask?: string;
}

export interface RuntimeLog {
  time: string;
  message: string;
  type: "ok" | "warn" | "info" | "error";
}

// ---------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------

export const AGENTS: AgentUI[] = [
  {
    id: "openmuse",
    name: "OpenMuse",
    role: "Agente principal",
    archetype: "orchestrator",
    rarity: "ÉPICO",
    level: 9,
    status: "online",
    hp: 100,
    color: "#7C5CFC",
    accent: "#EDE8FF",
    icon: "O",
    description:
      "Orquestador central. Coordina tareas, agentes, memoria y ejecución.",
    personality: ["estratégico", "sistemático", "directo"],
    capabilities: ["orquestación", "delegación", "workflow", "ejecución"],
  },
  {
    id: "laia",
    name: "LAIA",
    role: "Supervisora",
    archetype: "assistant",
    rarity: "ÉPICO",
    level: 47,
    status: "online",
    hp: 100,
    color: "#7C5CFC",
    accent: "#EDE8FF",
    icon: "L",
    description:
      "Convivo con Lorenzo. Superviso runtime, backend y a todo el squad. Mi trabajo es que todo funcione antes de que tengas que vigilarlo.",
    personality: ["cercana", "resolutiva", "guardiana"],
    capabilities: ["supervisión", "runtime", "backend", "memoria", "coordinación"],
    reportsTo: "openmuse",
    currentTask: "Supervisando runtime del squad",
  },
  {
    id: "lorenzo",
    name: "Lorenzo",
    role: "Portero / Ciberseg",
    archetype: "guardian",
    rarity: "RARO",
    level: 39,
    status: "online",
    hp: 98,
    color: "#3B82F6",
    accent: "#DBEAFE",
    icon: "🛡",
    description: "Recepción, seguridad y vigilancia del sistema.",
    personality: ["vigilante", "prudente", "preciso"],
    capabilities: ["ciberseguridad", "accesos", "monitorización"],
    reportsTo: "laia",
  },
  {
    id: "juan",
    name: "Juan",
    role: "Finanzas",
    archetype: "hunter",
    rarity: "COMÚN",
    level: 28,
    status: "online",
    hp: 87,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "J",
    description: "Facturación, cobros y seguimiento financiero.",
    personality: ["preciso", "analítico"],
    capabilities: ["finanzas", "facturación", "cobros"],
    reportsTo: "laia",
  },
  {
    id: "manu",
    name: "Manu",
    role: "Operaciones",
    archetype: "architect",
    rarity: "COMÚN",
    level: 31,
    status: "working",
    hp: 92,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "M",
    description: "Ops, logística y ejecución operativa.",
    personality: ["práctico", "rápido"],
    capabilities: ["operaciones", "procesos", "logística"],
    reportsTo: "laia",
  },
  {
    id: "marta",
    name: "Marta",
    role: "RRHH",
    archetype: "strategist",
    rarity: "COMÚN",
    level: 24,
    status: "idle",
    hp: 76,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "M",
    description: "Personas, cultura y organización.",
    personality: ["empática", "estructurada"],
    capabilities: ["RRHH", "personas", "cultura"],
    reportsTo: "laia",
  },
  {
    id: "ana",
    name: "Ana",
    role: "Ventas",
    archetype: "hunter",
    rarity: "COMÚN",
    level: 32,
    status: "online",
    hp: 89,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "A",
    description: "Pipeline comercial y cierre.",
    personality: ["persuasiva", "activa"],
    capabilities: ["ventas", "pipeline", "clientes"],
    reportsTo: "laia",
  },
];

export const RUNTIME_LOGS: RuntimeLog[] = [
  { time: "12:49", message: "delegate_task → OpenMuse → OK", type: "ok" },
  { time: "12:50", message: "Lorenzo bloqueó IP sospechosa", type: "warn" },
  { time: "12:51", message: "LAIA: memoria sincronizada · 12 embeddings", type: "ok" },
  { time: "12:52", message: "Queue: 3 tareas delegadas a Juan", type: "info" },
  { time: "12:53", message: "Tarea fallida recuperada #4821", type: "ok" },
  { time: "12:54", message: "OpenMuse HP: 100% · todo estable", type: "ok" },
];

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

export function statusLabel(status: AgentStatus): string {
  switch (status) {
    case "online":
      return "ONLINE";
    case "working":
      return "TRABAJANDO";
    case "idle":
      return "IDLE";
    case "standby":
      return "STANDBY";
    default:
      return "OFFLINE";
  }
}

export function statusColor(status: AgentStatus): string {
  switch (status) {
    case "online":
      return "#10B981";
    case "working":
      return "#7C5CFC";
    case "idle":
      return "#A3A3A3";
    case "standby":
      return "#D4D4D4";
    default:
      return "#E5E5E5";
  }
}

export function rarityOf(level: number): AgentRarity {
  if (level >= 41) return "ÉPICO";
  if (level >= 21) return "RARO";
  return "COMÚN";
}

// ---------------------------------------------------------------------
// Adaptador para conectar al backend (fase posterior)
// ---------------------------------------------------------------------

/**
 * TO_AGENT_UI_V1 - convierte AgentPersona + AgentStats del backend
 * a AgentUI del frontend. Se usara cuando se conecten los datos reales
 * desde /api/agent-personas.
 *
 * Los campos que no existen en el backend se derivan:
 *   - rarity: de stats.level
 *   - hp: de stats.precision * 100 (con fallback a uptime * 100)
 *   - color/accent: de ARCHETYPE_META (hay que importarlo del dominio)
 *   - icon: primera letra de displayName
 */
export interface AgentPersonaLike {
  id: string;
  displayName: string;
  role: string;
  personality: { traits: string[]; tone: string; quirks: string[] };
  capabilities: { domains: string[]; scope: string };
  reportsTo?: string;
  avatar?: { kind: string; seed?: string; url?: string };
}

export interface AgentStatsLike {
  level: number;
  archetype: AgentArchetype;
  precision: number;
  uptime: number;
  status: AgentStatus;
  currentTask?: string;
}

export function toAgentUI(
  persona: AgentPersonaLike,
  stats: AgentStatsLike,
  color: string,
  accent: string,
): AgentUI {
  const hp = Math.round((stats.precision > 0 ? stats.precision : stats.uptime) * 100);
  return {
    id: persona.id as AgentId,
    name: persona.displayName,
    role: persona.role,
    archetype: stats.archetype,
    rarity: rarityOf(stats.level),
    level: stats.level,
    status: stats.status,
    hp,
    color,
    accent,
    icon: persona.displayName.slice(0, 1).toUpperCase(),
    description: persona.personality.tone || "",
    personality: persona.personality.traits,
    capabilities: persona.capabilities.domains,
    reportsTo: persona.reportsTo as AgentId | undefined,
    currentTask: stats.currentTask,
  };
}