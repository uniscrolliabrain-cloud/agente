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

export default function KanbanPanel({ collapsed, mobileOpen, onCloseMobile, tasks, onOpenTask, onReviewTask }: Props) {
  const todo = tasks.filter((t) => ["queued", "scheduled", "paused"].includes(t.status));
  const running = tasks.filter((t) => t.status === "running");
  const action = tasks.filter((t) => t.status === "waiting_approval" || t.status === "waiting_input");
  const done = tasks.filter((t) => ["succeeded", "failed", "cancelled"].includes(t.status));

  const Column = ({ title, items, dotColor, counterClass, emptyIcon, empty }: {
    title: string;
    items: AgentTask[];
    dotColor: string;
    counterClass?: string;
    emptyIcon: string;
    empty: string;
  }) => (
    <div className="k-col">
      <div className="k-col-head">
        <span className="k-dot" style={{ background: dotColor }} />
        <span>{title}</span>
        <span className={`k-counter ${counterClass ?? ""}`}>{items.length}</span>
      </div>
      <div className="k-list">
        {items.length === 0 ? (
          <div className="kanban-empty">
            <div className="kanban-empty-icon">{emptyIcon}</div>
            <div>{empty}</div>
          </div>
        ) : (
          items.map((t) => (
            <TaskCard key={t.id} task={t} onOpen={() => onOpenTask(t)} onReview={() => onReviewTask(t)} />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={`kanban-panel ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="kanban-head">
        <h3>Tareas</h3>
        <span className="kanban-count">{tasks.length}</span>
        <button className="icon-btn sm show-mobile" onClick={onCloseMobile}>✕</button>
      </div>
      <div className="kanban-scroll">
        <Column title="Por hacer" items={todo} dotColor="var(--gray)" emptyIcon="○" empty="Sin tareas pendientes" />
        <Column title="En curso" items={running} dotColor="var(--blue)" counterClass="blue" emptyIcon="◐" empty="Nada corriendo ahora" />
        <Column title="Necesita tu acción" items={action} dotColor="var(--amber)" counterClass="amber" emptyIcon="◎" empty="Todo al día" />
        <Column title="Completado" items={done} dotColor="var(--green)" emptyIcon="●" empty="Sin historial" />
      </div>
    </div>
  );
}
