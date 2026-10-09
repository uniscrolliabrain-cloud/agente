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
import { useAgentWindow } from "../contexts/AgentWindowContext"; // CHAT_OPEN_AGENT_COMMAND_V1

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

const CHIPS = [
  { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
];

export default function ChatPanel({ chat, onResolveView }: Props) {
  // CHAT_OPEN_AGENT_COMMAND_V1 - intercepta "llama a X" / "abre a X" y
  // abre la ventana del agente en vez de enviarlo al backend.
  const { open: openAgentWindow } = useAgentWindow();
  const sendWithCommand = (text: string) => {
    const m = /^\s*(?:llama|abre|abrir|invoca)\s+a\s+([a-z0-9-]+)\s*$/i.exec(text);
    if (m) {
      openAgentWindow(m[1].toLowerCase());
      return;
    }
    chat.send(text);
  };
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
          onSend={sendWithCommand}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed={seed}
          onSeedConsumed={() => setSeed("")}
        />
        <SuggestionChips chips={CHIPS} onSelect={(p) => setSeed(p)} />
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
          onSend={sendWithCommand}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed=""
          onSeedConsumed={() => {}}
        />
      </div>
    </div>
  );
}