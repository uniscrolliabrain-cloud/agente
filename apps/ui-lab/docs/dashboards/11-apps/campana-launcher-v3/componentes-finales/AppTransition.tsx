import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowLeft, Layers, Star, X } from "lucide-react";
import { DEMO_SURFACES, type LauncherApp } from "./launcher-catalog";
import type { OriginRect } from "./launcher-state";

type SurfaceProps = {
  app: LauncherApp;
  origin: OriginRect | null;
  closing: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onHome: () => void;
  onRecents: () => void;
  onToggleFavorite: () => void;
};

/**
 * Superficie provisional de aplicación.
 *
 * No pretende sustituir a los 35 workspaces reales: es una demostración
 * identificada como tal, con contenido sintético por categoría. Al abrirse
 * conserva la continuidad espacial del icono pulsado mediante `transform-origin`.
 */
export function AppTransition({ app, origin, closing, isFavorite, onClose, onHome, onRecents, onToggleFavorite }: SurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const surface = DEMO_SURFACES[app.category];

  useEffect(() => {
    surfaceRef.current?.focus();
  }, [app.id]);

  // Escape pertenece a la superficie modal: un único dueño evita que la primera
  // pulsación se pierda mientras el escritorio se desmonta.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const style = origin
    ? ({
        "--alp-origin-x": `${Math.round(origin.x + origin.width / 2)}px`,
        "--alp-origin-y": `${Math.round(origin.y + origin.height / 2)}px`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`alp-surface${closing ? " is-closing" : ""}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={app.name}
      tabIndex={-1}
      ref={surfaceRef}
    >
      <header className="alp-surface-head">
        <button type="button" className="alp-icon-button" onClick={onHome} aria-label="Volver al escritorio">
          <ArrowLeft size={17} aria-hidden="true" />
        </button>
        <img className="alp-surface-icon" src={app.icon} alt="" width={96} height={96} />
        <div className="alp-surface-title">
          <h2>{app.name}</h2>
          <p>{app.tagline}</p>
        </div>
        <span className="alp-demo-badge">Demostración</span>
        <div className="alp-surface-tools">
          <button type="button" className="alp-icon-button" onClick={onRecents} aria-label="Aplicaciones recientes">
            <Layers size={16} aria-hidden="true" />
          </button>
          <button type="button" className="alp-icon-button" onClick={onClose} aria-label={`Cerrar ${app.name}`}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="alp-surface-body">
        <p className="alp-surface-summary">{surface.summary}</p>
        <div className="alp-surface-columns">
          {surface.columns.map((column) => (
            <section key={column.title} className="alp-surface-panel" aria-label={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.rows.map((row) => (
                  <li key={row.label}>
                    <div>
                      <span className="alp-surface-row-title">{row.label}</span>
                      <span className="alp-surface-row-meta">{row.meta}</span>
                    </div>
                    {row.state ? <span className="alp-surface-state">{row.state}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="alp-surface-note">
          Simulación de interfaz dentro del launcher. Los datos son sintéticos y el workspace real conserva su propia
          experiencia; no se ha conectado ninguna API, MCP ni servicio externo.
        </p>
      </div>

      <footer className="alp-surface-foot">
        <button type="button" className="alp-text-button" onClick={onToggleFavorite}>
          <Star size={14} aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Quitar de favoritas" : "Añadir a favoritas"}
        </button>
        <button type="button" className="alp-text-button" onClick={onHome}>Escritorio</button>
        <button type="button" className="alp-text-button alp-text-button--primary" onClick={onClose}>
          Cerrar aplicación
        </button>
      </footer>
    </div>
  );
}
