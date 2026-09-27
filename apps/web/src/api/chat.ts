import { getSession } from "./client";

export interface RunInput {
  threadId: string;
  runId: string;
  messages: { id: string; role: string; content: string }[];
}

export interface AgUiEvent {
  type: string;
  messageId?: string;
  delta?: string;
  toolCallId?: string;
  toolCallName?: string;
  content?: string;
  message?: string;
  [key: string]: unknown;
}

export async function streamChat(
  input: RunInput,
  onEvent: (event: AgUiEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const session = getSession();
  if (!session) throw new Error("No hay sesión activa");

  const res = await fetch("/api/copilotkit/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      threadId: input.threadId,
      runId: input.runId,
      messages: input.messages,
      tools: [],
      context: [],
      state: {},
    }),
    signal,
  });

  if (res.status === 401) {
    throw new Error("Sesión expirada");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }
  if (!res.body) throw new Error("Respuesta sin cuerpo");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      // SSE: los eventos se separan por una línea en blanco. El encoder del runtime usa
      // CRLF, así que se aceptan ambos finales de línea.
      const blocks = buf.split(/\r?\n\r?\n/);
      buf = blocks.pop() ?? "";
      for (const block of blocks) {
        for (const line of block.split(/\r?\n/)) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            onEvent(JSON.parse(payload) as AgUiEvent);
          } catch {
            /* ignorar payloads no-JSON */
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
