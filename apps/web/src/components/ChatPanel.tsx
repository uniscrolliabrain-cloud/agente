import { useState } from "react";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import SuggestionChips from "./SuggestionChips";
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

const CHIPS = [
  { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
];

export default function ChatPanel({ chat }: Props) {
  const [seed, setSeed] = useState("");
  const isEmpty = chat.messages.length === 0 && !chat.streaming;

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
        <button className="ghost-icon-button" title="Mas opciones">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {isEmpty ? (
        <div className="stage">
          <h1 className="hero">En que te ayudo hoy?</h1>
          <ChatInput
            onSend={chat.send}
            onCancel={chat.cancel}
            streaming={chat.streaming}
            seed={seed}
            onSeedConsumed={() => setSeed("")}
          />
          <SuggestionChips
            chips={CHIPS}
            onSelect={(prompt) => setSeed(prompt)}
          />
        </div>
      ) : (
        <>
          <MessageList
            messages={chat.messages}
            streaming={chat.streaming}
            streamBuf={chat.streamBuf}
            activeTool={chat.activeTool}
            onQuickAction={(kind, text) => {
              if (kind === "responder") return;
              const prefix = kind === "resumir" ? "Resume lo siguiente en espanol:\\n\\n" : "Traduce al ingles lo siguiente:\\n\\n";
              chat.send(prefix + text);
            }}
          />
          {chat.error && <div className="chat-error">{chat.error}</div>}
          <div className="dock">
            <ChatInput
              onSend={chat.send}
              onCancel={chat.cancel}
              streaming={chat.streaming}
              seed=""
              onSeedConsumed={() => {}}
            />
          </div>
        </>
      )}
    </main>
  );
}
