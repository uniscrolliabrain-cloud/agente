// VIEW_ENVELOPE_V1 - contrato canonico de una vista servida.
// RuntimeViewSpec sigue siendo el payload de presentacion; este sobre anade
// identidad, procedencia, frescura y permisos para que el renderer no tenga
// que adivinar de donde salen los datos.
import { z } from "zod";
import { runtimeViewSpecSchema } from "./views.ts";

export const viewProvenanceSchema = z.object({
  source: z.string().min(1).max(200),
  ref: z.string().max(500).optional(),
  label: z.string().max(200).optional(),
  asOf: z.string().max(80).optional(),
});

export const viewFreshnessSchema = z.object({
  generatedAt: z.iso.datetime({ offset: true }),
  sourceAsOf: z.iso.datetime({ offset: true }).optional(),
  stale: z.boolean().default(false),
});

export const viewPermissionsSchema = z.object({
  canView: z.boolean().default(true),
  canAct: z.array(z.string().max(200)).max(50).default([]),
});

export const viewSourceSchema = z.object({
  provider: z.string().min(1).max(100),
  workspaceId: z.string().max(100).optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().max(200).optional(),
});

export const viewEnvelopeSchema = z.object({
  id: z.string().min(1).max(240),
  tenantId: z.string().min(1).max(100),
  workspaceId: z.string().max(100).optional(),
  spec: runtimeViewSpecSchema,
  provenance: z.array(viewProvenanceSchema).max(50).default([]),
  freshness: viewFreshnessSchema,
  permissions: viewPermissionsSchema,
  source: viewSourceSchema,
  generatedAt: z.iso.datetime({ offset: true }),
});

export type ViewEnvelope = z.infer<typeof viewEnvelopeSchema>;
export type ViewProvenance = z.infer<typeof viewProvenanceSchema>;

export function parseViewEnvelope(raw: unknown): ViewEnvelope | null {
  const parsed = viewEnvelopeSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
