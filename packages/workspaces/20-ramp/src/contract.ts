// 20-ramp - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "ramp",
    slug: "20-ramp",
    order: 20,
    family: "finanzas",
    reference: "Ramp",
    title: "Compras y gestion de gastos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "expense.submit",
      "expense.approve",
      "expense.reject",
      "expense.receipt_attach",
      "spend_limit.set",
      "expense.list",
    ],
    dependencies: [
      "domain-core",
      "documents",
      "personas",
      "purchases",
    ],
    events: {
      publishes: [
      "expense.submitted",
      "expense.approved",
      "expense.rejected",
      "expense.receipt.attached",
      ],
      consumes: [
      "document.uploaded",
      "purchase.order.received",
      ],
    },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
  commands: COMMANDS,
  queries: QUERIES,
};
