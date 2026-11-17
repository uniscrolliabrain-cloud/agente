// TEAM_VIEW_V1 - "Equipo": personas y agentes IA del tenant en un mismo sitio.
// Es la pantalla que antes era "Agentes"; ahora tambien gestiona a los actores
// humanos (empleados, usuarios, socios, proveedores o invitados).
//
// El tenant demo pinta el equipo sintetico del mockup; en una sesion real se
// leen /api/company y /api/agent/roles. Las unicas acciones con backend son el
// alta de persona (POST /api/company/members) y el alta de agente
// (POST /api/agent/roles). El interruptor activo/pausa solo funciona con los
// datos de ejemplo: falta el endpoint de cambio de estado.
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { isDemoSession } from "../api/client";
import { addCompanyMember, getCompanyOverview, type CompanyOverview } from "../api/company";
import { listAgents } from "../api/agents";
import AgentCreateModal from "./AgentCreateModal";
import { AddTeamModal } from "./team/AddTeamModal";
import { TeamMemberCard } from "./team/TeamMemberCard";
import { TeamProfilePanel } from "./team/TeamProfilePanel";
import {
  DEMO_AGENT_CATALOG,
  activateDemoAgent,
  demoTeam,
} from "../demo/team";
import { teamFromOverview, teamMemberFromRole, type TeamMember } from "./team/data";

type TeamFilter = "all" | "human" | "ai";

interface Props {
  onOpenChat?: () => void;
}

export default function TeamView({ onOpenChat }: Props) {
  const demo = isDemoSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TeamFilter>("all");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [agentModal, setAgentModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const [company, roles] = await Promise.all([
        getCompanyOverview(),
        listAgents().catch(() => []),
      ]);
      setOverview(company);
      setMembers(teamFromOverview(company, roles));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el equipo");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (demo) {
      setMembers(demoTeam());
      setLoading(false);
      return;
    }
    void load();
  }, [demo, load]);

  useEffect(() => {
    if (!notice) return;
    const handle = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(handle);
  }, [notice]);

  const humans = members.filter((member) => member.kind === "human").length;
  const agents = members.filter((member) => member.kind === "ai").length;
  const avgLoad = useMemo(() => {
    const measured = members.filter((member) => member.active && member.load !== undefined);
    if (measured.length === 0) return null;
    return Math.round(measured.reduce((total, member) => total + (member.load ?? 0), 0) / measured.length);
  }, [members]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (filter !== "all" && member.kind !== filter) return false;
      if (!q) return true;
      return `${member.name} ${member.role} ${member.work}`.toLowerCase().includes(q);
    });
  }, [members, filter, query]);

  const detail = members.find((member) => member.id === detailId) ?? null;
  const canManage = demo || Boolean(overview?.canManageMembers);
  const availableAgents = demo
    ? DEMO_AGENT_CATALOG.filter((agent) => !members.some((member) => member.name === agent.name))
    : [];

  const tenantName = demo ? "Interfaz" : overview?.tenant.name ?? "Tu empresa";

  const toggle = (member: TeamMember) => {
    if (!demo) return;
    setMembers((current) =>
      current.map((item) =>
        item.id === member.id
          ? {
              ...item,
              active: !item.active,
              status: item.active ? "pausa" : item.status === "pausa" ? "disponible" : item.status,
            }
          : item,
      ),
    );
    setNotice(`${member.name} ${member.active ? "queda en pausa" : "vuelve a estar activo"}`);
  };

  const addPerson = async (person: {
    name: string;
    email: string;
    roleLabel: string;
    role: "admin" | "member";
  }) => {
    if (demo) {
      // La alta pasa por el mismo store sintetico que el centro de mando: asi
      // el equipo nuevo aparece en las dos pantallas, no solo en esta.
      await addCompanyMember({
        email: person.email,
        role: person.role,
        ...(person.name ? { name: person.name } : {}),
      });
      setMembers(demoTeam());
      setNotice(`${person.name || person.email} se ha unido al equipo de ejemplo`);
      return;
    }

    await addCompanyMember({
      email: person.email,
      role: person.role,
      ...(person.name ? { name: person.name } : {}),
    });
    setNotice(`${person.name || person.email} se ha añadido a la empresa`);
    await load(true);
  };

  const activateAgent = (agent: TeamMember) => {
    activateDemoAgent(agent);
    setMembers(demoTeam());
    setNotice(`${agent.name} se ha activado en el equipo`);
  };

  return (
    <div className="team-view">
      <div className="team-top">
        <div className="team-breadcrumb">
          {tenantName} / Organización
        </div>
        <div className="team-toprow">
          <div>
            <h1>Tu equipo</h1>
            <p>Tu equipo, humano y digital, trabajando en un mismo lugar.</p>
          </div>
          <div className="team-top-actions">
            {!demo && (
              <button
                type="button"
                className="team-icon"
                onClick={() => void load(true)}
                aria-label="Actualizar equipo"
                title="Actualizar"
              >
                <RefreshCw size={14} className={refreshing ? "team-spin" : ""} />
              </button>
            )}
            {canManage && (
              <button type="button" className="team-btn primary" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Añadir
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="team-banner">
        <div>
          <strong>
            {tenantName} — {demo ? "Estudio digital" : "Equipo"}
          </strong>
          <small>
            Equipo humano + digital · {demo ? "Datos de ejemplo" : `${members.length} miembros`}
          </small>
        </div>
      </div>

      <div className="team-kpis">
        <button
          type="button"
          className="team-kpi"
          onClick={() => setFilter("all")}
        >
          <b>{members.length}</b>
          <span>Miembros</span>
        </button>
        <button
          type="button"
          className={`team-kpi ${filter === "human" ? "active" : ""}`}
          onClick={() => setFilter("human")}
        >
          <b>{humans}</b>
          <span>Personas</span>
        </button>
        <button
          type="button"
          className={`team-kpi ${filter === "ai" ? "active" : ""}`}
          onClick={() => setFilter("ai")}
        >
          <b>{agents}</b>
          <span>Agentes IA</span>
        </button>
        <div className="team-kpi static">
          <b>{avgLoad === null ? "—" : `${avgLoad}%`}</b>
          <span>Carga media de hoy</span>
        </div>
      </div>

      <div className="team-toolbar">
        <div className="team-filters" role="group" aria-label="Filtrar equipo">
          {(
            [
              { id: "all", label: "Todos" },
              { id: "human", label: "Personas" },
              { id: "ai", label: "Agentes IA" },
            ] as { id: TeamFilter; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? "active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="team-search">
          <Search size={13} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o rol..."
            aria-label="Buscar en el equipo"
          />
        </label>
        <span className="team-count">
          {visible.length} {visible.length === 1 ? "miembro" : "miembros"}
        </span>
      </div>

      {error && (
        <div className="chat-error" style={{ marginBottom: 14 }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {loading ? (
        <div className="team-loading">
          <Loader2 size={16} className="team-spin" /> Cargando equipo…
        </div>
      ) : visible.length === 0 ? (
        <div className="team-empty">
          {members.length === 0
            ? "Todavía no hay nadie en el equipo. Añade una persona o activa un agente."
            : "Ningún miembro coincide con la búsqueda."}
        </div>
      ) : (
        <div className="team-grid">
          {visible.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              editable={demo}
              onOpen={(item) => setDetailId(item.id)}
              onToggle={toggle}
            />
          ))}
        </div>
      )}

      {demo && (
        <p className="team-note">
          Los estados, la carga de hoy y la actividad de esta pantalla son datos de ejemplo. En producción
          vendrán de las sesiones de usuario y de los eventos reales de los agentes.
        </p>
      )}

      {detail && (
        <TeamProfilePanel
          member={detail}
          editable={demo}
          onClose={() => setDetailId(null)}
          onToggle={toggle}
          {...(onOpenChat ? { onOpenChat: () => { setDetailId(null); onOpenChat(); } } : {})}
        />
      )}

      {addOpen && (
        <AddTeamModal
          demo={demo}
          availableAgents={availableAgents}
          onClose={() => setAddOpen(false)}
          onAddPerson={addPerson}
          onActivateAgent={activateAgent}
          onCreateAgent={() => {
            setAddOpen(false);
            setAgentModal(true);
          }}
        />
      )}

      {agentModal && (
        <AgentCreateModal
          onClose={() => setAgentModal(false)}
          onCreated={(role) => {
            setMembers((current) => [...current, teamMemberFromRole(role)]);
            setNotice(`${role.name} se ha activado en el equipo`);
            setAgentModal(false);
          }}
        />
      )}

      {notice && (
        <div className="team-toast" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}
