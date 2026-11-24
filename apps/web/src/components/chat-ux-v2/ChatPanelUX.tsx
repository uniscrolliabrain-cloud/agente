// CHAT_UX_V2_PANEL - estructura de ChatPanel.tsx (main d7260009).
// Conserva saludo, titular, chips por rol, selector, timeline, lista y
// compositor. El compositor es un unico nodo estable en ambas fases: no se
// remonta, no pierde borrador ni foco, y se desplaza con continuidad espacial
// (FLIP) al pasar de portada a conversacion. Sin cambios de contrato.
import { useLayoutEffect, useRef, useState } from "react";
import SuggestionChips from "../../components/SuggestionChips";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { ToolCall } from "../../lib/toolsReducer";
import type { ChatAttachment, ChatMessage } from "../../types/api";
import ChatComposerUX from "./ChatComposerUX";
import { CognitionTimeline } from "../chat/CognitionTimeline";
import RoleSelector from "../RoleSelector";
import { CHIPS_BY_ROLE, CHIPS_DEFAULT } from "./content";
import MessageListUX from "./MessageListUX";

export interface ChatUXState {
  roleId?: string;
  setRoleId?: (id: string | undefined) => void;
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  tools: ToolCall[];
  error: string | null;
  send: (text: string, attachment?: ChatAttachment) => void;
  cancel: () => void;
  threadId: string | null;
}

interface Props {
  chat: ChatUXState;
  onResolveView?: (intent: string, messageId?: string) => void;
  userName?: string;
  upload: (file: File) => Promise<ChatAttachment>;
}

function greetingFor(name?: string): string {
  const hour = new Date().getHours();
  const salutation = hour < 6 || hour >= 21 ? "Buenas noches" : hour < 13 ? "Buenos días" : "Buenas tardes";
  const firstName = (name ?? "").trim().split(" ")[0];
  return firstName ? `${salutation}, ${firstName}` : salutation;
}

export default function ChatPanelUX({ chat, onResolveView, userName, upload }: Props) {
  const [seed, setSeed] = useState("");
  const lastResolvedRef = useRef<string | null>(null);
  const isEmpty = chat.messages.length === 0 && !chat.streaming;
  const phase = isEmpty ? "home" : "conv";
  const reduced = useReducedMotion();
  const dockRef = useRef<HTMLDivElement>(null);
  const lastRect = useRef<DOMRect | null>(null);
  const lastPhase = useRef(phase);
  const [seeded] = useState(chat.messages.length > 0);

  // CHATPANEL_RESOLVEVIEW_V2 - una sola resolucion por mensaje de usuario.
  useLayoutEffect(() => {
    if (!onResolveView) return;
    const lastUser = [...chat.messages].reverse().find((m) => m.role === "user");
    if (!lastUser?.content) return;
    const key = `${chat.threadId ?? "no-thread"}:${lastUser.id}`;
    if (lastResolvedRef.current === key) return;
    lastResolvedRef.current = key;
    onResolveView(lastUser.content, lastUser.id);
  }, [chat.messages, chat.threadId, onResolveView]);

  // Continuidad portada -> conversacion: medimos el compositor y lo llevamos
  // desde su posicion central con una animacion breve. Si no hay soporte o se
  // prefiere menos movimiento, no se anima nada.
  useLayoutEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (lastPhase.current !== phase && lastRect.current && !reduced) {
      const delta = lastRect.current.top - rect.top;
      if (Math.abs(delta) > 8 && typeof el.animate === "function") {
        el.animate([{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }], {
          duration: 560,
          easing: "cubic-bezier(.22,1,.36,1)",
        });
      }
    }
    lastRect.current = rect;
    lastPhase.current = phase;
  }, [phase, reduced]);

  const chips = chat.roleId ? (CHIPS_BY_ROLE[chat.roleId] ?? CHIPS_DEFAULT) : CHIPS_DEFAULT;

  return (
    <div className="cux-stage" data-phase={phase}>
      {isEmpty && (
        <header className="cux-home" data-enter="true">
          <div className="v2-greeting cux-greeting">✦ {greetingFor(userName)}</div>
          <h1 className="v2-hero-title cux-title">¿En qué te ayudo hoy?</h1>
        </header>
      )}

      {!isEmpty && (
        <div className="cux-conv-top">
          <RoleSelector value={chat.roleId} onChange={chat.setRoleId} />
        </div>
      )}

      {!isEmpty && (
        <MessageListUX
          messages={chat.messages}
          streaming={chat.streaming}
          streamBuf={chat.streamBuf}
          tools={chat.tools}
          seeded={seeded}
        />
      )}

      {!isEmpty && (
        <CognitionTimeline refreshKey={`${chat.threadId}:${chat.messages.length}:${chat.streaming}`} />
      )}

      <div className="cux-dock" ref={dockRef} data-phase={phase}>
        <ChatComposerUX
          onSend={chat.send}
          onCancel={chat.cancel}
          streaming={chat.streaming}
          seed={isEmpty ? seed : ""}
          onSeedConsumed={() => setSeed("")}
          upload={upload}
        />
        {isEmpty && (
          <div className="cux-chips">
            <SuggestionChips chips={chips} onSelect={(prompt) => setSeed(prompt)} />
          </div>
        )}
      </div>
    </div>
  );
}
