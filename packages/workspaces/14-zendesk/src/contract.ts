// 14-zendesk - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "zendesk",
    slug: "14-zendesk",
    order: 14,
    family: "comunicacion",
    reference: "Zendesk",
    title: "Atencion al cliente y tickets",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "ticket.create",
      "ticket.assign",
      "ticket.escalate",
      "ticket.resolve",
      "ticket.reopen",
      "ticket.list",
      "ticket.read",
    ],
    dependencies: [
      "domain-core",
      "email",
      "messaging",
      "crm",
      "documents",
    ],
    events: {
      publishes: [
      "ticket.created",
      "ticket.assigned",
      "ticket.resolved",
      "ticket.escalated",
      ],
      consumes: [
      "email.received",
      "whatsapp.message.received",
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
