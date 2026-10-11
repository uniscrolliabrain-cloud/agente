// TEMPLATES_REGISTRY_V1
import type { ViewSpec } from "../view/spec.ts";
import ListTemplate from "./list/ListTemplate.tsx";
import TableTemplate from "./table/TableTemplate.tsx";
import KanbanTemplate from "./kanban/KanbanTemplate.tsx";
import TimelineTemplate from "./timeline/TimelineTemplate.tsx";
import GraphTemplate from "./graph/GraphTemplate.tsx";
import DetailTemplate from "./detail/DetailTemplate.tsx";
import FormTemplate from "./form/FormTemplate.tsx";
import DashboardTemplate from "./dashboard/DashboardTemplate.tsx";

const MAP: Record<string, unknown> = {
  list: ListTemplate,
  table: TableTemplate,
  kanban: KanbanTemplate,
  timeline: TimelineTemplate,
  graph: GraphTemplate,
  detail: DetailTemplate,
  form: FormTemplate,
  dashboard: DashboardTemplate,
};

const EXTRA: Record<string, unknown> = {
  inbox: ListTemplate,
  queue: ListTemplate,
  chart: DashboardTemplate,
  compare: TableTemplate,
  calendar: TimelineTemplate,
  document: DetailTemplate,
};

for (const k of Object.keys(EXTRA)) {
  if (!(k in MAP)) MAP[k] = EXTRA[k];
}

export function findTemplate(spec: ViewSpec): unknown {
  const key = spec.layout ?? spec.kind;
  return MAP[key] ?? ListTemplate;
}

export function listTemplates(): string[] {
  return Object.keys(MAP);
}
