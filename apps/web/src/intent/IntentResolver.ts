// INTENT_RESOLVER_V1 - texto -> Intent. patrones + embeddings placeholder + llm pequeno placeholder
import { intentSchema, type Intent } from "./schema.ts";
function normalize(s:string){return s.trim().toLowerCase().replace(/\s+/g," ")}
function detectKind(raw:string):Intent["kind"]{
 const n=normalize(raw);
 if(n.startsWith("crea")||n.startsWith("create")||n.startsWith("nuevo"))return "create";
 if(n.startsWith("borra")||n.startsWith("delete"))return "delete";
 if(n.startsWith("actualiza")||n.startsWith("update")||n.startsWith("edita"))return "update";
 if(n.startsWith("ve")||n.startsWith("muestra")||n.startsWith("lista")||n.includes("table")||n.includes("kanban"))return "query";
 if(n.startsWith("ir")||n.startsWith("abre"))return "navigate";
 return "unknown";
}
export class IntentResolver{
 resolve(raw:string):Intent{
  const norm=normalize(raw);
  const kind=detectKind(raw);
  return intentSchema.parse({id:`intent_${Date.now()}`,raw,normalized:norm,kind,entities:[],confidence:kind==="unknown"?0.4:0.8,bindings:{},timestamp:new Date().toISOString()});
 }
}