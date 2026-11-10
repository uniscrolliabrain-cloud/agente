// ANALYTICS_OVERVIEW_V1 (E19) - panel del tenant activo con datos reales.
//
// Lee del Store con scope por tenant (scanByPrefix con el tenantId del
// contexto), agrega los importes que ya existen en las acciones
// (`amountEur`) y devuelve las filas tal como estan guardadas. No hay
// fixtures, ni formulas de confianza, ni campos derivados del texto: lo que
// no esta en el dato, no se pinta.
import { Hono } from "hono";
import type { TenantScopedStore } from "../db-tenant.ts";

type TaskRow = {
  id: string;
  title?: string;
  status?: string;
  assignedTo?: string;
  clientId?: string;
  createdAt?: string;
  updatedAt?: string;
  state?: { ownerId?: string };
};

type ProjectRow = {
  id: string;
  name?: string;
  status?: string;
  clientId?: string;
  progressPct?: number;
  checklistDone?: number;
  checklistTotal?: number;
  updatedAt?: string;
};

type BusinessRow = {
  id: string;
  type?: string;
  name?: string;
  domain?: string;
  status?: string;
  amountEur?: number | null;
  nextStep?: string;
  action?: string;
  detail?: string;
  updatedAt?: string;
};

type ActionRow = {
  id: string;
  title?: string;
  kind?: string;
  status?: string;
  amountEur?: number;
  createdAt?: string;
  executeAt?: string | null;
};

type NotificationRow = {
  id: string;
  title?: string;
  body?: string;
  cta?: string;
  read?: boolean;
  createdAt?: string;
};

type AgentRow = { id: string; name?: string; description?: string; title?: string };

const OPEN_STATUSES = new Set([
  "queued",
  "running",
  "waiting_approval",
  "waiting_input",
  "paused",
  "scheduled",
]);

const PENDING_ACTION_STATUSES = new Set(["awaiting_review", "scheduled"]);

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 } as const;
type Range = keyof typeof RANGE_DAYS;

function parseRange(raw: string | undefined): Range {
  return raw === "7d" || raw === "90d" ? raw : "30d";
}

function within(iso: string | undefined, days: number, now: number): boolean {
  if (!iso) return false;
  const at = new Date(iso).getTime();
  return Number.isFinite(at) && now - at <= days * 86_400_000;
}

export function analyticsRoutes(deps: { db: TenantScopedStore }) {
  const app = new Hono<{
    Variables: { owner: string; tenantId?: string; ctx?: { tenantId?: string } };
  }>();

  app.get("/overview", async (c) => {
    const tenantId = c.get("tenantId") ?? c.get("ctx")?.tenantId;
    if (!tenantId) return c.json({ error: "Sesion sin empresa resuelta", code: "TENANT_REQUIRED" }, 403);

    const range = parseRange(c.req.query("range"));
    const days = RANGE_DAYS[range];
    const now = Date.now();

    const [tasks, projects, business, actions, notifications, agents] = await Promise.all([
      deps.db.scanByPrefix<TaskRow>("tasks", tenantId, 2000),
      deps.db.scanByPrefix<ProjectRow>("projects", tenantId, 2000),
      deps.db.scanByPrefix<BusinessRow>("business-records", tenantId, 2000),
      deps.db.scanByPrefix<ActionRow>("actions", tenantId, 2000),
      deps.db.scanByPrefix<NotificationRow>("notifications", tenantId, 2000),
      deps.db.scanByPrefix<AgentRow>("agent-roles", tenantId, 200),
    ]);

    const taskRows = tasks.map((row) => row.value);
    const projectRows = projects.map((row) => row.value);
    const businessRows = business.map((row) => row.value);
    const actionRows = actions.map((row) => row.value);
    const notificationRows = notifications.map((row) => row.value);

    const openTasks = taskRows.filter((task) => OPEN_STATUSES.has(String(task.status)));
    const pendingActions = actionRows.filter((action) => PENDING_ACTION_STATUSES.has(String(action.status)));
    // Importes ya presentes en el dato: suma directa, sin parsear texto.
    const pendingAmountEur = pendingActions.reduce(
      (sum, action) => sum + (typeof action.amountEur === "number" ? action.amountEur : 0),
      0,
    );

    return c.json({
      tenantId,
      range,
      generatedAt: new Date(now).toISOString(),
      kpis: {
        openTasks: openTasks.length,
        running: openTasks.filter((task) => task.status === "running").length,
        awaitingDecision: openTasks.filter(
          (task) => task.status === "waiting_approval" || task.status === "waiting_input",
        ).length,
        failed: taskRows.filter((task) => task.status === "failed").length,
        done: taskRows.filter((task) => task.status === "succeeded" && within(task.updatedAt, days, now)).length,
        newToday: taskRows.filter((task) => within(task.createdAt, 1, now)).length,
        pendingActions: pendingActions.length,
        pendingAmountEur,
        leads: businessRows.filter((row) => row.type === "lead").length,
        activeProjects: projectRows.filter((project) => project.status === "active").length,
      },
      tasks: taskRows,
      projects: projectRows,
      leads: businessRows.filter((row) => row.type === "lead"),
      clients: businessRows.filter((row) => row.type === "client"),
      actions: actionRows,
      notifications: notificationRows.filter((row) => row.read !== true),
      agents: agents.map((row) => row.value),
    });
  });

  return app;
}
