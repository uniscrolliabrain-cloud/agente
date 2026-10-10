// 28-odoo-manufacturing - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "odoo-manufacturing",
    slug: "28-odoo-manufacturing",
    order: 28,
    family: "operaciones",
    reference: "Odoo Manufacturing",
    title: "Produccion y ordenes de trabajo",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "production.plan",
      "production.start",
      "production.consume",
      "production.record_output",
      "production.close",
      "production.read",
    ],
    dependencies: [
      "domain-core",
      "inventory",
      "purchases",
      "commerce",
    ],
    events: {
      publishes: [
      "production.planned",
      "production.started",
      "production.output.recorded",
      "production.closed",
      ],
      consumes: [
      "stock.reserved",
      "order.created",
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
