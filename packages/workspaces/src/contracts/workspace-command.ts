// WORKSPACE_COMMAND_V1 — sobre comun de cualquier comando de workspace.
// El payload generico solo es envoltorio. Cada comando concreto define su
// propio schema Zod en src/application/commands.ts del workspace.

import { z } from "zod";

export const workspaceCommandEnvelopeSchema = z.object({
  id: z.string().min(1).max(200),
  workspaceId: z.string().min(1).max(100),
  command: z.string().min(1).max(100),
  version: z.number().int().positive().default(1),
  entityId: z.string().min(1).max(200).optional(),
  idempotencyKey: z.string().min(1).max(200).optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type WorkspaceCommandEnvelope = z.infer<
  typeof workspaceCommandEnvelopeSchema
>;

export interface CommandResult {
  status: "ok" | "rejected" | "deferred";
  entityId?: string;
  reason?: string;
}

export interface CommandHandler<TPayload = Record<string, unknown>> {
  readonly commandId: string;
  readonly version: number;
  handle(
    payload: TPayload,
    context: import("./workspace-context.ts").WorkspaceContext,
    envelope: WorkspaceCommandEnvelope,
  ): Promise<CommandResult>;
}