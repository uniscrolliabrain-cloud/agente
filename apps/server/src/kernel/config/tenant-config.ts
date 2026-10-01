// KERNEL_TENANT_CONFIG_V2 - capabilities + latencias por tenant.
// SOC-2: cada tenant puede tener caps distintas.
import { z } from "zod";
export const tenantCapabilitiesSchema=z.object({
 fastChain:z.boolean().default(true),slowChain:z.boolean().default(true),
 rag:z.boolean().default(false),businessGraph:z.boolean().default(false),
 memory:z.boolean().default(false),policy:z.boolean().default(false),
 views:z.boolean().default(true),progress:z.boolean().default(true),
 meta:z.boolean().default(true),cromos:z.boolean().default(false),
});
export const tenantConfigSchema=z.object({
 tenantId:z.string().min(1).max(100),
 capabilities:tenantCapabilitiesSchema,
 quiescenceMs:z.number().int().min(0).max(600000).default(10000),
 fastIdleMs:z.number().int().min(0).max(60000).default(1000),
 slowLongMs:z.number().int().min(0).max(300000).default(30000),
 maxThoughtsPerTurn:z.number().int().min(1).max(5000).default(500),
});
export type TenantCapabilities=z.infer<typeof tenantCapabilitiesSchema>;
export type TenantConfig=z.infer<typeof tenantConfigSchema>;
export interface TenantConfigResolver{resolve(tenantId:string):Promise<TenantConfig>}