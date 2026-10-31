import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../../apps/server/src/db-tenant.ts";
import { currentTenantScope } from "../../../apps/server/src/tenant-scope.ts";
import { TaskWorker } from "../../../apps/server/src/engine/worker.ts";
import { EventBus } from "../../../apps/server/src/engine/events/bus.ts";
import type { AgentTask } from "../../../packages/domain/src/agent.ts";
import type { SystemEvent } from "../../../apps/server/src/engine/events/types.ts";

function task(id: string): AgentTask {
  const now = new Date().toISOString();
  return { id, tenantId: "empresa-b", assignedTo: "executor", title: id,
    prompt: id, kind: "agent", status: "queued", plan: [], evidence: [],
    input: {}, state: {}, createdAt: now, updatedAt: now, attempts: 0,
    leaseId: null, leaseUntil: null, artifactIds: [] };
}

test("PS-01: legacy sin solicitante demostrable no llega al handler", async () => {
  const db = await createStore();
  try {
    await db.put("empresa-b:u1", "tasks", task("missing-actor"));
    const scoped = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "empresa-a");
    let called = 0;
    const worker = new TaskWorker(scoped, async () => {
      called++;
      return { status: "succeeded" };
    });
    await worker.tick();
    assert.equal(called, 0, "assignedTo no demuestra el actor solicitante");
  } finally { await db.close(); }
});

test("PS-01: checkpoint no cambia tenant ni actor de origen", async () => {
  const db = await createStore();
  try {
    await db.put("empresa-b:u1", "tasks", { ...task("checkpoint"), assignedBy: "requester", requestedBy: "requester" });
    const scoped = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "empresa-a");
    const worker = new TaskWorker(scoped, async (_owner, _task, ctx) => {
      await ctx.checkpoint({ tenantId: "empresa-a", assignedBy: "imposter", requestedBy: "imposter" });
      return { status: "succeeded" };
    });
    await worker.tick();
    const saved = await db.get<AgentTask>("empresa-b:u1", "tasks", "checkpoint");
    assert.equal(saved?.tenantId, "empresa-b", "el patch no puede reasignar el tenant");
    assert.equal(saved?.assignedBy, "requester", "el patch no puede sustituir solicitante");
  } finally { await db.close(); }
});

test("PS-01: el envelope de evento del worker mantiene tenant B", async () => {
  const db = await createStore();
  try {
    await db.put("empresa-b:u1", "tasks", { ...task("event"), assignedBy: "requester", requestedBy: "requester" });
    const scoped = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "empresa-a");
    const written: SystemEvent[] = [];
    const bus = new EventBus(scoped, { write: async (event) => { written.push(event); } });
    const worker = new TaskWorker(scoped, async (_owner, _task, ctx) => {
      await ctx.busEvent("system.maintenance", { tasks: 0, monitors: 0 });
      return { status: "succeeded" };
    }, { bus });
    await worker.tick();
    assert.equal(written.length, 1);
    assert.equal(written[0].tenantId, "empresa-b", "ALS de Store no modifica el envelope de EventBus");
  } finally { await db.close(); }
});
