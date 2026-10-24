// DROP_TENANT_ID_COLUMN_V1 - elimina la columna tenant_id de records.
// Uso: pnpm exec tsx scripts/drop-tenant-id-column.ts
// Solo si aplicaste MT-1 y quieres limpiar la DB existente.

import { createStore } from "../apps/server/src/db.ts";

async function main() {
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    await db.select("ALTER TABLE records DROP COLUMN IF EXISTS tenant_id");
    await db.select("DROP INDEX IF EXISTS records_tenant_owner_kind_idx");
    await db.select("DROP INDEX IF EXISTS records_tenant_kind_status_idx");
    await db.select("DROP INDEX IF EXISTS records_tenant_kind_updated_idx");
    console.log("OK: columna tenant_id e indices eliminados");
  } finally {
    await db.close();
  }
}

void main();