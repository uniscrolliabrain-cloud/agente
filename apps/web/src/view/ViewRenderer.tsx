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

// VIEWRENDERER_SEVEN_KINDS_V1 - el renderer acepta los 7 kinds del schema
// ampliado. Los que no tienen componente propio muestran un fallback honesto
// en vez de reventar con assertNever.
function Render({ spec, onAction }: { spec: RuntimeViewSpec; onAction?: (id: string, a: string) => void }) {
  switch (spec.kind) {
    case "dashboard":
      return <DashboardTemplate spec={spec} />;
    case "queue":
      return <QueueTemplate spec={spec} onAction={onAction} />;
    case "inbox":
    case "board":
    case "table":
    case "detail":
    case "form":
      // Pendiente de componente propio. Mostramos un placeholder honesto.
      return (
        <div className="card" role="region" aria-label={spec.title}>
          <b>{spec.title}</b>
          <p>Este tipo de vista ({spec.kind}) se sirve pero aun no tiene template dedicado.</p>
        </div>
      );
    default:
      return assertNever(spec);
  }
}