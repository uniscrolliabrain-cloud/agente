// CHAT_TRANSVERSAL_V3 — laboratorio del chat transversal: rail, panel, hoja
// móvil, botón flotante y workspace de contexto. Ningún servicio real.
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronRight, Compass, Home, MessageSquare, Search, Settings2, Sparkles, Users } from "lucide-react";
import { BrandMark } from "../../../web/src/components/BrandMark";
import ChatCall from "./ChatCall";
import ChatDock from "./ChatDock";
import ChatSheet from "./ChatSheet";
import ChatPanel from "./ChatPanel";
import {
  replyFor,
  TENANT,
  uid,
  type AudioNote,
  type CallMode,
  type CallReport,
  type ChatMessage,
} from "./chat-data";
import "./chat-v3.css";

const DRAFT_KEY = "agntia_chat_transversal_v3_draft";
const REPLY_DELAY_MS = 620;
const TYPE_STEP = 3;
const TYPE_MS = 16;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function readDraft(): string {
  try {
    return window.localStorage.getItem(DRAFT_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function ChatTransversalV3() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [draft, setDraft] = useState(readDraft);
  const [call, setCall] = useState<{ mode: CallMode; report?: CallReport } | null>(null);
  const [reports, setReports] = useState<CallReport[]>([]);
  const [notes, setNotes] = useState<AudioNote[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const fabRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<{ delay?: number; type?: number }>({});
  const urls = useRef<string[]>([]);
  const noteCount = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, draft);
    } catch {
      /* almacenamiento no disponible: el borrador vive solo en memoria */
    }
  }, [draft]);

  useEffect(
    () => () => {
      window.clearTimeout(timers.current.delay);
      window.clearInterval(timers.current.type);
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const stopStreaming = useCallback(() => {
    window.clearTimeout(timers.current.delay);
    window.clearInterval(timers.current.type);
    setStreaming(false);
    setStreamBuf("");
  }, []);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      window.clearTimeout(timers.current.delay);
      window.clearInterval(timers.current.type);
      setMessages((current) => [...current, { id: uid(), role: "user", text: clean, at: Date.now() }]);
      setDraft("");
      setStreaming(true);
      setStreamBuf("");
      const full = replyFor(clean);
      timers.current.delay = window.setTimeout(() => {
        let index = 0;
        timers.current.type = window.setInterval(() => {
          index += TYPE_STEP;
          if (index >= full.length) {
            window.clearInterval(timers.current.type);
            setStreamBuf("");
            setStreaming(false);
            setMessages((current) => [...current, { id: uid(), role: "agent", text: full, at: Date.now() }]);
            return;
          }
          setStreamBuf(full.slice(0, index));
        }, TYPE_MS);
      }, REPLY_DELAY_MS);
    },
    [],
  );

  const addNote = useCallback((blob: Blob, seconds: number) => {
    const url = URL.createObjectURL(blob);
    urls.current.push(url);
    noteCount.current += 1;
    setNotes((current) => [
      ...current,
      { id: uid(), url, seconds, name: `nota-de-voz-${noteCount.current}.webm` },
    ]);
  }, []);

  const startCall = useCallback((mode: CallMode) => {
    setCall({ mode });
  }, []);

  const closePanel = useCallback(() => {
    setCall(null);
    setOpen(false);
    requestAnimationFrame(() => fabRef.current?.focus({ preventScroll: true }));
  }, []);

  const openPanel = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const dialog = document.querySelector("dialog[open]");
      if (dialog) return;
      closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  const panel = (
    <ChatPanel
      variant={isMobile ? "sheet" : "dock"}
      messages={messages}
      streaming={streaming}
      streamBuf={streamBuf}
      draft={draft}
      onDraft={setDraft}
      onSend={send}
      onStop={stopStreaming}
      onNote={addNote}
      onCall={startCall}
      onClose={closePanel}
      onExpand={() => setExpanded((current) => !current)}
      onOpenSettings={() => setSettingsOpen(true)}
      onOpenReport={(report) => setCall({ mode: report.mode, report })}
      reports={reports}
      notes={notes}
    />
  );

  return (
    <div className={`ctv${open ? " is-open" : ""}${isMobile ? " is-mobile" : ""}`}>
      <div className="ctv-shell">
        <nav className="ctv-rail" aria-label="Navegación de demostración">
          <span className="ctv-rail-brand" aria-hidden="true">
            <BrandMark size={22} />
          </span>
          {[
            { icon: Home, label: "Inicio" },
            { icon: MessageSquare, label: "Chat" },
            { icon: CalendarDays, label: "Agenda" },
            { icon: Users, label: "Equipo" },
            { icon: Compass, label: "Operaciones" },
          ].map(({ icon: Icon, label }, index) => (
            <button key={label} type="button" className={`ctv-rail-item${index === 0 ? " is-current" : ""}`} aria-label={label} aria-current={index === 0 ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" />
            </button>
          ))}
          <span className="ctv-rail-spacer" aria-hidden="true" />
          <button type="button" className="ctv-rail-item" aria-label="Ajustes del laboratorio">
            <Settings2 size={18} aria-hidden="true" />
          </button>
        </nav>

        {open && !isMobile && (
          <ChatDock expanded={expanded}>
            {call ? (
              <div className="ctv-dock-call">
                <ChatCall
                  mode={call.mode}
                  report={call.report}
                  onReport={(report) => setReports((current) => [...current, report])}
                  onClose={() => setCall(null)}
                  onExpand={() => setExpanded(true)}
                />
              </div>
            ) : (
              panel
            )}
          </ChatDock>
        )}

        <ContextWorkspace dockOpen={open && !isMobile} />

        {open && isMobile && (
          <ChatSheet
            onClose={closePanel}
            onExpand={() => setExpanded((current) => !current)}
            onOpenSettings={() => setSettingsOpen(true)}
            onSnapChange={(_index, isCompact) => setCompact(isCompact)}
          >
            {call ? (
              <ChatCall
                mode={call.mode}
                report={call.report}
                compact={compact && !call.report}
                onReport={(report) => setReports((current) => [...current, report])}
                onClose={() => setCall(null)}
                onExpand={() => {
                  const grip = document.querySelector<HTMLElement>(".ctv-sheet-grip");
                  grip?.focus({ preventScroll: true });
                }}
              />
            ) : (
              panel
            )}
          </ChatSheet>
        )}
      </div>

      {!open && (
        <button
          ref={fabRef}
          type="button"
          className="ctv-fab"
          aria-expanded={false}
          aria-label="Abrir el chat transversal"
          onClick={openPanel}
        >
          <span className="ctv-fab-mark" aria-hidden="true">
            <BrandMark size={22} />
          </span>
          <span className="ctv-fab-label">LAIA</span>
        </button>
      )}

      {settingsOpen && <ChatSettings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function ContextWorkspace({ dockOpen }: { dockOpen: boolean }) {
  return (
    <main className="ctv-workspace" aria-label="Workspace de contexto de demostración">
      <header className="ctv-workspace-head">
        <div>
          <p className="ctv-workspace-eyebrow">Contexto de demostración</p>
          <h1>Operaciones · martes 24</h1>
        </div>
        <div className="ctv-workspace-search" aria-hidden="true">
          <Search size={15} />
          <span>Buscar en el workspace</span>
        </div>
      </header>

      <div className={`ctv-workspace-grid${dockOpen ? " is-narrow" : ""}`}>
        <section className="ctv-workspace-block">
          <h2>Foco de la semana</h2>
          <ul className="ctv-list">
            <li>
              <span className="ctv-list-label">Cierre de octubre</span>
              <span className="ctv-list-meta">Finanzas · en curso</span>
            </li>
            <li>
              <span className="ctv-list-label">Propuestas de compras</span>
              <span className="ctv-list-meta">Compras · 2 abiertas</span>
            </li>
            <li>
              <span className="ctv-list-label">Plan de captación Q4</span>
              <span className="ctv-list-meta">Comercial · revisión</span>
            </li>
          </ul>
        </section>

        <section className="ctv-workspace-block">
          <h2>Equipo sintético</h2>
          <ul className="ctv-list">
            <li>
              <span className="ctv-list-label">Elena · Finanzas</span>
              <span className="ctv-list-meta">Preparando el informe</span>
            </li>
            <li>
              <span className="ctv-list-label">Marco · Compras</span>
              <span className="ctv-list-meta">Negociando proveedor</span>
            </li>
            <li>
              <span className="ctv-list-label">Sara · Comercial</span>
              <span className="ctv-list-meta">Seguimiento de cuentas</span>
            </li>
          </ul>
        </section>
      </div>

      <p className="ctv-workspace-note">
        <Sparkles size={14} aria-hidden="true" />
        El chat se abre a la izquierda y adapta este espacio. Datos de ejemplo; nada se ejecuta.
        <ChevronRight size={14} aria-hidden="true" />
      </p>
      <p className="ctv-workspace-tenant">{TENANT}</p>
    </main>
  );
}

function ChatSettings({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="ctv-settings"
      aria-labelledby="ctv-settings-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ctv-settings-panel">
        <header>
          <div>
            <p className="ctv-actions-eyebrow">Chat transversal</p>
            <h2 id="ctv-settings-title">Ajustes del laboratorio</h2>
          </div>
          <button type="button" className="ctv-icon-button" aria-label="Cerrar ajustes" onClick={onClose}>
            ✕
          </button>
        </header>
        <ul className="ctv-settings-list">
          {[
            { title: "Tono de respuesta", copy: "Directo, sin rodeos. Ajustable en el producto real." },
            { title: "Memoria del hilo", copy: "La conversación continúa al cambiar de workspace." },
            { title: "Avisos de llamada", copy: "Solo dentro de esta demostración." },
          ].map((item) => (
            <li key={item.title}>
              <div>
                <b>{item.title}</b>
                <span>{item.copy}</span>
              </div>
              <span className="ctv-settings-toggle" aria-hidden="true"><i /></span>
            </li>
          ))}
        </ul>
        <p className="ctv-actions-note">Preferencias de demostración: no guardan nada ni afectan a producción.</p>
      </div>
    </dialog>
  );
}
