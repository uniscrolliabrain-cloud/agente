// WORKSPACE_SPEC_V1 - especificacion de workspace derivada del schema.

import { z } from "zod";

export const viewKindSchema = z.enum([
  "dashboard",
  "queue",
  "inbox",
  "board",
  "table",
  "detail",
  "form",
  "timeline",
  "graph",
  "chart",
  "compare",
  "calendar",
  "document",
]);

export const columnSpecSchema = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "chip", "action", "boolean"]),
  sortable: z.boolean().default(false),
  align: z.enum(["left", "right", "center"]).default("left"),
});

export const actionSpecSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  kind: z.enum(["primary", "secondary", "danger"]).default("secondary"),
  intent: z.string().max(200),
});

export const dataSourceSpecSchema = z.object({
  kind: z.enum(["business-graph", "memory", "static", "task", "event"]),
  query: z.string().max(1000),
  tenantId: z.string().max(100),
  bindings: z.record(z.string(), z.unknown()).default({}),
});

export const provenanceChipSchema = z.enum(["auto", "alta", "media", "sugerido", "tu", "missing"]);

export const viewSpecSchema = z.object({
  id: z.string().min(1).max(200),
  kind: viewKindSchema,
  title: z.string().max(300),
  subtitle: z.string().max(500).optional(),
  columns: z.array(columnSpecSchema).max(200).optional(),
  actions: z.array(actionSpecSchema).max(50).optional(),
  dataSource: z.array(dataSourceSpecSchema).max(10).optional(),
  provenance: z.record(z.string(), z.unknown()).default({}),
});

export const formFieldSpecSchema = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string().max(200)).max(100).optional(),
  placeholder: z.string().max(200).optional(),
  value: z.unknown().optional(),
  provenance: provenanceChipSchema.default("missing"),
});

export const formSpecSchema = z.object({
  id: z.string().min(1).max(200),
  kind: z.literal("form"),
  title: z.string().max(300),
  entityType: z.string().max(100),
  fields: z.array(formFieldSpecSchema).max(200),
  submitLabel: z.string().max(100).default("Guardar"),
  cancelLabel: z.string().max(100).default("Cancelar"),
});

export const workspaceSectionSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  icon: z.string().max(50).optional(),
  viewKind: viewKindSchema,
  entityType: z.string().max(100).optional(),
  order: z.number().int().min(0).max(1000).default(0),
});

export const workspaceSpecSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  roleId: z.string().max(200).optional(),
  title: z.string().min(1).max(300),
  sections: z.array(workspaceSectionSchema).max(50).default([]),
  defaultView: viewKindSchema.default("dashboard"),
  createdAt: z.iso.datetime({ offset: true }),
});

export type ViewKind = z.infer<typeof viewKindSchema>;
export type ColumnSpec = z.infer<typeof columnSpecSchema>;
export type ActionSpec = z.infer<typeof actionSpecSchema>;
export type DataSourceSpec = z.infer<typeof dataSourceSpecSchema>;
export type ViewSpec = z.infer<typeof viewSpecSchema>;
export type FormFieldSpec = z.infer<typeof formFieldSpecSchema>;
export type FormSpec = z.infer<typeof formSpecSchema>;
export type WorkspaceSection = z.infer<typeof workspaceSectionSchema>;
export type WorkspaceSpec = z.infer<typeof workspaceSpecSchema>;