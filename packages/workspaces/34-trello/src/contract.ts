// 34-trello - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "trello",
    slug: "34-trello",
    order: 34,
    family: "trabajo" as never,
    reference: "Trello",
    title: "Kanban",
    status: "scaffold",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
    "board.create",
    "card.create",
    "card.move",
    "card.assign",
    "card.archive",
    "board.list",
    "card.history",
    ],
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};