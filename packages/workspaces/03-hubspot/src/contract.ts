// 03-hubspot - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "hubspot",
    slug: "03-hubspot",
    order: 3,
    family: "comunicacion",
    reference: "HubSpot",
    title: "CRM y ventas",
    status: "implemented",
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
    dependencies: [
      "domain-core",
      "email",
      "messaging",
      "documents",
    ],
    events: {
      publishes: [
      "lead.created",
      "opportunity.created",
      "opportunity.stage.changed",
      "sales.activity.logged",
      ],
      consumes: [
      "email.received",
      "whatsapp.message.received",
      "task.completed",
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
