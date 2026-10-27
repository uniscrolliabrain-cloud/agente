// AGENCY_BOOTSTRAP_TEST_V1 - el tenant de la agencia existe, esta aislado y el
// bootstrap se puede repetir sin duplicar nada.
//
// Lo que se comprueba:
//   1. El registro de tenants usa id=tenantId (varios tenants caben).
//   2. El owner resuelve al tenant de la agencia, no a "default".
//   3. El perfil se escribe bajo `<tenant>:<owner>` y no en "default".
//   4. Ejecutarlo dos veces no crea memorias nuevas.
//   5. Los datos de otro tenant no aparecen.

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import { bootstrapAgency, type AgencyProfile } from "../scripts/lib/agency-bootstrap.ts";
import { agencySops } from "../clientes/agntia/sops.ts";
import { testConfig } from "./helpers/config.ts";

let db: Store;
let directory: string;
let config: ReturnType<typeof testConfig>;
let ownerId: string;
let profile: AgencyProfile;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-agency-"));
  db = await createStore({ dataDir: join(directory, "db") });
  config = testConfig({ dataDir: directory });
  profile = JSON.parse(
    await readFile(
      join(dirname(fileURLToPath(import.meta.url)), "..", "clientes", "agntia", "agency.json"),
      "utf8",
    ),
  ) as AgencyProfile;
  const user = await new UserService(db).create({
    email: "fundador@agntia.local",
    name: "Fundador",
    password: "contrasena-larga-1",
    role: "admin",
  });
  ownerId = user.id;
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("las SOPs de la agencia son ejecutables: schema, allowlist y capacidades", () => {
  assert.ok(agencySops.length >= 8);
  for (const sop of agencySops) {
    assert.ok(sop.allowedTools.length > 0, `${sop.id} sin allowedTools`);
    for (const step of sop.steps) {
      assert.ok(
        sop.allowedTools.includes(step.tool),
        `${sop.id}: el paso ${step.id} usa ${step.tool} y no esta en allowedTools`,
      );
    }
    // Fase 1 corre con COMPUTER_ENABLED=false: nada de sandbox Python.
    assert.ok(
      !sop.steps.some((step) => step.tool === "computer_command"),
      `${sop.id} depende del computer, que esta apagado en el despliegue`,
    );
  }
});

test("el bootstrap crea el tenant, su perfil, sus SOPs y la membership del owner", async () => {
  const result = await bootstrapAgency(db, config, ownerId, profile, { sops: agencySops });
  assert.equal(result.tenantId, "agntia");
  assert.ok(result.actions.some((a) => a.kind === "tenant-registry" && a.action === "created"));
  assert.ok(result.actions.some((a) => a.kind === "memory" && a.action === "created"));
  assert.equal(result.actions.filter((a) => a.kind === "sop" && a.action === "created").length, agencySops.length);

  const registry = await db.get<{ id: string; tenantId: string; displayName: string }>(
    "system",
    "tenant-membership",
    "agntia",
  );
  assert.equal(registry?.tenantId, "agntia");
  assert.equal(registry?.displayName, "Agntia Pro");

  // El resolver del kernel ve el tenant de la agencia, no "default".
  const tenants = new TenantService(db, config);
  const resolution = await tenants.resolve(ownerId);
  assert.equal(resolution.tenantId, "agntia");
  assert.equal(resolution.source, "database");
  const memberships = await tenants.membershipsFor(ownerId);
  assert.deepEqual(
    memberships.map((m) => [m.tenantId, m.role]),
    [["agntia", "owner"]],
  );

  // El perfil vive en el espacio del tenant.
  const memories = await db.list<{ id: string; text: string }>(`agntia:${ownerId}`, "memories");
  const ids = memories.map((m) => m.id).sort();
  assert.deepEqual(
    ids,
    [
      "agencia-dominio",
      "agencia-icp",
      "agencia-limites",
      "agencia-oferta",
      "agencia-precios",
      "agencia-tono",
    ].sort(),
  );
  assert.ok(memories.some((m) => m.text.includes("490 EUR/mes")));
  assert.deepEqual(await db.list(`default:${ownerId}`, "memories"), []);

  // Schema de negocio del tenant, con la entidad de discovery calls.
  const schema = await db.get<{ entities: Array<{ type: string }> }>(
    `agntia:${ownerId}`,
    "business-schemas",
    "default",
  );
  assert.ok(schema?.entities.some((entity) => entity.type === "call"));

  const sops = await db.list<{ id: string }>(`agntia:${ownerId}`, "sops");
  assert.deepEqual(
    sops.map((s) => s.id).sort(),
    agencySops.map((s) => s.id).sort(),
  );
});

test("el bootstrap es idempotente: repetirlo no duplica memorias ni SOPs", async () => {
  const before = await db.list(`agntia:${ownerId}`, "memories");
  const sopsBefore = await db.list(`agntia:${ownerId}`, "sops");
  const result = await bootstrapAgency(db, config, ownerId, profile, { sops: agencySops });
  const afterRun = await db.list(`agntia:${ownerId}`, "memories");
  assert.equal(afterRun.length, before.length);
  assert.equal((await db.list(`agntia:${ownerId}`, "sops")).length, sopsBefore.length);
  assert.ok(result.actions.filter((a) => a.kind === "memory").every((a) => a.action === "skipped"));
  assert.ok(result.actions.filter((a) => a.kind === "sop").every((a) => a.action === "skipped"));
});

test("otro tenant no ve el perfil de la agencia", async () => {
  const other = await new UserService(db).create({
    email: "otro@cliente.local",
    name: "Otro",
    password: "contrasena-larga-2",
    role: "admin",
  });
  const result = await bootstrapAgency(db, config, other.id, {
    ...profile,
    tenantId: "otro-cliente",
    displayName: "Otro Cliente",
  });
  assert.equal(result.tenantId, "otro-cliente");
  const otherMemories = await db.list<{ text: string }>(`otro-cliente:${other.id}`, "memories");
  assert.ok(otherMemories.length > 0);
  // Y no ha tocado el espacio de la agencia: su copia es otra fila.
  const agencyMemories = await db.list(`agntia:${ownerId}`, "memories");
  assert.equal(agencyMemories.length, 6);
  const agencyProfile = await db.get<{ text: string }>(`agntia:${ownerId}`, "memories", "agencia-oferta");
  const otherProfile = await db.get<{ text: string }>(
    `otro-cliente:${other.id}`,
    "memories",
    "agencia-oferta",
  );
  assert.ok(agencyProfile && otherProfile);
  // Son filas distintas aunque compartan id: la clave lleva el tenant delante.
  assert.equal(agencyProfile.text, otherProfile.text);
  assert.equal((await db.list(`default:${other.id}`, "memories")).length, 0);
});
