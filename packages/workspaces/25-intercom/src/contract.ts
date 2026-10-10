// 25-intercom - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "intercom",
    slug: "25-intercom",
    order: 25,
    family: "comunicacion",
    reference: "Intercom",
    title: "Atencion posventa y exito del cliente",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "conversation.open",
      "conversation.send",
      "conversation.route",
      "conversation.close",
      "customer.timeline",
      "conversation.list",
    ],
    dependencies: [
      "domain-core",
      "crm",
      "tickets",
      "documents",
    ],
    events: {
      publishes: [
      "conversation.opened",
      "conversation.routed",
      "conversation.closed",
      ],
      consumes: [
      "email.received",
      "whatsapp.message.received",
      "ticket.created",
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
