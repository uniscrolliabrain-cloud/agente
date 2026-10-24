// TESTS_TENANT_ISOLATION_EXTENDED_V1 â€” 50 tenants con verificaciÃ³n de fugas.
// Ver: docs/audits/07-aislamiento-multi-tenant/roadmap.md Â§8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";

const TENANTS = 50;
const KEYS_PER_TENANT = 20;

test(`${TENANTS} tenants con lectura cruzada imposible`, { timeout: 60000 }, async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      const idx = owner.indexOf("-owner-");
      return idx > 0 ? owner.slice(0, idx) : "default";
    });

    // Fase 1: 1000 escrituras concurrentes.
    const writes = [];
    for (let t = 0; t < TENANTS; t++) {
      const owner = `tenant-${t}-owner-${t}`;
      for (let k = 0; k < KEYS_PER_TENANT; k++) {
        writes.push(
          tdb.put(owner, "tasks", {
            id: `task-${t}-${k}`,
            tenantId: `tenant-${t}`,
            title: `T${t}-K${k}`,
          }),
        );
      }
    }
    await Promise.all(writes);

    // Fase 2: lectura cruzada â€” tenant t lee la task de tenant s â‰  t.
    let leaks = 0;
    for (let t = 0; t < TENANTS; t++) {
      const owner = `tenant-${t}-owner-${t}`;
      for (let s = 0; s < TENANTS; s++) {
        if (s === t) continue;
        const foreign = await tdb.get(owner, "tasks", `task-${s}-0`);
        if (foreign) leaks++;
      }
    }
    assert.equal(leaks, 0, `${leaks} fugas detectadas`);

    // Fase 3: list por tenant devuelve solo lo suyo.
    for (let t = 0; t < TENANTS; t++) {
      const owner = `tenant-${t}-owner-${t}`;
      const list = await tdb.list<{ title: string }>(owner, "tasks");
      assert.equal(list.length, KEYS_PER_TENANT);
      for (const row of list) {
        assert.match(row.title, new RegExp(`^T${t}-K`));
      }
    }
  } finally {
    await db.close();
  }
});

test("scanByPrefix filtra correctamente por tenant", async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      const idx = owner.indexOf("-owner-");
      return idx > 0 ? owner.slice(0, idx) : "default";
    });
    await tdb.put("tenant-a-owner-1", "tasks", { id: "a1", tenantId: "tenant-a" });
    await tdb.put("tenant-a-owner-2", "tasks", { id: "a2", tenantId: "tenant-a" });
    await tdb.put("tenant-b-owner-1", "tasks", { id: "b1", tenantId: "tenant-b" });

    const fromA = await tdb.scanByPrefix<{ id: string }>("tasks", "tenant-a", 100);
    assert.equal(fromA.length, 2);
    assert.ok(fromA.every((r) => (r.value as { tenantId?: string }).tenantId === "tenant-a"));

    const fromB = await tdb.scanByPrefix<{ id: string }>("tasks", "tenant-b", 100);
    assert.equal(fromB.length, 1);
    assert.equal((fromB[0].value as { tenantId?: string }).tenantId, "tenant-b");
  } finally {
    await db.close();
  }
});

test("scanByOwnerPrefix rechaza prefijos maliciosos", async () => {
  const db = await createStore();
  try {
    await assert.rejects(
      db.scanByOwnerPrefix("tasks", "tenant'; DROP TABLE--", 10),
      /Invalid owner prefix/i,
    );
  } finally {
    await db.close();
  }
});
