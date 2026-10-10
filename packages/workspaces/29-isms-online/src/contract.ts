// 29-isms-online - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "isms-online",
    slug: "29-isms-online",
    order: 29,
    family: "gobierno",
    reference: "ISMS.online",
    title: "Cumplimiento y gestion de riesgos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "risk.register",
      "control.assign",
      "evidence.attach",
      "review.schedule",
      "risk.close",
      "risk.register_view",
      "compliance.overview",
    ],
    dependencies: [
      "domain-core",
      "documents",
      "personas",
    ],
    events: {
      publishes: [
      "risk.registered",
      "control.assigned",
      "evidence.attached",
      "review.scheduled",
      ],
      consumes: [
      "document.uploaded",
      "asset.registered",
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
