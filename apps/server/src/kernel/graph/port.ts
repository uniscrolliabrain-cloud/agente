// KERNEL_GRAPH_PORT_V1 - contrato tipado entre el kernel cognitivo y el grafo
// de negocio. Antes el kernel recibia `businessGraph` con params
// `Record<string, unknown>`, asi que nadie sabia que forma tenia una entidad y
// las vistas caian a placeholders. Este puerto fija la forma minima.

import type { NodeRef } from "../../../../../packages/domain/src/node-ref.ts";

export interface GraphNode {
  id: string;
  kind: string;
  label?: string;
}

export interface GraphTimelineEntry {
  id: string;
  at: string;
  type: string;
}

export interface GraphPort {
  /** Resuelve una referencia canonica a un nodo real del grafo. */
  resolveNode(tenantId: string, ref: string | NodeRef): Promise<GraphNode | undefined>;
  /** Vecinos de un nodo, con profundidad acotada por el adaptador. */
  neighbors(tenantId: string, ref: string | NodeRef, depth?: number): Promise<GraphNode[]>;
  /** Historial del nodo. Un adaptador sin historial devuelve [] de forma honesta. */
  timeline(tenantId: string, ref: string | NodeRef, limit?: number): Promise<GraphTimelineEntry[]>;
}
