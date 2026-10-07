// KERNEL_PERSONA_ISOLATION_TEST_V1 - verifica que dos personas con el
// mismo owner tienen turnos aislados por personaId.
//
// Patrón copiado de tests/kernel.test.ts.
// Ver: docs/audits/09-kernel-cognitivo/09z-fundamentos.md

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import {
  Kernel,
  StoreTurnStore,
  StoreAuditStore,
  EnvTenantConfigResolver,
  ServiceTenantResolver,
  kernelContextSchema,
} from "../apps/server/src/kernel/index.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";

let db: Store;
let kernel: Kernel;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-persona-isolation-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
  const tenantService = new TenantService(db, config);
  const storePort = {
    put: async (tenantId: string, kind: string, _id: string, data: unknown) => {
      await db.put(tenantId, kind, data as { id: string });
    },
    get: async (tenantId: string, kind: string, id: string) => db.get(tenantId, kind, id),
    list: async (tenantId: string, kind: string, limit: number) => {
      const rows = await db.listPaged<unknown>(tenantId, kind, { limit });
      return rows.map((row) => ({ id: (row.data as { id: string }).id, data: row.data }));
    },
    transaction: async <T>(fn: (tx: never) => Promise<T>): Promise<T> =>
      db.transaction(() => fn(storePort as never)),
  };
  kernel = new Kernel({
    store: new StoreTurnStore(storePort),
    tenants: new ServiceTenantResolver(tenantService),
    audit: new StoreAuditStore(db),
    config: new EnvTenantConfigResolver(),
  });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("listTurns aísla por personaId con el mismo owner", async () => {
  const ctxLaia = kernelContextSchema.parse({
    tenantId: "default",
    owner: "persona-test-owner",
    role: "user",
    requestId: "req-laia-1",
    personaId: "laia",
  });
  const ctxLorenzo = kernelContextSchema.parse({
    tenantId: "default",
    owner: "persona-test-owner",
    role: "user",
    requestId: "req-lorenzo-1",
    personaId: "lorenzo",
  });

  const turnLaia = await kernel.openTurn(ctxLaia, "persona.test.laia");
  const turnLorenzo = await kernel.openTurn(ctxLorenzo, "persona.test.lorenzo");

  const laiaTurns = await kernel.listTurns(ctxLaia, 50);
  const lorenzoTurns = await kernel.listTurns(ctxLorenzo, 50);

  const laiaIds = laiaTurns.map((t) => t.id);
  const lorenzoIds = lorenzoTurns.map((t) => t.id);

  assert.ok(laiaIds.includes(turnLaia.id), "Laia debe ver su propio turno");
  assert.ok(
    !laiaIds.includes(turnLorenzo.id),
    "Laia NO debe ver el turno de Lorenzo",
  );
  assert.ok(
    lorenzoIds.includes(turnLorenzo.id),
    "Lorenzo debe ver su propio turno",
  );
  assert.ok(
    !lorenzoIds.includes(turnLaia.id),
    "Lorenzo NO debe ver el turno de Laia",
  );
});

test("listTurns sin personaId devuelve todos los turnos del owner", async () => {
  const ctxOwner = kernelContextSchema.parse({
    tenantId: "default",
    owner: "persona-test-owner-2",
    role: "user",
    requestId: "req-owner-1",
  });
  const ctxLaia = kernelContextSchema.parse({
    tenantId: "default",
    owner: "persona-test-owner-2",
    role: "user",
    requestId: "req-laia-2",
    personaId: "laia",
  });

  const turnOwner = await kernel.openTurn(ctxOwner, "owner.test");
  const turnLaia = await kernel.openTurn(ctxLaia, "laia.test");

  const allTurns = await kernel.listTurns(ctxOwner, 50);
  const ids = allTurns.map((t) => t.id);

  assert.ok(ids.includes(turnOwner.id), "Sin personaId debe ver los del owner");
  assert.ok(ids.includes(turnLaia.id), "Sin personaId debe ver también los de laia");
});

test("openTurn persiste personaId en el Turn", async () => {
  const ctx = kernelContextSchema.parse({
    tenantId: "default",
    owner: "persona-test-owner-3",
    role: "user",
    requestId: "req-persist-1",
    personaId: "laia",
  });
  const turn = await kernel.openTurn(ctx, "persist.test");
  assert.equal(turn.personaId, "laia", "El Turn debe llevar personaId");
});