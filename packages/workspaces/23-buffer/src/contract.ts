// 23-buffer - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "buffer",
    slug: "23-buffer",
    order: 23,
    family: "comunicacion",
    reference: "Buffer",
    title: "Redes sociales y publicacion",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "post.compose",
      "post.schedule",
      "post.publish",
      "post.cancel",
      "post.metrics.collect",
      "post.read",
    ],
    dependencies: [
      "domain-core",
      "content",
      "marketing",
    ],
    events: {
      publishes: [
      "post.composed",
      "post.scheduled",
      "post.published",
      "post.metrics.collected",
      ],
      consumes: [
      "asset.published",
      "campaign.created",
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
