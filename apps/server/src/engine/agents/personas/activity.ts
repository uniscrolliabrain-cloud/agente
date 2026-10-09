// PERSONAS_ACTIVITY_V1 - activity log por persona.
//
// Deriva una lista de entradas legibles desde las tareas del owner.

import type { AgentTask } from "../../../../../../packages/domain/src/agent.ts";
import type { Store } from "../../../db.ts";

export type ActivityKind = "success" | "working" | "failed" | "queued" | "scheduled" | "other";

export interface AgentActivityEntry {
  kind: ActivityKind;
  verb: string;
  subject: string;
  at: string;
  taskId?: string;
  detail?: string;
}

function toEntry(task: AgentTask): AgentActivityEntry {
  switch (task.status) {
    case "succeeded":
      return {
        kind: "success",
        verb: "completo",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
        ...(task.result ? { detail: task.result.slice(0, 200) } : {}),
      };
    case "running":
      return {
        kind: "working",
        verb: "esta trabajando en",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
    case "failed":
      return {
        kind: "failed",
        verb: "fallo",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
        ...(task.error ? { detail: task.error.slice(0, 200) } : {}),
      };
    case "queued":
      return {
        kind: "queued",
        verb: "en cola",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
    case "scheduled":
      return {
        kind: "scheduled",
        verb: "programado",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
    default:
      return {
        kind: "other",
        verb: `en estado ${task.status}`,
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
  }
}

export async function activityForPersona(
  db: Store,
  owner: string,
  personaId: string,
  limit = 20,
): Promise<AgentActivityEntry[]> {
  const all = await db.list<AgentTask>(owner, "tasks", { limit: 500 });
  // ACTIVITY_FILTER_RELAX_V1 - si ninguna tarea declara personaId/roleId, cae
  // al owner completo. Si alguna lo declara, filtra estricto.
  const tagged = all.filter(
    (t) => t.assignedTo === personaId || (t.state && t.state.roleId === personaId),
  );
  const anyTagged = all.some(
    (t) => t.assignedTo !== undefined || (t.state && typeof t.state.roleId === "string"),
  );
  const mine = anyTagged ? tagged : all;
  mine.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return mine.slice(0, limit).map(toEntry);
}