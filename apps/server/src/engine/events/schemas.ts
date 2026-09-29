import { z } from "zod";
import type { SystemEventType } from "./types.ts";

/**
 * Payloads cerrados por tipo de evento.
 *
 * El Record obliga a cubrir TODOS los SystemEventType: si anades uno
 * al enum y no aqui, TypeScript no compila. Eso es intencional.
 *
 * La validacion vive en el emisor (EventBus.emit), nunca en el consumidor.
 */

const base = {
  taskId: z.string().max(200).optional(),
  actionId: z.string().max(200).optional(),
  monitorId: z.string().max(200).optional(),
  sopId: z.string().max(200).optional(),
  stepId: z.string().max(200).optional(),
  projectId: z.string().max(200).optional(),
  clientId: z.string().max(200).optional(),
  roleId: z.string().max(200).optional(),
};

export const payloadSchemas: Record<SystemEventType, z.ZodTypeAny> = {
  "task.created": z.object({ ...base, title: z.string().max(200), kind: z.string().max(40) }),
  "task.status_changed": z.object({ ...base, from: z.string().max(40), to: z.string().max(40) }),
  "task.completed": z.object({ ...base, title: z.string().max(200), result: z.string().max(2000).optional() }),
  "task.failed": z.object({ ...base, title: z.string().max(200), error: z.string().max(2000).optional() }),
  "task.waiting_input": z.object({ ...base, title: z.string().max(200), question: z.string().max(2000).optional() }),
  "task.waiting_approval": z.object({ ...base, title: z.string().max(200) }),
  "task.controlled": z.object({ ...base, action: z.enum(["pause","resume","cancel","retry"]) }),
  "sop.step_started": z.object({ ...base, index: z.number().int().nonnegative(), title: z.string().max(200) }),
  "sop.step_completed": z.object({ ...base, index: z.number().int().nonnegative(), title: z.string().max(200) }),
  "sop.step_skipped": z.object({ ...base, index: z.number().int().nonnegative(), title: z.string().max(200), reason: z.string().max(500).optional() }),
  "sop.failed": z.object({ ...base, error: z.string().max(2000).optional() }),
  "action.proposed": z.object({ ...base, title: z.string().max(300), kind: z.string().max(60) }),
  "action.approved": z.object({ ...base, title: z.string().max(300) }),
  "action.denied": z.object({ ...base, title: z.string().max(300) }),
  "action.executed": z.object({ ...base, title: z.string().max(300), result: z.string().max(2000).optional() }),
  "action.failed": z.object({ ...base, title: z.string().max(300), error: z.string().max(2000).optional() }),
  "action.outcome_unknown": z.object({ ...base, title: z.string().max(300), error: z.string().max(2000).optional() }),
  "monitor.check": z.object({ ...base, url: z.string().max(2000), matched: z.boolean() }),
  "monitor.changed": z.object({ ...base, url: z.string().max(2000), excerpt: z.string().max(1000) }),
  "monitor.failed": z.object({ ...base, url: z.string().max(2000), error: z.string().max(2000) }),
  "system.startup": z.object({ mode: z.enum(["sample", "live"]) }),
  "system.error": z.object({ message: z.string().max(2000), phase: z.string().max(100).optional() }),
  "system.maintenance": z.object({ tasks: z.number().int().nonnegative(), monitors: z.number().int().nonnegative() }),
  "system.google_disconnected": z.object({ owner: z.string().max(200) }),
  "auth.login": z.object({ userId: z.string().max(200) }),
  "auth.login_failed": z.object({ email: z.string().max(300) }),
};