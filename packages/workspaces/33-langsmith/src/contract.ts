// 33-langsmith - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "langsmith",
    slug: "33-langsmith",
    order: 33,
    family: "gobierno",
    reference: "LangSmith",
    title: "Observabilidad de agentes",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "run.record",
      "span.record",
      "evaluation.submit",
      "run.flag",
      "trace.read",
      "cost.by_agent",
    ],
    dependencies: [
      "domain-core",
      "identity",
    ],
    events: {
      publishes: [
      "run.recorded",
      "span.recorded",
      "evaluation.submitted",
      ],
      consumes: [

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
