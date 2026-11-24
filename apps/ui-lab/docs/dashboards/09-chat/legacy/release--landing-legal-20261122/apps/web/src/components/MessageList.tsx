// BUG03_MESSAGELIST_V3 - typewriter + ToolCallsGroup.
import { ThinkingSpiral } from "./chat/ThinkingSpiral";
import { Fragment, type ReactNode, useEffect, useRef } from "react";
import type { ChatMessage } from "../types/api";
import MessageBubble from "./MessageBubble";
import { useTypewriter } from "../hooks/useTypewriter";
import type { ToolCall } from "../lib/toolsReducer";

interface Props {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  tools: ToolCall[];
  beforeMessages?: ReactNode;
  afterMessage?: (index: number) => ReactNode;
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
}

// FIX_MSGLIST_SLICE_V1 - tope de 50 mensajes visibles. Antes se pintaban
// todos; con 500 mensajes eran ~5.000 DOM nodes y el scroll caia por debajo
// de 30 FPS.
const MAX_RENDERED_MESSAGES = 50;
export default function MessageList({ messages, streaming, streamBuf, tools, onQuickAction, beforeMessages, afterMessage }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { text: typed, typing } = useTypewriter(streamBuf, !streaming);
  const visibleMessages = messages.length > MAX_RENDERED_MESSAGES
    ? messages.slice(-MAX_RENDERED_MESSAGES)
    : messages;

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, typed, tools, streaming]);

  return (
    <div className="v2-assistant-body" ref={ref} style={{ overflow: "visible" }}>
      {beforeMessages}
      {visibleMessages.map((m, index) => (
        <Fragment key={m.id}>
          <MessageBubble message={m} onQuickAction={onQuickAction} />
          {afterMessage?.(messages.length - visibleMessages.length + index)}
        </Fragment>
      ))}

      {streaming && !streamBuf && <ThinkingSpiral />}
      {streaming && typed && (
        <div className="v2-assistant-text" style={{ marginTop: 12 }}>
          {typed}
          {typing && <span className="stream-cursor" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}