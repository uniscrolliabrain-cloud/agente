// MIGRATE_TENANT_ID_V1 - backfill de tenant_id en records.
// Uso: pnpm exec tsx scripts/migrate-tenant-id.ts

import { createStore } from "../apps/server/src/db.ts";

async function main() {
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    // El ALTER + backfill se hace en createStore cuando arranca. Aqui solo
    // verificamos cuantos records tienen tenant_id null.
    const rows = await db.select<{ count: number }>(
      "SELECT count(*)::int AS count FROM records WHERE tenant_id IS NULL",
    );
    const pending = rows[0]?.count ?? 0;
    if (pending === 0) {
      console.log("OK: no hay records sin tenant_id");
    } else {
      console.log(`Backfill pendiente: ${pending} records`);
      await db.select(
        "UPDATE records SET tenant_id = 'default' WHERE tenant_id IS NULL",
      );
      console.log(`OK: ${pending} records actualizados a 'default'`);
    }
  } finally {
    await db.close();
  }
}

void main();