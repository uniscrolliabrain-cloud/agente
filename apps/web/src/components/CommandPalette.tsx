import { useEffect, useRef, useState } from "react";
import { globalSearch } from "../api/search";
import { FileText, LayoutDashboard, MessageSquare, Plus, Search } from "lucide-react";
import type { AppView } from "./SidebarV2";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectView: (view: AppView) => void;
  onNewChat: () => void;
}

interface Option {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  run: () => void;
}

export default function CommandPalette({ open, onClose, onSelectView, onNewChat }: Props) {
  const [query, setQuery] = useState("");
  // COMMAND_PALETTE_SEARCH_V1 - hits de la busqueda global.
  const [hits, setHits] = useState<Array<{ kind: string; id: string; title: string; excerpt: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      dialogRef.current?.showModal();
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const close = () => {
    onClose();
  };

  const options: Option[] = [
    {
      id: "new-chat",
      label: "Nuevo chat",
      hint: "Cmd+N",
      icon: <Plus size={14} />,
      run: () => { close(); onNewChat(); },
    },
    {
      id: "chat",
      label: "Ir a Chat",
      hint: "",
      icon: <MessageSquare size={14} />,
      run: () => { close(); onSelectView("chat"); },
    },
    {
      id: "tasks",
      label: "Ir a Tareas",
      hint: "",
      icon: <LayoutDashboard size={14} />,
      run: () => { close(); onSelectView("tasks"); },
    },
    {
      id: "documents",
      label: "Ir a Documentos",
      hint: "",
      icon: <FileText size={14} />,
      run: () => { close(); onSelectView("documents"); },
    },
  ];

  const q = query.trim().toLowerCase();
  // COMMAND_PALETTE_SEARCH_V1 - busqueda global con debounce 200ms.
  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void globalSearch(query.trim(), 10)
        .then((list) => setHits(list.slice(0, 10)))
        .catch(() => setHits([]));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  return (
    <dialog className="palette" ref={dialogRef} aria-label="Buscar o ejecutar una accion">
      <div className="palette__search">
        <Search size={15} aria-hidden="true" />
        <input
          ref={inputRef}
          className="palette__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered[0]) {
              e.preventDefault();
              filtered[0].run();
            }
          }}
          placeholder="Buscar o ejecutar una accion"
        />
      </div>
      <div className="palette__list scroll" role="listbox">
        {filtered.length === 0 ? (
          <p className="palette__group">Sin resultados</p>
        ) : (
          filtered.map((o) => (
            <button
              key={o.id}
              className="palette__opt"
              role="option"
              onClick={o.run}
            >
              {o.icon}
              <span>{o.label}</span>
              {o.hint && <span style={{ marginLeft: "auto", opacity: 0.5, fontSize: 11 }}>{o.hint}</span>}
            </button>
          ))
        )}
      </div>
    </dialog>
  );
}
