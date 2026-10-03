// C3_APPROVAL_INBOX_V1 - lista de aprobaciones pendientes.
import ApprovalItem, { type Approval } from "./ApprovalItem";

interface Props {
  approvals: Approval[];
  me: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export default function ApprovalInbox({ approvals, me, onApprove, onReject, onCancel }: Props) {
  if (approvals.length === 0) {
    return (
      <div className="ap-empty">
        <p>Nada pendiente. Todo en orden.</p>
      </div>
    );
  }
  return (
    <div className="ap-list">
      {approvals.map((a) => (
        <ApprovalItem
          key={a.id}
          approval={a}
          me={me}
          onApprove={onApprove}
          onReject={onReject}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}