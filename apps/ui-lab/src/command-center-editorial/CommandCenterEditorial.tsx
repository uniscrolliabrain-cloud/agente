// CENTRO_DE_MANDO_EDITORIAL_V2 - composición editorial del Centro de Mando.
//
// Misma fuente de datos (`CompanyOverview`), mismos filtros, mismos permisos y
// mismos callbacks que `apps/web/src/components/command-center/CommandCenterView`.
// Lo que cambia es la composición, la tipografía, el ritmo y el movimiento.
// No toca el shell, ni el workspace 35, ni ControlCenterView, ni el backend.
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEditorialEntrance } from "./editorial-motion";
import type { CompanyOverview, CompanyTask } from "../../../web/src/api/company";
import AgentCreateModal from "../../../web/src/components/AgentCreateModal";
import { AddMemberModal } from "../../../web/src/components/command-center/AddMemberModal";
import { briefingText } from "../../../web/src/components/command-center/BriefingCard";
import SampleDashboardLegacy from "../../../web/src/components/command-center/SampleDashboardLegacy";
import { ROLE_LABEL, isAttention, type CommandFilter } from "../../../web/src/components/command-center/labels";
import { relativeTime } from "../../../web/src/lib/format";
import { EditorialFrame } from "./EditorialFrame";
import { PresentationChanges } from "./PresentationChanges";
import { EditorialAttention } from "./components/EditorialAttention";
import { EditorialBriefing } from "./components/EditorialBriefing";
import { EditorialFeed } from "./components/EditorialFeed";
import { EditorialFilters } from "./components/EditorialFilters";
import { EditorialHero } from "./components/EditorialHero";
import { EditorialKpis } from "./components/EditorialKpis";
import { EditorialOperational } from "./components/EditorialOperational";
import { EditorialPanels } from "./components/EditorialPanels";
import { ErrorState, LoadingState, Notice, SampleBanner } from "./components/EditorialStates";
import { EditorialDone, EditorialRunning } from "./components/EditorialWork";

export interface CommandCenterEditorialProps {
  overview: CompanyOverview | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  updatedAt: string | null;
  demoSession: boolean;
  onRefresh: () => void;
  onReload: () => Promise<void>;
  onOpenTask?: (taskId: string) => void;
  onReviewTask?: (taskId: string) => void;
  onOpenTasksView?: () => void;
  onOpenAgentsView?: () => void;
  onOpenTeamView?: () => void;
  onOpenChat?: () => void;
  /**
   * Solo laboratorio: cuando una acción abriría otra superficie del producto
   * (que UI Lab no monta), se explica en un aviso en lugar de simularla. En la
   * app real se deja en `false` y mandan los callbacks originales.
   */
  labNavigation?: boolean;
}

/** Estados que no esperan decisión ni se están ejecutando: alimentan el feed. */
const FEED_STATUSES = new Set(["queued", "scheduled", "paused", "cancelled"]);

export function CommandCenterEditorial({
  overview,
  loading,
  refreshing,
  error,
  updatedAt,
  demoSession,
  onRefresh,
  onReload,
  onOpenTask,
  onReviewTask,
  onOpenTasksView,
  onOpenAgentsView,
  onOpenTeamView,
  onOpenChat,
  labNavigation = false,
}: CommandCenterEditorialProps) {
  const [filter, setFilter] = useState<CommandFilter>("todo");
  // La presentación V5 es la normal, también con la API sintética.
  const [sampleHidden, setSampleHidden] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [agentModal, setAgentModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);

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

  const whoFor = (task: CompanyTask) =>
    (task.assignedTo ? agentNames.get(task.assignedTo) : undefined) ??
    memberNames.get(task.owner) ??
    "Sistema";

  const recent = overview?.tasks.recent ?? [];
  const attention = recent.filter((task) => isAttention(task.status));
  const runningTasks = recent.filter((task) => task.status === "running");
  const doneTasks = recent.filter((task) => task.status === "succeeded").slice(0, 6);
  const feedTasks = recent
    .filter((task) => FEED_STATUSES.has(task.status))
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  // El ejemplo histórico es opt-in y no sustituye por defecto al CompanyOverview.
  const sampleAvailable = overview !== null && (demoSession || overview.tasks.total === 0);
  const showSample = sampleAvailable && !sampleHidden;

  const show = {
    attention: filter === "todo" || filter === "aprobaciones",
    running: filter === "todo" || filter === "en-marcha",
    done: filter === "todo" || filter === "agentes",
    team: filter === "todo" || filter === "equipo",
    agents: filter === "todo" || filter === "agentes" || filter === "equipo",
  };

  /**
   * Envoltorio de una acción de navegación. Mantiene el contrato original:
   * sin callback y sin laboratorio, el control no se pinta.
   */
  const action = (label: string, run?: () => void) => {
    if (!run && !labNavigation) return undefined;
    return () => {
      run?.();
      if (labNavigation) setNotice(`Vista de laboratorio: ${label} se abre en la app, fuera de esta campaña.`);
    };
  };

  const [workRequest, setWorkRequest] = useState(0);
  const handledWork = useRef(0);
  const goToWork = () => {
    setFilter("todo");
    setWorkRequest((request) => request + 1);
  };

  /**
   * Abrir tarea y revisar aprobación conservan su callback original. En el
   * laboratorio no hay detalle ni ApprovalInbox montados: se avisa, no se simula.
   */
  const openTask =
    !onOpenTask && !labNavigation
      ? undefined
      : (taskId: string) => {
          onOpenTask?.(taskId);
          if (labNavigation) {
            setNotice("Vista de laboratorio: el detalle de la tarea se abre en la app, fuera de esta campaña.");
          }
        };

  const reviewTask =
    !onReviewTask && !labNavigation
      ? undefined
      : (taskId: string) => {
          onReviewTask?.(taskId);
          if (labNavigation) {
            setNotice("Vista de laboratorio: la revisión se hace en el flujo de aprobaciones existente de la app.");
          }
        };

  const updatedLabel = updatedAt ? relativeTime(updatedAt) : "";
  const viewRef = useRef<HTMLDivElement>(null);
  useEditorialEntrance(viewRef, overview !== null);
  // Después del commit de React, no un retraso arbitrario. Limitar búsqueda
  // a la instancia actual (dos centros pueden convivir en el laboratorio).
  useLayoutEffect(() => {
    if (workRequest === handledWork.current || filter !== "todo") return;
    handledWork.current = workRequest;
    const target = viewRef.current?.querySelector<HTMLElement>("[data-cce-work-target]");
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [workRequest, filter]);

  return (
    <EditorialFrame>
      <PresentationChanges overview={!showSample && !error ? overview : null}>
      <div className="cce-view" ref={viewRef}>
        <EditorialHero
          tenantName={overview?.tenant.name ?? "tu empresa"}
          role={overview?.role ?? null}
          canManageMembers={overview?.canManageMembers ?? false}
          updatedAt={updatedAt}
          updatedLabel={updatedLabel}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAddAgent={() => setAgentModal(true)}
          onAddPerson={() => setMemberModal(true)}
        />

        {notice && <Notice text={notice} onClose={() => setNotice(null)} />}

        {error && overview && (
          <ErrorState
            message={error}
            retainingData
            onRetry={() => {
              setNotice(null);
              onRefresh();
            }}
          />
        )}

        {sampleAvailable && (
          <SampleBanner
            tenantName={overview?.tenant.name ?? "esta empresa"}
            demoSession={demoSession}
            showingSample={showSample}
            onToggle={() => setSampleHidden((value) => !value)}
          />
        )}

        {loading && !overview ? (
          <LoadingState />
        ) : !overview ? (
          <ErrorState
            message={error ?? "No se pudo cargar el estado de la empresa."}
            onRetry={onRefresh}
          />
        ) : showSample ? (
          <SampleDashboardLegacy {...(onOpenChat || labNavigation ? { onOpenChat: action("Abrir LAIA", onOpenChat) } : {})} />
        ) : (
          <>
            <EditorialBriefing
              text={briefingText(overview)}
              hasFinishedWork={doneTasks.length > 0}
              onSeeWork={goToWork}
              onOpenChat={action("Abrir LAIA", onOpenChat)}
            />

            <EditorialKpis
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

            <EditorialFilters filter={filter} onFilter={setFilter} />

            {show.attention && (
              <EditorialAttention
                tasks={attention}
                totalAttention={overview.tasks.waiting + overview.tasks.failed}
                whoFor={whoFor}
                onOpenTask={openTask}
                onReviewTask={reviewTask}
              />
            )}

            {filter === "todo" && (
              <EditorialFeed tasks={feedTasks} whoFor={whoFor} onOpenTask={openTask} />
            )}

            {show.running && (
              <EditorialRunning tasks={runningTasks} whoFor={whoFor} onOpenTask={openTask} />
            )}

            {show.done && <EditorialDone tasks={doneTasks} whoFor={whoFor} onOpenTask={openTask} />}

            <EditorialOperational
              overview={overview}
              onOpenTasks={action("Abrir tareas", onOpenTasksView)}
              onOpenAgents={action("Abrir agentes", onOpenAgentsView)}
              onOpenTeam={action("Abrir equipo", onOpenTeamView)}
            />

            <EditorialPanels
              members={overview.members}
              agents={overview.agents}
              showTeam={show.team}
              showAgents={show.agents}
              canManageMembers={overview.canManageMembers}
              onOpenTeam={action("Abrir equipo", onOpenTeamView)}
              onOpenAgents={action("Abrir agentes", onOpenAgentsView)}
              onAddAgent={() => setAgentModal(true)}
            />
          </>
        )}
      </div>
      </PresentationChanges>

      {agentModal && (
        <AgentCreateModal
          onClose={() => setAgentModal(false)}
          onCreated={async (agent) => {
            setAgentModal(false);
            setNotice(`Agente "${agent.name}" creado. Ya aparece en la empresa.`);
            await onReload();
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
                ? `${result.user.name} tiene cuenta nueva y ya forma parte de ${company} como ${
                    ROLE_LABEL[result.role]
                  }. Puede entrar con su email y contraseña; más adelante con Google o GitHub usando el mismo email.`
                : `${result.user.name} ya tenía cuenta; se ha añadido a ${company} como ${
                    ROLE_LABEL[result.role]
                  }.`,
            );
            await onReload();
          }}
        />
      )}
    </EditorialFrame>
  );
}

export default CommandCenterEditorial;
