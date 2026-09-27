import { MessageSquare, MoreHorizontal } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "../types/api";

interface ChatState {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  activeTool: { id: string; name: string; status: "running" | "done"; args: unknown } | null;
  error: string | null;
  send: (text: string) => void;
  cancel: () => void;
  threadId: string | null;
}

interface Props {
  chat: ChatState;
}

export default function ChatPanel({ chat }: Props) {
  return (
    <main className="chat-panel">
      <div className="chat-toolbar">
        <div className="chat-toolbar-title">
          <div className="chat-title-icon">
            <MessageSquare size={15} />
          </div>
          <div>
            <strong>Chat</strong>
            <span>{chat.streaming ? "Generando respuesta..." : `${chat.messages.length} mensajes`}</span>
          </div>
        </div>
        <button className="ghost-icon-button" title="Más opciones">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <MessageList
        messages={chat.messages}
        streaming={chat.streaming}
        streamBuf={chat.streamBuf}
        activeTool={chat.activeTool}
        onExample={chat.send}
      />

      {chat.error && <div className="chat-error">{chat.error}</div>}

      <ChatInput onSend={chat.send} onCancel={chat.cancel} streaming={chat.streaming} />
    </main>
  );
}
