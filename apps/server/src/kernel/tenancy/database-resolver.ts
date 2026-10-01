// KERNEL_DATABASE_TENANT_RESOLVER_V1 - resuelve tenantId desde DB.
// Lee owner -> tenantId de tabla tenant_members. SOC-2 aislamiento.
export interface DbPort{query(sql:string,params:any[]):Promise<{rows:any[]}>}
export class DatabaseTenantResolver{
 constructor(private readonly db:DbPort){}
 async resolve(owner:string):Promise<string>{
  const r=await this.db.query("SELECT tenant_id FROM tenant_members WHERE user_id=$1 LIMIT 1",[owner]);
  if(r.rows.length===0)return owner; // fallback single-tenant dev
  return r.rows[0].tenant_id as string
 }
 async resolveAll(owner:string):Promise<string[]>{
  const r=await this.db.query("SELECT tenant_id FROM tenant_members WHERE user_id=$1",[owner]);
  return r.rows.map(x=>x.tenant_id as string)
 }
}