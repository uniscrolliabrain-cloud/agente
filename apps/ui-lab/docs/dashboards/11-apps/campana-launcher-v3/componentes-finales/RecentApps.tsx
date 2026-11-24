import { useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { APP_BY_ID, type LauncherApp } from "./launcher-catalog";

type RecentProps = {
  recents: string[];
  onOpen: (app: LauncherApp) => void;
  onClear: () => void;
  onHome: () => void;
};

export function RecentApps({ recents, onOpen, onClear, onHome }: RecentProps) {
  const apps = recents.map((id) => APP_BY_ID.get(id)).filter((app): app is LauncherApp => Boolean(app));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onHome();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onHome]);

  return (
    <section className="alp-recents" aria-label="Aplicaciones recientes">
      <header className="alp-recents-head">
        <button type="button" className="alp-icon-button" onClick={onHome} aria-label="Volver al escritorio">
          <ArrowLeft size={17} aria-hidden="true" />
        </button>
        <div>
          <h2>Recientes</h2>
          <p>Recupera una aplicación abierta o vuelve al escritorio</p>
        </div>
        {apps.length > 0 ? (
          <button type="button" className="alp-text-button" onClick={onClear}>
            <X size={14} aria-hidden="true" />
            Cerrar todo
          </button>
        ) : null}
      </header>

      {apps.length === 0 ? (
        <div className="alp-recents-empty">
          <p>No hay aplicaciones abiertas.</p>
          <button type="button" className="alp-text-button" onClick={onHome}>Volver al escritorio</button>
        </div>
      ) : (
        <ul className="alp-recents-list">
          {apps.map((app) => (
            <li key={app.id}>
              <button type="button" className="alp-recent-card" onClick={() => onOpen(app)} aria-label={`Abrir ${app.name}`}>
                <img src={app.icon} alt="" width={320} height={320} loading="lazy" decoding="async" />
                <span className="alp-recent-card-name">{app.name}</span>
                <span className="alp-recent-card-tagline">{app.tagline}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
