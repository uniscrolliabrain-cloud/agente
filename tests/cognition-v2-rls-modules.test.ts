import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { cognitionTables, voiceTables, cyberTables, installCognitionRls } from "../apps/server/src/engine/cognition/v2/rls.ts";
import { installVoiceV2 } from "../apps/server/src/engine/voice-v2/coordinator.ts";
import { installSecurityBridgeV2 } from "../apps/server/src/engine/security-v2/event-relay.ts";

const postgres = process.env.COGNITION_TEST_POSTGRES_URL;
test("restricted Postgres role isolates voice and cyber module records across tenants", { skip: !postgres }, async () => {
  const db = await createStore({ databaseUrl: postgres });
  const role = `cog_${randomUUID().replaceAll("-", "")}`;
  const a = randomUUID(), b = randomUUID();
  try {
    await installCognitionV2(db); await installVoiceV2(db); await installSecurityBridgeV2(db);
    await installCognitionRls(db, { voice: true, cyber: true });
    await db.rawQuery(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOBYPASSRLS`);
    for (const table of [...cognitionTables, ...voiceTables, ...cyberTables]) await db.rawQuery(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${table} TO ${role}`);
    await db.rawQuery("INSERT INTO cognition_v2_voice_sessions(tenant,id,actor,data) VALUES($1,'shared-id','alice','{}'),($2,'shared-id','alice','{}')", [a, b]);
    await db.rawQuery("INSERT INTO cognition_v2_cyber_cursors(tenant,consumer) VALUES($1,'shared'),($2,'shared')", [a, b]);
    await db.transaction(async () => {
      await db.rawQuery(`SET LOCAL ROLE ${role}`);
      for (const table of ["cognition_v2_voice_sessions", "cognition_v2_cyber_cursors"]) assert.equal((await db.rawQuery(`SELECT * FROM ${table}`)).length, 0);
      await db.rawQuery("SELECT set_config('app.tenant_id',$1,true)", [a]);
      for (const table of ["cognition_v2_voice_sessions", "cognition_v2_cyber_cursors"]) {
        assert.deepEqual((await db.rawQuery<{ tenant: string }>(`SELECT tenant FROM ${table}`)).map(row => row.tenant), [a]);
        assert.equal((await db.rawQuery(`DELETE FROM ${table} WHERE tenant=$1 RETURNING tenant`, [b])).length, 0);
      }
    });
    for (const [table, statement] of [
      ["voice", "INSERT INTO cognition_v2_voice_sessions(tenant,id,actor,data) VALUES($1,'forged','alice','{}')"],
      ["cyber", "INSERT INTO cognition_v2_cyber_cursors(tenant,consumer) VALUES($1,'forged')"],
    ]) {
      await assert.rejects(db.transaction(async () => {
        await db.rawQuery(`SET LOCAL ROLE ${role}`);
        await db.rawQuery("SELECT set_config('app.tenant_id',$1,true)", [a]);
        await db.rawQuery(statement, [b]);
      }), /row-level security/, table);
    }
    const policies = await db.rawQuery<{ tablename: string }>("SELECT tablename FROM pg_policies WHERE policyname='cognition_tenant_isolation'");
    assert.deepEqual(policies.map(row => row.tablename).sort(), [...cognitionTables, ...voiceTables, ...cyberTables].sort());
  } finally {
    await db.rawQuery(`DROP OWNED BY ${role}`).catch(() => {});
    await db.rawQuery(`DROP ROLE IF EXISTS ${role}`);
    await db.close();
  }
});
