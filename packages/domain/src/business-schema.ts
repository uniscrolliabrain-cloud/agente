// BUSINESS_SCHEMA_V1 - definicion declarativa de tipos de entidad.

import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "date",
  "datetime",
  "money",
  "reference",
  "json",
  "enum",
]);

export const fieldDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: fieldTypeSchema,
  required: z.boolean().default(false),
  enumValues: z.array(z.string().max(100)).max(100).optional(),
  refType: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

export const stateDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().max(200).optional(),
  terminal: z.boolean().default(false),
  initialState: z.boolean().default(false),
});

export const entityDefinitionSchema = z.object({
  type: z.string().min(1).max(100).regex(/^[a-z][a-z0-9_-]*$/),
  label: z.string().min(1).max(200),
  icon: z.string().max(50).optional(),
  fields: z.array(fieldDefinitionSchema).max(200).default([]),
  states: z.array(stateDefinitionSchema).max(50).default([]),
});

export const relationDefinitionSchema = z.object({
  type: z.string().min(1).max(100).regex(/^[a-z][a-z0-9_-]*$/),
  label: z.string().min(1).max(200),
  fromType: z.string().min(1).max(100),
  toType: z.string().min(1).max(100),
  cardinality: z.enum(["one-to-one", "one-to-many", "many-to-many"]).default("many-to-many"),
});

export const businessSchemaV2Schema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  version: z.string().min(1).max(50).default("1.0"),
  entities: z.array(entityDefinitionSchema).max(200).default([]),
  relations: z.array(relationDefinitionSchema).max(200).default([]),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export type FieldType = z.infer<typeof fieldTypeSchema>;
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;
export type StateDefinition = z.infer<typeof stateDefinitionSchema>;
export type EntityDefinition = z.infer<typeof entityDefinitionSchema>;
export type RelationDefinition = z.infer<typeof relationDefinitionSchema>;
export type BusinessSchemaV2 = z.infer<typeof businessSchemaV2Schema>;