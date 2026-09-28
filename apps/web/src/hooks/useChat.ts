import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat, type AgUiEvent } from "../api/chat";
import { getThread, saveThreadMessages } from "../api/threads";
import type { ChatAttachment, ChatMessage } from "../types/api";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

interface ActiveTool {
  id: string;
  name: string;
  status: "running" | "done";
  args: unknown;
}

export function useChat(
  enabled: boolean,
  threadId: string | null,
  onSaved?: (id: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedThreadRef = useRef<string | null>(null);

  // Cargar mensajes al cambiar de thread.
  useEffect(() => {
    if (!enabled || !threadId) {
      setMessages([]);
      loadedThreadRef.current = null;
      return;
    }
    if (loadedThreadRef.current === threadId) return;
    loadedThreadRef.current = threadId;
    let cancelled = false;
    void (async () => {
      try {
        const thread = await getThread(threadId);
        if (cancelled) return;
        setMessages(thread.messages ?? []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la conversación");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, threadId]);

  const send = useCallback(
    async (text: string, attachment?: ChatAttachment) => {
      if ((!text.trim() && !attachment) || streaming || !threadId) return;
      const trimmed = text.trim();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed || `Adjunto: ${attachment?.name ?? "archivo"}`,
        timestamp: now(),
        attachment,
      };
      const history = [...messages, userMsg];
      setMessages(history);
      setStreaming(true);
      setStreamBuf("");
      setActiveTool(null);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const llmContent = attachment
        ? `${trimmed || "(sin texto)"}\n\n[Adjunto: ${attachment.name}, id: ${attachment.id}]`
        : trimmed;

      let assistantText = "";
      let toolCall: ActiveTool | null = null;
      let runErrorMessage: string | null = null;

      try {
        await streamChat(
          {
            threadId,
            runId: uid(),
            messages: history.map((m, i) =>
              i === history.length - 1
                ? { id: m.id, role: m.role, content: llmContent }
                : { id: m.id, role: m.role, content: m.content },
            ),
          },
          (event: AgUiEvent) => {
            if (event.type === "TEXT_MESSAGE_CONTENT" && typeof event.delta === "string") {
              assistantText += event.delta;
              setStreamBuf(assistantText);
            } else if (event.type === "TOOL_CALL_START" && typeof event.toolCallName === "string") {
              toolCall = {
                id: String(event.toolCallId ?? uid()),
                name: event.toolCallName,
                status: "running",
                args: {},
              };
              setActiveTool({ ...toolCall });
            } else if (
              event.type === "TOOL_CALL_ARGS" &&
              typeof event.delta === "string" &&
              toolCall
            ) {
              try {
                toolCall.args = JSON.parse(event.delta);
              } catch {
                toolCall.args = event.delta;
              }
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
              } catch {
                /* contenido no JSON */
              }
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
        try {
          await saveThreadMessages(threadId, finalHistory);
          onSaved?.(threadId);
        } catch {
          /* se persiste en el próximo turno */
        }
      } catch (err) {
        if (controller.signal.aborted) setError("Cancelado por el usuario");
        else setError(err instanceof Error ? err.message : "Error en el stream");
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, threadId, onSaved],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, streaming, streamBuf, activeTool, error, send, cancel, threadId };
}