// CROMOS_PENDING_V1 — código declarado pero NO cableado.
// El roadmap 09 marca "no cromos ni polaridad todavía" como frontera.
// Estos módulos existen pero nadie los importa en runtime.
// Cuando se implementen de verdad, mover esta marca a CROMOS_ACTIVE_V1.
// Ver: auditoría profunda 09.
// KERNEL_CROMOS_PHYSICS_FIELD_V1 - campo escalar de atencion.
// Calcula energia de un Thought en funcion de weights.
// E = sum(weight^2) / count. Alta energia = foco.
export function fieldEnergy(matched:{weight:number}[]):number{
 if(matched.length===0)return 0;
 let s=0;for(const m of matched)s+=m.weight*m.weight;
 return s/matched.length
}
export function isHighEnergy(matched:{weight:number}[],threshold=0.7):boolean{
 return fieldEnergy(matched)>=threshold
}