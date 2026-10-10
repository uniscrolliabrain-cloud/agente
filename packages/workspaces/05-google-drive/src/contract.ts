// 05-google-drive - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "google-drive",
    slug: "05-google-drive",
    order: 5,
    family: "documentos",
    reference: "Google Drive",
    title: "Archivos y documentos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "document.upload",
      "document.move",
      "document.classify",
      "document.link",
      "document.archive",
      "document.search",
      "document.read",
    ],
    dependencies: [
      "domain-core",
    ],
    events: {
      publishes: [
      "document.uploaded",
      "document.classified",
      "document.linked",
      "document.archived",
      ],
      consumes: [
      "invoice.issued",
      "envelope.signed",
      "purchase.order.received",
      "email.received",
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
