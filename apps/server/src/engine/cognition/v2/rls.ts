import type { Store } from "../../../db.ts";

/** Explicit migration run by the schema owner; application roles must not own tables. */
export const cognitionTables = [
  "egress_quotas", "egress_receipts", "rag_refs", "import_plans", "import_receipts", "attention", "chat_runs", "lane_locks", "lane_slots", "lane_usage",
  "slow_jobs", "sequences", "events", "cursors", "inbox", "objects", "edges",
  "revocations", "deliveries", "delivery_recoveries", "snapshots",
].map((name) => `cognition_v2_${name}`);

export const voiceTables = ["consents", "locks", "sessions", "turns", "receipts"].map((name) => `cognition_v2_voice_${name}`);
export const cyberTables = ["cursors", "inbox"].map((name) => `cognition_v2_cyber_${name}`);

/** Optional modules must be installed explicitly before including them in this migration. */
export async function installCognitionRls(db: Store, modules: { voice?: boolean; cyber?: boolean } = {}): Promise<void> {
  if (db.backend !== "postgres") throw Error("COGNITION_RLS_REQUIRES_POSTGRES");
  const tables = [...cognitionTables, ...(modules.voice ? voiceTables : []), ...(modules.cyber ? cyberTables : [])];
  await db.transaction(async () => {
    for (const table of tables) {
      // Identifiers come exclusively from the static schema inventory above.
      await db.rawQuery(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      await db.rawQuery(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`);
      await db.rawQuery(`DROP POLICY IF EXISTS cognition_tenant_isolation ON ${table}`);
      await db.rawQuery(`CREATE POLICY cognition_tenant_isolation ON ${table}
        USING (tenant = nullif(current_setting('app.tenant_id', true), ''))
        WITH CHECK (tenant = nullif(current_setting('app.tenant_id', true), ''))`);
    }
  });
}
