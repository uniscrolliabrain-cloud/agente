import { useState } from "react";
import { Bot, Check, Copy, UserRound } from "lucide-react";
import type { ChatMessage } from "../types/api";
import ToolCallCard from "./ToolCallCard";

export default function MessageBubble({
  message,
  onQuickAction,
}: {
  message: ChatMessage;
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard bloqueado */ }
  };

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="assistant-avatar">
          <Bot size={15} strokeWidth={1.8} />
        </div>
      )}

      <div className="message-content">
        <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>{message.content}</div>

        {message.toolCall && (
          <ToolCallCard
            name={message.toolCall.name}
            status={message.toolCall.status}
            args={message.toolCall.args}
          />
        )}

        {!isUser && message.content && (
          <div className="msg__actions">
            <button
              className="icon-btn"
              onClick={copy}
              title={copied ? "Copiado" : "Copiar"}
              aria-label="Copiar mensaje"
              style={{ width: 26, height: 26 }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        )}
        {!isUser && message.content && onQuickAction && (
          <div className="quick-actions">
            <button className="ctrl-btn" onClick={() => onQuickAction("responder", message.content)}>Responder</button>
            <button className="ctrl-btn" onClick={() => onQuickAction("resumir", message.content)}>Resumir</button>
            <button className="ctrl-btn" onClick={() => onQuickAction("traducir", message.content)}>Traducir</button>
          </div>
        )}

        {message.timestamp && <span className="message-time">{message.timestamp}</span>}
      </div>

      {isUser && (
        <div className="user-message-avatar">
          <UserRound size={14} />
        </div>
      )}
    </div>
  );
}
