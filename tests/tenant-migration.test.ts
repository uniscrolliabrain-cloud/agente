// TESTS_TENANT_MIGRATION_V1 — la migración owner → "default:owner" no pierde filas.
// Ver scripts/migrate-tenant-scope.ts y docs/audits/_prep/audit-tenant-default.txt.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";

test("migrate-tenant-scope reescribe owners planos sin perder datos", async () => {
  const db = await createStore();
  try {
    // Simulamos estado pre-migración: 10 filas con owner plano.
    for (let i = 0; i < 10; i++) {
      await db.put("legacy-owner", "tasks", { id: `t-${i}`, title: `T${i}` });
    }
    const before = await db.list("legacy-owner", "tasks");
    assert.equal(before.length, 10);

    // Aplicamos la migración manualmente (misma lógica del script).
    const distinct = await db.select<{ owner: string }>(
      "SELECT DISTINCT owner FROM records WHERE owner NOT LIKE 'default:%' AND owner NOT LIKE '%:%'",
    );
    assert.equal(distinct.length, 1);
    assert.equal(distinct[0].owner, "legacy-owner");

    await db.select(
      "UPDATE records SET owner = 'default:' || owner WHERE owner = $1",
      ["legacy-owner"],
    );

    // Verificamos: el owner plano ya no tiene nada, el compuesto tiene todo.
    const afterOld = await db.list("legacy-owner", "tasks");
    const afterNew = await db.list("default:legacy-owner", "tasks");
    assert.equal(afterOld.length, 0, "owner plano queda vacío");
    assert.equal(afterNew.length, 10, "owner compuesto tiene las 10 filas");

    // Verificamos contenido íntegro.
    for (let i = 0; i < 10; i++) {
      const row = await db.get<{ title: string }>(
        "default:legacy-owner", "tasks", `t-${i}`,
      );
      assert.equal(row?.title, `T${i}`);
    }
  } finally {
    await db.close();
  }
});
