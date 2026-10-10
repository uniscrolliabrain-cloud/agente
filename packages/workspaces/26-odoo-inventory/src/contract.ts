// 26-odoo-inventory - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "odoo-inventory",
    slug: "26-odoo-inventory",
    order: 26,
    family: "operaciones",
    reference: "Odoo Inventory",
    title: "Inventario y almacen",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "stock.receive",
      "stock.issue",
      "stock.transfer",
      "stock.adjust",
      "stock.reserve",
      "stock.list",
      "stock.low_alerts",
    ],
    dependencies: [
      "domain-core",
      "purchases",
      "commerce",
      "manufacturing",
    ],
    events: {
      publishes: [
      "stock.received",
      "stock.issued",
      "stock.transferred",
      "stock.adjusted",
      "stock.low",
      ],
      consumes: [
      "purchase.order.received",
      "order.fulfilled",
      "production.output.recorded",
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
