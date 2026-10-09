// AGENT_UI_TYPES_V2 - tipos de UI de agentes, sin datos mock.
import type { AgentPersonaView } from "../../hooks/useAgentPersonas";

export type AgentArchetype =
  | "orchestrator" | "assistant" | "guardian" | "hunter" | "architect" | "strategist";
export type AgentStatus = "online" | "working" | "idle" | "standby" | "offline";
export type Rarity = "CORE" | "ÉPICO" | "RARO" | "COMÚN";

export interface AgentUI {
  id: string;
  name: string;
  role: string;
  archetype: AgentArchetype;
  rarity: Rarity;
  level: number;
  status: AgentStatus;
  hp: number;
  tasks: number;
  precision: number;
  avgTimeMs: number;
  uptime: number;
  description: string;
  capabilities: string[];
  reportsTo?: string;
  peers: string[];
  currentTask?: string;
}

const ARCHETYPES: AgentArchetype[] = [
  "orchestrator", "assistant", "guardian", "hunter", "architect", "strategist",
];
const STATUSES: AgentStatus[] = ["online", "working", "idle", "standby", "offline"];

export function toArchetype(v: string | undefined): AgentArchetype {
  return ARCHETYPES.includes(v as AgentArchetype) ? (v as AgentArchetype) : "assistant";
}

export function toStatus(v: string | undefined): AgentStatus {
  if (v === "busy") return "working";
  return STATUSES.includes(v as AgentStatus) ? (v as AgentStatus) : "idle";
}

export function toPercent(raw: number | undefined | null, fallback = 0): number {
  if (raw == null || Number.isNaN(raw)) return fallback;
  const v = raw <= 1 ? raw * 100 : raw;
  return Math.min(100, Math.max(0, v));
}

export const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export function fmtDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  return ms < 1000 ? `${Math.round(ms)}ms` : `${Math.round(ms / 1000)}s`;
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "--:--:--"
    : d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function thoughtText(content: string | Record<string, unknown> | undefined): string {
  if (content == null) return "";
  return typeof content === "string" ? content : JSON.stringify(content);
}

export function rarityOf(level: number, archetype: AgentArchetype): Rarity {
  if (archetype === "orchestrator") return "CORE";
  if (level >= 40) return "ÉPICO";
  if (level >= 35) return "RARO";
  return "COMÚN";
}

export function personaToAgentUI(p: AgentPersonaView): AgentUI {
  const s = p.stats;
  const level = s?.level ?? 1;
  const archetype = toArchetype(p.archetype);
  return {
    id: p.personaId,
    name: p.displayName,
    role: p.role,
    archetype,
    rarity: rarityOf(level, archetype),
    level,
    status: toStatus(s?.status),
    hp: Math.round(toPercent(s?.precision ?? s?.uptime, 80)),
    tasks: s?.totalTasks ?? 0,
    precision: toPercent(s?.precision, 0),
    avgTimeMs: s?.avgTimeMs ?? 0,
    uptime: toPercent(s?.uptime, 0),
    description: p.description ?? "",
    capabilities: p.capabilities ?? [],
    reportsTo: p.reportsTo ?? undefined,
    peers: p.peers ?? [],
    currentTask: s?.currentTask,
  };
}