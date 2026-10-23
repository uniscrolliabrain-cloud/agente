// FIELD_CLASSIFICATION_V1 - clasificacion por campo, mapa servidor.
// No se guarda en el registro. El FieldFilter consulta este mapa.
import { z } from "zod";

export const fieldClassificationSchema = z.enum([
  "public", "internal", "confidential", "restricted", "secret",
]);

export const classifiedFieldSchema = z.object({
  field: z.string().min(1).max(200),
  classification: fieldClassificationSchema,
});

export const classifiedRecordSchema = z.object({
  fields: z.array(classifiedFieldSchema).max(200),
});

export type FieldClassification = z.infer<typeof fieldClassificationSchema>;
export type ClassifiedField = z.infer<typeof classifiedFieldSchema>;
export type ClassifiedRecord = z.infer<typeof classifiedRecordSchema>;

// Mapa por defecto. Controlado por servidor, no por cliente.
export const DEFAULT_CLASSIFICATION: Record<string, Record<string, FieldClassification>> = {
  user: { email: "internal", name: "internal", setup: "confidential" },
  agentRole: { permissions: "restricted", memories: "confidential", allowedTools: "restricted" },
  agentTask: { prompt: "confidential", plan: "internal", outcome: "internal" },
  agentMemory: { text: "confidential" },
  businessEntity: { properties: "internal" },
  sop: { steps: "internal" },
};