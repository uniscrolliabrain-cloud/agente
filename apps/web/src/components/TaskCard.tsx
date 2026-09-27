import type { AgentTask, TaskStatus } from "../types/api";

function statusLabel(s: TaskStatus): string {
  const m: Record<TaskStatus, string> = {
    queued: "En cola",
    scheduled: "Programada",
    paused: "Pausada",
    running: "En curso",
    waiting_approval: "Revisión",
    waiting_input: "Tu input",
    succeeded: "Completada",
    failed: "Fallida",
    cancelled: "Cancelada",
  };
  return m[s];
}

function statusColor(s: TaskStatus): string {
  if (s === "succeeded") return "var(--green)";
  if (s === "failed") return "var(--red)";
  if (s === "running") return "var(--blue)";
  if (s.startsWith("waiting")) return "var(--amber)";
  return "var(--gray)";
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

interface Props {
  task: AgentTask;
  onOpen: () => void;
  onReview: () => void;
}

export default function TaskCard({ task, onOpen, onReview }: Props) {
  const sopId = typeof task.state.sopId === "string" ? task.state.sopId : undefined;
  const succeeded = task.plan.filter((p) => p.status === "succeeded").length;
  const progress = task.plan.length > 0 ? Math.round((succeeded / task.plan.length) * 100) : 0;
  const needsAction = task.status === "waiting_approval" || task.status === "waiting_input";

  return (
    <div
      className={`task-card ${task.status === "running" ? "running" : ""} ${needsAction ? "action-needed" : ""}`}
      onClick={onOpen}
    >
      <div className="tc-top">
        <span className="kind-chip">{task.kind}</span>
        {sopId && <span className="sop-chip">SOP: {sopId}</span>}
        {!needsAction && <span className="status-dot" style={{ background: statusColor(task.status) }} />}
        {needsAction && <span className="status-pill amber">{statusLabel(task.status)}</span>}
      </div>
      <div className="tc-title">{task.title}</div>

      {task.status === "running" && task.plan.length > 0 && (
        <div className="tc-progress">
          <div className="tc-bar"><div style={{ width: `${progress}%` }} /></div>
          <span>{progress}%</span>
        </div>
      )}

      {task.question && <div className="tc-question amber">💬 {task.question}</div>}

      {task.actionId && (
        <div className="tc-actions">
          <button className="open-review-btn" onClick={(e) => { e.stopPropagation(); onReview(); }}>
            Abrir revisión
          </button>
        </div>
      )}

      <div className="tc-foot">
        <span className="tc-id">{task.id.slice(0, 8)}</span>
        <span className={`tc-status-text ${task.status}`}>{statusLabel(task.status)} · {relativeTime(task.updatedAt)}</span>
      </div>
    </div>
  );
}
