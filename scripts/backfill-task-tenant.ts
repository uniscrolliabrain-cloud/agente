// BACKFILL_TASK_TENANT_V1 - añade tenantId: "default" a tareas sin él.
import { createStore } from "../apps/server/src/db.ts";

async function main() {
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    const rows = await db.select<{ owner: string; id: string; data: Record<string, unknown> }>(
      "SELECT owner, id, data FROM records WHERE kind = 'tasks'",
    );
    let updated = 0;
    for (const row of rows) {
      if (typeof row.data.tenantId === "string" && row.data.tenantId.length > 0) continue;
      const next = { ...row.data, tenantId: "default" };
      await db.select(
        "UPDATE records SET data = $1::jsonb WHERE owner = $2 AND kind = 'tasks' AND id = $3",
        [JSON.stringify(next), row.owner, row.id],
      );
      updated++;
    }
    console.log(`OK: ${updated} tareas con tenantId añadido`);
  } finally {
    await db.close();
  }
}

void main();