// CROMOS_PENDING_V1 — código declarado pero NO cableado.
// El roadmap 09 marca "no cromos ni polaridad todavía" como frontera.
// Estos módulos existen pero nadie los importa en runtime.
// Cuando se implementen de verdad, mover esta marca a CROMOS_ACTIVE_V1.
// Ver: auditoría profunda 09.
// KERNEL_CROMO_V1 - unidad cognitiva con axiomas + campo.
// Cromo = {id, tenantId, axioms, field, provenance}
import { z } from "zod";
export const cromoSchema=z.object({
 id:z.string().min(1).max(100),tenantId:z.string().min(1).max(100),
 kind:z.enum(["logic","physics","intent","memory","policy"]),
 axioms:z.array(z.string().max(1000)).default([]),
 field:z.record(z.string(),z.unknown()).default({}),
 provenance:z.object({source:z.string().min(1).max(200),createdAt:z.iso.datetime({offset:true})}),
});
export type Cromo=z.infer<typeof cromoSchema>;