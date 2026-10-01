// KERNEL_ENV_RESOLVER_V2 - lee CAPABILITIES y latencias de env.
// FAST_CHAIN, SLOW_CHAIN, VIEWS, PROGRESS, META, CROMOS, etc.
import type { TenantConfig, TenantConfigResolver, TenantCapabilities } from "./tenant-config.ts";
function boolEnv(name:string,def:boolean):boolean{
 const v=process.env[name];if(v===undefined)return def;return v==="1"||v.toLowerCase()==="true"
}
export class EnvTenantConfigResolver implements TenantConfigResolver{
 async resolve(tenantId:string):Promise<TenantConfig>{
  const caps:TenantCapabilities={
   fastChain:boolEnv("FAST_CHAIN",true),slowChain:boolEnv("SLOW_CHAIN",true),
   rag:boolEnv("RAG",false),businessGraph:boolEnv("BUSINESS_GRAPH",false),
   memory:boolEnv("MEMORY",false),policy:boolEnv("POLICY",false),
   views:boolEnv("VIEWS",true),progress:boolEnv("PROGRESS",true),
   meta:boolEnv("META",true),cromos:boolEnv("CROMOS",false),
  };
  const quiescenceMs=Number(process.env.QUIESCENCE_MS?? 10000);
  const fastIdleMs=Number(process.env.FAST_IDLE_MS?? 1000);
  const slowLongMs=Number(process.env.SLOW_LONG_MS?? 30000);
  return {tenantId,capabilities:caps,quiescenceMs,fastIdleMs,slowLongMs,maxThoughtsPerTurn:500}
 }
}