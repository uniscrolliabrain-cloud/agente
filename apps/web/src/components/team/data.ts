// TEAM_DATA_V1 - modelo de la vista "Equipo": personas y agentes IA en la misma
// ficha. En una sesion real se mapea lo que ya devuelven /api/company y
// /api/agent/roles; los datos de ejemplo viven en ../demo/team.ts, que a su vez
// toma las identidades de ../demo/fixtures.ts.
import type { AgentRole } from "../../api/agents";
import type { CompanyOverview } from "../../api/company";

export type TeamKind = "human" | "ai";
export type TeamStatus = "disponible" | "trabajando" | "pausa";

export interface TeamMember {
  id: string;
  kind: TeamKind;
  name: string;
  role: string;
  email?: string;
  status: TeamStatus;
  work: string;
  /** Carga de trabajo del dia (0-100). Solo existe en el demo. */
  load?: number;
  activity: string[];
  active: boolean;
  /** Agentes: ficha que ya existia en /api/agent/roles. */
  objetivo?: string;
  sops?: string[];
  memories?: { kind: string; text: string }[];
}

export const STATUS_LABEL: Record<TeamStatus, string> = {
  disponible: "Disponible",
  trabajando: "Trabajando",
  pausa: "En pausa",
};

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* --------------------------------------------------------------- real */

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Miembro",
};

const firstTask = (overview: CompanyOverview, predicate: (assignedTo?: string, owner?: string) => boolean) =>
  overview.tasks.recent.find((task) => predicate(task.assignedTo, task.owner))?.title ?? "";

/** Une miembros reales, agentes con ficha propia y sus tareas recientes. */
export function teamFromOverview(overview: CompanyOverview, roles: AgentRole[]): TeamMember[] {
  const rolesByName = new Map(roles.map((role) => [role.name.toLowerCase(), role]));

  const people: TeamMember[] = overview.members.map((member) => {
    const work = firstTask(overview, (_assignedTo, owner) => owner === member.userId);
    return {
      id: `user-${member.userId}`,
      kind: "human",
      name: member.name,
      role: ROLE_LABEL[member.role] ?? member.role,
      email: member.email,
      status: member.active ? "disponible" : "pausa",
      work: work || "Sin trabajo en curso",
      activity: [],
      active: member.active,
    };
  });

  const agents: TeamMember[] = overview.agents.map((agent) => {
    const role = rolesByName.get(agent.name.toLowerCase());
    const work = firstTask(overview, (assignedTo) => assignedTo === agent.id);
    return {
      id: `agent-${agent.id}`,
      kind: "ai",
      name: agent.name,
      role: "Agente IA",
      status: agent.active ? "disponible" : "pausa",
      work: work || role?.objetivo || "Sin trabajo en curso",
      activity: [],
      active: agent.active,
      ...(role
        ? {
            objetivo: role.objetivo,
            sops: role.sops,
            memories: role.memories.map((memory) => ({ kind: memory.kind, text: memory.text })),
          }
        : {}),
    };
  });

  return [...people, ...agents];
}

/** Ficha de un AgentRole recien creado, para pintarla sin recargar todo. */
export function teamMemberFromRole(role: AgentRole): TeamMember {
  return {
    id: `agent-${role.id}`,
    kind: "ai",
    name: role.name,
    role: "Agente IA",
    status: role.active ? "disponible" : "pausa",
    work: role.objetivo || "Sin trabajo en curso",
    activity: [],
    active: role.active,
    objetivo: role.objetivo,
    sops: role.sops,
    memories: role.memories.map((memory) => ({ kind: memory.kind, text: memory.text })),
  };
}
