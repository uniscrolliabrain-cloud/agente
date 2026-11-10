// ANALYTICS_API_V1 (E19) - panel del tenant activo desde el backend.
import { apiFetch } from "./client.ts";

export type AnalyticsRange = "7d" | "30d" | "90d";

export interface AnalyticsTask {
  id: string;
  title?: string;
  status?: string;
  assignedTo?: string;
  clientId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsProject {
  id: string;
  name?: string;
  status?: string;
  clientId?: string;
  progressPct?: number;
  checklistDone?: number;
  checklistTotal?: number;
  updatedAt?: string;
}

export interface AnalyticsBusiness {
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
}

export interface AnalyticsAction {
  id: string;
  title?: string;
  kind?: string;
  status?: string;
  amountEur?: number;
  createdAt?: string;
  executeAt?: string | null;
}

export interface AnalyticsNotification {
  id: string;
  title?: string;
  body?: string;
  cta?: string;
  read?: boolean;
  createdAt?: string;
}

export interface AnalyticsAgent {
  id: string;
  name?: string;
  description?: string;
  title?: string;
}

export interface AnalyticsOverview {
  tenantId: string;
  range: AnalyticsRange;
  generatedAt: string;
  kpis: {
    openTasks: number;
    running: number;
    awaitingDecision: number;
    failed: number;
    done: number;
    newToday: number;
    pendingActions: number;
    pendingAmountEur: number;
    leads: number;
    activeProjects: number;
  };
  tasks: AnalyticsTask[];
  projects: AnalyticsProject[];
  leads: AnalyticsBusiness[];
  clients: AnalyticsBusiness[];
  actions: AnalyticsAction[];
  notifications: AnalyticsNotification[];
  agents: AnalyticsAgent[];
}

export async function fetchAnalyticsOverview(range: AnalyticsRange): Promise<AnalyticsOverview> {
  return apiFetch<AnalyticsOverview>(`/api/analytics/overview?range=${encodeURIComponent(range)}`);
}
