// VOICE_SAME_AGENT_V1 - la voz NO es un gemelo del agente: es el agente.
//
// Hasta ahora /api/avatar/llm leia un snapshot de contexto y llamaba al modelo
// directo. Eso comparte identidad y memoria congelada, pero no el runtime: sin
// kernel, sin herramientas, sin turno del harness, sin guardrails y sin las
// escrituras que hace el agente de verdad.
//
// Aqui se usa el mismo ConversationAgent que monta makeRuntime() para el chat
// (apps/server/src/agent.ts), con el mismo AgentService y el mismo owner, y en
// el hilo real de la sesion. La unica diferencia es el transporte: los deltas
// de texto salen como SSE para que Anam los convierta en voz.

import type { RunAgentInput } from "@ag-ui/core";
import type { Config } from "../config.ts";
import { ConversationAgent } from "../engine/conversation.ts";
import type { AgentService } from "../engine/service.ts";
import { deltasOf } from "./llm.ts";

export interface VoiceHarnessInput {
  config: Config;
  service: AgentService;
  owner: string;
  threadId: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  signal?: AbortSignal;
}

/**
 * Arranca un turno del agente real y devuelve solo el texto.
 *
 * `state.voice` viaja en el input: el agente lo usa para acortar la respuesta
 * (1-2 frases) sin cambiar nada del comportamiento del chat escrito.
 */
export function voiceHarnessCompletion(input: VoiceHarnessInput): AsyncIterable<string> {
  const agent = new ConversationAgent(input.config, input.service, input.owner);
  const runInput: RunAgentInput = {
    threadId: input.threadId,
    runId: `voice-${Date.now()}`,
    messages: input.messages.map((message, index) => ({
      id: `voice-${index}`,
      role: message.role,
      content: message.content,
    })),
    tools: [],
    context: [],
    state: { voice: true },
    forwardedProps: {},
  };
  return deltasOf(agent.run(runInput), input.signal);
}
