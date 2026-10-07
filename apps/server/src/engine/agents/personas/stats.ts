// PERSONAS_STATS_V1 - calculo de stats de una persona desde datos reales.
//
// Los stats que declara stats.json son el "estado inicial" de la persona.
// computeStats() los recalcula desde las tareas del owner.

import type {
  AgentStats,
  AgentStatus,
} from "../../../../../../packages/domain/src/agent-persona.ts";
import type { AgentTask } from "../../../../../../packages/domain/src/agent.ts";
import type { Store } from "../../../db.ts";

const MIN_TASKS_FOR_PRECISION = 5;
const LEVEL_TASKS_PER_LEVEL = 20;

function deriveLevel(totalTasks: number): number {
  if (totalTasks === 0) return 1;
  const level = Math.floor(Math.log2(totalTasks / LEVEL_TASKS_PER_LEVEL + 1) * 3 + 1);
  return Math.max(1, Math.min(99, level));
}

function deriveStatus(tasks: AgentTask[]): AgentStatus {
  if (tasks.length === 0) return "offline";
  const running = tasks.filter((t) => t.status === "running");
  if (running.length > 0) return "working";
  const queued = tasks.filter((t) => t.status === "queued");
  if (queued.length > 0) return "online";
  const scheduled = tasks.filter(
    (t) =>
      t.status === "scheduled" ||
      t.status === "waiting_input" ||
      t.status === "waiting_approval",
  );
  if (scheduled.length > 0) return "standby";
  return "idle";
}

function deriveCurrentTask(tasks: AgentTask[]): string | undefined {
  const running = tasks.find((t) => t.status === "running");
  return running?.title;
}

function computeAvgTimeMs(tasks: AgentTask[]): number {
  const terminal = tasks.filter(
    (t) => t.status === "succeeded" || t.status === "failed" || t.status === "cancelled",
  );
  if (terminal.length === 0) return 0;
  let total = 0;
  let count = 0;
  for (const t of terminal) {
    const start = Date.parse(t.createdAt);
    const end = Date.parse(t.updatedAt);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) continue;
    total += end - start;
    count += 1;
  }
  return count === 0 ? 0 : Math.floor(total / count);
}

function computePrecision(tasks: AgentTask[]): number {
  const terminal = tasks.filter(
    (t) => t.status === "succeeded" || t.status === "failed" || t.status === "cancelled",
  );
  if (terminal.length < MIN_TASKS_FOR_PRECISION) return 0;
  const succeeded = terminal.filter((t) => t.status === "succeeded").length;
  return succeeded / terminal.length;
}

export async function computeStats(
  db: Store,
  owner: string,
  personaId: string,
  archetype: AgentStats["archetype"],
  limit = 500,
): Promise<AgentStats> {
  const all = await db.list<AgentTask>(owner, "tasks", { limit });
  const mine = all.filter(
    (t) => t.assignedTo === personaId || (t.state && t.state.roleId === personaId),
  );
  const terminal = mine.filter(
    (t) => t.status === "succeeded" || t.status === "failed" || t.status === "cancelled",
  );
  const succeeded = terminal.filter((t) => t.status === "succeeded").length;
  const status = deriveStatus(mine);
  const currentTask = deriveCurrentTask(mine);

  return {
    level: deriveLevel(succeeded),
    archetype,
    totalTasks: succeeded,
    precision: computePrecision(mine),
    avgTimeMs: computeAvgTimeMs(mine),
    uptime: 1.0,
    status,
    ...(currentTask ? { currentTask } : {}),
  };
}