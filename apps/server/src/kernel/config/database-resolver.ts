// DATABASE_RESOLVER_PENDING_V1 — adaptador Supabase no cableado.
// En el repo actual, app.ts usa EnvTenantConfigResolver y
// ServiceTenantResolver. Este resolver se activa cuando Supabase
// esté desplegado (fase posterior).
// Ver: auditoría profunda 09.
// KERNEL_DATABASE_CONFIG_RESOLVER_V2 — TenantConfig desde Supabase.
//
// Supabase = Postgres + RLS + PostgREST. Este resolver lee la tabla
// tenant_configs. Si el tenant no tiene fila o el puerto no esta inyectado,
// delega al fallback (EnvTenantConfigResolver).
//
// Tabla esperada (SQL se crea en bloque aparte):
//
//   create table tenant_configs (
//     tenant_id text primary key,
//     fast_provider text not null,
//     fast_model text not null,
//     fast_api_key text not null,
//     slow_provider text not null,
//     slow_model text not null,
//     slow_api_key text not null,
//     embeddings_provider text,
//     embeddings_model text,
//     embeddings_api_key text,
//     capabilities jsonb not null default '{}'::jsonb,
//     quiescence_ms int not null default 10000,
//     fast_idle_ms int not null default 1000,
//     slow_long_ms int not null default 30000,
//     max_thoughts_per_turn int not null default 500,
//     updated_at timestamptz not null default now()
//   );
//   alter table tenant_configs enable row level security;
//
// RLS: cada tenant solo puede leer su propia fila. El service_role key
// (server-side) puede leer todas; el resolver corre con service_role.
//
// Hoy NADIE instancia este resolver: app.ts usa EnvTenantConfigResolver
// directamente. Se deja listo para cuando Supabase este desplegado.

import { z } from "zod";
import {
  tenantCapabilitiesSchema,
  tenantConfigSchema,
  type TenantConfig,
  type TenantConfigResolver,
} from "./tenant-config.ts";

export interface SupabasePort {
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<{ rows: T[] }>;
}

const rowSchema = z.object({
  tenant_id: z.string().min(1),
  fast_provider: z.enum(["google", "anthropic", "openai", "openrouter"]),
  fast_model: z.string().min(1),
  fast_api_key: z.string(),
  slow_provider: z.enum(["google", "anthropic", "openai", "openrouter"]),
  slow_model: z.string().min(1),
  slow_api_key: z.string(),
  embeddings_provider: z
    .enum(["google", "anthropic", "openai", "openrouter"])
    .nullable()
    .optional(),
  embeddings_model: z.string().nullable().optional(),
  embeddings_api_key: z.string().nullable().optional(),
  capabilities: z.unknown(),
  quiescence_ms: z.number().int(),
  fast_idle_ms: z.number().int(),
  slow_long_ms: z.number().int(),
  max_thoughts_per_turn: z.number().int(),
});

export class DatabaseTenantConfigResolver implements TenantConfigResolver {
  constructor(
    private readonly db: SupabasePort,
    private readonly fallback: TenantConfigResolver,
  ) {}

  async resolve(tenantId: string): Promise<TenantConfig> {
    try {
      const result = await this.db.query(
        `select tenant_id,
                fast_provider, fast_model, fast_api_key,
                slow_provider, slow_model, slow_api_key,
                embeddings_provider, embeddings_model, embeddings_api_key,
                capabilities,
                quiescence_ms, fast_idle_ms, slow_long_ms, max_thoughts_per_turn
           from tenant_configs
          where tenant_id = $1
          limit 1`,
        [tenantId],
      );
      if (result.rows.length === 0) return this.fallback.resolve(tenantId);

      const parsed = rowSchema.safeParse(result.rows[0]);
      if (!parsed.success) return this.fallback.resolve(tenantId);
      const row = parsed.data;

      const capabilities = tenantCapabilitiesSchema.parse(
        row.capabilities && typeof row.capabilities === "object"
          ? row.capabilities
          : {},
      );

      return tenantConfigSchema.parse({
        tenantId: row.tenant_id,
        fast: {
          provider: row.fast_provider,
          model: row.fast_model,
          apiKey: row.fast_api_key,
        },
        slow: {
          provider: row.slow_provider,
          model: row.slow_model,
          apiKey: row.slow_api_key,
        },
        ...(row.embeddings_provider &&
        row.embeddings_model &&
        row.embeddings_api_key
          ? {
              embeddings: {
                provider: row.embeddings_provider,
                model: row.embeddings_model,
                apiKey: row.embeddings_api_key,
              },
            }
          : {}),
        capabilities,
        quiescenceMs: row.quiescence_ms,
        fastIdleMs: row.fast_idle_ms,
        slowLongMs: row.slow_long_ms,
        maxThoughtsPerTurn: row.max_thoughts_per_turn,
      });
    } catch {
      // Tabla no existe todavia, red caida o RLS bloqueando: cae al env.
      return this.fallback.resolve(tenantId);
    }
  }
}