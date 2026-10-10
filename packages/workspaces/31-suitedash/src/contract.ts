// 31-suitedash - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "suitedash",
    slug: "31-suitedash",
    order: 31,
    family: "comunicacion",
    reference: "SuiteDash",
    title: "Portal de clientes y proveedores",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "portal.invite",
      "portal.revoke",
      "request.submit",
      "case.update",
      "document.share",
      "case.timeline",
    ],
    dependencies: [
      "domain-core",
      "crm",
      "documents",
      "tickets",
    ],
    events: {
      publishes: [
      "portal.invited",
      "request.submitted",
      "case.updated",
      "document.shared",
      ],
      consumes: [
      "invoice.issued",
      "ticket.resolved",
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
