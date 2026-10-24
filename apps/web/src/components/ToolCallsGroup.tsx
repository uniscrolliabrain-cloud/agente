// B2_TOOLCALLSGROUP_V1 - tool calls agrupadas en un details.
import { useNow, fmtDur } from "../hooks/useNow";
import type { ToolCall } from "../lib/toolsReducer";

interface Props {
  tools: ToolCall[];
}

export default function ToolCallsGroup({ tools }: Props) {
  const running = tools.some((t) => t.status === "running");
  const now = useNow();
  if (tools.length === 0) return null;
  const t0 = Math.min(...tools.map((t) => t.startedAt));
  const t1 = running
    ? now
    : Math.max(...tools.map((t) => t.endedAt ?? t.startedAt));
  const hasError = tools.some((t) => t.status === "error");
  const icon = running ? "◐" : hasError ? "!" : "✓";

  return (
    <details className="steps" open={running}>
      <summary>
        <span aria-hidden>{icon}</span>{" "}
        {tools.length} {tools.length === 1 ? "paso" : "pasos"} · {fmtDur((t1 - t0) / 1000)}
      </summary>
      <ul>
        {tools.map((t) => (
          <li key={t.id} data-status={t.status}>
            {t.name}
            <span>
              {t.status === "running"
                ? "…"
                : fmtDur(((t.endedAt ?? now) - t.startedAt) / 1000)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}