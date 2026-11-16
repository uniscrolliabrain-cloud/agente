// KERNEL_TURN_INDEX_SEPARATION_V1 - legacy thought indexes lived under
// cognitive-turns and made listTurns/listOpenTurnsForThread throw ZodError.
// They must stay readable for recovery without being returned as turns.

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
} from "../apps/server/src/kernel/index.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";
import { readConfig } from "../apps/server/src/config.ts";

let db: Store;
let kernel: Kernel;
let directory: string;
let ctx: ReturnType<typeof kernelContextSchema.parse>;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-kernel-turn-index-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    ...readConfig(),
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
    owner: "turn-index-owner",
    actorId: "turn-index-owner",
    role: "user",
    requestId: "req-turn-index",
  });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("thought indexes never masquerade as turns and legacy indexes stay inert", async () => {
  const turn = await kernel.openTurn(ctx, "test.index");
  await new UserAuthor({ kernel }).write(ctx, { turnId: turn.id, message: "hola", messageId: "m1" });
  // Simulate pre-fix data: an index row stored under cognitive-turns.
  const legacyId = `${turn.id}:legacy-thought`;
  await db.put("default", "cognitive-turns", {
    id: legacyId, turnId: turn.id, thoughtId: "legacy-thought", tenantId: "default",
  });
  const turns = await kernel.listTurns(ctx, 20);
  assert.deepEqual(turns.map((t) => t.id), [turn.id]);
  const open = await kernel.listOpenTurnsForThread(ctx);
  assert.deepEqual(open.map((t) => t.id), [turn.id]);
  const all = await kernel.listTurnsForOwner(ctx, ctx.owner, 20);
  assert.equal(all.length, 1);
  // The historical row is preserved, not deleted as part of the fix.
  assert.ok(await db.get("default", "cognitive-turns", legacyId));
});
