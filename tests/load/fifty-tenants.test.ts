// TESTS_FIFTY_TENANTS_V1 — 50 tenants escribiendo en paralelo.
// El miniaudit 01 lo pide: "Sin test de 50 tenants concurrentes".
// El miniaudit 07 lo pide: "Sin tests de fugas con N tenants".
// Este test hace escrituras concurrentes (no secuenciales) y verifica
// que cada tenant ve solo lo suyo.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../apps/server/src/db-tenant.ts";

const TENANTS = 50;
const KEYS_PER_TENANT = 20;

test(`${TENANTS} tenants concurrentes con aislamiento verificado`, { timeout: 60000 }, async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      const idx = owner.indexOf("-owner-");
      return idx > 0 ? owner.slice(0, idx) : "default";
    });

    // Fase 1: 50 tenants × 20 keys en paralelo.
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
    assert.equal(
      writes.length,
      TENANTS * KEYS_PER_TENANT,
      "deben escribirse 1000 registros",
    );

    // Fase 2: cada tenant lee solo lo suyo, en paralelo.
    const reads = await Promise.all(
      Array.from({ length: TENANTS }, (_, t) =>
        tdb.list<{ id: string; title: string }>(`tenant-${t}-owner-${t}`, "tasks"),
      ),
    );
    for (let t = 0; t < TENANTS; t++) {
      assert.equal(reads[t].length, KEYS_PER_TENANT, `tenant-${t} ve ${KEYS_PER_TENANT}`);
      for (const row of reads[t]) {
        assert.match(row.title, new RegExp(`^T${t}-K`), `tenant-${t} no ve datos de otro`);
      }
    }

    // Fase 3: intento de fuga — leer con un owner falso.
    const leak = await tdb.get<{ title: string }>(
      "tenant-5-owner-5",
      "tasks",
      "task-7-0", // task-7-0 pertenece a tenant-7
    );
    assert.equal(leak, null, "tenant-5 no puede leer task-7-0");
  } finally {
    await db.close();
  }
});
