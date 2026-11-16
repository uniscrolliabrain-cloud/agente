import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { cognitionTables, installCognitionRls } from "../apps/server/src/engine/cognition/v2/rls.ts";
const url = process.env.COGNITION_TEST_POSTGRES_URL;
test("C01 restricted Postgres role: RLS rejects cross-tenant reads and writes without relying on SQL filters", { skip: !url }, async () => {
  const db = await createStore({ databaseUrl: url });
  const role = `cog_${randomUUID().replaceAll('-', '')}`;
  const tenant = randomUUID(), other = randomUUID();
  try {
    await installCognitionV2(db); await installCognitionRls(db);
    await db.rawQuery(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS`);
    for (const table of cognitionTables) await db.rawQuery(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${table} TO ${role}`);
    await db.rawQuery("INSERT INTO cognition_v2_revocations(tenant,source) VALUES($1,'known-id'),($2,'known-id')", [tenant, other]);
    await db.transaction(async () => {
      await db.rawQuery(`SET LOCAL ROLE ${role}`);
      assert.equal((await db.rawQuery("SELECT * FROM cognition_v2_revocations")).length, 0);
      await db.rawQuery("SELECT set_config('app.tenant_id',$1,true)", [tenant]);
      const rows = await db.rawQuery<{ tenant: string }>("SELECT * FROM cognition_v2_revocations WHERE source='known-id'");
      assert.deepEqual(rows.map((r) => r.tenant), [tenant]);
      assert.equal((await db.rawQuery("DELETE FROM cognition_v2_revocations WHERE tenant=$1 RETURNING *", [other])).length, 0);
    });
    await assert.rejects(db.transaction(async () => {
      await db.rawQuery(`SET LOCAL ROLE ${role}`);
      await db.rawQuery("SELECT set_config('app.tenant_id',$1,true)", [tenant]);
      await db.rawQuery("INSERT INTO cognition_v2_revocations(tenant,source) VALUES($1,'forged')", [other]);
    }), /row-level security/);
    await db.transaction(async () => {
      await db.rawQuery(`SET LOCAL ROLE ${role}`);
      assert.equal((await db.rawQuery("SELECT * FROM cognition_v2_revocations")).length, 0, "transaction-local scope must not leak");
    });
    const policies = await db.rawQuery<{ tablename: string }>("SELECT tablename FROM pg_policies WHERE policyname='cognition_tenant_isolation' AND tablename=ANY($1::text[])", [cognitionTables]);
    assert.deepEqual(policies.map((p) => p.tablename).sort(), [...cognitionTables].sort());
  } finally {
    await db.rawQuery(`DROP OWNED BY ${role}`).catch(() => {});
    await db.rawQuery(`DROP ROLE IF EXISTS ${role}`);
    await db.close();
  }
});
