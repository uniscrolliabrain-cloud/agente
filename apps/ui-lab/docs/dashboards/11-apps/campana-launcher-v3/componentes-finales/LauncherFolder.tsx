import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { APP_BY_ID, FOLDERS, type LauncherApp } from "./launcher-catalog";
import { AppIcon } from "./AppIcon";

type FolderProps = {
  folderId: string;
  selectedId: string | null;
  onActivate: (app: LauncherApp, element: HTMLButtonElement) => void;
  onClose: () => void;
  onHover: (id: string | null) => void;
};

export function LauncherFolder({ folderId, selectedId, onActivate, onClose, onHover }: FolderProps) {
  const folder = FOLDERS.find((entry) => entry.id === folderId);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape propio del diálogo: la capa modal se cierra siempre al primer intento.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!folder) return null;
  const apps = folder.appIds.map((id) => APP_BY_ID.get(id)).filter((app): app is LauncherApp => Boolean(app));

  return (
    <div className="alp-overlay" role="presentation" onClick={onClose}>
      <div
        className="alp-folder-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Carpeta ${folder.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="alp-folder-head">
          <div>
            <h2>{folder.name}</h2>
            <p>{apps.length} aplicaciones</p>
          </div>
          <button ref={closeRef} type="button" className="alp-icon-button" onClick={onClose} aria-label="Cerrar carpeta">
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="alp-folder-grid">
          {apps.map((app) => (
            <AppIcon
              key={app.id}
              app={app}
              variant="folder"
              selected={selectedId === app.id}
              onActivate={onActivate}
              onHoverChange={onHover}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
