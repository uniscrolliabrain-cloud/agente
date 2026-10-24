// CONTEXT_CHIPS_V1 - chips de procedencia por campo.

import { z } from "zod";

export const provenanceChipKindSchema = z.enum([
  "auto",
  "alta",
  "media",
  "sugerido",
  "tu",
  "missing",
]);
export type ProvenanceChipKind = z.infer<typeof provenanceChipKindSchema>;

export const provenanceChipSchema = z.object({
  kind: provenanceChipKindSchema,
  label: z.string().min(1).max(80),
  color: z.string().min(1).max(30),
  description: z.string().max(500).optional(),
});
export type ProvenanceChip = z.infer<typeof provenanceChipSchema>;

export function defaultChip(kind: ProvenanceChipKind): ProvenanceChip {
  switch (kind) {
    case "auto":
      return { kind, label: "auto", color: "neutral", description: "Dato canonico del sistema" };
    case "alta":
      return { kind, label: "auto · alta", color: "green", description: "Confianza alta" };
    case "media":
      return { kind, label: "auto · media", color: "amber", description: "Confianza media" };
    case "sugerido":
      return { kind, label: "sugerido", color: "purple", description: "Propuesto por el agente" };
    case "tu":
      return { kind, label: "tú", color: "blue", description: "Introducido por el usuario" };
    case "missing":
      return { kind, label: "falta", color: "gray", description: "Sin dato" };
  }
}