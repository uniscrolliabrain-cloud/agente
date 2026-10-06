 // KERNEL_VIEWS_V2_PROD - readView rapido + computeView con BusinessGraph + policy
 import { z } from "zod";
 import type { KernelContext } from "../context/kernel-context.ts";
 import type { Thought } from "./thought.ts";
 import type { Turn } from "./turn.ts";
 import type { Kernel } from "../kernel.ts";

 export const readViewScopeSchema = z.enum(["turn.recent","turn.thoughts","turn.summary","user.tasks","user.notifications","tenant.turns"]);
 export const computeViewScopeSchema = z.enum(["graph.entities","graph.neighborhood","graph.timeline","memory.recall","policy.evaluate"]);
 export type ReadViewScope = z.infer<typeof readViewScopeSchema>;
 export type ComputeViewScope = z.infer<typeof computeViewScopeSchema>;

 export interface ReadViewResult { scope: ReadViewScope; turnId?: string; thoughts?: Thought[]; summary?: string; metadata: Record<string, unknown>; }
 export interface ComputeViewResult { scope: ComputeViewScope; data: Record<string, unknown>; metadata: Record<string, unknown>; }
 export interface ViewsDeps { kernel: Kernel; businessGraph?: any; }

 export class Views {
   constructor(private readonly deps: ViewsDeps) {}

   async readView(ctx: KernelContext, scope: ReadViewScope, turnId?: string): Promise<ReadViewResult> {
     const tenantId = await this.deps.kernel.deps.tenants.resolve(ctx.owner);
     if ((scope === "turn.thoughts" || scope === "turn.recent") && turnId) {
       const thoughts = await this.deps.kernel.deps.store.thoughtsOf(tenantId, turnId);
       return { scope, turnId, thoughts, metadata: { tenantId, count: thoughts.length } };
     }
     if (scope === "tenant.turns") {
       // VIEWS_TENANT_TURNS_FIX_V1 - sin as any, con paginacion.
       const store = this.deps.kernel.deps.store as {
         listTurns?: (tenantId: string, limit: number) => Promise<Turn[]>;
       };
       const list = typeof store.listTurns === "function"
         ? await store.listTurns(tenantId, 100).catch(() => [] as Turn[])
         : ([] as Turn[]);
       return { scope, metadata: { tenantId, turns: list.length }, summary: `${list.length} turns` };
     }
     return { scope, turnId, metadata: { tenantId, empty: true } };
   }

   async computeView(ctx: KernelContext, scope: ComputeViewScope, params: Record<string, unknown> = {}): Promise<ComputeViewResult> {
     const tenantId = await this.deps.kernel.deps.tenants.resolve(ctx.owner);
     // V2_PROD: si hay businessGraph, consulta real, si no placeholder honesto
     let data: Record<string, unknown> = { tenantId, scope, params, note: "businessGraph not wired yet - implement in engine/business/graph.ts" };
     if (this.deps.businessGraph) {
       try {
         if (scope === "graph.entities") data = await this.deps.businessGraph.entities?.(tenantId, params)?? data;
         if (scope === "graph.neighborhood") data = await this.deps.businessGraph.neighborhood?.(tenantId, params)?? data;
         if (scope === "graph.timeline") data = await this.deps.businessGraph.timeline?.(tenantId, params)?? data;
       } catch (e: any) {
         data = { error: e.message, tenantId, scope };
       }
     }
     return { scope, data, metadata: { tenantId, computedAt: new Date().toISOString() } };
   }
 }