// VIEW_RENDERER_V3 - los 7 kinds tienen componente.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "@agente/domain/views";
import DashboardTemplate from "../templates/dashboard/DashboardTemplate";
import QueueTemplate from "../templates/queue/QueueTemplate";
import InboxTemplate from "../templates/inbox/InboxTemplate";
import BoardTemplate from "../templates/board/BoardTemplate";
import TableTemplate from "../templates/table/TableTemplate";
import DetailTemplate from "../templates/detail/DetailTemplate";
import FormTemplate from "../templates/form/FormTemplate";

interface Props {
  spec: unknown;
  onAction?: (itemId: string, actionId: string) => void;
}

function assertNever(x: never): never {
  throw new Error(`kind sin renderer: ${JSON.stringify(x)}`);
}

export default function ViewRenderer({ spec: raw, onAction }: Props) {
  const spec = parseRuntimeViewSpec(raw);
  if (!spec) {
    return (
      <div className="card" role="alert">
        No he podido mostrar esta vista.
      </div>
    );
  }
  return <Render spec={spec} onAction={onAction} />;
}

function Render({ spec, onAction }: { spec: RuntimeViewSpec; onAction?: (id: string, a: string) => void }) {
  switch (spec.kind) {
    case "dashboard":
      return <DashboardTemplate spec={spec} />;
    case "queue":
      return <QueueTemplate spec={spec} onAction={onAction} />;
    case "inbox":
      return <InboxTemplate spec={spec} onAction={onAction} />;
    case "board":
      return <BoardTemplate spec={spec} />;
    case "table":
      return <TableTemplate spec={spec} />;
    case "detail":
      return <DetailTemplate spec={spec} />;
    case "form":
      return <FormTemplate spec={spec} />;
    default:
      return assertNever(spec);
  }
}
