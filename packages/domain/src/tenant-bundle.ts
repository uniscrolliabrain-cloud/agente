// TENANT_BUNDLE_V1 - schema Zod del bundle de un tenant.
// El bundle vive en tenant_bundles (Supabase) y se mezcla con clientes/_template/.
import { z } from "zod";

export const tenantCompanySchema = z.object({
  name: z.string().min(1).max(200),
  sector: z.string().min(1).max(100),
  description: z.string().max(2000).default(""),
  services: z.array(z.string().max(200)).max(50).default([]),
  timezone: z.string().max(100).default("Europe/Madrid"),
  language: z.string().min(2).max(10).default("es"),
});

export const tenantChannelSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.string().max(100).optional(),
  credentialsRef: z.string().max(200).optional(),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const tenantAgentSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(120),
  tone: z.enum(["warm", "concise", "thoughtful"]).default("warm"),
  avatar: z.enum(["sky", "sand", "lilac"]).default("sky"),
  objetivo: z.string().max(2000).default(""),
  sops: z.array(z.string().max(200)).max(50).default([]),
  allowedTools: z.array(z.string().max(200)).max(100).optional(),
  memories: z.array(z.object({ kind: z.string().max(50), text: z.string().max(2000) })).max(20).default([]),
});

export const tenantProcessSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  sopFile: z.string().min(1).max(300),
  triggers: z.array(z.object({ type: z.string().max(50), value: z.string().max(500).optional() })).max(10).default([]),
});

export const tenantConfigSchema = z.object({
  fast: z.object({ provider: z.string().max(50), model: z.string().max(100) }),
  slow: z.object({ provider: z.string().max(50), model: z.string().max(100) }),
  maxSteps: z.number().int().min(1).max(100).default(6),
  quota: z.object({
    tokensPerDay: z.number().int().nonnegative().default(1_000_000),
    costEurPerDay: z.number().nonnegative().default(20),
    fastCallsPerHour: z.number().int().nonnegative().default(1000),
    slowCallsPerHour: z.number().int().nonnegative().default(500),
  }).default({}),
});

export const tenantBundleSchema = z.object({
  version: z.string().max(50).default("1.0.0"),
  tenantId: z.string().min(1).max(100),
  company: tenantCompanySchema,
  channels: z.record(z.string().max(50), tenantChannelSchema).default({}),
  agents: z.array(tenantAgentSchema).min(1).max(20),
  processes: z.array(tenantProcessSchema).max(50).default([]),
  capabilities: z.object({ enabled: z.array(z.string().max(200)).max(200).default([]), disabled: z.array(z.string().max(200)).max(200).default([]) }).default({}),
  config: tenantConfigSchema,
  crm: z.object({ kind: z.string().max(50).default("sheets"), config: z.record(z.string(), z.unknown()).default({}) }).optional(),
});

export type TenantCompany = z.infer<typeof tenantCompanySchema>;
export type TenantChannel = z.infer<typeof tenantChannelSchema>;
export type TenantAgent = z.infer<typeof tenantAgentSchema>;
export type TenantProcess = z.infer<typeof tenantProcessSchema>;
export type TenantConfigBundle = z.infer<typeof tenantConfigSchema>;
export type TenantBundle = z.infer<typeof tenantBundleSchema>;