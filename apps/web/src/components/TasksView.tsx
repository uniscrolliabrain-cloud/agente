import { CheckCircle2, Circle, CircleAlert, Play } from "lucide-react";
import type { AgentTask } from "../types/api";
import { groupTasks, type TaskColumnType } from "../lib/taskColumns";
import TaskCard from "./TaskCard";

interface Props {
  tasks: AgentTask[];
  onOpenTask: (task: AgentTask) => void;
  onReviewTask: (task: AgentTask) => void;
}

export default function TasksView({ tasks, onOpenTask, onReviewTask }: Props) {
  const columns = groupTasks(tasks);

  const Column = ({ title, items, type }: { title: string; items: AgentTask[]; type: TaskColumnType }) => {
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
        {columns.map((column) => (
          <Column key={column.type} title={column.title} items={column.tasks} type={column.type} />
        ))}
      </div>
    </main>
  );
}
