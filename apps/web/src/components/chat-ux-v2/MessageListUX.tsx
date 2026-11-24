// CHAT_UX_V2_MESSAGE_LIST - copia adaptada de MessageList.tsx (main d7260009).
// Conserva tope de 50 mensajes, useTypewriter y ThinkingSpiral. Diferencia
// solicitada: el autoscroll solo pega al fondo si el usuario ya estaba abajo,
// para no perder la lectura del historial. El foco no se mueve.
import { useEffect, useRef } from "react";
import { ThinkingSpiral } from "../../components/chat/ThinkingSpiral";
import { useTypewriter } from "../../hooks/useTypewriter";
import type { ToolCall } from "../../lib/toolsReducer";
import type { ChatMessage } from "../../types/api";
import MessageBubbleUX from "./MessageBubbleUX";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  tools: ToolCall[];
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
  /** Historial inicial: no reanima todas las filas al cargar. */
  seeded?: boolean;
}

const MAX_RENDERED_MESSAGES = 50;

// CHAT_UX_V2_STREAM_PREVIEW - mientras llega el texto se muestra una lectura
// limpia sin marcadores markdown a medio escribir ("**Lo qu"); al finalizar,
// el mensaje se renderiza con markdown completo.
function plainPreview(text: string): string {
  return text
    .replace(/^\s*#{1,4}\s*/gm, "")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/(^|\s)\*([^*\n]+)\*/g, "$1$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/```/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/^\s*>\s?/gm, "");
}

export default function MessageListUX({ messages, streaming, streamBuf, tools, onQuickAction, seeded }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const initialIds = useRef(new Set(messages.map((m) => m.id)));
  const { text: typed, typing } = useTypewriter(streamBuf, !streaming);
  const visibleMessages = messages.length > MAX_RENDERED_MESSAGES ? messages.slice(-MAX_RENDERED_MESSAGES) : messages;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
    if (pinned.current || nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages, typed, tools, streaming]);

  return (
    <div
      className="v2-assistant-body cux-scroll-body"
      ref={ref}
      data-seeded={seeded ? "true" : "false"}
      onScroll={() => {
        const el = ref.current;
        if (!el) return;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
      }}
    >
      {visibleMessages.map((m) => (
        <MessageBubbleUX key={m.id} message={m} onQuickAction={onQuickAction} enter={!initialIds.current.has(m.id)} />
      ))}

      {streaming && !typed && (
        <div className="cux-stream-row" role="status" aria-live="polite">
          <div className="v2-assistant-avatar cux-avatar" aria-hidden="true">
            IA
          </div>
          <ThinkingSpiral />
        </div>
      )}
      {streaming && typed && (
        <div className="cux-stream-row cux-stream-row--text" role="status" aria-live="polite">
          <div className="v2-assistant-avatar cux-avatar" aria-hidden="true">
            IA
          </div>
          <div className="v2-assistant-text cux-assistant-text">
            <span className="cux-stream-text">{plainPreview(typed)}</span>
            {typing && <span className="stream-cursor cux-cursor" aria-hidden="true" />}
          </div>
        </div>
      )}
    </div>
  );
}
