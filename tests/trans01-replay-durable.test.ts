// TRANS01_K05_REPLAY_DURABLE_V1 - el replay durable ordena por insercion
// (`updated_at`), no por el timestamp que declara el productor. Una insercion
// tardia con `emittedAt` anterior al cursor ya no desaparece, los timestamps
// iguales se paginan sin perdidas y el fallback sin SQL falla explicitamente.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import type { SystemEvent } from "../apps/server/src/engine/events/types.ts";

let db: Store;
let bus: EventBus;
before(async () => {
  db = await createStore();
  bus = new EventBus(db);
});
after(async () => {
  await db.close();
});

const tenant = "tenant-replay";
const owner = "owner-replay";

async function emit(title: string) {
  return bus.emit(owner, "task.created", { kind: "task", id: title }, { title, kind: "agent" }, {
    tenantId: tenant,
  });
}

async function page(filter: { limit?: number; sinceId?: string }) {
  const seen: SystemEvent[] = [];
  const count = await bus.replayTenant(tenant, filter, (event) => {
    seen.push(event);
  });
  return { seen, count };
}

test("una insercion tardia con emittedAt anterior al cursor se recupera", async () => {
  const first = await emit("A");
  const second = await emit("B");
  const initial = await page({ limit: 10 });
  assert.equal(initial.count, 2);
  const cursor = second.id;

  // Evento insertado DESPUES del cursor, pero con un emittedAt anterior.
  await db.insertIfAbsent(owner, "system-events", {
    id: "late-1",
    schemaVersion: "1.0",
    tenantId: tenant,
    owner,
    type: "task.created",
    emittedAt: new Date(Date.parse("2000-01-01T00:00:00.000Z")).toISOString(),
    source: { kind: "task", id: "late" },
    payload: { title: "late", kind: "agent" },
  } as SystemEvent & { id: string });

  const next = await page({ limit: 10, sinceId: cursor });
  assert.equal(next.count, 1, "la insercion tardia debe entrar despues del cursor");
  assert.equal(next.seen[0].id, "late-1");
  assert.ok(first.id !== second.id);
});

test("timestamps iguales se paginan sin perder ni repetir eventos", async () => {
  const equalTenant = "tenant-replay-equal";
  const at = new Date().toISOString();
  for (let index = 0; index < 6; index += 1) {
    await db.insertIfAbsent(owner, "system-events", {
      id: `equal-${index}`,
      schemaVersion: "1.0",
      tenantId: equalTenant,
      owner,
      type: "task.created",
      emittedAt: at,
      source: { kind: "task", id: `t-${index}` },
      payload: { title: `T${index}`, kind: "agent" },
    } as SystemEvent & { id: string });
  }
  const seen: string[] = [];
  let cursor: string | undefined;
  for (let round = 0; round < 4; round += 1) {
    const batch: SystemEvent[] = [];
    await bus.replayTenant(equalTenant, { limit: 2, ...(cursor ? { sinceId: cursor } : {}) }, (event) => {
      batch.push(event);
    });
    if (batch.length === 0) break;
    seen.push(...batch.map((event) => event.id));
    cursor = batch[batch.length - 1].id;
  }
  assert.equal(new Set(seen).size, 6, "ningun evento se pierde ni se repite");
  assert.deepEqual([...seen].sort(), ["equal-0", "equal-1", "equal-2", "equal-3", "equal-4", "equal-5"]);
});

test("pagina mas de 200 eventos sin perder ninguno", async () => {
  const bigTenant = "tenant-replay-big";
  for (let index = 0; index < 250; index += 1) {
    await bus.emit(owner, "task.created", { kind: "task", id: `big-${index}` }, { title: `B${index}`, kind: "agent" }, {
      tenantId: bigTenant,
    });
  }
  const seen: string[] = [];
  let cursor: string | undefined;
  for (let round = 0; round < 4; round += 1) {
    const batch: SystemEvent[] = [];
    await bus.replayTenant(bigTenant, { limit: 200, ...(cursor ? { sinceId: cursor } : {}) }, (event) => {
      batch.push(event);
    });
    if (batch.length === 0) break;
    seen.push(...batch.map((event) => event.id));
    cursor = batch[batch.length - 1].id;
  }
  assert.equal(seen.length, 250);
  assert.equal(new Set(seen).size, 250);
});

test("un cursor de otro tenant sigue denegando", async () => {
  const foreign = await bus.emit(owner, "task.created", { kind: "task", id: "foreign" }, { title: "F", kind: "agent" }, {
    tenantId: "tenant-replay-foreign",
  });
  await assert.rejects(page({ limit: 5, sinceId: foreign.id }), /EVENT_CURSOR_NOT_FOUND/);
});

test("el fallback sin SQL no finge una recuperacion completa", async () => {
  const fake = {
    get: async () => null,
    insertIfAbsent: async () => null,
    inTransaction: false,
    scanByPrefix: async () => [],
  } as unknown as Store;
  const fallback = new EventBus(
    fake,
    { write: async () => {} } as never,
    { recent: async () => [], aggregate: async () => [] } as never,
  );
  await assert.rejects(
    fallback.replayTenant(tenant, { sinceId: "x" }, () => {}),
    /EVENT_REPLAY_UNSUPPORTED/,
  );
  assert.equal(await fallback.replayTenant(tenant, {}, () => {}), 0);
});
