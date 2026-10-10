// WORKSPACE_CONTEXT_V1 — identidad del actor que ejecuta una operacion
// sobre un workspace. No autoriza por si solo. La autorizacion efectiva
// la decide PolicyEngine en el runtime.

import { z } from "zod";

export const workspaceContextSchema = z.object({
  workspaceId: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  actorId: z.string().min(1).max(200),
  actorKind: z.enum(["user", "agent", "system"]),
  roleId: z.string().min(1).max(100).optional(),
  personaId: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string().min(1).max(200)).default([]),
  correlationId: z.string().min(1).max(200),
  causationId: z.string().min(1).max(200).optional(),
});

export type WorkspaceContext = z.infer<typeof workspaceContextSchema>;