// B101_APPLIED
import { z } from "zod";

// BUSINESS_GRAPH_V1 — contrato canonico del Business Graph.

export const entityTypeSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z][a-z0-9_-]*$/, "entityType must be lowercase snake/kebab-case");

export const provenanceSchema = z.object({
  source: z.string().min(1).max(200),
  actor: z.string().min(1).max(200),
  updatedAt: z.iso.datetime({ offset: true }),
  confidence: z.number().min(0).max(1).optional(),
});

export const businessEntitySchema = z.object({
  id: z.string().trim().min(1).max(200),
  type: entityTypeSchema,
  name: z.string().trim().min(1).max(300),
  status: z.string().trim().max(100).optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
  schemaVersion: z.string().max(100).default("1.0"),
  provenance: provenanceSchema,
  /** B101 — maquina de estados que gobierna `status`. Si esta definida, updateEntity valida la transicion. */
  stateMachineId: z.string().trim().min(1).max(100).optional(),
});

export type BusinessEntity = z.infer<typeof businessEntitySchema>;

export const businessRelationSchema = z
  .object({
    id: z.string().trim().min(1).max(200),
    fromEntityId: z.string().trim().min(1).max(200),
    toEntityId: z.string().trim().min(1).max(200),
    type: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z][a-z0-9_-]*$/, "relation type must be lowercase snake/kebab-case"),
    properties: z.record(z.string(), z.unknown()).default({}),
    provenance: provenanceSchema,
  })
  .refine((value) => value.fromEntityId !== value.toEntityId, {
    message: "relation cannot be self-referential",
    path: ["toEntityId"],
  });

export type BusinessRelation = z.infer<typeof businessRelationSchema>;

export const businessFieldSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["string", "number", "boolean", "date", "datetime", "money", "reference", "json"]),
  required: z.boolean().default(false),
  refType: entityTypeSchema.optional(),
});

export const businessEntityDeclSchema = z.object({
  type: entityTypeSchema,
  label: z.string().min(1).max(200),
  icon: z.string().max(20).optional(),
  fields: z.array(businessFieldSchema).max(200).default([]),
  states: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  initialState: z.string().trim().min(1).max(100).optional(),
});

export const businessRelationDeclSchema = z.object({
  type: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z][a-z0-9_-]*$/),
  label: z.string().min(1).max(200),
  from: entityTypeSchema,
  to: entityTypeSchema,
});

export const businessSchemaSchema = z.object({
  version: z.string().min(1).max(100),
  entities: z.array(businessEntityDeclSchema).max(200),
  relations: z.array(businessRelationDeclSchema).max(200),
});

export type BusinessSchema = z.infer<typeof businessSchemaSchema>;
export type BusinessEntityDecl = z.infer<typeof businessEntityDeclSchema>;
export type BusinessRelationDecl = z.infer<typeof businessRelationDeclSchema>;

export interface BusinessEntityPublic {
  id: string;
  type: string;
  name: string;
  status?: string;
  provenance: {
    source: string;
    actor: string;
    updatedAt: string;
    confidence?: number;
  };
}

export function toPublicEntity(entity: BusinessEntity): BusinessEntityPublic {
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
    ...(entity.status ? { status: entity.status } : {}),
    provenance: entity.provenance,
  };
}
