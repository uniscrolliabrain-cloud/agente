import type { AgentTask, TaskStatus } from "../types/api";

export type TaskColumnType = "todo" | "running" | "action" | "done";

export interface TaskColumn {
  type: TaskColumnType;
  title: string;
  tasks: AgentTask[];
}

/** Orden de las columnas, fijo para que el panel y la vista grande no se desincronicen. */
const COLUMNS: { type: TaskColumnType; title: string; statuses: TaskStatus[] }[] = [
  { type: "todo", title: "Por hacer", statuses: ["queued", "scheduled", "paused"] },
  { type: "running", title: "En curso", statuses: ["running"] },
  { type: "action", title: "Necesita tu acción", statuses: ["waiting_approval", "waiting_input"] },
  { type: "done", title: "Completado", statuses: ["succeeded", "failed", "cancelled"] },
];

/**
 * Reparte las tareas en las cuatro columnas. KanbanPanel y TasksView implementaban los
 * mismos filtros y titulos por separado; cualquier cambio de estado habia que hacerlo dos
 * veces y ya se han desincronizado antes.
 */
export function groupTasks(tasks: AgentTask[]): TaskColumn[] {
  return COLUMNS.map(({ type, title, statuses }) => ({
    type,
    title,
    tasks: tasks.filter((task) => statuses.includes(task.status)),
  }));
}
