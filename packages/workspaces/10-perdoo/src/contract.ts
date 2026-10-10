// 10-perdoo - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "perdoo",
    slug: "10-perdoo",
    order: 10,
    family: "personas",
    reference: "Perdoo",
    title: "Direccion, objetivos y planificacion",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "objective.create",
      "objective.update_kr",
      "objective.link_strategy",
      "objective.close",
      "objective.list",
      "objective.progress",
    ],
    dependencies: [
      "domain-core",
      "work",
      "finance",
    ],
    events: {
      publishes: [
      "objective.created",
      "keyresult.updated",
      "objective.closed",
      ],
      consumes: [
      "workitem.completed",
      "invoice.issued",
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
