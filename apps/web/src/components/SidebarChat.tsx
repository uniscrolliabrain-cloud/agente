// SIDEBAR_CHAT_V1 - el chat del agente dentro de la columna izquierda, como el
// panel de Cline en VS Code. No inventa un chat paralelo: usa el mismo hilo y
// el mismo hook que la vista Chat, asi que la conversacion continua estes en la
// pantalla que estes. En movil se monta como hoja a pantalla completa.
import { useEffect, useRef, useState } from "react";
import { Maximize2, PanelLeftClose, Settings, Sparkles, X } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "../types/api";
import type { ToolCall } from "../lib/toolsReducer";

export interface DockChat {
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  tools: ToolCall[];
  error: string | null;
  send: (text: string) => void;
  cancel: () => void;
  threadId: string | null;
}

interface Props {
  chat: DockChat;
  tenantLabel: string;
  variant?: "dock" | "sheet";
  onClose: () => void;
  onOpenFullChat: () => void;
  onOpenSettings: () => void;
}

const QUICK_PROMPTS = [
  "¿Qué tengo pendiente hoy?",
  "Resume el estado del equipo",
  "Prepara un email para un cliente",
];

export default function SidebarChat({
  chat,
  tenantLabel,
  variant = "dock",
  onClose,
  onOpenFullChat,
  onOpenSettings,
}: Props) {
  const [seed, setSeed] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [chat.messages.length, chat.streamBuf, chat.streaming]);

  return (
    <section className={`side-chat ${variant === "sheet" ? "sheet" : ""}`} aria-label="Chat con tu agente">
      <header className="side-chat-head">
        <div className="side-chat-identity">
          <span className="side-chat-orb" aria-hidden="true">
            <Sparkles size={14} />
          </span>
          <div>
            <b>Tu agente</b>
            <span>{tenantLabel} · en línea</span>
          </div>
        </div>
        <div className="side-chat-actions">
          <button type="button" className="side-chat-icon" onClick={onOpenSettings} title="Ajustes" aria-label="Ajustes">
            <Settings size={15} />
          </button>
          <button
            type="button"
            className="side-chat-icon"
            onClick={onOpenFullChat}
            title="Abrir chat completo"
            aria-label="Abrir chat completo"
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            className="side-chat-icon"
            onClick={onClose}
            title={variant === "sheet" ? "Cerrar chat" : "Volver al menú"}
            aria-label={variant === "sheet" ? "Cerrar chat" : "Volver al menú"}
          >
            {variant === "sheet" ? <X size={16} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
      </header>

      <div className="side-chat-body" ref={bodyRef}>
        {chat.messages.length === 0 ? (
          <div className="side-chat-empty">
            <span className="side-chat-orb big" aria-hidden="true">
              <Sparkles size={20} />
            </span>
            <b>Habla con tu equipo</b>
            <p>Pregunta lo que quieras sin salir de la pantalla en la que estás.</p>
            <div className="side-chat-chips">
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" onClick={() => setSeed(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList
            messages={chat.messages}
            streaming={chat.streaming}
            streamBuf={chat.streamBuf}
            tools={chat.tools}
          />
        )}
        {chat.error && <div className="chat-error">{chat.error}</div>}
      </div>

      <div className="side-chat-foot">
        <ChatInput
          onSend={chat.send}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed={seed}
          onSeedConsumed={() => setSeed("")}
        />
      </div>
    </section>
  );
}
