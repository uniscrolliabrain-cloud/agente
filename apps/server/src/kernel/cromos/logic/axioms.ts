// CROMOS_PENDING_V1 — código declarado pero NO cableado.
// El roadmap 09 marca "no cromos ni polaridad todavía" como frontera.
// Estos módulos existen pero nadie los importa en runtime.
// Cuando se implementen de verdad, mover esta marca a CROMOS_ACTIVE_V1.
// Ver: auditoría profunda 09.
// KERNEL_CROMOS_LOGIC_AXIOMS_V1 - axiomas base logica.
// No LLM. Reglas deterministas para promocion y consistencia.
export const LOGIC_AXIOMS=[
 "A->B and B->C implies A->C",
 "not(not(A)) = A",
 "A and not(A) => contradiction",
 "primary must be in matched for high confidence",
 "empty content => discard",
] as const;
export function checkContradiction(a:string,b:string):boolean{
 const al=a.trim().toLowerCase();const bl=b.trim().toLowerCase();
 return al===`no ${bl}`||bl===`no ${al}`
}