// TESTS_KERNEL_V1 — cobertura mínima del kernel cognitivo.
// Sin esto, el kernel era el único módulo core sin tests.
// Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.

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
  UserAuthor,
  FastAuthor,
  Promoter,
} from "../apps/server/src/kernel/index.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";

let db: Store;
let kernel: Kernel;
let directory: string;
let ctx: ReturnType<typeof kernelContextSchema.parse>;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-kernel-"));
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
  ctx = kernelContextSchema.parse({
    tenantId: "default",
    owner: "kernel-test-owner",
    role: "user",
    requestId: "req-1",
  });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("openTurn + appendThought + closeTurn deja el turno cerrado con thoughts", async () => {
  const turn = await kernel.openTurn(ctx, "test.open");
  assert.equal(turn.status, "open");
  assert.equal(turn.thoughtIds.length, 0);

  await new UserAuthor({ kernel }).write(ctx, {
    turnId: turn.id,
    message: "hola",
    messageId: "m1",
  });
  const thoughts = await kernel.thoughtsOf(ctx, turn.id);
  assert.equal(thoughts.length, 1);
  assert.equal(thoughts[0].role, "intent");
  assert.equal(thoughts[0].content, "hola");

  const closed = await kernel.closeTurn(ctx, turn.id, "response", "system");
  assert.equal(closed.status, "closed");
  assert.equal(closed.closeReason, "response");
  assert.equal(closed.closedBy, "system");
});

test("appendThought sobre turno cerrado falla", async () => {
  const turn = await kernel.openTurn(ctx, "test.closed");
  await kernel.closeTurn(ctx, turn.id, "timeout", "system");
  await assert.rejects(
    new UserAuthor({ kernel }).write(ctx, {
      turnId: turn.id,
      message: "tarde",
      messageId: "m2",
    }),
    /Turn is not open/,
  );
});

test("Promoter.promote sobre turno con response produce survivors", async () => {
  const turn = await kernel.openTurn(ctx, "test.promote");
  await new UserAuthor({ kernel }).write(ctx, { turnId: turn.id, message: "ping" });
  await new FastAuthor({ kernel }).writeResponse(ctx, {
    turnId: turn.id,
    response: "pong",
    intent: "respond",
  });
  await kernel.closeTurn(ctx, turn.id, "response", "system");
  const result = await new Promoter({ kernel }).promote(ctx, turn.id);
  assert.ok(result);
  assert.ok(result.totalThoughts >= 2);
  assert.ok(result.survivors.length >= 1);
});

test("StoreAuditStore verifica el hash chain tras varias operaciones", async () => {
  const audit = new StoreAuditStore(db);
  for (let i = 0; i < 5; i++) {
    await audit.append({
      tenantId: "default",
      owner: ctx.owner,
      action: "thought.appended",
      actor: { kind: "system", id: "test" },
      payload: { n: i },
    });
  }
  const valid = await audit.verify("default");
  assert.equal(valid, true, "hash chain debe ser válido");
});

test("openChildTurn enlaza parent y child", async () => {
  const parent = await kernel.openTurn(ctx, "test.parent");
  const child = await kernel.openChildTurn(ctx, parent.id, "test.child");
  assert.equal(child.parentTurnId, parent.id);
  const reloaded = await kernel.deps.store.getTurn("default", parent.id);
  assert.ok(reloaded);
  assert.ok(reloaded.childTurnIds.includes(child.id));
});

test("closeTurnAndChildren cierra también los hijos abiertos", async () => {
  const parent = await kernel.openTurn(ctx, "test.parent2");
  const child = await kernel.openChildTurn(ctx, parent.id, "test.child2");
  await kernel.closeTurn(ctx, parent.id, "timeout", "system");
  const childReloaded = await kernel.deps.store.getTurn("default", child.id);
  assert.equal(childReloaded?.status, "closed", "el hijo debe cerrarse con el padre");
});
