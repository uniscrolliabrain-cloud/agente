// KERNEL_TURN_V2 — ciclo de vida completo.
//
// Cambios respecto a V1:
//   - parentTurnId: si el slow sigue tras cerrar el padre, abre turno hijo.
//   - quiescentAt / quiescenceMs: el turno se puede cerrar por quiescencia
//     (nadie escribe durante X ms), no solo por tiempo.
//   - closedBy: quien cerro el turno (presenter, quiescence, timeout, user).
//   - childTurnIds: array de turnos hijos.

import { z } from "zod";

export const turnCloseReasonSchema = z.enum(["response", "timeout", "promotion", "quiescence"]);
export const turnStatusSchema = z.enum(["open", "closed", "promoted"]);
export const turnClosedBySchema = z.enum(["presenter", "quiescence", "timeout", "user", "system"]);

export const turnSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  parentTurnId: z.string().max(100).optional(),
  childTurnIds: z.array(z.string().max(100)).max(100).default([]),
  startedAt: z.iso.datetime({ offset: true }),
  closedAt: z.iso.datetime({ offset: true }).optional(),
  quiescentAt: z.iso.datetime({ offset: true }).optional(),
  quiescenceMs: z.number().int().min(0).max(600_000).default(10_000),
  status: turnStatusSchema,
  thoughtIds: z.array(z.string().max(100)).max(500).default([]),
  triggers: z.array(z.string().max(100)).max(50).default([]),
  closeReason: turnCloseReasonSchema.optional(),
  closedBy: turnClosedBySchema.optional(),
});

export type TurnStatus = z.infer<typeof turnStatusSchema>;
export type TurnCloseReason = z.infer<typeof turnCloseReasonSchema>;
export type TurnClosedBy = z.infer<typeof turnClosedBySchema>;
export type Turn = z.infer<typeof turnSchema>;