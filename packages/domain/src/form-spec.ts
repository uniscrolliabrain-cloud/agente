// FORM_SPEC_V1 - contrato de formularios asistidos con procedencia.

import { z } from "zod";
import { provenanceChipKindSchema } from "./context-chips.ts";

export const formFieldSpecSchema = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string().max(200)).max(100).optional(),
  placeholder: z.string().max(200).optional(),
  value: z.unknown().optional(),
  provenance: provenanceChipKindSchema.default("missing"),
  hint: z.string().max(500).optional(),
});
export type FormFieldSpec = z.infer<typeof formFieldSpecSchema>;

export const formSpecSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(500).optional(),
  entityType: z.string().max(100),
  fields: z.array(formFieldSpecSchema).max(200).default([]),
  submitLabel: z.string().max(100).default("Guardar"),
  cancelLabel: z.string().max(100).default("Cancelar"),
  provenance: z.record(z.string(), z.unknown()).default({}),
});
export type FormSpec = z.infer<typeof formSpecSchema>;