import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { readOperationalFacts } from "../apps/server/src/engine/events/operational-facts.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";

test("operational facts group persisted events in an explicit tenant and half-open period", async () => {
  const db = await createStore();
  try {
    const scoped = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
    const inTenant = <T>(tenantId: string, fn: () => T) =>
      runInTenantScope({ tenantId, actorId: "same-actor" }, fn);
    const period = {
      from: new Date("2026-11-01T00:00:00+01:00"),
      until: new Date("2026-11-02T00:00:00+01:00"),
      timeZone: "Europe/Madrid",
    };

    const write = (tenantId: string, owner: string, id: string, type: string, emittedAt: string) =>
      inTenant(tenantId, () => scoped.put(owner, "system-events", { id, type, emittedAt }));
    await write("company-a", "same-actor", "start", "task.created", period.from.toISOString());
    await write("company-a", "other-actor", "during", "task.created", "2026-11-01T12:00:00.000Z");
    await write("company-a", "same-actor", "done", "task.completed", "2026-11-01T13:00:00.000Z");
    await write("company-a", "same-actor", "before", "task.created", "2026-10-31T22:59:59.999Z");
    await write("company-a", "same-actor", "end", "task.created", period.until.toISOString());
    await write("company-ab", "same-actor", "start", "task.completed", period.from.toISOString());

    const [a, b, empty] = await Promise.all([
      inTenant("company-a", () => readOperationalFacts(scoped, period)),
      inTenant("company-ab", () => readOperationalFacts(scoped, period)),
      inTenant("company-empty", () => readOperationalFacts(scoped, period)),
    ]);
    assert.deepEqual(a, {
      tenantId: "company-a",
      source: "system-events",
      period: { from: period.from.toISOString(), until: period.until.toISOString(), timeZone: period.timeZone },
      denominator: 3,
      counts: [{ type: "task.completed", count: 1 }, { type: "task.created", count: 2 }],
    });
    assert.equal(b.denominator, 1);
    assert.deepEqual(b.counts, [{ type: "task.completed", count: 1 }]);
    assert.equal(empty.denominator, 0);
    assert.deepEqual(empty.counts, []);
    await assert.rejects(readOperationalFacts(scoped, period), /authenticated tenant scope/);
    await assert.rejects(inTenant("company-a", () =>
      readOperationalFacts(scoped, { ...period, until: period.from })), RangeError);
    await assert.rejects(inTenant("company-a", () =>
      readOperationalFacts(scoped, { ...period, timeZone: "Not/AZone" })), RangeError);
  } finally {
    await db.close();
  }
});
