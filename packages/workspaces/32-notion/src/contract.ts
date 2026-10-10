// 32-notion - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "notion",
    slug: "32-notion",
    order: 32,
    family: "documentos",
    reference: "Notion",
    title: "Wiki y conocimiento interno",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "page.create",
      "page.update",
      "page.relate",
      "page.archive",
      "search.knowledge",
      "knowledge.read",
    ],
    dependencies: [
      "domain-core",
      "documents",
    ],
    events: {
      publishes: [
      "page.created",
      "page.updated",
      "page.archived",
      ],
      consumes: [
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
