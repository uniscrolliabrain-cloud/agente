// KERNEL_DATABASE_CONFIG_RESOLVER_V1 - lee TenantConfig desde DB.
// Tabla tenant_configs (tenant_id, capabilities jsonb, quiescence_ms, etc)
// Fallback a env si no existe.
import type { TenantConfig, TenantConfigResolver } from "./tenant-config.ts";
import { tenantConfigSchema } from "./tenant-config.ts";
export interface DbPort{query(sql:string,params:any[]):Promise<{rows:any[]}>}
export class DatabaseTenantConfigResolver implements TenantConfigResolver{
 constructor(private readonly db:DbPort, private readonly fallback:TenantConfigResolver){}
 async resolve(tenantId:string):Promise<TenantConfig>{
  try{
   const r=await this.db.query("SELECT tenant_id, capabilities, quiescence_ms, fast_idle_ms, slow_long_ms FROM tenant_configs WHERE tenant_id=$1 LIMIT 1",[tenantId]);
   if(r.rows.length===0)return this.fallback.resolve(tenantId);
   const row=r.rows[0];
   return tenantConfigSchema.parse({
    tenantId:row.tenant_id,capabilities:row.capabilities,
    quiescenceMs:row.quiescence_ms,fastIdleMs:row.fast_idle_ms,slowLongMs:row.slow_long_ms,
    maxThoughtsPerTurn:500
   })
  }catch{return this.fallback.resolve(tenantId)}
 }
}