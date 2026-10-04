// BUG05_APPROVAL_MODAL_V2 - usa ApprovalInbox para el flujo principal.
// WIRE_APPROVAL_INBOX_V1 - ApprovalModal delega a ApprovalInbox cuando aplica.
// C3_APPROVAL_MODAL_V2 - reemplazado por ApprovalInbox para el flujo principal.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { decideAction, reconcileAction, getWorkspace } from "../api/actions";
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
  // RECONCILE_MODAL_V1 — estado del modal de reconciliación.
  // Ver: docs/audits/06-aprobaciones-acciones/roadmap.md §8.
  const [reconcileNote, setReconcileNote] = useState("");

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

  // RECONCILE_MODAL_V1 — handler de reconciliación.
  const reconcile = async (outcome: "executed" | "not_executed") => {
    if (!action) return;
    setBusy(true);
    try {
      await reconcileAction(action.id, outcome, reconcileNote || undefined);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reconciliar");
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
            {/* DUAL_SIGN_VISIBLE_V1 — firmas requeridas si es doble firma. */}
            {action && action.needed && action.needed > 1 && (
              <div className="modal-sub" style={{ color: "var(--v2-warn-text)" }}>
                Doble firma: {action.signers?.length ?? 0}/{action.needed}
              </div>
            )}
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          {!action && !error && <div className="muted">Cargando…</div>}
{action && action.status === "scheduled" && action.executeAt && (
            <>
              {/* UNDO_COUNTDOWN_V1 — cuenta atrás de la ventana de undo. */}
              <div className="v2-suggestion-card" style={{ cursor: "default", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Acción programada</div>
                <div style={{ fontSize: 12, color: "var(--v2-text-2)", marginTop: 6 }}>
                  Se ejecutará en{" "}
                  <b>{Math.max(0, Math.ceil((Date.parse(action.executeAt) - Date.now()) / 1000))}s</b>
                  {action.needed && action.needed > 1
                    ? ` · firmas ${action.signers?.length ?? 0}/${action.needed}`
                    : ""}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  className="v2-pill"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const { cancelAction } = await import("../api/actions");
                      await cancelAction(action.id);
                      onChanged();
                      onClose();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Error al cancelar");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Deshacer
                </button>
              </div>
            </>
          )}
          {action && action.status === "outcome_unknown" && (
            <>
              {/* RECONCILE_UI_V1 — UI de reconciliación. */}
              <div className="chat-error" style={{ marginBottom: 12 }}>
                <b>Outcome incierto.</b> La operación pudo haber salido al proveedor.
                Comprueba en Google (o el proveedor correspondiente) si se ejecutó e
                indica el resultado:
              </div>
              <textarea
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", minHeight: 60, marginBottom: 12 }}
                placeholder="Nota opcional para el registro"
                value={reconcileNote}
                onChange={(e) => setReconcileNote(e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="v2-pill" disabled={busy} onClick={() => reconcile("not_executed")}>
                  No se ejecutó
                </button>
                <button className="v2-need-action-btn" disabled={busy} onClick={() => reconcile("executed")}>
                  Sí se ejecutó
                </button>
              </div>
            </>
          )}
          {action && action.status !== "outcome_unknown" && ('
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