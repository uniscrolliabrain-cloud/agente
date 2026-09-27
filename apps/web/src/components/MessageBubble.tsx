import type { ChatMessage } from "../types/api";
import ToolCallCard from "./ToolCallCard";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`msg-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="ai-avatar">✦</div>}
      <div className="bubble-wrap">
        <div className={`bubble ${isUser ? "user-b" : "assistant-b"}`}>
          <div className="bubble-content">{message.content}</div>
        </div>
        {message.toolCall && (
          <ToolCallCard
            name={message.toolCall.name}
            status={message.toolCall.status}
            args={message.toolCall.args}
          />
        )}
        {message.timestamp && <div className="msg-time">{message.timestamp}</div>}
      </div>
    </div>
  );
}
