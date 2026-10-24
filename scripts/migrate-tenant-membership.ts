// MIGRATE_TENANT_MEMBERSHIP_V1
// Unifica todas las filas de tenant-membership a id="default".
// Uso: pnpm exec tsx scripts/migrate-tenant-membership.ts

import { createStore } from "../apps/server/src/db.ts";

async function main() {
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    const rows = await db.list<{ id: string; tenantId: string }>(
      "system",
      "tenant-membership",
      { limit: 10000 },
    );
    let migrated = 0;
    let skipped = 0;
    for (const row of rows) {
      if (row.id === "default") { skipped++; continue; }
      if (!row.tenantId) { skipped++; continue; }
      const existing = await db.get("system", "tenant-membership", "default");
      if (existing) { skipped++; continue; }
      await db.put("system", "tenant-membership", {
        id: "default",
        tenantId: row.tenantId,
        migratedAt: new Date().toISOString(),
        migratedFrom: row.id,
      });
      await db.remove("system", "tenant-membership", row.id);
      migrated++;
    }
    console.log(`OK: ${migrated} migradas, ${skipped} saltadas`);
  } finally {
    await db.close();
  }
}

void main();
