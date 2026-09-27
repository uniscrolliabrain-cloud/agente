import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat, type AgUiEvent } from "../api/chat";
import { getConversation, getOrCreateMainThread, saveConversation } from "../api/conversation";
import type { ChatMessage } from "../types/api";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

interface ActiveTool { id: string; name: string; status: "running" | "done"; args: unknown; }

export function useChat(enabled: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (initRef.current) return;
    initRef.current = true;
    void (async () => {
      try {
        const thread = await getOrCreateMainThread();
        setThreadId(thread.threadId);
        const conv = await getConversation();
        if (conv.messages.length > 0) setMessages(conv.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la conversación");
      }
    })();
  }, [enabled]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming || !threadId) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text.trim(), timestamp: now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setStreaming(true);
    setStreamBuf("");
    setActiveTool(null);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantText = "";
    let toolCall: ActiveTool | null = null;
    let runErrorMessage: string | null = null;

    try {
      await streamChat(
        {
          threadId,
          runId: uid(),
          messages: history.map((m) => ({ id: m.id, role: m.role, content: m.content })),
        },
        (event: AgUiEvent) => {
          if (event.type === "TEXT_MESSAGE_CONTENT" && typeof event.delta === "string") {
            assistantText += event.delta;
            setStreamBuf(assistantText);
          } else if (event.type === "TOOL_CALL_START" && typeof event.toolCallName === "string") {
            toolCall = { id: String(event.toolCallId ?? uid()), name: event.toolCallName, status: "running", args: {} };
            setActiveTool({ ...toolCall });
          } else if (event.type === "TOOL_CALL_ARGS" && typeof event.delta === "string" && toolCall) {
            try { toolCall.args = JSON.parse(event.delta); } catch { toolCall.args = event.delta; }
            setActiveTool({ ...toolCall });
          } else if (event.type === "TOOL_CALL_END" && toolCall) {
            toolCall.status = "done";
            setActiveTool({ ...toolCall });
          } else if (event.type === "TOOL_CALL_RESULT" && toolCall) {
            try {
              const parsed = JSON.parse(String(event.content ?? ""));
              if (parsed && typeof parsed.id === "string") {
                toolCall.args = { ...(toolCall.args as object), taskId: parsed.id };
              }
            } catch { /* contenido no JSON */ }
          } else if (event.type === "RUN_ERROR") {
            runErrorMessage = String(event.message ?? "Error del modelo");
          }
        },
        controller.signal,
      );

      if (runErrorMessage && !assistantText.trim()) {
        setError(runErrorMessage);
        return;
      }

      const finalAssistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: assistantText.trim() || "(sin respuesta)",
        timestamp: now(),
        toolCall: toolCall ?? undefined,
      };
      const finalHistory = [...history, finalAssistant];
      setMessages(finalHistory);
      setStreamBuf("");
      setActiveTool(null);
      try { await saveConversation(finalHistory); } catch { /* se persiste en el próximo turno */ }
    } catch (err) {
      if (controller.signal.aborted) setError("Cancelado por el usuario");
      else setError(err instanceof Error ? err.message : "Error en el stream");
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming, threadId]);

  const cancel = useCallback(() => { abortRef.current?.abort(); }, []);

  return { messages, streaming, streamBuf, activeTool, error, send, cancel, threadId };
}
