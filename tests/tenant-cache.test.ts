// TESTS_TENANT_CACHE_V1 — cache de TenantService con invalidación.
// Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";

function makeConfig(): Config {
  return {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: "/tmp/test",
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
}

test("cache devuelve el mismo resultado en menos de TTL", async () => {
  const db = await createStore();
  try {
    const ts = new TenantService(db, makeConfig());
    const first = await ts.tenantIdFor("owner-a");
    const second = await ts.tenantIdFor("owner-a");
    assert.equal(first, second);
    assert.equal(ts.cacheSize(), 1);
  } finally {
    await db.close();
  }
});

test("invalidateAll vacía la cache", async () => {
  const db = await createStore();
  try {
    const ts = new TenantService(db, makeConfig());
    await ts.tenantIdFor("owner-a");
    await ts.tenantIdFor("owner-b");
    assert.equal(ts.cacheSize(), 2);
    ts.invalidateAll();
    assert.equal(ts.cacheSize(), 0);
  } finally {
    await db.close();
  }
});

test("setMembership actualiza la cache inmediatamente", async () => {
  const db = await createStore();
  try {
    const ts = new TenantService(db, makeConfig());
    await ts.tenantIdFor("owner-x");
    await ts.setMembership("owner-x", "tenant-x");
    const resolved = await ts.tenantIdFor("owner-x");
    assert.equal(resolved, "tenant-x");
  } finally {
    await db.close();
  }
});
