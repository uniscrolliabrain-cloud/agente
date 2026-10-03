// D3_VIEWRENDERER_V2 - discriminated union + assertNever.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D
import DashboardTemplate from "../templates/dashboard/DashboardTemplate";
import QueueTemplate from "../templates/queue/QueueTemplate";

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
    default:
      return assertNever(spec);
  }
}