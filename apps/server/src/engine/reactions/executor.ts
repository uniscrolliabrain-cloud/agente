// REACTION_EXECUTOR_V1 - ejecuta las acciones de una ReactionRule.

import type { ExecutionContext } from "../../../../../packages/domain/src/index.ts";
import type { AgentService } from "../service.ts";
import type { HandoffService } from "../handoff/service.ts";

export async function executeReactionActions(
  service: AgentService,
  handoff: HandoffService,
  ctx: ExecutionContext,
  actions: Array<{ kind: string; params: Record<string, unknown> }>,
): Promise<void> {
  for (const action of actions) {
    try {
      switch (action.kind) {
        case "create_task": {
          const prompt = String(action.params.prompt ?? "Tarea automática");
          await service.createTask(ctx.owner, {
            prompt,
            kind: (action.params.kind as "agent" | "document" | "monitor" | "finance" | "plan" | "sop") ?? "agent",
            ...(typeof action.params.title === "string" ? { title: action.params.title } : {}),
          });
          break;
        }
        case "create_goal": {
          await service.createGoal(ctx.owner, {
            title: String(action.params.title ?? "Objetivo"),
            description: String(action.params.description ?? ""),
          });
          break;
        }
        case "notify": {
          await service.notify(
            ctx.owner,
            String(action.params.title ?? "Aviso"),
            String(action.params.body ?? ""),
            ctx.taskId,
          );
          break;
        }
        case "handoff": {
          await handoff.create({
            id: `handoff-${Date.now()}`,
            tenantId: ctx.tenantId,
            fromRoleId: String(action.params.fromRoleId ?? "system"),
            toRoleId: String(action.params.toRoleId ?? "system"),
            ...(ctx.goalId ? { goalId: ctx.goalId } : {}),
            ...(ctx.taskId ? { taskId: ctx.taskId } : {}),
            createdAt: new Date().toISOString(),
          });
          break;
        }
        case "run_sop": {
          const sopId = String(action.params.sopId ?? "");
          if (!sopId) break;
          await service.createTask(ctx.owner, {
            kind: "sop",
            prompt: `Ejecución automática de ${sopId}`,
            input: { sopId },
          });
          break;
        }
        case "call_capability": {
          // Placeholder: en la próxima fase llama al CapabilityRunner.
          break;
        }
      }
    } catch {
      /* best-effort */
    }
  }
}