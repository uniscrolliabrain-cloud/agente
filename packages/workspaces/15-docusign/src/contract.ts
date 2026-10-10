// 15-docusign - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "docusign",
    slug: "15-docusign",
    order: 15,
    family: "documentos",
    reference: "DocuSign",
    title: "Contratos y firma electronica",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "envelope.prepare",
      "envelope.send",
      "envelope.record_signature",
      "envelope.cancel",
      "envelope.read",
      "envelope.list_pending",
    ],
    dependencies: [
      "domain-core",
      "documents",
      "crm",
    ],
    events: {
      publishes: [
      "envelope.prepared",
      "envelope.sent",
      "envelope.signed",
      "envelope.completed",
      ],
      consumes: [
      "document.uploaded",
      "contract.drafted",
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
