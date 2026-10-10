// 22-canva - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "canva",
    slug: "22-canva",
    order: 22,
    family: "documentos",
    reference: "Canva",
    title: "Diseno y creacion de contenido",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "brief.create",
      "design.generate",
      "asset.export",
      "asset.publish",
      "brand.upload",
      "design.read",
    ],
    dependencies: [
      "domain-core",
      "documents",
      "marketing",
    ],
    events: {
      publishes: [
      "brief.created",
      "design.generated",
      "asset.exported",
      "asset.published",
      ],
      consumes: [
      "campaign.created",
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
