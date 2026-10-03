// BUG05_APPROVAL_MODAL_V2 - usa ApprovalInbox para el flujo principal.
// WIRE_APPROVAL_INBOX_V1 - ApprovalModal delega a ApprovalInbox cuando aplica.
// C3_APPROVAL_MODAL_V2 - reemplazado por ApprovalInbox para el flujo principal.
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
              <div className="v2-suggestion-card" style={{ cursor: "default", marginBottom: 12 }}>
                <div className="v2-suggestion-icon">!</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{action.title}</div>
                  <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2 }}>{action.kind}</div>
                </div>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 10,
                  background: "var(--v2-bg-soft)",
                  border: "1px solid var(--v2-border)",
                  borderRadius: 10,
                  fontSize: 11,
                  lineHeight: 1.5,
                  maxHeight: 200,
                  overflow: "auto",
                  color: "var(--v2-text-2)",
                  fontFamily: "SFMono-Regular, Consolas, monospace",
                }}
              >
                {JSON.stringify(action.data, null, 2)}
              </pre>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button className="v2-pill" disabled={busy} onClick={() => decide("deny")}>Denegar</button>
                <button className="v2-need-action-btn" disabled={busy} onClick={() => decide("approve")}>Aprobar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}