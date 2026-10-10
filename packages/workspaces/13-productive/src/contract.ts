// 13-productive - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "productive",
    slug: "13-productive",
    order: 13,
    family: "trabajo",
    reference: "Productive",
    title: "Gestion de proyectos y rentabilidad",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "project.allocate",
      "project.read",
      "project.close",
      "time.log",
      "budget.adjust",
      "profitability.read",
    ],
    dependencies: [
      "domain-core",
      "work",
      "personas",
      "finance",
    ],
    events: {
      publishes: [
      "resource.allocated",
      "time.logged",
      "budget.adjusted",
      ],
      consumes: [
      "workitem.completed",
      "employee.created",
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
