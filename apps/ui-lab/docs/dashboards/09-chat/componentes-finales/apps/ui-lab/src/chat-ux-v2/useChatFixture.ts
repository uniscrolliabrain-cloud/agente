// CHAT_UX_V2_USE_CHAT_FIXTURE - misma API publica que useChat, sin red.
// Conserva envio, streaming por trozos, cancelacion, herramientas y guardado
// ficticio. No persiste nada y no contacta con el backend.
import { useCallback, useEffect, useRef, useState } from "react";
import type { ToolCall } from "../../../web/src/lib/toolsReducer";
import type { ChatAttachment, ChatMessage } from "../../../web/src/types/api";
import { type FixtureState, initialMessages, streamingReply } from "./fixture";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function useChatFixture(state: FixtureState, initialRole?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages(state));
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [tools, setTools] = useState<ToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string | undefined>(initialRole);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelledRef = useRef(false);

  const clearTimers = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const respond = useCallback((text: string) => {
    setStreaming(true);
    setStreamBuf("");
    setError(null);
    const started = Date.now();
    setTools([{ id: "fixture-tool-running", name: "consultar_proyectos", status: "running", startedAt: started }]);

          // Trozos pequeños para que la fixture mantenga el streaming durante los
      // recorridos de QA (no es la velocidad del backend real).
      const chunks = streamingReply.match(/.{1,12}(\s|$)/g) ?? [streamingReply];
    let buffer = "";
    let index = 0;

    timers.current.push(
      setTimeout(() => {
        const tick = () => {
          if (cancelledRef.current) return;
          if (index >= chunks.length) {
            setTools([
              {
                id: "fixture-tool-running",
                name: "consultar_proyectos",
                status: "done",
                startedAt: started,
                endedAt: Date.now(),
              },
              {
                id: "fixture-tool-summary",
                name: "resumir_actividad",
                status: "done",
                startedAt: Date.now() - 400,
                endedAt: Date.now(),
              },
            ]);
            setMessages((previous) => [
              ...previous,
              {
                id: uid(),
                role: "assistant",
                content: buffer.trim(),
                timestamp: now(),
                tools: [
                  {
                    id: "fixture-tool-running",
                    name: "consultar_proyectos",
                    status: "done",
                    startedAt: started,
                    endedAt: Date.now(),
                  },
                  {
                    id: "fixture-tool-summary",
                    name: "resumir_actividad",
                    status: "done",
                    startedAt: Date.now() - 400,
                    endedAt: Date.now(),
                  },
                ],
              },
            ]);
            setStreamBuf("");
            setTools([]);
            setStreaming(false);
            return;
          }
          buffer += chunks[index];
          index += 1;
          setStreamBuf(buffer);
                      timers.current.push(setTimeout(tick, 60 + Math.round(Math.random() * 40)));
        };
        tick();
      }, 520),
    );

    // La fixture no "responde" al texto, pero deja constancia del turno.
    if (!text.trim()) setError(null);
  }, []);

  const send = useCallback(
    (text: string, attachment?: ChatAttachment) => {
      if ((!text.trim() && !attachment) || streaming) return;
      cancelledRef.current = false;
      const content = text.trim() || `Adjunto: ${attachment?.name ?? "archivo"}`;
      setMessages((previous) => [
        ...previous,
        { id: uid(), role: "user", content, timestamp: now(), ...(attachment ? { attachment } : {}) },
      ]);
      respond(content);
    },
    [respond, streaming],
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    setStreaming(false);
    setStreamBuf("");
    setTools([]);
    // useChat real guarda este error; ChatPanel no lo pinta. Se conserva la
    // paridad y la ausencia de superficie de error queda documentada en QA.
    setError("Cancelado por el usuario");
  }, [clearTimers]);

  // state=streaming reproduce la respuesta en curso para capturas del gate.
  useEffect(() => {
    if (state !== "streaming") return;
    const timer = setTimeout(() => respond(""), 350);
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [respond, state]);

  return {
    messages,
    streaming,
    streamBuf,
    tools,
    error,
    send,
    cancel,
    threadId: "chat-ux-v2-fixture",
    roleId,
    setRoleId,
  };
}
