import "./config.ts";
import { currentTenantScope } from "./tenant-scope.ts";
import { HttpAgent } from "@ag-ui/client";
import {
  type AgentsFactory,
  CopilotRuntime,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import type { Auth } from "./auth.ts";
import type { Config } from "./config.ts";
import { ConversationAgent } from "./engine/conversation.ts";
import { CognitionV2ChatAgent } from "./engine/cognition/v2/chat-agent.ts";
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
export function makeRuntime(config: Config, service: AgentService, auth: Auth) {
  const ownerFor = async (request: Request) =>
    currentTenantScope()?.actorId ?? await auth.owner(request.headers.get("authorization") ?? undefined);
  const agents: AgentsFactory = async ({ request }) => ({
    default:
      // Opted-in tenants use Cognition V2 end-to-end, without V1 fallback.
      // Explicit remote AG-UI backend stays isolated until migration approval.
      config.agentBackend !== "agui" && service.cognitionV2?.enabledForRequest()
        ? new CognitionV2ChatAgent(service.cognitionV2, await ownerFor(request))
        : config.agentBackend === "sample"
        ? new ConversationAgent(
            config,
            service,
            await ownerFor(request),
          )
        : config.agentBackend === "agui"
          ? new HttpAgent({
              url: config.agentUrl ?? "http://127.0.0.1:1/unconfigured",
              headers: config.agentToken ? { Authorization: `Bearer ${config.agentToken}` } : {},
            })
          : new ConversationAgent(
              config,
              service,
              await ownerFor(request),
            ),
  });
  const runtime = new CopilotRuntime({ agents });
  return createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
}