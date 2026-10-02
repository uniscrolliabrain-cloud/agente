 // TEMPLATES_REGISTRY_V1 - mapa real
 import type { ViewSpec } from "../view/spec.ts";
 import ListTemplate from "./list/ListTemplate.tsx";
 import TableTemplate from "./table/TableTemplate.tsx";
 import KanbanTemplate from "./kanban/KanbanTemplate.tsx";
 import TimelineTemplate from "./timeline/TimelineTemplate.tsx";
 import GraphTemplate from "./graph/GraphTemplate.tsx";
 import DetailTemplate from "./detail/DetailTemplate.tsx";
 import FormTemplate from "./form/FormTemplate.tsx";
 import DashboardTemplate from "./dashboard/DashboardTemplate.tsx";

 const MAP: Record<string, any> = {
   list: ListTemplate, table: TableTemplate, kanban: KanbanTemplate,
   timeline: TimelineTemplate, graph: GraphTemplate, detail: DetailTemplate,
   form: FormTemplate, dashboard: DashboardTemplate,
 };

 export function findTemplate(spec: ViewSpec) {
   const key = spec.layout ?? spec.kind;
    return MAP[key] ?? ListTemplate;
 }
 export function listTemplates() { return Object.keys(MAP); }