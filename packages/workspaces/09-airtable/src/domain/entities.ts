// 09-airtable — entidades canonicas del workspace de datos tabulares.
// Derivado del analisis de Airtable Web API (bases, tables, fields,
// records, views, webhooks).

import { z } from "zod";

export const datasetSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(2000).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const fieldDefinitionSchema = z.object({
  id: z.string().min(1).max(200),
  datasetId: z.string().min(1).max(200),
  externalId: z.string().max(200).optional(),
  name: z.string().max(200),
  type: z.enum([
    "text","longText","number","currency","percent","date","dateTime",
    "boolean","select","multiSelect","user","attachment","relation",
    "formula","rollup","lookup","createdTime","modifiedTime","autoNumber"
  ]),
  options: z.array(z.string().max(200)).default([]),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  order: z.number().int().nonnegative().default(0),
});

export const datasetRecordSchema = z.object({
  id: z.string().min(1).max(200),
  datasetId: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  values: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().max(200).optional(),
});

export const recordRelationSchema = z.object({
  id: z.string().min(1).max(200),
  fromRecordId: z.string().min(1).max(200),
  toRecordId: z.string().min(1).max(200),
  fieldId: z.string().min(1).max(200),
  createdAt: z.string(),
});

export const viewSchema = z.object({
  id: z.string().min(1).max(200),
  datasetId: z.string().min(1).max(200),
  name: z.string().max(200),
  type: z.enum(["grid","form","calendar","kanban","gallery","timeline","list"]),
  filters: z.array(z.record(z.string(), z.unknown())).default([]),
  sorts: z.array(z.record(z.string(), z.unknown())).default([]),
  visibleFieldIds: z.array(z.string().min(1).max(200)).default([]),
});

export type Dataset = z.infer<typeof datasetSchema>;
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;
export type DatasetRecord = z.infer<typeof datasetRecordSchema>;
export type RecordRelation = z.infer<typeof recordRelationSchema>;
export type View = z.infer<typeof viewSchema>;