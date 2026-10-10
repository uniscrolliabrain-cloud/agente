// 02-whatsapp - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "whatsapp",
    slug: "02-whatsapp",
    order: 2,
    family: "comunicacion",
    reference: "WhatsApp Web",
    title: "Mensajeria instantanea",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "messaging.read",
      "messaging.send",
      "messaging.send_template",
      "messaging.send_media",
      "messaging.link_identity",
      "messaging.mark_read",
    ],
    dependencies: [
      "domain-core",
      "documents",
      "crm",
    ],
    events: {
      publishes: [
      "whatsapp.message.received",
      "whatsapp.message.sent",
      "whatsapp.identity.linked",
      ],
      consumes: [
      "contact.created",
      "document.uploaded",
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
