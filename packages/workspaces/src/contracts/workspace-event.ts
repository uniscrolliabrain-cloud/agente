// WORKSPACE_EVENT_V1 — sobre comun de eventos publicados por un workspace.
// El bus real es SystemEvent (apps/server/src/engine/events/types.ts).
// Este sobre es la declaracion tipada que vive dentro del modulo; el
// adapter de registro lo traduce a SystemEvent al publicar.

import { z } from "zod";

export const workspaceEventEnvelopeSchema = z.object({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(150),
  version: z.number().int().positive().default(1),
  workspaceId: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  entityId: z.string().min(1).max(200).optional(),
  correlationId: z.string().min(1).max(200).optional(),
  causationId: z.string().min(1).max(200).optional(),
  occurredAt: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type WorkspaceEventEnvelope = z.infer<
  typeof workspaceEventEnvelopeSchema
>;

export interface PublishedEvent {
  readonly type: string;
  readonly version: number;
  readonly description: string;
}

export interface ConsumedEvent {
  readonly type: string;
  readonly version: number;
  readonly description: string;
  readonly source: string;
}