import { Bot, UserRound } from "lucide-react";
import type { ChatMessage } from "../types/api";
import ToolCallCard from "./ToolCallCard";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
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
