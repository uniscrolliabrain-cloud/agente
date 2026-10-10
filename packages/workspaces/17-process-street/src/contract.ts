// 17-process-street - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "process-street",
    slug: "17-process-street",
    order: 17,
    family: "trabajo",
    reference: "Process Street",
    title: "Procedimientos y documentacion operativa",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "sop.create",
      "sop.start_run",
      "sop.complete_step",
      "sop.abort_run",
      "sop.read",
      "sop.pending_steps",
    ],
    dependencies: [
      "domain-core",
      "work",
      "documents",
    ],
    events: {
      publishes: [
      "sop.started",
      "sop.step.completed",
      "sop.completed",
      "sop.aborted",
      ],
      consumes: [
      "workitem.created",
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
