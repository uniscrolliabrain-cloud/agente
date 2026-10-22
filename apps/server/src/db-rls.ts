// DB_RLS_V1 - Row Level Security opcional para Postgres real.
//
// Solo aplica si el backend es "postgres". En PGlite no existe.
//
// La idea: cuando multi-tenant este activo en un mismo Postgres (varios
// tenants en la misma tabla records), se activa RLS por tenant_id. Mientras
// el modelo sea "un deployment por cliente", RLS no aporta nada, porque
// cada deployment solo tiene un tenant.
//
// Uso:
//   await enableRls(store);   // al arrancar, si DATABASE_URL y
//                             // MULTI_TENANT_SHARED=true
//
// Requiere que la tabla records tenga columna tenant_id. Si no la tiene,
// la anade con backfill a 'default'. Si el modelo es un deployment por
// cliente, esto es decorativo y se puede saltar.

import type { Store } from "./db.ts";
import { backgroundFailure } from "./log.ts";

  // DB_RLS_ENABLED_FLAG_V1
export async function enableRls(store: Store): Promise<boolean> {
  if (store.backend !== "postgres") {
    return false;
  }
  if (process.env.MULTI_TENANT_SHARED !== "true") {
    // Un deployment por cliente: no aplica.
    return false;
  }
  try {
    // 1. Columna tenant_id con backfill.
    await store.select(
      "ALTER TABLE records ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default'",
    );
    // 2. Indice compuesto.
    await store.select(
      "CREATE INDEX IF NOT EXISTS records_tenant_owner_kind_idx ON records(tenant_id, owner, kind, id)",
    );
    // 3. Politica RLS. El usuario de la app debe usar SET LOCAL app.tenant_id
    //    antes de cada query. Si no lo hace, no ve nada. Esto es defensa en
    //    profundidad: aunque alguien olvide filtrar por tenant, RLS bloquea.
    await store.select("ALTER TABLE records ENABLE ROW LEVEL SECURITY");
    await store.select("DROP POLICY IF EXISTS tenant_isolation ON records");
    await store.select(
      "CREATE POLICY tenant_isolation ON records USING (tenant_id = current_setting('app.tenant_id', true))",
    );
    // 4. Forzar RLS al owner de la tabla.
    await store.select("ALTER TABLE records FORCE ROW LEVEL SECURITY");
    return true;
  } catch (error) {
    backgroundFailure("enableRls", error);
    return false;
  }
}

/**
 * Envuelve una query en un SET LOCAL app.tenant_id para que RLS aplique.
 * Uso:
 *   await withTenantRls(store, tenantId, async () => store.list(...));
 */
  // DB_RLS_TENANT_CTX_V1
export async function withTenantRls<T>(
  store: Store,
  tenantId: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (store.backend !== "postgres" || process.env.MULTI_TENANT_SHARED !== "true") {
    return fn();
  }
  // RLS_TX_REQUIRED_V1 - store.transaction() no comparte conexion con
  // store.select() dentro del callback (pg.Pool max:5, cada query coge una
  // conexion distinta). set_config(is_local=true) se pierde y RLS no aplica.
  // Hasta que Store exponga transactionWithConnection(conn, fn), lanzamos
  // en vez de mentir: si el caller depende de RLS, debe saberlo.
  throw new Error(
    "RLS_TX_REQUIRED_V1: withTenantRls no garantiza RLS porque set_config y la query no comparten conexion. Requiere refactor de Store.transaction.",
  );
}