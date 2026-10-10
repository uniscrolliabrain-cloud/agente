// WORKSPACE_QUERY_V1 — sobre comun de cualquier consulta de workspace.

import { z } from "zod";

export const workspaceQueryEnvelopeSchema = z.object({
  id: z.string().min(1).max(200),
  workspaceId: z.string().min(1).max(100),
  query: z.string().min(1).max(100),
  version: z.number().int().positive().default(1),
  parameters: z.record(z.string(), z.unknown()).default({}),
  limit: z.number().int().positive().max(500).default(50),
  cursor: z.string().max(200).optional(),
});

export type WorkspaceQueryEnvelope = z.infer<
  typeof workspaceQueryEnvelopeSchema
>;

export interface QueryResult<T = unknown> {
  status: "ok" | "empty" | "forbidden";
  items: T[];
  nextCursor?: string;
  total?: number;
}

export interface QueryHandler<TParams = Record<string, unknown>, TItem = unknown> {
  readonly queryId: string;
  readonly version: number;
  handle(
    params: TParams,
    context: import("./workspace-context.ts").WorkspaceContext,
    envelope: WorkspaceQueryEnvelope,
  ): Promise<QueryResult<TItem>>;
}