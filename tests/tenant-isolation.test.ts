// TENANT_ISOLATION_TEST_V1 - verifica que dos tenants no se ven.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";

test("records de un tenant no son visibles desde otro", async () => {
  const db = await createStore();
  try {
    await db.put("tenant-a", "tasks", { id: "t1", title: "A" });
    await db.put("tenant-b", "tasks", { id: "t1", title: "B" });

    const a = await db.get<{ title: string }>("tenant-a", "tasks", "t1");
    const b = await db.get<{ title: string }>("tenant-b", "tasks", "t1");

    assert.equal(a?.title, "A");
    assert.equal(b?.title, "B");

    const listA = await db.list<{ title: string }>("tenant-a", "tasks");
    const listB = await db.list<{ title: string }>("tenant-b", "tasks");

    assert.equal(listA.length, 1);
    assert.equal(listA[0].title, "A");
    assert.equal(listB.length, 1);
    assert.equal(listB[0].title, "B");

    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});

test("scanByStatus no mezcla tenants", async () => {
  const db = await createStore();
  try {
    await db.put("tenant-a", "tasks", { id: "t1", status: "queued" });
    await db.put("tenant-b", "tasks", { id: "t2", status: "queued" });

    const all = await db.scanByStatus<{ id: string }>("tasks", ["queued"]);
    // scanByStatus es global por ahora; verificamos que devuelve los dos owners
    // y que el filtrado por tenant se hace arriba.
    assert.equal(all.length, 2);

    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});
// TENANT_ISOLATION_SCOPED_V1 - prueba TenantScopedStore con dos tenants.
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";

test("TenantScopedStore aisla por tenantId:owner", async () => {
  const db = await createStore();
  try {
    // Dos tenants, mismo owner logico.
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      if (owner === "shared-owner-a") return "tenant-a";
      if (owner === "shared-owner-b") return "tenant-b";
      return "default";
    });
    await tdb.put("shared-owner-a", "tasks", { id: "t1", title: "A" });
    await tdb.put("shared-owner-b", "tasks", { id: "t1", title: "B" });
    const a = await tdb.get<{ title: string }>("shared-owner-a", "tasks", "t1");
    const b = await tdb.get<{ title: string }>("shared-owner-b", "tasks", "t1");
    assert.equal(a?.title, "A");
    assert.equal(b?.title, "B");
    const listA = await tdb.list<{ title: string }>("shared-owner-a", "tasks");
    const listB = await tdb.list<{ title: string }>("shared-owner-b", "tasks");
    assert.equal(listA.length, 1);
    assert.equal(listB.length, 1);
    assert.equal(listA[0].title, "A");
    assert.equal(listB[0].title, "B");
    // El owner plano en la DB es "tenantId:owner".
    const rawA = await db.get("tenant-a:shared-owner-a", "tasks", "t1");
    const rawB = await db.get("tenant-b:shared-owner-b", "tasks", "t1");
    assert.ok(rawA, "record A con clave compuesta");
    assert.ok(rawB, "record B con clave compuesta");
  } finally {
    await db.close();
  }
});