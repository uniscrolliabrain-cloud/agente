// FIX_02_CHATPANEL_V4 - sin activeTool. Usa chat.tools[].
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import SuggestionChips from "./SuggestionChips";
import RoleSelector from "./RoleSelector";
import type { ChatMessage } from "../types/api";
import type { ToolCall } from "../lib/toolsReducer";

interface ChatState {
  roleId?: string;
  setRoleId?: (id: string | undefined) => void;
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
  chat: ChatState;
}

const DEMO_SUGGESTIONS = [
  { t: "Cerrar facturación", d: "Revisa facturas pendientes y cierra el mes", icon: "📄" },
  { t: "Revisar aprobaciones", d: "Tienes 3 aprobaciones por revisar", icon: "✓" },
  { t: "Recordatorio de pago", d: "Envía recordatorio a cliente moroso", icon: "⏰" },
  { t: "Resumen semanal", d: "Genera reporte de actividad y gastos", icon: "📊" },
];

const CHIPS = [
  { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
];

export default function ChatPanel({ chat }: Props) {
  const [seed, setSeed] = useState("");
  const [expanded, setExpanded] = useState(true);
  const isEmpty = chat.messages.length === 0 && !chat.streaming;

  const userMessage = [...chat.messages].reverse().find((m) => m.role === "user");
  const assistantMessage = [...chat.messages].reverse().find((m) => m.role === "assistant");
  const firstTool: ToolCall | null = chat.tools[0] ?? null;

  if (isEmpty) {
    return (
      <div className="v2-home">
        <div className="v2-greeting">✦ Buenas tardes, Alfonso</div>
        <h1 className="v2-hero-title">¿En qué te ayudo hoy?</h1>

        <ChatInput
          onSend={chat.send}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed={seed}
          onSeedConsumed={() => setSeed("")}
        />

        <div className="v2-suggestion-grid">
          {DEMO_SUGGESTIONS.map((c, i) => (
            <button key={i} className="v2-suggestion-card" onClick={() => setSeed(c.t)}>
              <div className="v2-suggestion-icon">{c.icon}</div>
              <div>
                <div className="v2-suggestion-title">{c.t}</div>
                <div className="v2-suggestion-desc">{c.d}</div>
              </div>
            </button>
          ))}
        </div>

        <SuggestionChips chips={CHIPS} onSelect={(p) => setSeed(p)} />

        <div className="v2-home-footer">
          Agente IA Pro · v2 · Conectado a 12 SOPs · 48 documentos indexados
        </div>
      </div>
    );
  }

  return (
    <div className="v2-conv">
      <RoleSelector value={chat.roleId} onChange={chat.setRoleId} />
      <div className="v2-conv-crumb">
        <span>Chat</span>
        <span style={{ color: "var(--v2-border-strong)" }}>/</span>
        <span className="v2-conv-crumb-current">Conversación</span>
        <span className="v2-conv-status">
          {chat.streaming ? "En curso" : "Listo"}
        </span>
      </div>

      {userMessage && (
        <div className="v2-user-bubble">
          <div className="v2-user-bubble-inner">{userMessage.content}</div>
        </div>
      )}

      <div className="v2-assistant-row">
        <div className="v2-assistant-avatar">IA</div>
        <div className="v2-assistant-body">
          {firstTool && (
            <button className="v2-steps-pill" onClick={() => setExpanded((v) => !v)}>
              <span className="v2-steps-dot" />
              Trabajando · {firstTool.name}
              <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
            </button>
          )}
          {expanded && firstTool && (
            <div className="v2-steps-timeline">
              <div className="v2-steps-step">
                <div className="v2-steps-step-title">Ejecutando {firstTool.name}</div>
              </div>
            </div>
          )}

          {assistantMessage && !chat.streaming && (
            <div className="v2-assistant-text">{assistantMessage.content}</div>
          )}

          {chat.error && (
            <div className="chat-error" style={{ marginTop: 16 }}>{chat.error}</div>
          )}
        </div>
      </div>

      <MessageList
        messages={chat.messages}
        streaming={chat.streaming}
        streamBuf={chat.streamBuf}
        tools={chat.tools}
      />

      <div className="v2-conv-input">
        <ChatInput
          onSend={chat.send}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed=""
          onSeedConsumed={() => {}}
        />
      </div>
    </div>
  );
}