// 11-holded-tesoreria - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "holded-tesoreria",
    slug: "11-holded-tesoreria",
    order: 11,
    family: "finanzas" as never,
    reference: "Holded",
    title: "Tesoreria y conciliacion bancaria",
    status: "scaffold",
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
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};