// KERNEL_DATABASE_TENANT_RESOLVER_V2 — TenantResolver desde Supabase.
//
// Supabase = Postgres + RLS + PostgREST. Este resolver lee la tabla
// tenant_members. Cada owner (user_id) puede pertenecer a uno o varios
// tenants. El primer tenant devuelto es el activo por defecto.
//
// Tabla esperada (SQL se crea en bloque aparte):
//
//   create table tenant_members (
//     user_id text not null,
//     tenant_id text not null,
//     role text not null default 'member',
//     is_default boolean not null default false,
//     created_at timestamptz not null default now(),
//     primary key (user_id, tenant_id)
//   );
//   create index on tenant_members (user_id);
//   alter table tenant_members enable row level security;
//
// RLS: cada usuario solo puede leer sus propias filas. El service_role key
// (server-side) puede leer todas; el resolver corre con service_role.
//
// Fallback: si el owner no tiene fila, se devuelve "default" (single-tenant).
// Eso permite arrancar en un deployment single-tenant sin tocar el kernel.
//
// Hoy NADIE instancia este resolver: app.ts usa DefaultTenantResolver
// directamente. Se deja listo para cuando Supabase este desplegado.

import type { TenantResolver } from "./resolver.ts";
import { DEFAULT_TENANT_ID } from "./default-resolver.ts";

export interface SupabasePort {
  query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[],
  ): Promise<{ rows: T[] }>;
}

export class DatabaseTenantResolver implements TenantResolver {
  constructor(
    private readonly db: SupabasePort,
    private readonly fallback: TenantResolver,
  ) {}

  async resolve(owner: string): Promise<string> {
    try {
      const result = await this.db.query<{ tenant_id: string }>(
        `select tenant_id
           from tenant_members
          where user_id = $1
          order by is_default desc, created_at asc
          limit 1`,
        [owner],
      );
      if (result.rows.length === 0) {
        const fb = await this.fallback.resolve(owner);
        return fb || DEFAULT_TENANT_ID;
      }
      return result.rows[0].tenant_id;
    } catch {
      const fb = await this.fallback.resolve(owner);
      return fb || DEFAULT_TENANT_ID;
    }
  }

  async resolveAll(owner: string): Promise<string[]> {
    try {
      const result = await this.db.query<{ tenant_id: string }>(
        `select tenant_id
           from tenant_members
          where user_id = $1
          order by is_default desc, created_at asc`,
        [owner],
      );
      if (result.rows.length === 0) return [DEFAULT_TENANT_ID];
      return result.rows.map((row) => row.tenant_id);
    } catch {
      return [DEFAULT_TENANT_ID];
    }
  }
}