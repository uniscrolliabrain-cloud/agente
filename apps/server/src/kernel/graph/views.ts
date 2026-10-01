// KERNEL_VIEWS_V1 — frontera de consulta al grafo.
//
// El fast no puede leer el grafo entero: tiene presupuesto de latencia.
// El slow si. La frontera no es "grafo si/no" sino profundidad:
//
//   - readView(scope):  vistas precomputadas. El fast las lee directas.
//                       Devuelve datos ya agregados, sin traversal.
//   - computeView(scope): vistas nuevas. El slow las computa.
//                       Puede recorrer el grafo, consultar business graph,
//                       evaluar policies.
//
// Esto evita que el fast haga "un poquito de RAG" y rompa su presupuesto.
// Y evita que el slow responda rapido y rompa su profundidad.

import { z } from "zod";
import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "./thought.ts";
import type { Turn } from "./turn.ts";
import type { Kernel } from "../kernel.ts";

export const readViewScopeSchema = z.enum([
  "turn.recent",
  "turn.thoughts",
  "turn.summary",
  "user.tasks",
  "user.notifications",
  "tenant.turns",
]);

export const computeViewScopeSchema = z.enum([
  "graph.entities",
  "graph.neighborhood",
  "graph.timeline",
  "memory.recall",
  "policy.evaluate",
]);

export type ReadViewScope = z.infer<typeof readViewScopeSchema>;
export type ComputeViewScope = z.infer<typeof computeViewScopeSchema>;

export interface ReadViewResult {
  scope: ReadViewScope;
  turnId?: string;
  thoughts?: Thought[];
  summary?: string;
  metadata: Record<string, unknown>;
}

export interface ComputeViewResult {
  scope: ComputeViewScope;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface ViewsDeps {
  kernel: Kernel;
}

export class Views {
  constructor(private readonly deps: ViewsDeps) {}

  async readView(
    ctx: KernelContext,
    scope: ReadViewScope,
    turnId?: string,
  ): Promise<ReadViewResult> {
    if (scope === "turn.thoughts" || scope === "turn.recent") {
      if (!turnId) {
        throw new Error(`readView(${scope}) requires turnId`);
      }
      const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
      return {
        scope,
        turnId,
        thoughts,
        metadata: { count: thoughts.length },
      };
    }
    if (scope === "turn.summary") {
      if (!turnId) {
        throw new Error(`readView(turn.summary) requires turnId`);
      }
      const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
      return {
        scope,
        turnId,
        summary: `${thoughts.length} thoughts`,
        metadata: { count: thoughts.length },
      };
    }
    return {
      scope,
      metadata: { note: "readView scope no implementado todavia" },
    };
  }

  async computeView(
    ctx: KernelContext,
    scope: ComputeViewScope,
    _input: Record<string, unknown> = {},
  ): Promise<ComputeViewResult> {
    void ctx;
    return {
      scope,
      data: {},
      metadata: { note: "computeView pendiente: se activa cuando el business graph este inyectado" },
    };
  }
}