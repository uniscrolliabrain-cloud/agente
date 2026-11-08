// VERTICAL_SLICE_POSTGRES_TEST_V1 - campaña 05.
// Ver: docs/vertical-slice-actual/05-perimetro/CAMPAIGN.md
//
// Aserción de cierre: A no lee filas, streams ni enlaces de B; SQL arbitrario
// bloqueado aunque lo pida una tool.
// Aquí se prueba lo que se puede sin staging: que `query_business` NO ejecuta
// SQL contra la base de la app cuando no hay DSN dedicado (cae al dataset del
// owner), y que el SSE filtra por principal y no por cabecera.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { BusinessDataService } from "../apps/server/src/engine/business.ts";
import { notificationVisible } from "../apps/server/src/notifications-stream.ts";

let db: Store;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-slice5-"));
  db = await createStore({ dataDir: join(directory, "db") });
  await db.put("tenant-a:t", "business-records", { id: "lead-1", type: "lead", name: "Uno", cif: "B1" });
  await db.put("tenant-a:t", "business-records", { id: "lead-2", type: "lead", name: "Dos", cif: "B2" });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("sin BUSINESS_DATABASE_URL, query_business no toca la base de la app", async () => {
  // Constructor sin DSN: es exactamente lo que ocurre cuando la variable falta.
  const business = new BusinessDataService(db);
  const result = await business.query("tenant-a:t", {
    source: "postgres",
    query: "SELECT * FROM records WHERE cif = 'B1'",
  });
  // El SQL NO se ejecuta contra la base de la app: se emula sobre las filas
  // del owner de la petición.
  assert.match(result.summary, /Local business dataset/);
  assert.equal(result.rows.length, 1);
  assert.equal((result.rows[0] as { name?: string }).name, "Uno");
});

test("el dataset local no se sale del owner que consulta", async () => {
  await db.put("tenant-b:t", "business-records", { id: "lead-b", type: "lead", name: "Ajeno" });
  const business = new BusinessDataService(db);
  const result = await business.query("tenant-a:t", { source: "postgres", query: "SELECT * FROM records" });
  assert.ok(result.rows.every((row) => (row as { name?: string }).name !== "Ajeno"));
  assert.equal(result.rows.length, 2);
});

test("SQL de escritura sigue rechazado antes de tocar nada", async () => {
  const business = new BusinessDataService(db);
  await assert.rejects(
    () => business.query("tenant-a:t", { source: "postgres", query: "DELETE FROM records" }),
    (error: unknown) => {
      const err = error as { status?: number };
      assert.ok(err.status === 422 || err.status === 400);
      return true;
    },
  );
});

test("el SSE muestra lo propio y oculta lo de otro actor del mismo tenant", () => {
  const viewer = { userId: "user-a", tenantId: "tenant-a" };
  assert.equal(notificationVisible({ id: "n1" }, viewer), true);
  assert.equal(notificationVisible({ id: "n2", assignedTo: "user-a" }, viewer), true);
  assert.equal(notificationVisible({ id: "n3", assignedTo: "user-b" }, viewer), false);
  // Laia supervisa: ve lo asignado a otros dentro de su tenant.
  assert.equal(
    notificationVisible({ id: "n4", assignedTo: "user-b" }, { userId: "laia", tenantId: "tenant-a" }),
    true,
  );
});

test("el tenant manda: una notificación de B no se sirve a A", () => {
  const viewer = { userId: "user-a", tenantId: "tenant-a" };
  assert.equal(notificationVisible({ id: "n5", tenantId: "tenant-b" }, viewer), false);
  // Legacy sin tenantId: se asume el del principal, no el de la fila.
  assert.equal(notificationVisible({ id: "n6", tenantId: undefined }, viewer), true);
  // Ni siquiera la supervisora cruza de tenant.
  assert.equal(
    notificationVisible({ id: "n7", tenantId: "tenant-b" }, { userId: "laia", tenantId: "tenant-a" }),
    false,
  );
});
