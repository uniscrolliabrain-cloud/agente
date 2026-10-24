// KERNEL_PROVIDER_SPEC_V1 — contrato de un proveedor LLM.
//
// Cada velocidad (fast, slow, embeddings) tiene su propio ProviderSpec:
// provider, model, apiKey, baseUrl opcional. tenant-config los importa y los
// expone dentro de TenantConfig. env-resolver los rellena desde .env.
//
// SOC-2: las apiKeys no viven aqui en claro en produccion; vienen resueltas
// desde el vault o desde la DB del tenant. Este tipo solo describe la forma.

import { z } from "zod";

export const providerSpecSchema = z.object({
  provider: z.enum(["google", "anthropic", "openai", "openrouter"]),
  model: z.string().min(1).max(200),
  apiKey: z.string().max(2000),
  baseUrl: z.string().max(2000).optional(),
});

export type ProviderSpec = z.infer<typeof providerSpecSchema>;