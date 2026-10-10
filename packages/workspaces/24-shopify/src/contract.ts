// 24-shopify - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "shopify",
    slug: "24-shopify",
    order: 24,
    family: "finanzas",
    reference: "Shopify",
    title: "Comercio electronico y pedidos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "order.create",
      "order.fulfill",
      "order.return_register",
      "inventory.sync",
      "refund.issue",
      "order.list",
      "order.read",
    ],
    dependencies: [
      "domain-core",
      "inventory",
      "payments",
      "documents",
    ],
    events: {
      publishes: [
      "order.created",
      "order.fulfilled",
      "order.returned",
      "inventory.synced",
      ],
      consumes: [
      "stock.movement.recorded",
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
