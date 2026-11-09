// TENANT_MIGRATION_TEST_V1 - campaña 04.
// Ver: docs/vertical-slice-actual/04-datos/CAMPAIGN.md
//
// Aserción de cierre: dos miembros comparten hechos de A; privado queda privado
// y B con IDs iguales queda aislada. Se prueba en las dos direcciones:
// composición de claves (mismo id de actor en A y B no colisiona) y migración
// (sólo se toca lo atribuible; lo dudoso va a revisión).

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import {
  applyRecordMigration,
  assertRecordAccess,
  parseRecordOwner,
  planRecordMigration,
  recordOwner,
  scopeOfKind,
  type MigrationRow,
} from "../apps/server/src/engine/tenant-records.ts";

test("cada kind tiene scope y la plataforma no se confunde con la empresa", () => {
  assert.equal(scopeOfKind("tenant-membership"), "platform");
  assert.equal(scopeOfKind("sops"), "tenant");
  assert.equal(scopeOfKind("memories"), "actor");
  assert.equal(scopeOfKind("rag-chunks"), "connection");
  assert.equal(scopeOfKind("actions"), "execution");
  // Un kind nuevo no se migra a ciegas: hereda tenant y sale como clasificable.
  assert.equal(scopeOfKind("kind-nuevo"), "tenant");
});

test("el mismo actor en dos empresas no comparte clave", () => {
  const inA = recordOwner({ scope: "actor", tenantId: "tenant-a", actorId: "user-1" });
  const inB = recordOwner({ scope: "actor", tenantId: "tenant-b", actorId: "user-1" });
  assert.notEqual(inA, inB);
  assert.deepEqual(parseRecordOwner(inA), { scope: "actor", tenantId: "tenant-a", actorId: "user-1" });
  assert.deepEqual(parseRecordOwner(inB), { scope: "actor", tenantId: "tenant-b", actorId: "user-1" });
});

test("las claves de empresa comparten owner entre miembros", () => {
  const shared = recordOwner({ scope: "tenant", tenantId: "tenant-a" });
  const a = parseRecordOwner(shared);
  const b = parseRecordOwner(shared);
  assert.deepEqual(a, b);
  assert.equal(a.tenantId, "tenant-a");
  assert.equal(a.scope, "tenant");
});

test("plataforma exige admin y el tenant ajeno se rechaza", () => {
  assert.throws(
    () => assertRecordAccess({ kind: "tenant-membership", owner: "system", tenantId: "tenant-a" }),
    (error: unknown) => {
      const err = error as { status?: number; fields?: Record<string, string> };
      assert.equal(err.status, 403);
      assert.equal(err.fields?.code, "RECORD_SCOPE_DENIED");
      return true;
    },
  );
  assert.doesNotThrow(() =>
    assertRecordAccess({
      kind: "tenant-membership",
      owner: "system",
      tenantId: "tenant-a",
      isPlatformAdmin: true,
    }),
  );
  assert.throws(() =>
    assertRecordAccess({
      kind: "memories",
      owner: recordOwner({ scope: "actor", tenantId: "tenant-b", actorId: "user-1" }),
      tenantId: "tenant-a",
      actorId: "user-1",
    }),
  );
  assert.throws(() =>
    assertRecordAccess({
      kind: "memories",
      owner: recordOwner({ scope: "actor", tenantId: "tenant-a", actorId: "user-2" }),
      tenantId: "tenant-a",
      actorId: "user-1",
    }),
  );
  // Compartido de la empresa: dos actores distintos, mismo acceso.
  const shared = recordOwner({ scope: "tenant", tenantId: "tenant-a" });
  for (const actorId of ["user-1", "user-2"]) {
    assert.doesNotThrow(() =>
      assertRecordAccess({ kind: "sops", owner: shared, tenantId: "tenant-a", actorId }),
    );
  }
});

test("el plan sólo propone filas atribuibles y manda el resto a revisión", () => {
  const rows: MigrationRow[] = [
    { owner: "tenant-a:t", kind: "sops", id: "sop-1", value: { id: "sop-1" } },
    {
      owner: recordOwner({ scope: "actor", tenantId: "tenant-a", actorId: "user-1" }),
      kind: "memories",
      id: "mem-1",
      value: { id: "mem-1", tenantId: "tenant-a" },
    },
    { owner: "tenant-a:user-2", kind: "memories", id: "mem-2", value: { id: "mem-2" } },
    { owner: "system", kind: "tenant-membership", id: "tenant-a", value: { id: "tenant-a" } },
    { owner: "huerfano", kind: "memories", id: "mem-3", value: { id: "mem-3" } },
    { owner: "tenant-a:user-2", kind: "memories", id: "mem-2", value: { id: "mem-2" } },
  ];
  const plan = planRecordMigration(rows);
  assert.equal(plan.total, 6);
  assert.equal(plan.byScope.platform, 1);
  assert.equal(plan.byScope.tenant, 1);
  assert.equal(plan.byScope.actor, 3);
  assert.equal(plan.byScope.unclassified, 1);
  // sop-1 no declara tenantId; mem-2 tampoco. mem-1 ya lo declara.
  assert.deepEqual(
    plan.toUpdate.map((row) => row.id).sort(),
    ["mem-2", "sop-1"],
  );
  // huérfano + duplicado exacto.
  assert.equal(plan.review.length, 2);
  assert.ok(plan.review.some((row) => row.id === "mem-3" && row.reason.includes("sin tenant")));
  assert.ok(plan.review.some((row) => row.id === "mem-2" && row.reason.includes("duplicado")));
});

let db: Store;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-migrate-"));
  db = await createStore({ dataDir: join(directory, "db") });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("aplicar escribe tenantId, deja diario y no toca lo dudoso", async () => {
  await db.put("tenant-a:t", "sops", { id: "sop-mig", name: "SOP" });
  await db.put("tenant-b:t", "sops", { id: "sop-mig", name: "SOP de B" });
  await db.put("huerfano", "memories", { id: "mem-huerfana", text: "sin dueño" });

  const rows: MigrationRow[] = [];
  for (const kind of ["sops", "memories"]) {
    for (const row of await db.scan<Record<string, unknown>>(kind, 100)) {
      rows.push({ owner: row.owner, kind, id: String(row.value.id), value: row.value });
    }
  }
  const plan = planRecordMigration(rows);
  const journal: Array<Record<string, unknown>> = [];
  const result = await applyRecordMigration(db, plan, {
    journal: async (entry) => {
      journal.push(entry);
    },
  });

  assert.equal(result.updated, 2);
  assert.equal(journal.filter((entry) => entry.event === "tenant-id").length, 2);

  const a = await db.get<Record<string, unknown>>("tenant-a:t", "sops", "sop-mig");
  const b = await db.get<Record<string, unknown>>("tenant-b:t", "sops", "sop-mig");
  assert.equal(a?.tenantId, "tenant-a");
  assert.equal(b?.tenantId, "tenant-b");
  assert.equal(b?.name, "SOP de B");

  // La fila huérfana sigue intacta y sin tenantId inventado.
  const orphan = await db.get<Record<string, unknown>>("huerfano", "memories", "mem-huerfana");
  assert.equal(orphan?.tenantId, undefined);
});

// MIGRATE_TENANT_SCOPE_LEGACY_V1 - cobertura heredada, conservada al añadir
// la de la campaña 04 (no se reescribe: se amplía).
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
