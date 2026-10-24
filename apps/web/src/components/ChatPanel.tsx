// CHATPANEL_RESOLVEVIEW_V1 - el panel contextual se rellena cuando el usuario
// pide una vista. Antes solo se rellenaba si el backend emitia view.resolved
// al bus, que no ocurre en la practica. Ahora disparamos resolveView cuando
// el usuario envia un mensaje y pasamos el spec al viewResolver.
import { useEffect, useState } from "react";
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
  onResolveView?: (intent: string) => void;
}

const CHIPS_DEFAULT = [
  { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
];

// FIX_11_G_CHIPS_BY_ROLE_V1 - chips contextuales por rol.
const CHIPS_BY_ROLE: Record<string, { id: string; label: string; prompt: string }[]> = {
  legal: [
    { id: "clausula", label: "Revisar una clausula", prompt: "Revisa la clausula del ultimo contrato." },
    { id: "riesgo", label: "Analizar riesgo legal", prompt: "Analiza los riesgos legales del ultimo documento." },
    { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  ],
  finanzas: [
    { id: "gastos", label: "Resumen de gastos", prompt: "Dame un resumen de gastos del mes." },
    { id: "factura", label: "Revisar una factura", prompt: "Revisa la ultima factura que he subido." },
    { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  ],
  comercial: [
    { id: "lead", label: "Analizar un lead", prompt: "Analiza el ultimo lead que ha entrado." },
    { id: "propuesta", label: "Preparar propuesta", prompt: "Prepara una propuesta comercial." },
    { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  ],
  marketing: [
    { id: "campana", label: "Resumen de campana", prompt: "Dame un resumen de la ultima campana." },
    { id: "post", label: "Preparar un post", prompt: "Prepara un post para redes." },
    { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
  ],
};

export default function ChatPanel({ chat, onResolveView }: Props) {
  const [seed, setSeed] = useState("");
  const isEmpty = chat.messages.length === 0 && !chat.streaming;

  // CHATPANEL_RESOLVEVIEW_V1 - cada vez que el usuario manda un mensaje
  // nuevo, intentamos resolverlo como intencion de vista.
  useEffect(() => {
    if (!onResolveView) return;
    const lastUser = [...chat.messages].reverse().find((m) => m.role === "user");
    if (!lastUser?.content) return;
    onResolveView(lastUser.content);
  }, [chat.messages, onResolveView]);

  if (isEmpty) {
    return (
      <div className="v2-home">
        <div className="v2-greeting">âœ¦ Buenas tardes, Alfonso</div>
        <h1 className="v2-hero-title">Â¿En quÃ© te ayudo hoy?</h1>
        <ChatInput
          onSend={chat.send}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed={seed}
          onSeedConsumed={() => setSeed("")}
        />
        <SuggestionChips chips={chat.roleId ? (CHIPS_BY_ROLE[chat.roleId] ?? CHIPS_DEFAULT) : CHIPS_DEFAULT} onSelect={(p) => setSeed(p)} /> {/* FIX_11_G_CHIPS_BY_ROLE_V1 */}
      </div>
    );
  }

  return (
    <div className="v2-conv">
      <RoleSelector value={chat.roleId} onChange={chat.setRoleId} />
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