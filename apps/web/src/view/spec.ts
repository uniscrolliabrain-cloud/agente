// VIEW_SPEC_V1 - tipos cerrados que rellena el backend
import { z } from "zod";
export const columnSpec=z.object({key:z.string(),label:z.string(),type:z.enum(["text","number","date","chip","action"]),sortable:z.boolean().optional()});
export const actionSpec=z.object({id:z.string(),label:z.string(),kind:z.enum(["primary","secondary","danger"]),intent:z.string()});
export const dataSourceSpec=z.object({kind:z.enum(["business-graph","memory","static"]),query:z.string(),tenantId:z.string(),bindings:z.record(z.string(),z.unknown()).default({})});
export const viewSpec=z.object({
 id:z.string(),kind:z.enum(["collection","timeline","detail","form","chart"]),layout:z.enum(["dashboard","table","kanban","list","timeline","form","graph"]).optional(),
 title:z.string(),columns:z.array(columnSpec).optional(),actions:z.array(actionSpec).optional(),
 dataSource:z.array(dataSourceSpec).optional(),provenance:z.record(z.string(),z.unknown()).optional(),
});
export type ViewSpec=z.infer<typeof viewSpec>;export type ColumnSpec=z.infer<typeof columnSpec>;export type ActionSpec=z.infer<typeof actionSpec>;export type DataSourceSpec=z.infer<typeof dataSourceSpec>;