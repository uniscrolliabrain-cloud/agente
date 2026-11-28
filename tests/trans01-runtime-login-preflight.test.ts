import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
const postgres = process.env.COGNITION_TEST_POSTGRES_URL;

test("normal Store bootstrap rejects a restricted runtime login without schema privileges", {
  skip: !postgres,
}, async () => {
  const admin = await createStore({ databaseUrl: postgres });
  const suffix = randomUUID().replaceAll("-", "");
  const role = `startup_${suffix}`,
    schema = `startup_${suffix}`;
  try {
    await admin.rawQuery(`CREATE SCHEMA ${schema}`);
    await admin.rawQuery(`CREATE TABLE ${schema}.records (LIKE public.records INCLUDING ALL)`);
    await admin.rawQuery(`CREATE ROLE ${role} LOGIN NOSUPERUSER NOBYPASSRLS`);
    await admin.rawQuery(`ALTER ROLE ${role} SET search_path TO ${schema}`);
    await admin.rawQuery(`GRANT USAGE ON SCHEMA ${schema} TO ${role}`);
    await admin.rawQuery(`GRANT SELECT,INSERT,UPDATE,DELETE ON ${schema}.records TO ${role}`);
    const url = new URL(postgres!);
    url.username = role;
    url.password = "";
    const result = await new Promise<{ code: number | null; signal: string | null; output: string; timedOut: boolean }>(
      (resolve, reject) => {
        const child = spawn(
          process.execPath,
          [
            "--import",
            "tsx",
            "--input-type=module",
            "-e",
            `
        import { createStore, createPool } from './apps/server/src/db.ts';
        const pool = createPool(process.env.SYNTHETIC_STORE_URL);
        try {
          const {rows} = await pool.query('SELECT rolcanlogin,rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user');
          if (!rows[0]?.rolcanlogin || rows[0].rolsuper || rows[0].rolbypassrls) throw Error('INVALID_FIXTURE_ROLE');
        } finally { await pool.end(); }
        try { await createStore({databaseUrl: process.env.SYNTHETIC_STORE_URL}); process.exitCode=3; }
        catch(error) { if (error.code !== '42501') process.exitCode=4; else process.stdout.write('EXPECTED_PERMISSION_DENIED\\n'); }
      `,
          ],
          {
            env: { PATH: process.env.PATH, HOME: process.env.HOME, SYNTHETIC_STORE_URL: url.toString() },
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
        let output = "",
          timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          child.kill("SIGKILL");
        }, 7000);
        child.stdout.on("data", (chunk) => {
          output += chunk;
        });
        child.stderr.on("data", (chunk) => {
          output += chunk;
        });
        child.on("error", (error) => {
          clearTimeout(timer);
          reject(error);
        });
        child.on("close", (code, signal) => {
          clearTimeout(timer);
          resolve({ code, signal, output, timedOut });
        });
      },
    );
    assert.match(result.output, /EXPECTED_PERMISSION_DENIED/);
    assert.equal(result.timedOut, false, "failed initialization retained an open pool past the child deadline");
    assert.equal(result.code, 0, result.output);
  } finally {
    await admin.rawQuery(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.rawQuery(`DROP ROLE IF EXISTS ${role}`);
    await admin.close();
  }
});
