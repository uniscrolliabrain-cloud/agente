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