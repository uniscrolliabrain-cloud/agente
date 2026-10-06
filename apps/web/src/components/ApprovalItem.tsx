// C3_APPROVAL_ITEM_V1 - item de aprobacion con cuenta atras del servidor.
import { useState } from "react";
import { fmtDur, useNow } from "../hooks/useNow";

export interface Approval {
  id: string;
  title: string;
  amount?: number;
  requestedBy: string;
  requestedAt: number;
  signers: string[];
  needed: number;
  executeAt: number | null;
  lockedReason?: string;
}

interface Props {
  approval: Approval;
  me: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const CONFIRM_FROM = 5000;

export default function ApprovalItem({ approval, me, onApprove, onReject, onCancel }: Props) {
  const now = useNow();
  const [confirming, setConfirming] = useState(false);
  const left = approval.executeAt
    ? Math.max(0, Math.ceil((approval.executeAt - now) / 1000))
    : null;
  const iSigned = approval.signers.includes(me);

  return (
    <article className="ap" data-state={left !== null ? "scheduled" : "pending"} aria-live="polite">
      <header className="ap__head">
        <b className="ap__title">{approval.title}</b>
        {approval.amount != null && (
          <span className="ap__amount">{approval.amount.toLocaleString("es-ES")}â‚¬</span>
        )}
      </header>
      <small className="ap__meta">
        Pedido por {approval.requestedBy} Â· hace{" "}
        {fmtDur((now - approval.requestedAt) / 1000)}
        {approval.needed > 1 && ` Â· firmas ${approval.signers.length}/${approval.needed}`}
      </small>

      {left !== null ? (
        <p className="ap__countdown">
          Se ejecutarÃ¡ en <b>{left}s</b>{" "}
          {iSigned && (
            <button type="button" className="btn" onClick={() => onCancel(approval.id)}>
              Deshacer
            </button>
          )}
        </p>
      ) : (approval as { status?: string }).status === "outcome_unknown" ? (
        <p>
          <small>Outcome incierto. Reconcilia en el detalle de la tarea.</small>
        </p>
      ) : approval.lockedReason ? (
        <p>
          <button type="button" className="btn" disabled>
            Aprobar
          </button>{" "}
          <small>ðŸ”’ {approval.lockedReason}</small>
        </p>
      ) : iSigned ? (
        <p>
          <small>Has firmado. Falta otra persona.</small>
        </p>
      ) : confirming ? (
        <p>
          Â¿Aprobar {approval.amount?.toLocaleString("es-ES")}â‚¬?{" "}
          <button type="button" className="btn primary" onClick={() => onApprove(approval.id)}>
            Confirmar
          </button>{" "}
          <button type="button" className="btn" onClick={() => setConfirming(false)}>
            Cancelar
          </button>
        </p>
      ) : (
        <p className="ap__actions">
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              (approval.amount ?? 0) >= CONFIRM_FROM
                ? setConfirming(true)
                : onApprove(approval.id)
            }
          >
            Aprobar
          </button>{" "}
          <button type="button" className="btn" onClick={() => onReject(approval.id)}>
            Rechazar
          </button>
        </p>
      )}
    </article>
  );
}