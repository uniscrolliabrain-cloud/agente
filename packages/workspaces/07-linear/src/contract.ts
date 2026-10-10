// 07-linear - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "linear",
    slug: "07-linear",
    order: 7,
    family: "trabajo",
    reference: "Linear",
    title: "Tareas y proyectos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "work.create","work.assign","work.change_status","work.add_dependency",
      "work.close","work.list","work.read",
    ],
    dependencies: ["domain-core", "personas"],
    events: {
      publishes: ["workitem.created","workitem.assigned","workitem.completed","workitem.blocked"],
      consumes: ["task.created","ticket.created","sop.completed"],
    },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
  commands: COMMANDS,
  queries: QUERIES,
};
