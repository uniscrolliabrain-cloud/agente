// TRANS01_E02_EVENT_PAGE_V1 - replay con cursor durable: filtros y cursor se
// aplican en el store antes del limite. Antes, una ventana inicial podia
// agotarse con eventos anteriores al cursor y la recuperacion quedaba vacia.
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

const owner = "owner-page";
const tenant = "tenant-page";

async function seed(count: number) {
  const ids: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const result = await bus.emit(owner, "task.created", { kind: "task", id: `t-${index}` }, { title: `T${index}`, kind: "agent" }, { tenantId: tenant });
    ids.push(result.id);
  }
  return ids;
}

async function page(filter: { limit?: number; sinceId?: string; type?: "task.created" | "action.proposed" }) {
  const seen: SystemEvent[] = [];
  const count = await bus.replayTenant(tenant, filter, (event) => {
    seen.push(event);
  });
  return { seen, count };
}

test("el cursor recupera todos los eventos aunque la primera ventana se agote", async () => {
  const ids = await seed(250);
  const first = await page({ limit: 100 });
  assert.equal(first.count, 100);
  assert.equal(first.seen[0].id, ids[0]);
  const second = await page({ limit: 100, sinceId: first.seen[99].id });
  assert.equal(second.count, 100);
  assert.equal(second.seen[0].id, ids[100]);
  const third = await page({ limit: 100, sinceId: second.seen[99].id });
  assert.equal(third.count, 50);
  assert.equal(third.seen[49].id, ids[249]);
  const all = new Set([...first.seen, ...second.seen, ...third.seen].map((event) => event.id));
  assert.equal(all.size, 250, "ningun evento se repite ni se pierde");
});

test("el filtro de tipo se aplica antes del limite", async () => {
  const tenantMix = "tenant-page-mix";
  const other = "owner-page-mix";
  for (let index = 0; index < 40; index += 1) {
    if (index % 4 === 0) {
      await bus.emit(other, "action.proposed", { kind: "action", id: `a-${index}` }, { title: `A${index}`, kind: "email.send" }, { tenantId: tenantMix });
    } else {
      await bus.emit(other, "task.created", { kind: "task", id: `t-${index}` }, { title: `T${index}`, kind: "agent" }, { tenantId: tenantMix });
    }
  }
  const seen: SystemEvent[] = [];
  const count = await bus.replayTenant(tenantMix, { type: "action.proposed", limit: 5 }, (event) => {
    seen.push(event);
  });
  assert.equal(count, 5);
  assert.ok(seen.every((event) => event.type === "action.proposed"));
  const next: SystemEvent[] = [];
  const nextCount = await bus.replayTenant(
    tenantMix,
    { type: "action.proposed", limit: 5, sinceId: seen[4].id },
    (event) => {
      next.push(event);
    },
  );
  assert.equal(nextCount, 5);
  assert.ok(next.every((event) => event.type === "action.proposed"));
  assert.ok(next[0].id > seen[4].id);
});

test("un cursor de otro tenant deniega en vez de reiniciar", async () => {
  const foreign = await bus.emit("owner-foreign", "task.created", { kind: "task", id: "t-foreign" }, { title: "T", kind: "agent" }, { tenantId: "tenant-foreign" });
  await assert.rejects(page({ limit: 10, sinceId: foreign.id }), /EVENT_CURSOR_NOT_FOUND/);
});

test("un cursor inexistente deniega", async () => {
  await assert.rejects(page({ limit: 10, sinceId: "no-existe" }), /EVENT_CURSOR_NOT_FOUND/);
});
