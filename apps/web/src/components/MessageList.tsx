import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/api";
import MessageBubble from "./MessageBubble";

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
    <div className="v2-assistant-body" ref={ref} style={{ overflow: "visible" }}>
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} onQuickAction={onQuickAction} />
      ))}

      {streaming && streamBuf && (
        <div className="v2-assistant-text" style={{ marginTop: 12 }}>
          {streamBuf}
          <span className="stream-cursor">|</span>
        </div>
      )}
    </div>
  );
}