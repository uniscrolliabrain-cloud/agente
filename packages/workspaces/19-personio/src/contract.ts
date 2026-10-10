// 19-personio - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "personio",
    slug: "19-personio",
    order: 19,
    family: "personas",
    reference: "Personio",
    title: "Seleccion y candidatos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "position.open",
      "onboarding.start",
      "onboarding.complete",
      "employment.close",
      "lifecycle.read",
      "onboarding.progress",
    ],
    dependencies: [
      "domain-core",
      "personas",
      "documents",
      "identity",
    ],
    events: {
      publishes: [
      "position.opened",
      "onboarding.started",
      "onboarding.completed",
      "employment.closed",
      ],
      consumes: [
      "employee.created",
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
