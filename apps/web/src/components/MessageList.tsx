import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import type { ChatMessage } from "../types/api";
import MessageBubble from "./MessageBubble";
import ToolCallCard from "./ToolCallCard";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  activeTool: { id: string; name: string; status: "running" | "done"; args: unknown } | null;
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
}

export default function MessageList({ messages, streaming, streamBuf, activeTool, onQuickAction }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, streamBuf, activeTool, streaming]);

  return (
    <div className="message-list scroll" ref={ref}>
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} onQuickAction={onQuickAction} />
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
                <span className="stream-cursor">|</span>
              </div>
            ) : (
              <div className="skeleton" style={{ width: 240 }} />
            )}
            {activeTool && (
              <ToolCallCard name={activeTool.name} status={activeTool.status} args={activeTool.args} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
