// 16-n8n - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "n8n",
    slug: "16-n8n",
    order: 16,
    family: "trabajo" as never,
    reference: "n8n",
    title: "Automatizaciones",
    status: "scaffold",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
    "workflow.create",
    "workflow.enable",
    "workflow.disable",
    "workflow.trigger",
    "workflow.read",
    "workflow.list_executions",
    ],
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};