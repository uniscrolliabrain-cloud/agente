// BUG02_USECHAT_V2 - tools[] + typewriter en la API publica.
import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat, type AgUiEvent } from "../api/chat";
import { getThread, saveThreadMessages } from "../api/threads";
import { toolsReducer, type ToolCall } from "../lib/toolsReducer";
import type { ChatAttachment, ChatMessage } from "../types/api";

// AUTOMATION_THREAD_PANEL_V1 (campana 13) - el panel muestra a que automatizacion
// y ejecucion esta vinculado el hilo que esta mirando.
interface ThreadAutomation {
  automationId: string;
  personaId: string;
  executionId?: string;
  entityId?: string;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function useChat(
  enabled: boolean,
  threadId: string | null,
  onSaved?: (id: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [tools, setTools] = useState<ToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [automation, setAutomation] = useState<ThreadAutomation | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [loadedThreadId, setLoadedThreadId] = useState<string | null>(null);

  useEffect(() => {
    setMessages([]);
    setAutomation(null);
    setStreaming(false);
    setStreamBuf("");
    setTools([]);
    setError(null);
    setLoadedThreadId(null);
    if (!enabled || !threadId) return;

    let cancelled = false;
    void (async () => {
      try {
        const thread = await getThread(threadId);
        if (cancelled) return;
        setLoadedThreadId(threadId);
        setMessages(thread.messages ?? []);
        setAutomation((thread as { automation?: ThreadAutomation | null }).automation ?? null);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la conversación");
      }
    })();
    return () => {
      cancelled = true;
      const previousRun = abortRef.current;
      abortRef.current = null;
      previousRun?.abort();
    };
  }, [enabled, threadId]);

  const [roleId, setRoleId] = useState<string | undefined>(undefined);

  const send = useCallback(
    async (text: string, attachment?: ChatAttachment) => {
      if ((!text.trim() && !attachment) || streaming || !threadId || loadedThreadId !== threadId || abortRef.current) return;
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
      setTools([]);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;
      const isCurrentRun = () => abortRef.current === controller;

      const llmContent = attachment
        ? `${trimmed || "(sin texto)"}\n\n[Adjunto: ${attachment.name}, id: ${attachment.id}]`
        : trimmed;

      let assistantText = "";
      let localTools: ToolCall[] = [];
      let runErrorMessage: string | null = null;
      // CHAT_STREAM_THROTTLE_V1 - un setState por token re-renderizaba toda la app
      // (barra, vista activa, sidebar y chat). Se agrupa a ~12 pintados por segundo;
      // el typewriter interpola igual y el texto sigue saliendo fluido.
      let pendingText = "";
      let flushHandle: ReturnType<typeof setTimeout> | null = null;
      let lastFlush = 0;
      const flushText = () => {
        flushHandle = null;
        lastFlush = Date.now();
        if (isCurrentRun()) setStreamBuf(pendingText);
      };
      const pushText = (text: string) => {
        pendingText = text;
        const elapsed = Date.now() - lastFlush;
        if (elapsed >= 80) {
          flushText();
          return;
        }
        if (flushHandle === null) flushHandle = setTimeout(flushText, 80 - elapsed);
      };

      try {
        await streamChat(
          {
            threadId,
            runId: uid(),
            ...(roleId ? { roleId } : {}),
            messages: history.map((m, i) =>
              i === history.length - 1
                ? { id: m.id, role: m.role, content: llmContent }
                : { id: m.id, role: m.role, content: m.content },
            ),
          },
          (event: AgUiEvent) => {
            if (!isCurrentRun()) return;
            const at = Date.now();
            if (
              (event.type === "TEXT_MESSAGE_CONTENT" || event.type === "TEXT_MESSAGE_CHUNK") &&
              typeof event.delta === "string"
            ) {
              assistantText += event.delta;
              pushText(assistantText);
            } else if (event.type === "RUN_STARTED") {
              localTools = toolsReducer(localTools, { type: "RUN_STARTED" });
              setTools([...localTools]);
            } else if (event.type === "TOOL_CALL_START" && typeof event.toolCallName === "string") {
              localTools = toolsReducer(localTools, {
                type: "TOOL_CALL_START",
                id: String(event.toolCallId ?? uid()),
                name: event.toolCallName,
                at,
              });
              setTools([...localTools]);
            } else if (event.type === "TOOL_CALL_END") {
              localTools = toolsReducer(localTools, {
                type: "TOOL_CALL_END",
                id: String(event.toolCallId ?? ""),
                at,
              });
              setTools([...localTools]);
            } else if (event.type === "RUN_ERROR") {
              runErrorMessage = String(event.message ?? "Error del modelo");
            }
          },
          controller.signal,
        );

        if (!isCurrentRun()) return;
        if (runErrorMessage && !assistantText.trim()) {
          setError(runErrorMessage);
          return;
        }

        const finalAssistant: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: assistantText.trim() || "(sin respuesta)",
          timestamp: now(),
          tools: localTools.length > 0 ? localTools : undefined,
        };
        const finalHistory = [...history, finalAssistant];
        setMessages(finalHistory);
        setStreamBuf("");
        setTools([]);
        try {
          await saveThreadMessages(threadId, finalHistory);
          onSaved?.(threadId);
        } catch {
          /* se persiste en el próximo turno */
        }
      } catch (err) {
        if (!isCurrentRun()) return;
        if (controller.signal.aborted) setError("Cancelado por el usuario");
        else setError(err instanceof Error ? err.message : "Error en el stream");
      } finally {
        if (flushHandle !== null) clearTimeout(flushHandle);
        flushHandle = null;
        if (isCurrentRun()) {
          setStreaming(false);
          abortRef.current = null;
        }
      }
    },
    [messages, streaming, threadId, loadedThreadId, onSaved, roleId],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    streaming,
    sendDisabled: !enabled || !threadId || threadId !== loadedThreadId,
    streamBuf,
    tools,
    error,
    automation,
    send,
    cancel,
    threadId,
    roleId,
    setRoleId,
  };
}