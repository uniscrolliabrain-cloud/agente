// FORM_SPEC_V1 - formulario pre-relleno con provenance
import { z } from "zod";
export const provenanceChip=z.enum(["auto.alta","auto.media","sugerido","tu"]);
export const fieldSpec=z.object({
 key:z.string(),label:z.string(),type:z.enum(["text","number","date","select","chip","textarea"]),
 value:z.unknown().optional(),provenance:provenanceChip.optional(),
 required:z.boolean().default(false),options:z.array(z.string()).optional(),
});
export const formSpec=z.object({
 id:z.string(),title:z.string(),kind:z.literal("form"),
 fields:z.array(fieldSpec),submitIntent:z.string().optional(),
 provenance:z.record(z.string(),z.unknown()).optional(),
});
export type FormSpec=z.infer<typeof formSpec>;export type FieldSpec=z.infer<typeof fieldSpec>;