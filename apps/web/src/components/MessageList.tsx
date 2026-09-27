import { useEffect, useRef } from "react";
import { Bot, Sparkles } from "lucide-react";
import type { ChatMessage } from "../types/api";
import MessageBubble from "./MessageBubble";
import ToolCallCard from "./ToolCallCard";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  activeTool: { id: string; name: string; status: "running" | "done"; args: unknown } | null;
  onExample?: (text: string) => void;
}

const EXAMPLES = [
  "¿Cuántos leads tengo?",
  "Revisa mi pipeline de ventas",
  "Prepara un email para Acme",
  "Dame un resumen del negocio",
];

export default function MessageList({ messages, streaming, streamBuf, activeTool, onExample }: Props) {
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
        <div className="message-row assistant streaming">
          <div className="assistant-avatar">
            <Bot size={15} />
          </div>
          <div className="message-content">
            {streamBuf ? (
              <div className="message-bubble assistant streaming-bubble">
                {streamBuf}
                <span className="stream-cursor">▌</span>
              </div>
            ) : (
              <div className="thinking">
                <span>Trabajando</span>
                <span className="thinking-dots"><i /><i /><i /></span>
              </div>
            )}
            {activeTool && (
              <ToolCallCard name={activeTool.name} status={activeTool.status} args={activeTool.args} />
            )}
          </div>
        </div>
      )}

      {messages.length === 0 && !streaming && (
        <div className="empty-chat">
          <div className="empty-chat-icon">
            <Sparkles size={21} />
          </div>
          <h1>¿En qué te ayudo?</h1>
          <p>Trabaja con tu agente para analizar información, ejecutar tareas y preparar resultados.</p>
          <div className="example-grid">
            {EXAMPLES.map((ex) => (
              <button key={ex} className="example-card" onClick={() => onExample?.(ex)}>
                <span>{ex}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
