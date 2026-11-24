import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, FileUp, FolderKanban, Image, ListChecks, Search, UserRound, Video, WandSparkles, X } from "lucide-react";

const actions = [
  { label: "Subir archivo", icon: FileUp, accept: "", capture: false },
  { label: "Subir fotos", icon: Image, accept: "image/*", capture: false },
  { label: "Cámara", icon: Camera, accept: "image/*", capture: true },
  { label: "Subir vídeo", icon: Video, accept: "video/*", capture: false },
  { label: "Cliente", icon: UserRound, placeholder: "Nombre del cliente", prompt: "Trabajemos con el cliente" },
  { label: "Proyecto", icon: FolderKanban, placeholder: "Nombre del proyecto", prompt: "Trabajemos en el proyecto" },
  { label: "Crear SOP", icon: ListChecks, placeholder: "Proceso que quieres documentar", prompt: "Ayúdame a redactar un SOP para" },
  { label: "Crear vídeo", icon: WandSparkles, placeholder: "Tema del vídeo", prompt: "Ayúdame a preparar un guion para un vídeo sobre" },
  { label: "Buscar en la web", icon: Search, placeholder: "Qué quieres buscar", prompt: "Busca en la web información sobre" },
];

interface Props {
  onClose: () => void;
  onPick: (accept: string, capture: boolean) => void;
  onDraft: (text: string) => void;
}

export default function MobileChatActions({ onClose, onPick, onDraft }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const firstAction = useRef<HTMLButtonElement>(null);
  const detail = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<(typeof actions)[number] | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    if (selected) detail.current?.focus();
    else firstAction.current?.focus();
  }, [selected]);

  return (
    <dialog
      ref={dialog}
      className="mobile-chat-actions"
      aria-labelledby="mobile-chat-actions-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="mobile-chat-actions-content">
        <header>
          {selected && <button type="button" aria-label="Volver a acciones" onClick={() => setSelected(null)}><ArrowLeft size={19} /></button>}
          <h2 id="mobile-chat-actions-title">{selected?.label ?? "Acciones del chat"}</h2>
          <button type="button" aria-label="Cerrar acciones" onClick={onClose}><X size={19} /></button>
        </header>
        {selected?.prompt ? (
          <form onSubmit={(event) => {
            event.preventDefault();
            if (value.trim()) onDraft(`${selected.prompt} ${value.trim()}`);
          }}>
            <label>
              {selected.placeholder}
              <input ref={detail} value={value} onChange={(event) => setValue(event.target.value)} />
            </label>
            <button type="submit" disabled={!value.trim()}>Añadir al borrador</button>
          </form>
        ) : (
          <div className="mobile-chat-actions-grid">
            {actions.map(({ icon: Icon, ...action }, index) => (
              <button
                key={action.label}
                ref={index === 0 ? firstAction : undefined}
                type="button"
                onClick={() => {
                  if (action.accept !== undefined) {
                    dialog.current?.close();
                    onPick(action.accept, action.capture);
                  }
                  else {
                    setValue("");
                    setSelected(actions[index]);
                  }
                }}
              >
                <Icon size={20} aria-hidden="true" />{action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
