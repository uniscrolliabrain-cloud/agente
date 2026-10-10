// 18-factorial - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "factorial",
    slug: "18-factorial",
    order: 18,
    family: "personas",
    reference: "Factorial",
    title: "Recursos humanos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "employee.create",
      "employee.read",
      "leave.approve",
      "leave.reject",
      "attendance.record",
      "schedule.update",
    ],
    dependencies: [
      "domain-core",
      "documents",
      "identity",
    ],
    events: {
      publishes: [
      "employee.created",
      "leave.approved",
      "leave.rejected",
      "attendance.recorded",
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
