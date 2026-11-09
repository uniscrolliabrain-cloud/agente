// VERTICAL_SLICE_PROVISION_TEST_V1 - el instalador de la campana 08.
//
// Lo que se comprueba:
//   1. `plan` no escribe: ni registry ni instalacion.
//   2. A y B se instalan con seis actores (owner + dos personas por empresa).
//   3. Doble apply y reanudacion tras un fallo no duplican usuarios, no pisan
//      el createdAt del tenant ni las memorias ya sembradas.
//   4. Una clave de operacion no se puede reutilizar para otro tenant.
//   5. `check` informa el estado y deja Google como consentimiento pendiente.

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { VerticalSliceBundle } from "../scripts/lib/vertical-slice-bundle.ts";
import {
  applyProvision,
  checkProvision,
  planProvision,
  readInstallation,
} from "../scripts/provision-vertical-slice.ts";
import { testConfig } from "./helpers/config.ts";

let db: Store;
let directory: string;
let config: Config;
let ownerId: string;

function makeBundle(input: {
  suffix: string;
  displayName: string;
  version?: number;
  operationKey?: string;
  templateId?: string;
  slug?: string;
}): VerticalSliceBundle {
  const { suffix } = input;
  const slug = input.slug ?? `agencia-${suffix}`;
  return {
    schema: "VERTICAL_SLICE_BUNDLE_V1",
    version: input.version ?? 1,
    template: {
      id: input.templateId ?? `tpl_${suffix}aaaaaaaaaaaaaaa`,
      slug,
      name: input.displayName,
    },
    operationKey: input.operationKey ?? `op_${suffix}bbbbbbbbbbbbbbb`,
    zone: "eu-west",
    profile: {
      displayName: input.displayName,
      offer: `Captacion de leads de ${input.displayName}`,
      tone: "Directo, sin jerga",
    },
    persons: [
      { id: `person_${suffix}_fundador`, name: "Fundador", email: `fundador@${slug}.test` },
      { id: `person_${suffix}_ops`, name: "Operaciones", email: `ops@${slug}.test` },
    ],
    memberships: [
      { personId: `person_${suffix}_fundador`, role: "owner" },
      { personId: `person_${suffix}_fundador`, role: "admin" },
      { personId: `person_${suffix}_ops`, role: "member" },
    ],
    automations: [{ id: `auto_${suffix}_prospeccion`, sopId: "prospeccion-diaria" }],
    connections: [
      { id: `conn_${suffix}_google`, provider: "google", kind: "oauth", required: true },
      { id: `conn_${suffix}_pipeline`, provider: "postgres", kind: "dataset" },
    ],
  };
}

const bundleA = makeBundle({ suffix: "a", displayName: "Agencia A" });
const bundleB = makeBundle({ suffix: "b", displayName: "Agencia B" });

function memoryCount(tenantId: string): Promise<number> {
  return db.list(`${tenantId}:${ownerId}`, "memories").then((rows) => rows.length);
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-provision-"));
  db = await createStore({ dataDir: join(directory, "db") });
  config = testConfig({ dataDir: directory });
  const owner = await new UserService(db).create({
    email: "dueno@agencia-a.test",
    name: "Dueno",
    password: randomBytes(24).toString("base64url"),
    role: "admin",
  });
  ownerId = owner.id;
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("plan no escribe nada y detecta la instalacion nueva", async () => {
  const plan = await planProvision(db, bundleA);
  assert.equal(plan.blocked, false);
  assert.equal(plan.fromVersion, null);
  assert.equal(plan.toVersion, 1);
  assert.ok(plan.operations.some((op) => op.id === "tenant:agencia-a" && op.action === "create"));
  assert.equal(await readInstallation(db, bundleA.operationKey), null);
  assert.equal(await db.get("system", "tenant-membership", "agencia-a"), null);
});

test("A se instala completa con tres actores y el owner resuelve a su empresa", async () => {
  const result = await applyProvision(db, config, bundleA, { owner: ownerId });
  assert.equal(result.record.status, "complete");
  assert.equal(result.record.version, 1);
  assert.equal(result.record.actors.length, 3);
  assert.deepEqual(
    result.record.actors.map((actor) => actor.role).sort(),
    ["member", "owner", "owner"],
  );
  assert.equal(result.record.steps.complete, true);

  const registry = await db.get<{ status: string; displayName: string; createdAt: string }>(
    "system",
    "tenant-membership",
    "agencia-a",
  );
  assert.equal(registry?.status, "complete");
  assert.equal(registry?.displayName, "Agencia A");
  assert.ok(registry?.createdAt);
  assert.equal(await new TenantService(db, config).tenantIdFor(ownerId), "agencia-a");
  assert.equal(await memoryCount("agencia-a"), 2);
});

test("doble apply no duplica usuarios, memorias ni mueve el createdAt", async () => {
  const first = await readInstallation(db, bundleA.operationKey);
  const registryBefore = await db.get<{ createdAt: string }>("system", "tenant-membership", "agencia-a");
  const usersAfterFirst = await db.list<{ id: string; email?: string }>("system", "users");
  const firstActors = new Map(first?.actors.map((actor) => [actor.personId, actor.userId]) ?? []);

  const again = await applyProvision(db, config, bundleA, { owner: ownerId });
  assert.equal(again.record.status, "complete");
  assert.equal(again.actorsCreated, 0);
  assert.equal(again.record.actors.length, 3);
  for (const actor of again.record.actors) {
    assert.equal(actor.userId, firstActors.get(actor.personId), `${actor.personId} cambio de usuario`);
  }

  const usersAfterSecond = await db.list<{ id: string; email?: string }>("system", "users");
  assert.equal(usersAfterSecond.length, usersAfterFirst.length);

  const registry = await db.get<{ createdAt: string }>("system", "tenant-membership", "agencia-a");
  assert.ok(registryBefore?.createdAt);
  assert.equal(registry?.createdAt, registryBefore?.createdAt);
  assert.equal(first?.completedAt !== undefined, true);
  assert.equal(await memoryCount("agencia-a"), 2);
});

test("B se instala aparte: seis actores entre las dos empresas", async () => {
  const result = await applyProvision(db, config, bundleB, { owner: ownerId });
  assert.equal(result.record.actors.length, 3);

  const installations = await db.list<{ actors: unknown[] }>("system", "vertical-slice-installations");
  const total = installations.reduce((sum, row) => sum + row.actors.length, 0);
  assert.equal(installations.length, 2);
  assert.equal(total, 6);

  // El owner solo tiene membership en A; los actores de B no ven memorias de A.
  const tenants = new TenantService(db, config);
  const bFundador = result.record.actors.find((actor) => actor.personId === "person_b_fundador");
  assert.ok(bFundador);
  assert.equal(await tenants.tenantIdFor(bFundador.userId), "agencia-b");
  assert.equal(await db.list(`agencia-b:${bFundador.userId}`, "memories").then((rows) => rows.length), 0);
  assert.ok((await memoryCount("agencia-b")) > 0);
});

test("un fallo a mitad deja la instalacion incompleta y se reanuda sin duplicar", async () => {
  const bundleC = makeBundle({ suffix: "c", displayName: "Agencia C" });
  const usersBefore = (await db.list<{ id: string }>("system", "users")).length;

  await assert.rejects(
    () => applyProvision(db, config, bundleC, { owner: ownerId, failAt: "actors" }),
    /FALLO_INYECTADO: actors/,
  );
  const half = await readInstallation(db, bundleC.operationKey);
  assert.equal(half?.status, "incomplete");
  assert.equal(half?.steps.tenant, true);
  assert.equal(half?.steps.complete, undefined);
  assert.equal(half?.actors.length, 3);
  assert.ok(half?.error);

  const registryHalf = await db.get<{ status: string }>("system", "tenant-membership", "agencia-c");
  assert.equal(registryHalf?.status, "incomplete");

  const report = await checkProvision(db, config, bundleC);
  assert.equal(report.ok, false);
  assert.ok(report.problems.some((problem) => problem.includes("incomplete")));

  const usersMid = (await db.list<{ id: string }>("system", "users")).length;
  const resumed = await applyProvision(db, config, bundleC, { owner: ownerId });
  assert.equal(resumed.resumed, true);
  assert.equal(resumed.record.status, "complete");
  assert.equal(resumed.record.error, undefined);
  assert.equal(resumed.record.actors.length, 3);
  assert.equal((await db.list<{ id: string }>("system", "users")).length, usersMid);
  assert.equal(usersMid, usersBefore + 2);

  // El actor creado antes del fallo se reutiliza, no se crea otro.
  const before = half?.actors.map((actor) => actor.userId).sort();
  assert.deepEqual(resumed.record.actors.map((actor) => actor.userId).sort(), before);

  const finalReport = await checkProvision(db, config, bundleC);
  assert.equal(finalReport.ok, true);
  assert.deepEqual(finalReport.pendingConsent, [{ id: "conn_c_google", provider: "google" }]);
});

test("la clave de operacion no se puede reutilizar para otro tenant", async () => {
  const impostor = makeBundle({
    suffix: "d",
    displayName: "Agencia D",
    slug: "agencia-d",
    operationKey: bundleA.operationKey,
    templateId: "tpl_dddddddddddddddd",
  });
  await assert.rejects(
    () => applyProvision(db, config, impostor, { owner: ownerId }),
    /RESERVA_CONFLICTO/,
  );
  assert.equal(await db.get("system", "tenant-membership", "agencia-d"), null);
});

test("un nombre ya reclamado por otra plantilla no se reasigna", async () => {
  const sameName = makeBundle({
    suffix: "e",
    displayName: "Agencia A",
    slug: "agencia-e",
    templateId: "tpl_eeeeeeeeeeeeeeee",
  });
  await assert.rejects(
    () => applyProvision(db, config, sameName, { owner: ownerId }),
    /NOMBRE_DUPLICADO/,
  );
  const plan = await planProvision(db, sameName);
  assert.equal(plan.blocked, true);
  assert.ok(plan.errors.some((error) => error.code === "NOMBRE_DUPLICADO"));
  assert.equal(await db.get("system", "tenant-membership", "agencia-e"), null);
});
