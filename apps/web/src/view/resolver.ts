// VIEW_RESOLVER_V1 - decide template segun intent+context (frontend resolver local)
import type { ViewSpec } from "./spec.ts";
import { findTemplate } from "../templates/registry.ts";
export function resolveView(spec:ViewSpec){return findTemplate(spec)}
export function resolveByIntent(intent:string):Partial<ViewSpec>{
 if(intent.includes("table"))return {kind:"collection",layout:"table"};
 if(intent.includes("kanban"))return {kind:"collection",layout:"kanban"};
 if(intent.includes("timeline"))return {kind:"timeline",layout:"timeline"};
 return {kind:"collection",layout:"list"};
}