import type { Store } from "../../../db.ts";

/** Explicit migration run by the schema owner; application roles must not own tables. */
export const cognitionTables = [
  "egress_quotas", "egress_receipts", "rag_refs", "import_plans", "import_receipts", "attention", "chat_runs", "lane_locks", "lane_slots", "lane_usage",
  "slow_jobs", "sequences", "events", "cursors", "inbox", "objects", "edges",
  "revocations", "deliveries", "delivery_recoveries", "snapshots",
].map((name) => `cognition_v2_${name}`);

export async function installCognitionRls(db: Store): Promise<void> {
  if (db.backend !== "postgres") throw Error("COGNITION_RLS_REQUIRES_POSTGRES");
  await db.transaction(async () => {
    for (const table of cognitionTables) {
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
