// TEMPLATE_REGISTRY_V1 - catálogo cerrado
import type { ViewSpec } from "../view/spec.ts";
export interface TemplateDef{kind:string;accepts:(spec:ViewSpec)=>boolean;component:string}
export const registry: TemplateDef[]=[
 {kind:"dashboard",accepts:s=>s.kind==="collection"&&s.layout==="dashboard",component:"dashboard/DashboardTemplate"},
 {kind:"table",accepts:s=>s.kind==="collection"&&s.layout==="table",component:"table/TableTemplate"},
 {kind:"kanban",accepts:s=>s.kind==="collection"&&s.layout==="kanban",component:"kanban/KanbanTemplate"},
 {kind:"list",accepts:s=>s.kind==="collection"&&s.layout==="list",component:"list/ListTemplate"},
 {kind:"detail",accepts:s=>s.kind==="detail",component:"detail/DetailTemplate"},
 {kind:"timeline",accepts:s=>s.kind==="timeline",component:"timeline/TimelineTemplate"},
 {kind:"form",accepts:s=>s.kind==="form",component:"form/FormTemplate"},
 {kind:"graph",accepts:s=>s.kind==="chart",component:"graph/GraphTemplate"},
];
export function findTemplate(spec:ViewSpec){return registry.find(t=>t.accepts(spec))}