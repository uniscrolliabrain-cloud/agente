import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { decideAction, getWorkspace } from "../api/actions";
import type { ActionProposal } from "../types/api";

interface Props {
  taskId: string;
  onClose: () => void;
  onChanged: () => void;
}

export default function ApprovalModal({ taskId, onClose, onChanged }: Props) {
  const [action, setAction] = useState<ActionProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const ws = await getWorkspace();
        const found = ws.actions.find((a) => a.taskId === taskId && a.status === "awaiting_review");
        if (!found) setError("No hay acción pendiente para esta tarea");
        else setAction(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando acción");
      }
    })();
  }, [taskId]);

  const decide = async (decision: "approve" | "deny") => {
    if (!action) return;
    setBusy(true);
    try {
      await decideAction(action.id, action.hash, decision);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al decidir");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Revisión requerida</div>
            {action && <div className="modal-sub">Action {action.id.slice(0, 10)}</div>}
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          {!action && !error && <div className="muted">Cargando…</div>}
          {action && (
            <>
              <div className="tool-card">
                <div className="tool-card-header">
                  <div className="tool-card-icon">!</div>
                  <div className="tool-card-name">
                    <span>{action.title}</span>
                    <small>{action.kind}</small>
                  </div>
                </div>
                <pre>{JSON.stringify(action.data, null, 2)}</pre>
              </div>
              <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
                <button className="ctrl-btn danger" disabled={busy} onClick={() => decide("deny")}>Denegar</button>
                <button className="primary-btn" disabled={busy} onClick={() => decide("approve")}>Aprobar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
