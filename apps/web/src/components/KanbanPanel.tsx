import { CheckCircle2, Circle, CircleAlert, Play, X } from "lucide-react";
import type { AgentTask } from "../types/api";
import TaskCard from "./TaskCard";

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  tasks: AgentTask[];
  onOpenTask: (task: AgentTask) => void;
  onReviewTask: (task: AgentTask) => void;
}

type ColumnType = "todo" | "running" | "action" | "done";

export default function KanbanPanel({ collapsed, mobileOpen, onCloseMobile, tasks, onOpenTask, onReviewTask }: Props) {
  const todo = tasks.filter((t) => ["queued", "scheduled", "paused"].includes(t.status));
  const running = tasks.filter((t) => t.status === "running");
  const action = tasks.filter((t) => t.status === "waiting_approval" || t.status === "waiting_input");
  const done = tasks.filter((t) => ["succeeded", "failed", "cancelled"].includes(t.status));

  const Column = ({ title, items, type, empty }: { title: string; items: AgentTask[]; type: ColumnType; empty: string }) => {
    const Icon = type === "todo" ? Circle : type === "running" ? Play : type === "action" ? CircleAlert : CheckCircle2;
    return (
      <section className={`task-column ${type}`}>
        <div className="task-column-header">
          <div className="task-column-title">
            <Icon size={14} />
            <span>{title}</span>
          </div>
          <span className="task-count">{items.length}</span>
        </div>

        {items.length === 0 ? (
          <div className="task-empty"><span>{empty}</span></div>
        ) : (
          <div className="task-list">
            {items.map((t) => (
              <TaskCard key={t.id} task={t} onOpen={() => onOpenTask(t)} onReview={() => onReviewTask(t)} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <aside className={`right-panel ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="right-panel-header">
        <div>
          <strong>Tareas</strong>
          <span>{tasks.length} total</span>
        </div>
        <button className="ghost-icon-button mobile-close" onClick={onCloseMobile}>
          <X size={17} />
        </button>
      </div>

      <div className="right-panel-tabs">
        <button className="active">Tareas</button>
        <button>Contexto</button>
        <button>Memoria</button>
      </div>

      <div className="right-panel-content">
        <Column title="Por hacer" items={todo} type="todo" empty="Sin tareas pendientes" />
        <Column title="En curso" items={running} type="running" empty="Nada corriendo ahora" />
        <Column title="Necesita tu acción" items={action} type="action" empty="Todo al día" />
        <Column title="Completado" items={done} type="done" empty="Sin historial" />
      </div>
    </aside>
  );
}
