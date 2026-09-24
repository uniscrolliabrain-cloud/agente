import "./config.ts";
import { HttpAgent } from "@ag-ui/client";
import {
  type AgentsFactory,
  type CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import type { Auth } from "./auth.ts";
import type { Config } from "./config.ts";
import { ConversationAgent } from "./engine/conversation.ts";
import type { AgentService } from "./engine/service.ts";

export function agentConfigured(config: Config) {
  return (
    config.agentBackend === "sample" ||
    (config.agentBackend === "agui"
      ? Boolean(config.agentUrl)
      : Boolean(
          config.model &&
            (process.env.OPENAI_API_KEY ||
              process.env.ANTHROPIC_API_KEY ||
              process.env.GOOGLE_API_KEY),
        ))
  );
}
export function makeRuntime(
  config: Config,
  service: AgentService,
  auth: Auth,
  intelligence?: CopilotKitIntelligence,
) {
  const agents: AgentsFactory = async ({ request }) => ({
    default:
      config.agentBackend === "sample"
        ? new ConversationAgent(
            config,
            service,
            await auth.owner(request.headers.get("authorization") ?? undefined),
          )
        : config.agentBackend === "agui"
          ? new HttpAgent({
              url: config.agentUrl ?? "http://127.0.0.1:1/unconfigured",
              headers: config.agentToken ? { Authorization: `Bearer ${config.agentToken}` } : {},
            })
          : new ConversationAgent(
              config,
              service,
              await auth.owner(request.headers.get("authorization") ?? undefined),
            ),
  });
  // Runtime 1.70 types Intelligence and SSE as two disjoint option shapes: Intelligence mode
  // requires `intelligence`, while SSE mode rejects `identifyUser` and `generateThreadNames`.
  // The SSE runtime ignores web identity entirely, so the callback only belongs to the
  // Intelligence branch.
  const runtime = intelligence
    ? new CopilotRuntime({
        agents,
        intelligence,
        identifyUser: async (request) => ({
          id: await auth.owner(request.headers.get("authorization") ?? undefined),
          name: "OpenMuse user",
        }),
        generateThreadNames: false,
      })
    : new CopilotRuntime({ agents });
  return createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
}

