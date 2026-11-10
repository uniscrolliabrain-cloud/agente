// CONTEXTUAL_PANEL_V3 - recibe un ViewEnvelope, no un spec suelto.
import type { ViewEnvelope } from "@agente/domain/view-envelope";
import ViewRenderer from "../view/ViewRenderer";

interface Props {
  view: ViewEnvelope | null;
  loading?: boolean;
  error?: string | null;
  onClose?: () => void;
  onAction?: (itemId: string, actionId: string) => void;
}

export default function ContextualPanel({
  view,
  loading = false,
  error = null,
  onClose,
  onAction,
}: Props) {
  if (!view && !loading && !error) return null;

  return (
    <div className="panel-slide-in ctx-panel">
      <div className="ctx-panel__head">
        <div>
          <strong className="ctx-panel__title">{view?.spec.title ?? "Vista"}</strong>
          {view && <small className="ctx-panel__source">{view.source.provider}</small>}
        </div>
        {onClose && (
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            ×
          </button>
        )}
      </div>
      <div className="ctx-panel__body">
        {loading && <div className="ctx-panel__loading">Resolviendo vista...</div>}
        {error && (
          <div className="ctx-panel__error" role="alert">
            {error}
          </div>
        )}
        {view && !view.permissions.canView ? (
          <div className="ctx-panel__empty">No tienes permiso para ver esta vista.</div>
        ) : view ? (
          <ViewRenderer spec={view.spec} onAction={onAction} />
        ) : (
          <div className="ctx-panel__empty">Escribe en el chat para que el sistema sirva una vista.</div>
        )}
      </div>
    </div>
  );
}
