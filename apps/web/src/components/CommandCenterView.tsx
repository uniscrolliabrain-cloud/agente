// COMMAND_CENTER_VIEW_V1 - centro de mando de la empresa.
//
// Sustituye al antiguo "Hoy": es la pantalla con la que arranca el software y el
// estado actual de la empresa, con los dos atajos de alta del owner. Todo sale
// de GET /api/company (tenant real); el briefing se calcula con esos numeros y
// no se simula ninguna accion que el backend todavia no tenga.
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { isDemoSession } from "../api/client";
import { getCompanyOverview, type CompanyTask, type CompanyOverview } from "../api/company";
import AgentCreateModal from "./AgentCreateModal";
import { AddMemberModal } from "./command-center/AddMemberModal";
import { BriefingCard } from "./command-center/BriefingCard";
import { CommandCenterHero } from "./command-center/CommandCenterHero";
import { CommandFilters } from "./command-center/CommandFilters";
import { CompanyPanels } from "./command-center/CompanyPanels";
import { OperationalStatus } from "./command-center/OperationalStatus";
import SampleDashboard from "./command-center/SampleDashboard";
import { AttentionSection, DoneSection, RunningSection } from "./command-center/TaskSections";
import { ROLE_LABEL, isAttention, type CommandFilter } from "./command-center/labels";

interface Props {
  onOpenTask?: (taskId: string) => void;
  onReviewTask?: (taskId: string) => void;
  onOpenTasksView?: () => void;
  onOpenAgentsView?: () => void;
  onOpenTeamView?: () => void;
  onOpenChat?: () => void;
}

export default function CommandCenterView({
  onOpenTask,
  onReviewTask,
  onOpenTasksView,
  onOpenAgentsView,
  onOpenTeamView,
  onOpenChat,
}: Props) {
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [filter, setFilter] = useState<CommandFilter>("todo");
  const [agentModal, setAgentModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // COMMAND_CENTER_SAMPLE_V1 - el ejemplo se puede ocultar para ver el estado real.
  const [sampleHidden, setSampleHidden] = useState(false);
  const [, setTick] = useState(0);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      setOverview(await getCompanyOverview());
      setUpdatedAt(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la empresa");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const poll = window.setInterval(() => void load(true), 30000);
    // "hace Xm" se refresca aunque el servidor no cambie.
    const tick = window.setInterval(() => setTick((n) => n + 1), 15000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [load]);

  const memberNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of overview?.members ?? []) map.set(member.userId, member.name);
    return map;
  }, [overview]);

  const agentNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const agent of overview?.agents ?? []) map.set(agent.id, agent.name);
    return map;
  }, [overview]);

  const whoFor = useCallback(
    (task: CompanyTask) =>
      (task.assignedTo ? agentNames.get(task.assignedTo) : undefined) ??
      memberNames.get(task.owner) ??
      "Sistema",
    [agentNames, memberNames],
  );

  const recent = overview?.tasks.recent ?? [];
  const attention = useMemo(() => recent.filter((task) => isAttention(task.status)), [recent]);
  const runningTasks = useMemo(() => recent.filter((task) => task.status === "running"), [recent]);
  const doneTasks = useMemo(
    () => recent.filter((task) => task.status === "succeeded").slice(0, 6),
    [recent],
  );

  // El ejemplo solo sustituye al estado real cuando el tenant demo lo pide o
  // cuando la empresa aun no tiene ninguna tarea registrada.
  const demoSession = isDemoSession();
  const sampleAvailable = overview !== null && (demoSession || overview.tasks.total === 0);
  const showSample = sampleAvailable && !sampleHidden;

  // El filtro decide que secciones se pintan; el estado operativo queda siempre.
  const show = {
    attention: filter === "todo" || filter === "aprobaciones",
    running: filter === "todo" || filter === "en-marcha",
    done: filter === "todo" || filter === "agentes",
    team: filter === "todo" || filter === "equipo",
    agents: filter === "todo" || filter === "agentes" || filter === "equipo",
  };

  const seeWork = () => {
    setFilter("todo");
    window.setTimeout(() => {
      document.getElementById("cc-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="cc-view">
      <CommandCenterHero
        tenantName={overview?.tenant.name ?? "tu empresa"}
        role={overview?.role ?? null}
        canManageMembers={overview?.canManageMembers ?? false}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={() => void load(true)}
        onAddAgent={() => setAgentModal(true)}
        onAddPerson={() => setMemberModal(true)}
      />

      {notice && (
        <div className="cc-notice" role="status">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
          <button type="button" className="cc-icon" onClick={() => setNotice(null)} aria-label="Cerrar aviso">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="chat-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {sampleAvailable && (
        <div className="cc-sample-banner" role="status">
          <Sparkles size={15} />
          <span>
            <b>Datos de ejemplo.</b>{" "}
            {demoSession
              ? "Tenant demo · Interfaz."
              : `Todavía no hay actividad en ${overview?.tenant.name ?? "esta empresa"}.`}{" "}
            Así se verá el centro de mando cuando los agentes empiecen a trabajar.
          </span>
          <button
            type="button"
            className="cc-btn"
            onClick={() => setSampleHidden((value) => !value)}
          >
            {showSample ? "Ver datos reales" : "Ver ejemplo"}
          </button>
        </div>
      )}

      {loading && !overview ? (
        <div className="cc-loading">
          <Loader2 size={18} className="cc-spin" /> Cargando la empresa…
        </div>
      ) : !overview ? (
        <div className="cc-empty" style={{ padding: "36px 16px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--v2-text-2)" }}>
            No se pudo cargar el estado de la empresa.
          </p>
          <button type="button" className="cc-btn primary" onClick={() => void load()}>
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      ) : showSample ? (
        <SampleDashboard {...(onOpenChat ? { onOpenChat } : {})} />
      ) : (
        <>
          <BriefingCard
            overview={overview}
            hasFinishedWork={doneTasks.length > 0}
            onSeeWork={seeWork}
            {...(onOpenChat ? { onOpenChat } : {})}
          />

          <CommandFilters
            waiting={overview.tasks.waiting}
            failed={overview.tasks.failed}
            running={overview.tasks.running}
            total={overview.tasks.total}
            agentsActive={overview.agents.filter((agent) => agent.active).length}
            agentsTotal={overview.agents.length}
            members={overview.members.length}
            filter={filter}
            onFilter={setFilter}
          />

          {show.attention && (
            <AttentionSection
              tasks={attention}
              whoFor={whoFor}
              {...(onOpenTask ? { onOpenTask } : {})}
              {...(onReviewTask ? { onReviewTask } : {})}
            />
          )}

          {show.running && (
            <RunningSection
              tasks={runningTasks}
              whoFor={whoFor}
              {...(onOpenTask ? { onOpenTask } : {})}
            />
          )}

          {show.done && (
            <DoneSection
              tasks={doneTasks}
              whoFor={whoFor}
              {...(onOpenTask ? { onOpenTask } : {})}
            />
          )}

          <OperationalStatus
            overview={overview}
            {...(onOpenTasksView ? { onOpenTasks: onOpenTasksView } : {})}
            {...(onOpenAgentsView ? { onOpenAgents: onOpenAgentsView } : {})}
            {...(onOpenTeamView ? { onOpenTeam: onOpenTeamView } : {})}
          />

          <div style={{ marginTop: 22 }}>
            <CompanyPanels
              members={overview.members}
              agents={overview.agents}
              showTeam={show.team}
              showAgents={show.agents}
              canManageMembers={overview.canManageMembers}
              onAddAgent={() => setAgentModal(true)}
              {...(onOpenTeamView ? { onOpenTeam: onOpenTeamView } : {})}
              {...(onOpenAgentsView ? { onOpenAgents: onOpenAgentsView } : {})}
            />
          </div>
        </>
      )}

      {agentModal && (
        <AgentCreateModal
          onClose={() => setAgentModal(false)}
          onCreated={async (agent) => {
            setAgentModal(false);
            setNotice(`Agente "${agent.name}" creado. Ya aparece en la empresa.`);
            await load(true);
          }}
        />
      )}

      {memberModal && (
        <AddMemberModal
          isOwner={overview?.role === "owner"}
          onClose={() => setMemberModal(false)}
          onCreated={async (result) => {
            setMemberModal(false);
            const company = overview?.tenant.name ?? "la empresa";
            setNotice(
              result.created
                ? `${result.user.name} tiene cuenta nueva y ya forma parte de ${company} como ${ROLE_LABEL[result.role]}. Puede entrar con su email y contraseña; más adelante con Google o GitHub usando el mismo email.`
                : `${result.user.name} ya tenía cuenta; se ha añadido a ${company} como ${ROLE_LABEL[result.role]}.`,
            );
            await load(true);
          }}
        />
      )}
    </div>
  );
}
