import { CheckCircle2, Circle, CircleAlert, Play } from "lucide-react";
import type { AgentTask } from "../types/api";
import TaskCard from "./TaskCard";

interface Props {
  tasks: AgentTask[];
  onOpenTask: (task: AgentTask) => void;
  onReviewTask: (task: AgentTask) => void;
}

type ColumnType = "todo" | "running" | "action" | "done";

export default function TasksView({ tasks, onOpenTask, onReviewTask }: Props) {
  const todo = tasks.filter((t) => ["queued", "scheduled", "paused"].includes(t.status));
  const running = tasks.filter((t) => t.status === "running");
  const action = tasks.filter((t) => t.status === "waiting_approval" || t.status === "waiting_input");
  const done = tasks.filter((t) => ["succeeded", "failed", "cancelled"].includes(t.status));

  const Column = ({ title, items, type }: { title: string; items: AgentTask[]; type: ColumnType }) => {
    const Icon = type === "todo" ? Circle : type === "running" ? Play : type === "action" ? CircleAlert : CheckCircle2;
    return (
      <div className="view-tasks-column">
        <div className="view-tasks-column-header">
          <div className={`view-tasks-column-title ${type}`}>
            <Icon size={14} />
            <span>{title}</span>
          </div>
          <span className="task-count">{items.length}</span>
        </div>
        <div className="view-tasks-column-body">
          {items.length === 0 ? (
            <div className="task-empty"><span>—</span></div>
          ) : (
            items.map((t) => (
              <TaskCard key={t.id} task={t} onOpen={() => onOpenTask(t)} onReview={() => onReviewTask(t)} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="view-shell">
      <div className="view-header">
        <h2>Tareas</h2>
        <span className="view-header-meta">{tasks.length} en total</span>
      </div>
      <div className="view-tasks-grid">
        <Column title="Por hacer" items={todo} type="todo" />
        <Column title="En curso" items={running} type="running" />
        <Column title="Necesita tu acción" items={action} type="action" />
        <Column title="Completado" items={done} type="done" />
      </div>
    </main>
  );
}
