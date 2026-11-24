// CHAT_TRANSVERSAL_V3 — las diez acciones del «+». Diálogo nativo para quedar
// por encima de la hoja y del dock; la clase propia viaja en el propio <dialog>
// porque el top layer no hereda el contenedor de la app.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, FileUp, FolderKanban, Image, ListChecks, Search, UserRound, Video, WandSparkles, X } from "lucide-react";
import { ACTIONS, type ChatAction } from "./chat-data";

const ICONS: Record<string, typeof FileUp> = {
  file: FileUp,
  photos: Image,
  photo: Camera,
  video: Video,
  record: Video,
  client: UserRound,
  project: FolderKanban,
  sop: ListChecks,
  "create-video": WandSparkles,
  web: Search,
};

const CAPTURES: Record<string, { accept: string; capture?: "environment" | "user" }> = {
  file: { accept: "" },
  photos: { accept: "image/*" },
  photo: { accept: "image/*", capture: "environment" },
  video: { accept: "video/*" },
  record: { accept: "video/*", capture: "environment" },
};

interface Props {
  onClose: () => void;
  onPick: (accept: string, capture?: "environment" | "user") => void;
  onDraft: (text: string) => void;
}

export default function ChatActions({ onClose, onPick, onDraft }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<ChatAction | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (selected) detailRef.current?.focus();
    else firstRef.current?.focus();
  }, [selected]);

  const captureGroup = ACTIONS.filter((action) => action.group === "capture");
  const businessGroup = ACTIONS.filter((action) => action.group === "business");

  const renderAction = (action: ChatAction, first = false) => {
    const Icon = ICONS[action.id] ?? FileUp;
    return (
      <button
        key={action.id}
        ref={first ? firstRef : undefined}
        type="button"
        className="ctv-action"
        onClick={() => {
          const capture = CAPTURES[action.id];
          if (capture) {
            dialogRef.current?.close();
            onPick(capture.accept, capture.capture);
            onClose();
            return;
          }
          setValue("");
          setSelected(action);
        }}
      >
        <span className="ctv-action-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="ctv-action-label">{action.label}</span>
      </button>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      className="ctv-actions"
      aria-labelledby="ctv-actions-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ctv-actions-panel">
        <header className="ctv-actions-head">
          {selected && (
            <button type="button" className="ctv-icon-button" aria-label="Volver a acciones" onClick={() => setSelected(null)}>
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
          )}
          <div>
            <p className="ctv-actions-eyebrow">{selected ? "Acción del chat" : "Compositor"}</p>
            <h2 id="ctv-actions-title">{selected?.label ?? "Añadir al mensaje"}</h2>
          </div>
          <button type="button" className="ctv-icon-button" aria-label="Cerrar acciones" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {selected ? (
          <form
            className="ctv-action-detail"
            onSubmit={(event) => {
              event.preventDefault();
              if (value.trim()) onDraft(`${selected.prompt} ${value.trim()}`);
              onClose();
            }}
          >
            <label>
              <span>{selected.placeholder}</span>
              <input ref={detailRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Escribe aquí" />
            </label>
            <p className="ctv-actions-note">Se añade al borrador. No se ejecuta nada real en este laboratorio.</p>
            <button type="submit" className="ctv-primary" disabled={!value.trim()}>
              Añadir al borrador
            </button>
          </form>
        ) : (
          <div className="ctv-actions-body">
            <section aria-labelledby="ctv-actions-capture">
              <h3 id="ctv-actions-capture">Capturar</h3>
              <div className="ctv-actions-grid">{captureGroup.map((action, index) => renderAction(action, index === 0))}</div>
            </section>
            <section aria-labelledby="ctv-actions-business">
              <h3 id="ctv-actions-business">Trabajo</h3>
              <div className="ctv-actions-grid">{businessGroup.map((action) => renderAction(action))}</div>
            </section>
            <p className="ctv-actions-note">
              La cámara y el micrófono usan permisos del navegador y se liberan al cerrar. Las acciones de empresa preparan un borrador.
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
