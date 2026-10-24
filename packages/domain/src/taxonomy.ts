// TAXONOMY_V1 - 15 familias universales de capacidad.
//
// Ver: docs/audits/09-kernel-cognitivo/09z-fundamentos.md

import { z } from "zod";

export const taxonomyFamilySchema = z.enum([
  "WEB", "RESEARCH", "DOCUMENTS", "DATA", "CONTENT", "CREATIVE",
  "COMMUNICATION", "SOCIAL", "CRM", "SALES", "MARKETING",
  "SOFTWARE", "DATABASE", "AUTOMATION", "ANALYTICS",
]);

export type TaxonomyFamily = z.infer<typeof taxonomyFamilySchema>;

export const ALL_FAMILIES = [
  "WEB", "RESEARCH", "DOCUMENTS", "DATA", "CONTENT", "CREATIVE",
  "COMMUNICATION", "SOCIAL", "CRM", "SALES", "MARKETING",
  "SOFTWARE", "DATABASE", "AUTOMATION", "ANALYTICS",
] as const;

if (ALL_FAMILIES.length !== 15) {
  throw new Error("TAXONOMY_V1: deben ser exactamente 15 familias");
}

export const FUTURE_FAMILIES: readonly string[] = [
  "CALENDAR", "PROJECT_MANAGEMENT", "CLOUD", "AUTH", "PAYMENTS",
  "ECOMMERCE", "SUPPORT", "KNOWLEDGE_BASE", "VECTOR_DB",
  "FILESYSTEM", "GIT", "API_GATEWAY", "NOTIFICATIONS",
  "FORMS", "SCHEDULING", "COMPLIANCE",
];

export function isValidFamily(family: string): family is TaxonomyFamily {
  return (ALL_FAMILIES as readonly string[]).includes(family);
}