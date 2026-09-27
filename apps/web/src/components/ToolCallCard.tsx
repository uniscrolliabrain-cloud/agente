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
      <div className="tool-head">
        <div className="tool-icon">◧</div>
        <span className="tool-name">{name}</span>
        <span className={`tool-status ${status}`}>{status === "running" ? "ejecutando…" : "hecho"}</span>
        {status === "running" && <span className="spin">◍</span>}
      </div>
      {args !== undefined && args !== null && (
        <pre className="tool-args">
          {typeof args === "string" ? args : JSON.stringify(args, null, 2)}
        </pre>
      )}
    </div>
  );
}
