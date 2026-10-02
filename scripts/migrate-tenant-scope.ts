// MIGRATE_TENANT_SCOPE_V1 - reescribe owner -> "default:owner".
import { createStore } from "../apps/server/src/db.ts";

async function main() {
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    const rows = await db.select<{ owner: string }>(
      "SELECT DISTINCT owner FROM records WHERE owner NOT LIKE 'default:%' AND owner NOT LIKE '%:%'",
    );
    console.log(`Owners sin prefijo: ${rows.length}`);
    for (const row of rows) {
      await db.select("UPDATE records SET owner = 'default:' || owner WHERE owner = $1", [row.owner]);
    }
    console.log(`OK: ${rows.length} owners reescritos`);
  } finally {
    await db.close();
  }
}

void main();