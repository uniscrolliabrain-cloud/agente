import { Check, LoaderCircle, Wrench } from "lucide-react";

export default function ToolCallCard({
  name,
  status,
  args,
}: {
  name: string;
  status: "running" | "done";
  args: unknown;
}) {
  return (
    <div className={`tool-card ${status}`}>
      <div className="tool-card-header">
        <div className="tool-card-icon">
          <Wrench size={13} />
        </div>
        <div className="tool-card-name">
          <span>{name}</span>
          <small>{status === "running" ? "Ejecutando" : "Completado"}</small>
        </div>
        <div className={`tool-card-status ${status}`}>
          {status === "running" ? <LoaderCircle size={14} className="spin" /> : <Check size={14} />}
        </div>
      </div>
      {args !== undefined && args !== null && (
        <pre>{typeof args === "string" ? args : JSON.stringify(args, null, 2)}</pre>
      )}
    </div>
  );
}
