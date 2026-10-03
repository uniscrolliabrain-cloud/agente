// D3_CONTEXTUALPANEL_V2 - panel que renderiza ViewSpec servido por el sistema.
import type { ViewSpec } from "@openmuse/domain/views";
import ViewRenderer from "../view/ViewRenderer";

interface Props {
  spec: ViewSpec | null;
  onClose?: () => void;
  onAction?: (itemId: string, actionId: string) => void;
}

export default function ContextualPanel({ spec, onClose, onAction }: Props) {
  return (
    <div className="panel-slide-in ctx-panel">
      <div className="ctx-panel__head">
        <strong className="ctx-panel__title">Vista</strong>
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
        {spec ? (
          <ViewRenderer spec={spec} onAction={onAction} />
        ) : (
          <div className="ctx-panel__empty">
            Escribe en el chat para que el sistema sirva una vista.
          </div>
        )}
      </div>
    </div>
  );
}