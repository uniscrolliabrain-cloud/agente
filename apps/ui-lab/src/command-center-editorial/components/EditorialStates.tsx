// Piezas compartidas del Centro de Mando editorial.
// Solo presentación: reciben datos y callbacks ya resueltos por la vista.
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Sparkles, X } from "lucide-react";

export function SectionHeader({
  id,
  icon,
  title,
  sub,
  aside,
}: {
  id: string;
  icon?: ReactNode;
  title: string;
  sub?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="cce-section-head">
      <h2 className="cce-section-title" id={id}>
        {icon}
        {title}
      </h2>
      {aside ?? (sub ? <p className="cce-section-sub">{sub}</p> : null)}
    </div>
  );
}

export function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="cce-notice" role="status">
      <CheckCircle2 size={16} aria-hidden="true" />
      <span>{text}</span>
      <button type="button" className="cce-icon-btn" onClick={onClose} aria-label="Cerrar aviso">
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

export function SampleBanner({
  tenantName,
  demoSession,
  showingSample,
  onToggle,
}: {
  tenantName: string;
  demoSession: boolean;
  showingSample: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="cce-sample" role="status">
      <Sparkles size={15} aria-hidden="true" />
      <p>
        <b>Datos de ejemplo.</b>{" "}
        {demoSession
          ? "Tenant demo · Interfaz."
          : `Todavía no hay actividad en ${tenantName}.`}{" "}
        Así se verá el centro de mando cuando los agentes empiecen a trabajar.
      </p>
      <button type="button" className="cce-btn cce-btn--small" onClick={onToggle}>
        {showingSample ? "Ver datos reales" : "Ver ejemplo"}
      </button>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="cce-error" role="alert">
      <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AlertTriangle size={16} aria-hidden="true" />
        {message}
      </p>
      <button type="button" className="cce-btn cce-btn--primary" onClick={onRetry}>
        <RefreshCw size={14} aria-hidden="true" /> Reintentar
      </button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="cce-skeleton" aria-busy="true" aria-live="polite">
      <span className="cce-visually-hidden">
        <Loader2 size={12} aria-hidden="true" /> Cargando la empresa…
      </span>
      <div className="cce-skeleton-bar cce-skeleton-title" />
      <div className="cce-skeleton-bar cce-skeleton-line" />
      <div className="cce-skeleton-bar cce-skeleton-block" />
      <div className="cce-skeleton-grid">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="cce-skeleton-bar cce-skeleton-block" style={{ height: 78 }} />
        ))}
      </div>
      <div className="cce-skeleton-grid cce-skeleton-grid--work">
        {[0, 1, 2].map((index) => (
          <div key={index} className="cce-skeleton-bar cce-skeleton-block" style={{ height: 132 }} />
        ))}
      </div>
      <div className="cce-skeleton-bar cce-skeleton-block" style={{ height: 190 }} />
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <div className="cce-empty">{children}</div>;
}
