// DEMO_TEAM_V1 - equipo sintetico del tenant "Interfaz".
//
// Las identidades (personas y agentes) salen de ./fixtures: es la misma fuente
// que usan el centro de mando y /api/agent/roles. Aqui solo se anade lo que la
// vista Equipo necesita (puesto, trabajo en curso, carga del dia y actividad),
// para que no haya dos listas de nombres distintas en el demo.
import type { AgentRole } from "../api/agents";
import type { TeamMember, TeamStatus } from "../components/team/data";
import { demoAgents, demoUsers } from "./fixtures";

interface DemoProfile {
  role: string;
  work: string;
  status: TeamStatus;
  /** Carga de trabajo del dia, 0-100. Solo existe en el demo. */
  load?: number;
  activity: string[];
}

const HUMAN_PROFILES: Record<string, DemoProfile> = {
  "u-ana": {
    role: "Dirección",
    work: "Revisando la propuesta de Estudio Lumen",
    status: "trabajando",
    load: 76,
    activity: [
      "Aprobó el presupuesto de Lumen · Hace 12 min",
      "Revisó el briefing de Casa Botànica · Hoy",
      "Cerró la planificación de la semana · Ayer",
    ],
  },
  "u-diego": {
    role: "Diseño y web",
    work: "Publicando la landing de otoño",
    status: "trabajando",
    load: 88,
    activity: [
      "Subió la landing de otoño a revisión · Hace 25 min",
      "Ajustó los tokens de color · Hoy",
      "Entregó 3 secciones nuevas · Ayer",
    ],
  },
  "u-lucia": {
    role: "Diseño de producto",
    work: "Auditando la accesibilidad de la app de reservas",
    status: "disponible",
    load: 54,
    activity: [
      "Terminó la auditoría de contraste · Hace 1 h",
      "Documentó 8 incidencias de foco · Hoy",
      "Revisó el flujo de reserva · Ayer",
    ],
  },
  "u-marc": {
    role: "Soporte",
    work: "Sin trabajo asignado",
    status: "pausa",
    activity: ["Se pausó su acceso · Hace 6 días"],
  },
};

const AGENT_PROFILES: Record<string, DemoProfile> = {
  "agent-marta": {
    role: "Atención al cliente",
    work: "Preparando la respuesta a Casa Botànica",
    status: "trabajando",
    load: 81,
    activity: [
      "Preparó una respuesta para Casa Botànica · Hace 8 min",
      "Clasificó 6 consultas entrantes · Hoy",
      "Dejó 2 borradores en revisión · Ayer",
    ],
  },
  "agent-bruno": {
    role: "Comercial",
    work: "Preparando la propuesta para Estudio Lumen",
    status: "trabajando",
    load: 69,
    activity: [
      "Actualizó el borrador de propuesta · Hace 20 min",
      "Revisó el histórico de Lumen · Hoy",
      "Cerró el seguimiento de Talleres Norte · Ayer",
    ],
  },
  "agent-nora": {
    role: "Diseño y marca",
    work: "Revisando la accesibilidad de la app de reservas",
    status: "trabajando",
    load: 93,
    activity: [
      "Marcó 4 desviaciones de la guía v2 · Hace 5 min",
      "Revisó la landing de otoño · Hoy",
      "Aprobó el sistema tipográfico · Ayer",
    ],
  },
  "agent-iker": {
    role: "Operaciones y soporte",
    work: "Sin trabajo asignado",
    status: "disponible",
    load: 40,
    activity: ["Esperando activación · Ahora"],
  },
  "agent-vera": {
    role: "Investigación y datos",
    work: "Sin trabajo asignado",
    status: "disponible",
    load: 34,
    activity: ["Esperando activación · Ahora"],
  },
};

function agentToMember(agent: AgentRole): TeamMember {
  const profile = AGENT_PROFILES[agent.id];
  return {
    id: `demo-${agent.id}`,
    kind: "ai",
    name: agent.name,
    role: profile?.role ?? "Agente IA",
    status: agent.active ? (profile?.status ?? "disponible") : "pausa",
    work: profile?.work ?? agent.objetivo ?? "Sin trabajo en curso",
    ...(agent.active && profile?.load !== undefined ? { load: profile.load } : {}),
    activity: profile?.activity ?? [],
    active: agent.active,
    objetivo: agent.objetivo,
    sops: agent.sops,
    memories: agent.memories.map((memory) => ({ kind: memory.kind, text: memory.text })),
  };
}

/** Miembros del demo: personas del tenant y agentes activos. */
export function demoTeam(): TeamMember[] {
  const people: TeamMember[] = demoUsers.map((user) => {
    const profile = HUMAN_PROFILES[user.id];
    const active = user.active !== false;
    return {
      id: `demo-${user.id}`,
      kind: "human",
      name: user.name,
      role: profile?.role ?? (user.role === "admin" ? "Administración" : "Equipo"),
      email: user.email,
      status: active ? (profile?.status ?? "disponible") : "pausa",
      work: profile?.work ?? "Sin trabajo en curso",
      ...(active && profile?.load !== undefined ? { load: profile.load } : {}),
      activity: profile?.activity ?? ["Se unió al equipo · Ahora"],
      active,
    };
  });

  const agents = demoAgents.filter((agent) => agent.active).map(agentToMember);
  return [...people, ...agents];
}

/** Agentes del catalogo que aun no estan activos en el equipo. */
export const DEMO_AGENT_CATALOG: TeamMember[] = demoAgents
  .filter((agent) => !agent.active)
  .map(agentToMember);

/** Activa un agente del catalogo en el store sintetico (sin backend). */
export function activateDemoAgent(member: TeamMember): void {
  const id = member.id.replace(/^demo-/, "");
  const agent = demoAgents.find((item) => item.id === id);
  if (agent) agent.active = true;
}
