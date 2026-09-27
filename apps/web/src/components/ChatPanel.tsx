import { useChat } from "../hooks/useChat";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function ChatPanel() {
  const { messages, streaming, streamBuf, activeTool, error, send, cancel } = useChat();
  return (
    <div className="chat-panel">
      <div className="chat-head">
        <span className="chat-head-title">Chat</span>
        <span className="chat-head-hint">
          {streaming ? "generando…" : `${messages.length} mensajes`}
        </span>
      </div>
      <MessageList messages={messages} streaming={streaming} streamBuf={streamBuf} activeTool={activeTool} />
      {error && <div className="chat-error">{error}</div>}
      <ChatInput onSend={send} onCancel={cancel} streaming={streaming} />
    </div>
  );
}
