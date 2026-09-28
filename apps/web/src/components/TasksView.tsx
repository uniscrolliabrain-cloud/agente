import { useMemo, useState } from "react";
import { CheckCircle2, Circle, CircleAlert, Play, UserRound } from "lucide-react";
import type { AgentTask } from "../types/api";
import { groupTasks, type TaskColumnType } from "../lib/taskColumns";
import { useAgents } from "../hooks/useAgents";
import TaskCard from "./TaskCard";

interface Props {
  tasks: AgentTask[];
  currentUserId: string | null;
  onOpenTask: (task: AgentTask) => void;
  onReviewTask: (task: AgentTask) => void;
}

type Filter = "todas" | "mias" | "sin_asignar" | "escaladas";

export default function TasksView({ tasks, currentUserId, onOpenTask, onReviewTask }: Props) {
  const { agents } = useAgents(true);
  const [roleId, setRoleId] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");

  // El filtro por rol (roleId) y el filtro por estado de asignacion (filter) son
  // independientes: primero se aplica el rol, luego el estado.
  const visible = useMemo(() => {
    if (!roleId) return tasks;
    return tasks.filter((t) => t.assignedTo === roleId);
  }, [tasks, roleId]);

  const filtered = useMemo(() => {
    if (filter === "mias") return visible.filter((t) => t.assignedTo && currentUserId && t.assignedTo === currentUserId);
    if (filter === "sin_asignar") return visible.filter((t) => !t.assignedTo);
    if (filter === "escaladas") return visible.filter((t) => Boolean((t.state as Record<string, unknown>)?.escalatedTo));
    return visible;
  }, [visible, filter, currentUserId]);

  const columns = groupTasks(filtered);

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
        <span className="view-header-meta">
          {filtered.length} en total
          {filtered.length !== tasks.length ? ` de ${tasks.length}` : ""}
        </span>
        {agents.length > 0 && (
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            aria-label="Filtrar por agente"
          >
            <option value="">Todos los agentes</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="memory-categories">
        <button className={`ctrl-btn ${filter === "todas" ? "active" : ""}`} onClick={() => setFilter("todas")}>Todas</button>
        <button className={`ctrl-btn ${filter === "mias" ? "active" : ""}`} onClick={() => setFilter("mias")} disabled={!currentUserId}>
          <UserRound size={12} /> Mias
        </button>
        <button className={`ctrl-btn ${filter === "sin_asignar" ? "active" : ""}`} onClick={() => setFilter("sin_asignar")}>Sin asignar</button>
        <button className={`ctrl-btn ${filter === "escaladas" ? "active" : ""}`} onClick={() => setFilter("escaladas")}>Escaladas</button>
      </div>
      <div className="view-tasks-grid">
        {columns.map((column) => (
          <Column key={column.type} title={column.title} items={column.tasks} type={column.type} />
        ))}
      </div>
    </main>
  );
}
