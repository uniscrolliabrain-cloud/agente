// CHAT_TRANSVERSAL_V3 — conversación del panel. Mantiene el hilo y el borrador
// entre modalidades porque ambos viven en la raíz, no aquí.
import { useEffect, useRef } from "react";
import { Maximize2, Settings, X } from "lucide-react";
import { BrandMark } from "../../../web/src/components/BrandMark";
import ChatComposer from "./ChatComposer";
import { formatDuration, QUICK_ACTION_COPY, SUGGESTIONS, TENANT, type AudioNote, type CallMode, type CallReport, type ChatMessage } from "./chat-data";

interface Props {
  variant: "dock" | "sheet";
  messages: ChatMessage[];
  streaming: boolean;
  streamBuf: string;
  draft: string;
  onDraft: (value: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onNote: (blob: Blob, seconds: number) => void;
  onCall: (mode: CallMode) => void;
  onClose: () => void;
  onExpand: () => void;
  onOpenSettings: () => void;
  onOpenReport: (report: CallReport) => void;
  reports: CallReport[];
  notes: AudioNote[];
}

export default function ChatPanel({
  variant,
  messages,
  streaming,
  streamBuf,
  draft,
  onDraft,
  onSend,
  onStop,
  onNote,
  onCall,
  onClose,
  onExpand,
  onOpenSettings,
  onOpenReport,
  reports,
  notes,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, streamBuf, streaming, notes.length, reports.length]);

  const empty = messages.length === 0 && !streaming && !streamBuf;

  return (
    <section className={`ctv-panel ctv-panel--${variant}`} aria-label="Chat con tu agente">
      {variant === "dock" && (
        <header className="ctv-head">
          <div className="ctv-identity">
            <span className="ctv-identity-mark" aria-hidden="true">
              <BrandMark size={20} />
            </span>
            <div className="ctv-identity-text">
              <b>LAIA</b>
              <span>{TENANT} · en línea</span>
            </div>
          </div>
          <div className="ctv-head-actions">
            <button type="button" className="ctv-icon-button" onClick={onOpenSettings} aria-label="Ajustes del chat">
              <Settings size={16} aria-hidden="true" />
            </button>
            <button type="button" className="ctv-icon-button" onClick={onExpand} aria-label="Ampliar el chat">
              <Maximize2 size={16} aria-hidden="true" />
            </button>
            <button type="button" className="ctv-icon-button" onClick={onClose} aria-label="Cerrar el chat">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>
      )}

      <div className="ctv-body" ref={bodyRef}>
        {empty ? (
          <div className="ctv-empty">
            <span className="ctv-empty-mark" aria-hidden="true">
              <BrandMark size={30} />
            </span>
            <p className="ctv-empty-eyebrow">
              {variant === "sheet" ? "Chat transversal" : "Siempre contigo"}
            </p>
            <h2>¿En qué te ayudo?</h2>
            <p className="ctv-empty-copy">
              Trabajo sobre lo que tienes delante, sin cambiar de pantalla. Pregunta, dicta o llámame.
            </p>
            <div className="ctv-suggestions" role="group" aria-label="Sugerencias">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => onDraft(suggestion)}>
                  <span>{suggestion}</span>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M4 8h7M8.6 4.6 12 8l-3.4 3.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="ctv-demo-note">{QUICK_ACTION_COPY}</p>
          </div>
        ) : (
          <div className="ctv-thread">
            {messages.map((message) =>
              message.role === "user" ? (
                <article className="ctv-msg ctv-msg--user" key={message.id}>
                  <p>{message.text}</p>
                </article>
              ) : (
                <article className="ctv-msg ctv-msg--agent" key={message.id}>
                  <span className="ctv-agent-mark" aria-hidden="true">
                    <BrandMark size={14} />
                  </span>
                  <div>
                    <p>{message.text}</p>
                    <span className="ctv-msg-meta">LAIA · datos de demostración</span>
                  </div>
                </article>
              ),
            )}
            {streaming && !streamBuf && (
              <div className="ctv-thinking" role="status">
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <em>Pensando</em>
              </div>
            )}
            {streaming && streamBuf && (
              <article className="ctv-msg ctv-msg--agent">
                <span className="ctv-agent-mark" aria-hidden="true">
                  <BrandMark size={14} />
                </span>
                <div>
                  <p>
                    {streamBuf}
                    <span className="ctv-caret" aria-hidden="true" />
                  </p>
                </div>
              </article>
            )}
            {notes.map((note) => (
              <article className="ctv-audio" key={note.id} aria-label="Nota de voz local">
                <div className="ctv-audio-head">
                  <b>Nota de voz</b>
                  <span>{note.seconds} s · local</span>
                </div>
                <audio src={note.url} controls preload="metadata" aria-label="Escuchar la nota de voz" />
                <a href={note.url} download={note.name}>
                  Descargar
                </a>
              </article>
            ))}
            {reports.map((report) => (
              <button
                type="button"
                className="ctv-report-link"
                key={report.id}
                onClick={() => onOpenReport(report)}
              >
                <span>{report.mode === "video" ? "Informe de la videollamada" : "Informe de la conversación"}</span>
                <span className="ctv-report-link-meta">{formatDuration(report.seconds)} · {report.ideas.length} puntos</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ctv-foot">
        <ChatComposer
          value={draft}
          onChange={onDraft}
          onSend={onSend}
          onStop={onStop}
          onNote={onNote}
          onCall={onCall}
          streaming={streaming}
        />
      </div>
    </section>
  );
}
