// 03-hubspot - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "hubspot",
    slug: "03-hubspot",
    order: 3,
    family: "comunicacion" as never,
    reference: "HubSpot",
    title: "CRM y ventas",
    status: "scaffold",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
    "crm.upsert_lead",
    "crm.upsert_contact",
    "crm.upsert_company",
    "crm.qualify",
    "crm.create_opportunity",
    "crm.move_stage",
    "crm.log_activity",
    "crm.list_segments",
    ],
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};