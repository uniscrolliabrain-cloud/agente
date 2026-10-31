import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { createStore } from "../../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../../apps/server/src/db-tenant.ts";
import { EventBus } from "../../../apps/server/src/engine/events/bus.ts";
import { EventSubscriberRegistry, globalSubscribers } from "../../../apps/server/src/engine/events/subscriber.ts";
import type { SystemEvent } from "../../../apps/server/src/engine/events/types.ts";
import { eventsRoutes } from "../../../apps/server/src/events-routes.ts";
import { currentTenantScope, runInTenantScope } from "../../../apps/server/src/tenant-scope.ts";

function event(tenantId: string, owner = "same-user"): SystemEvent {
  return { id: `${tenantId}-${owner}`, tenantId, owner, schemaVersion: "1.0", type: "system.error",
    emittedAt: new Date().toISOString(), source: { kind: "system", id: "test" }, payload: { message: tenantId } };
}

test("event subscribers isolate tenant plus owner and legacy has no wildcard", () => {
  const registry = new EventSubscriberRegistry();
  const a: SystemEvent[] = [], b: SystemEvent[] = [], legacy: SystemEvent[] = [];
  registry.subscribe("same-user", e => a.push(e), { tenantId: "tenant-a" });
  registry.subscribe("same-user", e => b.push(e), { tenantId: "tenant-b" });
  registry.subscribe("same-user", e => legacy.push(e));
  registry.publish(event("tenant-b"));
  registry.publish(event("tenant-a", "someone-else"));
  registry.publish(event("tenant-a"));
  registry.publish(event(""));
  assert.deepEqual(a.map(e => e.tenantId), ["tenant-a"]);
  assert.deepEqual(b.map(e => e.tenantId), ["tenant-b"]);
  assert.equal(legacy.length, 0);
  registry.publish(event("same-user"));
  assert.equal(legacy.length, 1);
  assert.equal(registry.count("same-user", "tenant-a"), 1);
  assert.throws(() => registry.subscribe("same-user", () => {}, { tenantId: "" }));
  runInTenantScope({ tenantId: "tenant-a", actorId: "actor" }, () => {
    assert.throws(() => registry.subscribe("same-user", () => {}, { tenantId: "tenant-b" }));
  });
});

test("bus scopes envelope, persistent dedupe and caches by tenant and owner", { timeout: 60000 }, async () => {
  const db = await createStore();
  const scoped = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "primary");
  const bus = new EventBus(scoped);
  const emit = (instance: EventBus, tenantId: string, owner = "same-user") => instance.emit(owner,
    "system.error", { kind: "system", id: "test" }, { message: tenantId }, { tenantId, dedupeKey: "same-key" });
  try {
    await emit(bus, "tenant-a");
    await emit(bus, "tenant-b");
    await emit(bus, "tenant-a", "another-user");
    await emit(bus, "tenant-a");
    await emit(bus, "tenant-b");
    // A fresh bus must observe durable dedupe, not a positive process cache.
    const restarted = new EventBus(scoped);
    await emit(restarted, "tenant-a");
    await emit(restarted, "tenant-b");
    for (const [tenantId, owner] of [["tenant-a", "same-user"], ["tenant-b", "same-user"], ["tenant-a", "another-user"]]) {
      const rows = await db.list<SystemEvent>(`${tenantId}:${owner}`, "system-events");
      assert.equal(rows.length, 1, `${tenantId}/${owner} must have exactly one sequential emission`);
      assert.equal(rows[0].tenantId, tenantId);
      assert.equal(rows[0].owner, owner);
    }
    assert.equal((await db.list("primary:same-user", "system-events")).length, 0);
    await runInTenantScope({ tenantId: "tenant-b", actorId: "requester" }, () =>
      bus.emit("same-user", "system.error", { kind: "system", id: "inherited" }, { message: "ALS" }));
    const b = await db.list<SystemEvent>("tenant-b:same-user", "system-events");
    assert.equal(b.length, 2);
    assert.ok(b.every(e => e.tenantId === "tenant-b"));
    await assert.rejects(runInTenantScope({ tenantId: "tenant-a", actorId: "actor" }, () => emit(bus, "tenant-b")), /mismatch/);
    await assert.rejects(bus.emit("same-user", "system.error", { kind: "system", id: "missing" }, { message: "missing" }), /explicit tenant/);
    assert.equal((await db.list("tenant-b:same-user", "system-events")).length, 2);
    await Promise.all(["tenant-a", "tenant-b"].map(tenantId => bus.emit("same-user", "system.error",
      { kind: "system", id: "parallel" }, { message: tenantId }, { tenantId, dedupeKey: "parallel" })));
    for (const tenantId of ["tenant-a", "tenant-b"]) {
      const parallel = (await db.list<SystemEvent>(`${tenantId}:same-user`, "system-events"))
        .filter(e => e.source.id === "parallel");
      assert.equal(parallel.length, 1);
      assert.equal(parallel[0].tenantId, tenantId);
    }
  } finally { await db.close(); }
});

function routeApp(tenantId?: string) {
  const app = new Hono<{ Variables: { owner: string; ctx: { owner: string; tenantId: string; actorId: string } } }>();
  app.use("*", async (c, next) => {
    c.set("owner", "same-user");
    if (tenantId) c.set("ctx", { owner: "same-user", tenantId, actorId: "authenticated-actor" });
    await next();
  });
  app.route("/events", eventsRoutes({} as EventBus));
  return app;
}

test("SSE uses authenticated tenant and cancellation removes the subscription", async () => {
  globalSubscribers.clear();
  const a = await routeApp("tenant-a").request("/events/stream?tenantId=tenant-b");
  const b = await routeApp("tenant-b").request("/events/stream");
  const readerA = a.body!.getReader(), readerB = b.body!.getReader();
  const decoder = new TextDecoder();
  try {
    assert.equal(a.status, 200);
    assert.match(decoder.decode((await readerA.read()).value), /event: ready/);
    await readerB.read();
    globalSubscribers.publish(event("tenant-b"));
    globalSubscribers.publish(event("tenant-a"));
    const receivedA = decoder.decode((await readerA.read()).value);
    const receivedB = decoder.decode((await readerB.read()).value);
    assert.match(receivedA, /"tenantId":"tenant-a"/);
    assert.doesNotMatch(receivedA, /tenant-b/);
    assert.match(receivedB, /"tenantId":"tenant-b"/);
    assert.doesNotMatch(receivedB, /tenant-a/);
  } finally {
    await readerA.cancel();
    await readerB.cancel();
  }
  assert.equal(globalSubscribers.count(), 0);
  assert.equal((await routeApp().request("/events/stream")).status, 403);
  assert.equal(globalSubscribers.count(), 0);
});
