// TESTS_KERNEL_PRESENTER_V1 — el Presenter decide el texto del turno.
// Ver: docs/audits/09-kernel-cognitivo/roadmap.md §8.

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
  Presenter,
} from "../apps/server/src/kernel/index.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";

let db: Store;
let kernel: Kernel;
let directory: string;
let ctx: ReturnType<typeof kernelContextSchema.parse>;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-presenter-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    mode: "sample", port: 8787, host: "127.0.0.1",
    publicUrl: "http://localhost:8787", dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
  const tenantService = new TenantService(db, config);
  const storePort = {
    put: async (t: string, k: string, _id: string, d: unknown) => {
      await db.put(t, k, d as { id: string });
    },
    get: async (t: string, k: string, id: string) => db.get(t, k, id),
    list: async (t: string, k: string, limit: number) => {
      const rows = await db.listPaged<unknown>(t, k, { limit });
      return rows.map((r) => ({ id: (r.data as { id: string }).id, data: r.data }));
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
    tenantId: "default", owner: "presenter-test", role: "user", requestId: "r1",
  });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("presentTurn devuelve la response cuando hay una", async () => {
  const turn = await kernel.openTurn(ctx, "test.present");
  await new UserAuthor({ kernel }).write(ctx, { turnId: turn.id, message: "hola" });
  await new FastAuthor({ kernel }).writeResponse(ctx, {
    turnId: turn.id, response: "respuesta del fast", intent: "respond",
  });
  await kernel.closeTurn(ctx, turn.id, "response", "system");
  const presenter = new Presenter({ kernel });
  const result = await presenter.presentTurn(ctx, turn.id);
  assert.ok(result);
  assert.equal(result.presentation.role, "response");
  assert.equal(result.presentation.content, "respuesta del fast");
});

test("presentTurn devuelve undefined si el turno no tiene thoughts", async () => {
  const turn = await kernel.openTurn(ctx, "test.empty");
  const presenter = new Presenter({ kernel });
  const result = await presenter.presentTurn(ctx, turn.id);
  assert.equal(result, undefined);
});

test("PRIORITY: response gana a observation", async () => {
  const turn = await kernel.openTurn(ctx, "test.priority");
  const { SlowAuthor } = await import("../apps/server/src/kernel/index.ts");
  await new SlowAuthor({ kernel }).writeReasoning(ctx, {
    turnId: turn.id, content: "razonamiento interno",
  });
  await new FastAuthor({ kernel }).writeResponse(ctx, {
    turnId: turn.id, response: "respuesta visible",
  });
  await kernel.closeTurn(ctx, turn.id, "response", "system");
  const presenter = new Presenter({ kernel });
  const result = await presenter.presentTurn(ctx, turn.id);
  assert.ok(result);
  assert.equal(result.presentation.role, "response");
});