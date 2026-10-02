// VIEW_RESOLVER_V1 - decide ViewSpec dado un intent.

import type { AgentService } from "../service.ts";
import type { ViewSpec } from "../../../../../packages/domain/src/workspace-spec.ts";

export class ViewResolver {
  constructor(private readonly service: AgentService) {}

  async resolve(owner: string, intent: string): Promise<ViewSpec | null> {
    const lower = intent.toLowerCase();

    if (/pipeline|leads|oportunidades/.test(lower)) {
      return {
        id: `view-board-${Date.now()}`,
        kind: "board",
        title: "Pipeline",
        provenance: { source: "resolver", intent },
      };
    }

    if (/facturas|invoice/.test(lower)) {
      return {
        id: `view-table-${Date.now()}`,
        kind: "table",
        title: "Facturas",
        columns: [
          { key: "number", label: "Número", type: "text", sortable: true, align: "left" },
          { key: "amount", label: "Importe", type: "number", sortable: true, align: "right" },
          { key: "status", label: "Estado", type: "chip", sortable: false, align: "left" },
        ],
        provenance: { source: "resolver", intent },
      };
    }

    if (/c[oó]mo va|resumen|mes|estado/.test(lower)) {
      return {
        id: `view-dashboard-${Date.now()}`,
        kind: "dashboard",
        title: "Resumen",
        provenance: { source: "resolver", intent },
      };
    }

    void owner;
    return null;
  }
}