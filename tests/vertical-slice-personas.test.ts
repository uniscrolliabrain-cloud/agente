// VERTICAL_SLICE_PERSONAS_TEST_V1 - personas por empresa (campana 09).
//
// Cierre de campana:
//   - la imagen/plantilla resuelve cuatro instancias para A y B;
//   - Marcos deshabilitado no puede iniciar trabajo;
//   - una persona sin humano de la empresa o sin la SOP asignada tampoco;
//   - encender Marcos es dato (activacion), no codigo.

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { loadPersonaFile } from "../apps/server/src/engine/agents/personas/loader.ts";
import { PersonaRegistry } from "../apps/server/src/engine/agents/personas/registry.ts";
import { loadInstalledPersonas } from "../apps/server/src/kernel/personas-bootstrap.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { VerticalSliceBundle } from "../scripts/lib/vertical-slice-bundle.ts";
import { applyProvision } from "../scripts/provision-vertical-slice.ts";
import { testConfig } from "./helpers/config.ts";

let db: Store;
let directory: string;
let config: Config;
let ownerId: string;
let fundadorA: string;
let fundadorB: string;

function makeBundle(suffix: string, displayName: string): VerticalSliceBundle {
  const slug = `agencia-${suffix}`;
  return {
    schema: "VERTICAL_SLICE_BUNDLE_V1",
    version: 1,
    template: { id: `tpl_${suffix}zzzzzzzzzzzzzzz`, slug, name: displayName },
    operationKey: `op_${suffix}yyyyyyyyyyyyyyy`,
    zone: "eu-west",
    profile: { displayName, offer: `Oferta de ${displayName}`, tone: "Directo" },
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
    connections: [{ id: `conn_${suffix}_google`, provider: "google", kind: "oauth" }],
  };
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-personas-"));
  db = await createStore({ dataDir: join(directory, "db") });
  config = testConfig({ dataDir: directory });
  const owner = await new UserService(db).create({
    email: "dueno@personas.test",
    name: "Dueno",
    password: randomBytes(24).toString("base64url"),
    role: "admin",
  });
  ownerId = owner.id;
  const a = await applyProvision(db, config, makeBundle("a", "Agencia A"), { owner: ownerId });
  const b = await applyProvision(db, config, makeBundle("b", "Agencia B"), { owner: ownerId });
  fundadorA = a.record.actors.find((actor) => actor.personId === "person_a_fundador")!.userId;
  fundadorB = b.record.actors.find((actor) => actor.personId === "person_b_fundador")!.userId;
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("la plantilla trae Laia encendida y Marcos apagado, y ambas validan", async () => {
  const base = fileURLToPath(new URL("../clientes/_template/personas/", import.meta.url));
  const laia = await loadPersonaFile(join(base, "laia", "persona.json"));
  const marcos = await loadPersonaFile(join(base, "marcos", "persona.json"));
  assert.ok(laia, "laia de plantilla debe validar");
  assert.ok(marcos, "marcos de plantilla debe validar");
  assert.equal(laia.metadata.enabled, true);
  assert.equal(marcos.metadata.enabled, false);
  assert.equal(marcos.reportsTo, "laia");
  assert.equal(marcos.capabilities.crossTenant, false);
});

test("el alta deja dos instancias por empresa: cuatro en total", async () => {
  const rows = await db.list<{ tenantId: string; personaId: string }>("system", "persona-instances");
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map((row) => row.tenantId).sort(), [
    "agencia-a",
    "agencia-a",
    "agencia-b",
    "agencia-b",
  ]);
});

test("la registry del chat resuelve cuatro instancias con su activacion", async () => {
  const registry = new PersonaRegistry();
  const report = await loadInstalledPersonas(registry, db);
  assert.equal(report.errors.length, 0);
  assert.equal(report.loaded, 4);

  assert.deepEqual(registry.list("agencia-a").map(({ persona }) => persona.id).sort(), [
    "laia",
    "marcos",
  ]);
  assert.deepEqual(registry.list("agencia-b").map(({ persona }) => persona.id).sort(), [
    "laia",
    "marcos",
  ]);

  const laiaA = registry.activation("agencia-a", "laia");
  assert.ok(laiaA);
  assert.equal(laiaA.enabled, true);
  assert.deepEqual(laiaA.sopIds, ["prospeccion-diaria"]);
  assert.equal(laiaA.owners.length, 3);
  assert.ok(laiaA.owners.includes(fundadorA));
  assert.ok(!laiaA.owners.includes(fundadorB));

  // Aislamiento: cada empresa solo ve sus propias instancias.
  assert.equal(registry.activation("agencia-b", "laia")!.enabled, true);
  assert.ok(registry.activation("agencia-b", "laia")!.owners.includes(fundadorB));
});

test("Laia puede empezar trabajo; Marcos deshabilitado no", async () => {
  const registry = new PersonaRegistry();
  await loadInstalledPersonas(registry, db);

  assert.deepEqual(
    registry.canStartWork("agencia-a", "laia", { owner: fundadorA, sopId: "prospeccion-diaria" }),
    { allowed: true },
  );
  assert.deepEqual(
    registry.canStartWork("agencia-a", "marcos", { owner: fundadorA, sopId: "prospeccion-diaria" }),
    { allowed: false, reason: "persona_deshabilitada" },
  );
});

test("sin humano de la empresa o sin la SOP asignada tampoco se trabaja", async () => {
  const registry = new PersonaRegistry();
  await loadInstalledPersonas(registry, db);

  assert.deepEqual(registry.canStartWork("agencia-b", "laia", { owner: fundadorA }), {
    allowed: false,
    reason: "sin_humano",
  });
  assert.deepEqual(
    registry.canStartWork("agencia-a", "laia", { owner: fundadorA, sopId: "sop-inexistente" }),
    { allowed: false, reason: "sin_sop" },
  );
  assert.deepEqual(registry.canStartWork("agencia-a", "persona-fantasma", { owner: fundadorA }), {
    allowed: false,
    reason: "persona_desconocida",
  });
  assert.deepEqual(registry.canStartWork("agencia-z", "laia", { owner: fundadorA }), {
    allowed: false,
    reason: "persona_desconocida",
  });
});

test("encender Marcos es un dato de la empresa, no un cambio de codigo", async () => {
  const row = await db.get<{
    id: string;
    activation: { enabled: boolean; sopIds: string[]; owners: string[] };
  }>("system", "persona-instances", "agencia-a:marcos");
  assert.ok(row);
  await db.put("system", "persona-instances", {
    ...row,
    activation: { ...row.activation, enabled: true },
  });

  const registry = new PersonaRegistry();
  await loadInstalledPersonas(registry, db, ["agencia-a"]);
  assert.deepEqual(
    registry.canStartWork("agencia-a", "marcos", {
      owner: fundadorA,
      sopId: "prospeccion-diaria",
    }),
    { allowed: true },
  );
  // La otra empresa sigue con su propia copia apagada.
  const untouched = new PersonaRegistry();
  await loadInstalledPersonas(untouched, db, ["agencia-b"]);
  assert.deepEqual(untouched.canStartWork("agencia-b", "marcos", { owner: fundadorB }), {
    allowed: false,
    reason: "persona_deshabilitada",
  });
});
