import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/api";
import MessageBubble from "./MessageBubble";
import ToolCallCard from "./ToolCallCard";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  activeTool: { id: string; name: string; status: "running" | "done"; args: unknown } | null;
}

const EXAMPLES = [
  "¿Cuántos leads tengo?",
  "Revisa mi pipeline de ventas",
  "Prepara un email para Acme",
  "Resumen del negocio",
];

export default function MessageList({ messages, streaming, streamBuf, activeTool }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, streamBuf, activeTool, streaming]);

  return (
    <div className="message-list" ref={ref}>
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {streaming && (
        <div className="msg-row assistant streaming">
          <div className="ai-avatar">✦</div>
          <div className="bubble-wrap">
            {streamBuf ? (
              <div className="bubble assistant-b">
                <div className="bubble-content">
                  {streamBuf}
                  <span className="cursor">▌</span>
                </div>
              </div>
            ) : (
              <div className="thinking">
                <span>Pensando</span>
                <span className="dots"><i /><i /><i /></span>
              </div>
            )}
            {activeTool && (
              <ToolCallCard name={activeTool.name} status={activeTool.status} args={activeTool.args} />
            )}
          </div>
        </div>
      )}

      {messages.length === 0 && !streaming && (
        <div className="chat-empty">
          <div className="chat-empty-logo">✦</div>
          <h2 className="chat-empty-title">¿En qué te ayudo hoy?</h2>
          <p className="chat-empty-sub">
            Pregúntame sobre tus leads, clientes, facturación o pídeme que prepare cualquier cosa.
          </p>
          <div className="chat-empty-examples">
            {EXAMPLES.map((ex) => (
              <button key={ex} className="example-chip" type="button">
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
