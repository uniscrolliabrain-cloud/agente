import { ArrowUpRight, CircleAlert, LoaderCircle } from "lucide-react";
import type { AgentTask, TaskStatus } from "../types/api";

function statusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
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
  return labels[status];
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
  const needsAction = task.status === "waiting_approval" || task.status === "waiting_input";
  const succeeded = task.plan.filter((s) => s.status === "succeeded").length;
  const progress = task.plan.length > 0 ? Math.round((succeeded / task.plan.length) * 100) : 0;

  return (
    <article
      className={`task-card ${task.status === "running" ? "running" : ""} ${needsAction ? "needs-action" : ""}`}
      onClick={onOpen}
    >
      <div className="task-card-top">
        <span className="task-kind">{task.kind}</span>
        {typeof task.state.sopId === "string" && <span className="task-sop">{task.state.sopId}</span>}
        {task.status === "running" && <LoaderCircle size={13} className="task-loader spin" />}
        {needsAction && <CircleAlert size={14} className="task-alert" />}
      </div>

      <h3>{task.title}</h3>

      {task.status === "running" && task.plan.length > 0 && (
        <div className="task-progress">
          <div><span style={{ width: `${progress}%` }} /></div>
          <small>{progress}%</small>
        </div>
      )}

      {task.question && (
        <div className="task-question">
          <CircleAlert size={13} />
          <span>{task.question}</span>
        </div>
      )}

      {task.actionId && (
        <button
          className="review-button"
          onClick={(e) => { e.stopPropagation(); onReview(); }}
        >
          Abrir revisión
          <ArrowUpRight size={13} />
        </button>
      )}

      <footer>
        <span>{task.id.slice(0, 8)}</span>
        <span>{statusLabel(task.status)} · {relativeTime(task.updatedAt)}</span>
      </footer>
    </article>
  );
}
