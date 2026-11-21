// SIDEBAR_CHAT_V1 - el chat del agente dentro de la columna izquierda, como el
// panel de Cline en VS Code. No inventa un chat paralelo: usa el mismo hilo y
// el mismo hook que la vista Chat, asi que la conversacion continua estes en la
// pantalla que estes. En movil se monta como hoja a pantalla completa.
import { useEffect, useRef, useState } from "react";
import { Maximize2, PanelLeftClose, Settings, Sparkles } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import MobileAudioNote, { type AudioNote } from "./MobileAudioNote";
import MobileChatCall, { type MobileCallMode, type MobileCallReport } from "./MobileChatCall";
import type { ChatAttachment, ChatMessage } from "../types/api";
import type { ToolCall } from "../lib/toolsReducer";

export interface DockChat {
  messages: ChatMessage[];
  streaming: boolean;
  sendDisabled?: boolean;
  streamBuf: string;
  tools: ToolCall[];
  error: string | null;
  send: (text: string, attachment?: ChatAttachment) => void;
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
  onRevealMobileBody?: () => void;
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
  onRevealMobileBody,
}: Props) {
  const [seed, setSeed] = useState("");
  const [selectedCall, setCall] = useState<{ thread: string | null; mode: MobileCallMode; report?: MobileCallReport } | null>(null);
  const [notes, setNotes] = useState<{ thread: string | null; after: number; note: AudioNote }[]>([]);
  const [reports, setReports] = useState<{ thread: string | null; report: MobileCallReport }[]>([]);
  const mounted = useRef(false);
  const urls = useRef<string[]>([]);
  const callTrigger = useRef<HTMLElement | null>(null);
  const threadRef = useRef(chat.threadId);
  threadRef.current = chat.threadId;
  const bodyRef = useRef<HTMLDivElement>(null);
  const call = selectedCall?.thread === chat.threadId ? selectedCall : null;

  useEffect(() => {
    setCall((current) => current?.thread === chat.threadId ? current : null);
  }, [chat.threadId]);

  useEffect(() => {
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [chat.messages.length, chat.streamBuf, chat.streaming, notes.length, reports.length, call]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const mobile = variant === "sheet" ? {
    onCall: (mode: MobileCallMode) => {
      callTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      onRevealMobileBody?.();
      setCall({ thread: chat.threadId, mode });
    },
    onNote: (blob: Blob, seconds: number) => {
      if (!mounted.current || threadRef.current !== chat.threadId) return;
      const id = crypto.randomUUID();
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
      setNotes((previous) => [...previous, { thread: chat.threadId, after: chat.messages.length, note: { id, blob, url, seconds, name: `nota-de-voz-${id}.${extension}` } }]);
      onRevealMobileBody?.();
    },
  } : undefined;
  const threadNotes = notes.filter(({ thread }) => thread === chat.threadId);
  const threadReports = reports.filter(({ thread }) => thread === chat.threadId);
  const hasLocalEntries = threadNotes.length > 0 || threadReports.length > 0;

  const footer = (
    <div className="side-chat-foot" hidden={Boolean(call)}>
      <ChatInput
        mobile={mobile}
        onSend={chat.send}
        onCancel={chat.cancel}
        streaming={chat.streaming}
        sendDisabled={chat.sendDisabled}
        seed={seed}
        onSeedConsumed={() => setSeed("")}
      />
    </div>
  );

  return (
    <section className={`side-chat ${variant === "sheet" ? "sheet" : ""}`} aria-label="Chat con tu agente">
      {/* MOBILE_SHEET_V2 - en la hoja los controles viven en la fila del tirador. */}
      {variant === "dock" && (
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
            title="Volver al menú"
            aria-label="Volver al menú"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>
      </header>
      )}

      {call && (
        <MobileChatCall
          mode={call.mode}
          initialReport={call.report}
          onExpand={onRevealMobileBody}
          onReport={(report) => {
            setReports((previous) => [...previous, { thread: chat.threadId, report }]);
            onRevealMobileBody?.();
          }}
          onClose={() => {
            setCall(null);
            requestAnimationFrame(() => callTrigger.current?.focus({ preventScroll: true }));
          }}
        />
      )}
      <div className="side-chat-body" ref={bodyRef} hidden={Boolean(call)}>
        {chat.messages.length === 0 && !hasLocalEntries ? (
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
            afterMessage={hasLocalEntries ? (index) => threadNotes.filter(({ after }) => after === index + 1).map(({ note }) => <MobileAudioNote key={note.id} note={note} />) : undefined}
            beforeMessages={threadNotes.filter(({ after }) => after === 0 || after > chat.messages.length).map(({ note }) => <MobileAudioNote key={note.id} note={note} />)}
          />
        )}
        {threadReports.map(({ report }) => (
          <button className="mobile-chat-report-link" type="button" key={report.id} onClick={(event) => {
            callTrigger.current = event.currentTarget;
            onRevealMobileBody?.();
            setCall({ thread: chat.threadId, mode: report.mode, report });
          }}>Ver informe de la {report.mode === "video" ? "videollamada" : "conversación por voz"}</button>
        ))}
        {chat.error && <div className="chat-error">{chat.error}</div>}
      </div>

      {footer}
    </section>
  );
}
