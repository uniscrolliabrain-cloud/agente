// CENTRO_MANDO_DATA_V2 (E19) - el panel del tenant activo.
//
// Sesion real: GET /api/analytics/overview (tenant-scoped) y se pinta lo que
// hay. Sandbox: los fixtures de "Interfaz" siguen en useDemoCentroMandoData.
// No se inventan metricas: la confianza de los agentes es un dato (AgentMetric)
// que el seed no tiene, asi que la lista sale vacia en vez de con una formula.
import { useEffect, useMemo, useState } from "react";
import { isDemoSession } from "../../../api/client";
import { fetchAnalyticsOverview, type AnalyticsOverview } from "../../../api/analytics";
import type {
  Agent,
  BarRow,
  Client,
  ClientStatus,
  DateRange,
  Insight,
  PendingAction,
  PipelineStage,
  Project,
  Ticket,
} from "../types";
import { useDemoCentroMandoData } from "./useDemoCentroMandoData";

const OPEN_STATUSES = new Set([
  "queued",
  "running",
  "waiting_approval",
  "waiting_input",
  "paused",
  "scheduled",
]);

const PURPLE = "#5E4FF1";
const ORANGE = "#FF6B2C";
const GREEN = "#22C55E";

const ATTENTION: Record<string, { badge: string; badgeColor: string; urgency: string; dot: string }> = {
  waiting_approval: {
    badge: "Aprobación",
    badgeColor: "bg-[#FEF3C7] text-amber-800",
    urgency: "ALTA",
    dot: "bg-amber-400",
  },
  waiting_input: {
    badge: "Falta un dato",
    badgeColor: "bg-[#DBEAFE] text-blue-700",
    urgency: "MEDIA",
    dot: "bg-[#5E4FF1]",
  },
  failed: {
    badge: "Fallo",
    badgeColor: "bg-[#FFE4E6] text-red-700",
    urgency: "URGENCIA",
    dot: "bg-red-500",
  },
};

const ACTION_BADGE: Record<string, { label: string; tone: PendingAction["tone"] }> = {
  awaiting_review: { label: "Revisar", tone: "warn" },
  scheduled: { label: "Programada", tone: "info" },
  outcome_unknown: { label: "Sin confirmar", tone: "danger" },
  failed: { label: "Fallida", tone: "danger" },
};

const PIPELINE_STATUSES = ["riesgo", "oportunidad", "estable", "ganado"] as const;

function relative(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return "ahora";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function eur(value: number | null | undefined): string {
  if (typeof value !== "number") return "Sin importe";
  return `${value.toLocaleString("es-ES")} €`;
}

function clientStatus(status: string | undefined): ClientStatus {
  return status === "riesgo" ? "riesgo" : status === "oportunidad" ? "oportunidad" : "estable";
}

function mapOverview(overview: AnalyticsOverview | null) {
  const empty = {
    tenant: "—",
    clients: [] as Client[],
    projects: [] as Project[],
    tickets: [] as Ticket[],
    agents: [] as Agent[],
    insights: [] as Insight[],
    pending: [] as PendingAction[],
    load: [] as BarRow[],
    pipeline: [] as PipelineStage[],
    topAgent: undefined as Agent | undefined,
    kpis: {
      openTasks: 0,
      running: 0,
      awaitingDecision: 0,
      failed: 0,
      done: 0,
      newToday: 0,
      pending: 0,
      pendingAmount: "—",
      leads: 0,
      activeProjects: 0,
    },
    lastSync: "—",
  };
  if (!overview) return empty;

  const clientName = new Map(overview.clients.map((row) => [row.id, row.name ?? row.id]));
  const agentName = new Map(overview.agents.map((row) => [row.id, row.name ?? row.id]));
  const ownerOf = (assignedTo?: string) => (assignedTo ? (agentName.get(assignedTo) ?? assignedTo) : "Equipo");
  const companyOf = (clientId?: string) => (clientId ? (clientName.get(clientId) ?? clientId) : "—");

  const clients: Client[] = overview.leads.map((lead) => {
    const name = lead.name ?? lead.domain ?? lead.id;
    return {
      id: lead.id,
      name,
      company: lead.domain ?? "—",
      ltv: eur(lead.amountEur),
      status: clientStatus(lead.status),
      next: lead.nextStep ?? "Sin próximo paso",
      action: lead.action ?? "Abrir ficha",
      avatar: initials(name),
      detail: lead.detail ?? "",
      amount: eur(lead.amountEur),
    };
  });

  const projects: Project[] = overview.projects.map((project) => {
    const pct = typeof project.progressPct === "number" ? project.progressPct : 0;
    return {
      name: project.name ?? project.id,
      pct,
      owner: companyOf(project.clientId),
      avatar: initials(project.name ?? project.id),
      alert:
        project.status === "paused"
          ? "Pausado"
          : `${project.checklistDone ?? 0}/${project.checklistTotal ?? 0} partidas`,
      color: project.status === "paused" ? ORANGE : pct >= 80 ? GREEN : PURPLE,
    };
  });

  const tickets: Ticket[] = overview.tasks
    .filter((task) => task.status && task.status in ATTENTION)
    .sort((a, b) => (String(a.updatedAt ?? "") < String(b.updatedAt ?? "") ? 1 : -1))
    .map((task) => {
      const meta = ATTENTION[task.status as keyof typeof ATTENTION];
      return {
        name: ownerOf(task.assignedTo),
        company: companyOf(task.clientId),
        issue: task.title ?? task.id,
        time: relative(task.updatedAt),
        badge: meta.badge,
        badgeColor: meta.badgeColor,
        urgency: meta.urgency,
        dot: meta.dot,
      };
    });

  const pending: PendingAction[] = overview.actions
    .filter((action) => action.status && action.status in ACTION_BADGE)
    .map((action) => {
      const badge = ACTION_BADGE[action.status as keyof typeof ACTION_BADGE];
      return {
        id: action.id,
        title: action.title ?? action.id,
        meta: typeof action.amountEur === "number" ? eur(action.amountEur) : (action.kind ?? "Acción"),
        badge: badge.label,
        tone: badge.tone,
      };
    });

  const openTasks = overview.tasks.filter((task) => task.status && OPEN_STATUSES.has(task.status));
  const loadByAgent = [...new Set(openTasks.map((task) => task.assignedTo ?? "sin-agente"))]
    .map((assignedTo) => ({
      name: assignedTo === "sin-agente" ? "Sin asignar" : ownerOf(assignedTo),
      value: openTasks.filter((task) => (task.assignedTo ?? "sin-agente") === assignedTo).length,
    }))
    .sort((a, b) => b.value - a.value);
  const maxLoad = Math.max(1, ...loadByAgent.map((row) => row.value));
  const load: BarRow[] = loadByAgent.map((row) => ({ ...row, pct: Math.round((row.value / maxLoad) * 100) }));

  const pipelineValues = PIPELINE_STATUSES.map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    val: overview.leads.filter((lead) => lead.status === status).length,
  }));
  const maxStage = Math.max(1, ...pipelineValues.map((item) => item.val));
  const pipeline: PipelineStage[] = pipelineValues.map((item) => ({
    ...item,
    w: `${Math.round((item.val / maxStage) * 100)}%`,
  }));

  const variants: Insight["variant"][] = ["light", "primary", "ghost"];
  const insights: Insight[] = overview.notifications.slice(0, 3).map((notification, index) => ({
    tag: notification.title ?? notification.id,
    body: notification.body ?? "",
    cta: notification.cta ?? "Abrir",
    variant: variants[index % variants.length],
  }));

  return {
    tenant: overview.tenantId.toUpperCase(),
    clients,
    projects,
    tickets,
    // AgentMetric (confianza) es un dato que el tenant no tiene: lista vacía.
    agents: [] as Agent[],
    insights,
    pending,
    load,
    pipeline,
    topAgent: undefined as Agent | undefined,
    kpis: {
      ...empty.kpis,
      openTasks: overview.kpis.openTasks,
      running: overview.kpis.running,
      awaitingDecision: overview.kpis.awaitingDecision,
      failed: overview.kpis.failed,
      done: overview.kpis.done,
      newToday: overview.kpis.newToday,
      pending: overview.kpis.pendingActions,
      pendingAmount: eur(overview.kpis.pendingAmountEur),
      leads: overview.kpis.leads,
      activeProjects: overview.kpis.activeProjects,
    },
    lastSync: relative(overview.generatedAt),
  };
}

export function useCentroMandoData(range: DateRange) {
  const demo = isDemoSession();
  const demoData = useDemoCentroMandoData(range);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAnalyticsOverview(range)
      .then((next) => {
        if (!cancelled) setOverview(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar la analítica");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range, demo]);

  const real = useMemo(() => mapOverview(overview), [overview]);

  if (demo) return { ...demoData, loading: false, error: null };
  return { ...real, loading, error };
}
