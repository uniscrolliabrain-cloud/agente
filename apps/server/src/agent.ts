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
import type { AgentService } from "./engine/service.ts";
import { CognitionV2ChatAgent } from "./engine/cognition/v2/chat-agent.ts";

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
  const ownerFor = async (request: Request) => service.cognitionV2?.enabledForRequest()
    ? currentTenantScope()!.actorId
    : auth.owner(request.headers.get("authorization") ?? undefined);
  const agents: AgentsFactory = async ({ request }) => {
    if (config.agentBackend === "agui") {
      return { default: new HttpAgent({
        url: config.agentUrl ?? "http://127.0.0.1:1/unconfigured",
        headers: config.agentToken ? { Authorization: `Bearer ${config.agentToken}` } : {},
      }) };
    }
    const owner = await ownerFor(request);
    const cognition = service.cognitionV2;
    return { default: cognition?.enabledForRequest()
      ? new CognitionV2ChatAgent(cognition, owner)
      : new ConversationAgent(config, service, owner) };
  };
  const runtime = new CopilotRuntime({ agents });
  return createCopilotHonoHandler({ runtime, basePath: "/api/copilotkit" });
}