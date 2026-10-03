// BUG03_MESSAGELIST_V3 - typewriter + ToolCallsGroup.
import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/api";
import MessageBubble from "./MessageBubble";
import { useTypewriter } from "../hooks/useTypewriter";
import type { ToolCall } from "../lib/toolsReducer";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  tools: ToolCall[];
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
}

export default function MessageList({ messages, streaming, streamBuf, tools, onQuickAction }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { text: typed, typing } = useTypewriter(streamBuf, !streaming);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, typed, tools, streaming]);

  return (
    <div className="v2-assistant-body" ref={ref} style={{ overflow: "visible" }}>
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} onQuickAction={onQuickAction} />
      ))}

      {streaming && typed && (
        <div className="v2-assistant-text" style={{ marginTop: 12 }}>
          {typed}
          {typing && <span className="stream-cursor" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}