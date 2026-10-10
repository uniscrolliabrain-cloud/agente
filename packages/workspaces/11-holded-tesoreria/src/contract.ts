// 11-holded-tesoreria - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "holded-tesoreria",
    slug: "11-holded-tesoreria",
    order: 11,
    family: "finanzas",
    reference: "Holded / banca online",
    title: "Tesoreria y conciliacion bancaria",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "bank.import_statement",
      "bank.reconcile",
      "bank.flag_discrepancy",
      "treasury.close_period",
      "treasury.cash_position",
      "treasury.list_transactions",
    ],
    dependencies: [
      "domain-core",
      "holded",
      "payments",
    ],
    events: {
      publishes: [
      "bank.transaction.imported",
      "bank.transaction.reconciled",
      "bank.discrepancy.detected",
      ],
      consumes: [
      "invoice.paid",
      "purchase.order.received",
      "payment.succeeded",
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
