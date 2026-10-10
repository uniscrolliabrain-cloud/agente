// 08-chatgpt - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "chatgpt",
    slug: "08-chatgpt",
    order: 8,
    family: "global",
    reference: "ChatGPT",
    title: "Chat con IA",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "assistant.send_message",
      "assistant.trigger_tool",
      "assistant.approve_action",
      "assistant.list_conversations",
    ],
    dependencies: [
      "domain-core",
    ],
    events: {
      publishes: [
      "assistant.run.started",
      "assistant.run.completed",
      "assistant.tool.invoked",
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
