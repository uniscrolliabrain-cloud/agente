// 12-odoo-purchase - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "odoo-purchase",
    slug: "12-odoo-purchase",
    order: 12,
    family: "finanzas" as never,
    reference: "Odoo Purchase",
    title: "Compras y proveedores",
    status: "scaffold",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
    "purchase.request",
    "purchase.approve",
    "purchase.send",
    "purchase.receive",
    "purchase.list",
    "purchase.read",
    ],
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};