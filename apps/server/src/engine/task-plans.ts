// TASK_PLANS_V1 — planes por kind, centralizados y configurables.
//
// Antes estaban hardcodeados dentro de createTask en service.ts.
// Centralizarlos permite:
//   - tests unitarios sin montar el AgentService
//   - override por config (env, tenant config)
//   - coherencia entre documentos y UI (mismas etiquetas)
//
// Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.

import type { AgentTask } from "../../../../packages/domain/src/agent.ts";

export type TaskKind = AgentTask["kind"];

export const DEFAULT_PLANS: Record<TaskKind, string[]> = {
  document: [
    "Find the source document",
    "Fill a new copy",
    "Prepare a reply",
    "Wait for your decision",
    "Record the outcome",
  ],
  monitor: [
    "Check the source",
    "Compare with the last observation",
    "Report a meaningful change",
  ],
  finance: ["Validate transactions", "Calculate the summary", "Save your tracker"],
  agent: ["Understand the outcome", "Plan the work", "Use connected tools", "Return a result"],
  plan: ["Understand the outcome", "Plan the work", "Use connected tools", "Return a result"],
  sop: [], // Los SOPs generan su plan desde sop.steps.
};

export function planForKind(kind: TaskKind): string[] {
  return DEFAULT_PLANS[kind] ?? [];
}
