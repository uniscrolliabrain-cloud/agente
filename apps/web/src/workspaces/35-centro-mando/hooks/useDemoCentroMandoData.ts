// CENTRO_MANDO_DATA_V1 - datos del tenant demo "Interfaz".
// Solo se usa con sesion de sandbox: `useCentroMandoData` delega aqui cuando
// `isDemoSession()` es cierto y, en sesion real, lee /api/analytics/overview.
import { useMemo } from 'react';
import { demoStore } from '../../../demo/fixtures';
import type { AgentTask } from '../../../types/api';
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
} from '../types';

const TENANT = 'Interfaz Studio';

const OPEN_STATUSES = new Set([
  'queued',
  'running',
  'waiting_approval',
  'waiting_input',
  'paused',
  'scheduled',
]);

const RANGE_DAYS: Record<DateRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

const PURPLE = '#5E4FF1';
const ORANGE = '#FF6B2C';
const GREEN = '#22C55E';

function relative(iso?: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'ahora';
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
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function stateOf(task: AgentTask): Record<string, unknown> {
  return (task.state ?? {}) as Record<string, unknown>;
}

const users = demoStore.users;
const agents = demoStore.agents;

const userById = new Map(users.map((user) => [user.id, user]));


function ownerName(task: AgentTask): string {
  const ownerId = stateOf(task).ownerId;
  if (typeof ownerId === 'string') {
    const user = userById.get(ownerId);
    if (user) return user.name;
  }
  return 'Interfaz Studio';
}

/* ------------------------------------------------------------- clientes */

const LEAD_META: Record<
  string,
  { ltv: string; status: ClientStatus; next: string; action: string; detail: string; amount: string }
> = {
  'estudio-lumen': {
    ltv: '8.400 €',
    status: 'estable',
    next: 'Recordatorio de la propuesta el día 25',
    action: 'Revisar propuesta',
    detail: 'Paga a 30 días y siempre pide la factura antes del día 25.',
    amount: '8.400 € enviados',
  },
  'casa-botanica': {
    ltv: '6.200 €',
    status: 'oportunidad',
    next: 'Propuesta en PDF con resumen de una página',
    action: 'Preparar propuesta',
    detail: 'Prefiere recibir las propuestas en PDF y con un resumen de una página.',
    amount: 'Propuesta en preparación',
  },
  'talleres-norte': {
    ltv: '—',
    status: 'oportunidad',
    next: 'Cualificar necesidad y presupuesto',
    action: 'Cualificar',
    detail: 'Contacto inicial: todavía no hay brief ni importe cerrado.',
    amount: 'Sin importe',
  },
  'verde-oficina': {
    ltv: '—',
    status: 'riesgo',
    next: 'Reactivar con un caso de referencia',
    action: 'Reactivar',
    detail: 'En espera desde hace 6 días y no responde al último correo.',
    amount: 'Sin respuesta',
  },
};

function buildClients(): Client[] {
  return demoStore.leads.map((lead) => {
    const name = lead.name ?? lead.domain ?? lead.id;
    const meta = LEAD_META[lead.ref ?? ''] ?? {
      ltv: '—',
      status: 'oportunidad' as ClientStatus,
      next: lead.status ?? 'Sin próximo paso',
      action: 'Abrir ficha',
      detail: 'Lead sin cualificar en el tenant.',
      amount: 'Sin importe',
    };
    return {
      id: lead.id,
      name,
      company: lead.domain ?? '—',
      ltv: meta.ltv,
      status: meta.status,
      next: meta.next,
      action: meta.action,
      avatar: initials(name),
      detail: `${meta.detail} Estado actual: ${lead.status ?? 'sin estado'} · actualizado hace ${relative(lead.updatedAt)}.`,
      amount: meta.amount,
    };
  });
}

/* ------------------------------------------------------------ proyectos */

const PROJECT_TASK: Record<string, string> = {
  'proj-checkout': 'task-checkout',
  'proj-otono': 'task-landing',
  'proj-soporte': 'task-contrato',
};

function projectPct(project: (typeof demoStore.projects)[number]): number {
  const checklist = project.blocks.filter((block) => block.type === 'checklist');
  if (checklist.length === 0) return project.status === 'paused' ? 30 : 60;
  const done = checklist.filter((block) => block.checked).length;
  return Math.round((done / checklist.length) * 100);
}

function buildProjects(): Project[] {
  return demoStore.projects.map((project) => {
    const taskId = PROJECT_TASK[project.id];
    const task = taskId ? demoStore.tasks.find((item) => item.id === taskId) : undefined;
    const pct = projectPct(project);
    const note = project.blocks.find((block) => block.type === 'note')?.text;
    return {
      name: project.name,
      pct,
      owner: task ? ownerName(task) : 'Equipo',
      avatar: initials(task ? ownerName(task) : project.name),
      alert:
        project.status === 'paused'
          ? 'Pausado · pendiente de renovación'
          : note ?? (pct >= 80 ? 'En tiempo' : 'En curso'),
      color: project.status === 'paused' ? ORANGE : pct >= 80 ? GREEN : PURPLE,
    };
  });
}

/* -------------------------------------------------------------- tickets */

const ATTENTION: Record<
  string,
  { badge: string; badgeColor: string; urgency: string; dot: string }
> = {
  waiting_approval: {
    badge: 'Aprobación',
    badgeColor: 'bg-[#FEF3C7] text-amber-800',
    urgency: 'ALTA',
    dot: 'bg-amber-400',
  },
  waiting_input: {
    badge: 'Falta un dato',
    badgeColor: 'bg-[#DBEAFE] text-blue-700',
    urgency: 'MEDIA',
    dot: 'bg-[#5E4FF1]',
  },
  failed: {
    badge: 'Fallo',
    badgeColor: 'bg-[#FFE4E6] text-red-700',
    urgency: 'URGENCIA',
    dot: 'bg-red-500',
  },
};

const CLIENTS_IN_TEXT = ['Lumen', 'Botànica', 'Talleres', 'Verde'];

function clientInText(text: string): string {
  return CLIENTS_IN_TEXT.find((client) => text.includes(client)) ?? TENANT;
}

function buildTickets(): Ticket[] {
  return demoStore.tasks
    .filter((task) => task.status in ATTENTION)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map((task) => {
      const meta = ATTENTION[task.status];
      return {
        name: ownerName(task),
        company: clientInText(task.title),
        issue: task.title,
        time: relative(task.updatedAt),
        badge: meta.badge,
        badgeColor: meta.badgeColor,
        urgency: meta.urgency,
        dot: meta.dot,
      };
    });
}

/* ---------------------------------------------------------------- agentes */

function buildAgents(): Agent[] {
  return agents
    .filter((agent) => agent.active)
    .map((agent) => {
      const assigned = demoStore.tasks.filter(
        (task) => task.assignedTo === agent.id && OPEN_STATUSES.has(task.status),
      );
      const blocked = assigned.filter(
        (task) => task.status === 'failed' || task.status === 'waiting_input',
      ).length;
      const conf = Math.max(62, 96 - blocked * 9 - (assigned.length > 3 ? 4 : 0));
      return {
        name: agent.name,
        conf,
        tasks: assigned.length,
        status: blocked > 0 ? 'warn' : 'ok',
        desc: agent.objetivo,
      } satisfies Agent;
    });
}

/* ------------------------------------------------------------- acciones */

const ACTION_KIND_LABEL: Record<string, string> = {
  'email.send': 'Email',
  'content.publish': 'Notion',
  'drive.createFolder': 'Drive',
  'shopify.sync': 'Shopify',
};

const ACTION_BADGE: Record<string, { label: string; tone: PendingAction['tone'] }> = {
  awaiting_review: { label: 'Revisar', tone: 'warn' },
  scheduled: { label: 'Programada', tone: 'info' },
  outcome_unknown: { label: 'Sin confirmar', tone: 'danger' },
  failed: { label: 'Fallida', tone: 'danger' },
};

function buildPending(): PendingAction[] {
  return demoStore.actions
    .filter((action) => action.status in ACTION_BADGE)
    .map((action) => {
      const data = (action.data ?? {}) as Record<string, unknown>;
      const detail =
        typeof data.importe === 'string'
          ? data.importe
          : typeof data.canal === 'string'
            ? data.canal
            : typeof data.carpeta === 'string'
              ? data.carpeta
              : action.account ?? ACTION_KIND_LABEL[action.kind] ?? action.kind;
      const badge = ACTION_BADGE[action.status];
      return {
        id: action.id,
        title: action.title,
        meta: detail,
        badge: badge.label,
        tone: badge.tone,
      } satisfies PendingAction;
    });
}

function amountOf(): { total: number; label: string } {
  const total = demoStore.actions.reduce((sum, action) => {
    const data = (action.data ?? {}) as Record<string, unknown>;
    if (typeof data.importe !== 'string') return sum;
    const parsed = Number(data.importe.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? sum + parsed : sum;
  }, 0);
  return {
    total,
    label:
      total > 0
        ? `${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`
        : '—',
  };
}

/* --------------------------------------------------------------- insights */

const INSIGHT_CTA: Record<string, string> = {
  'task-presupuesto': 'Revisar presupuesto',
  'task-landing': 'Responder al equipo',
  'task-shopify': 'Reconectar Shopify',
  'task-guia': 'Abrir en Notion',
};

function buildInsights(): Insight[] {
  const variants: Insight['variant'][] = ['light', 'primary', 'ghost'];
  return demoStore.notifications
    .filter((notification) => !notification.read)
    .slice(0, 3)
    .map((notification, index) => ({
      tag: notification.title,
      body: notification.body,
      cta: (notification.taskId && INSIGHT_CTA[notification.taskId]) ?? 'Abrir tarea',
      variant: variants[index % variants.length],
    }));
}

/* ------------------------------------------------------------------ datos */

export function useDemoCentroMandoData(range: DateRange) {
  const days = RANGE_DAYS[range];

  return useMemo(() => {
    const now = Date.now();
    const inRange = (iso?: string) =>
      Boolean(iso) && now - new Date(iso as string).getTime() <= days * 86_400_000;

    const openTasks = demoStore.tasks.filter((task) => OPEN_STATUSES.has(task.status));
    const running = openTasks.filter((task) => task.status === 'running').length;
    const awaitingDecision = openTasks.filter(
      (task) => task.status === 'waiting_approval' || task.status === 'waiting_input',
    ).length;
    const failed = demoStore.tasks.filter((task) => task.status === 'failed').length;
    const done = demoStore.tasks.filter(
      (task) => task.status === 'succeeded' && inRange(task.updatedAt),
    ).length;
    const newToday = demoStore.tasks.filter(
      (task) => now - new Date(task.createdAt).getTime() <= 86_400_000,
    ).length;

    const pending = buildPending();
    const amount = amountOf();

    const loadByAgent: { name: string; value: number }[] = agents
      .map((agent) => ({
        name: agent.name,
        value: openTasks.filter((task) => task.assignedTo === agent.id).length,
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value);
    const maxLoad = Math.max(1, ...loadByAgent.map((row) => row.value));
    const load: BarRow[] = loadByAgent.map((row) => ({
      ...row,
      pct: Math.round((row.value / maxLoad) * 100),
    }));

    const leads = demoStore.leads;
    const stage = (needle: string) =>
      leads.filter((lead) => (lead.status ?? '').includes(needle)).length;
    const stageValues = [
      { label: 'Lead', val: stage('Contacto') },
      { label: 'Propuesta', val: stage('Propuesta') + stage('Presupuesto') },
      { label: 'En espera', val: stage('espera') },
      { label: 'Ganado', val: 0 },
    ];
    const maxStage = Math.max(1, ...stageValues.map((item) => item.val));
    const pipeline: PipelineStage[] = stageValues.map((item) => ({
      ...item,
      w: `${Math.round((item.val / maxStage) * 100)}%`,
    }));

    const agentsData = buildAgents();
    const topAgent = [...agentsData].sort((a, b) => b.conf - a.conf)[0];

    return {
      tenant: TENANT,
      clients: buildClients(),
      projects: buildProjects(),
      tickets: buildTickets(),
      agents: agentsData,
      insights: buildInsights(),
      pending,
      load,
      pipeline,
      topAgent,
      kpis: {
        openTasks: openTasks.length,
        running,
        awaitingDecision,
        failed,
        done,
        newToday,
        pending: pending.length,
        pendingAmount: amount.label,
        leads: leads.length,
        activeProjects: demoStore.projects.filter((project) => project.status === 'active').length,
      },
      lastSync: relative(demoStore.notifications[0]?.createdAt),
    };
  }, [days]);
}
