import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../../apps/server/src/db-tenant.ts";
import { TaskWorker } from "../../../apps/server/src/engine/worker.ts";
import { currentTenantScope, runInTenantScope } from "../../../apps/server/src/tenant-scope.ts";
import type { AgentTask } from "../../../packages/domain/src/agent.ts";

function task(id: string, tenantId: string): AgentTask {
  const now = new Date().toISOString();
  return { id, tenantId, requestedBy: "requester", assignedTo: "executor",
    title: id, prompt: id, kind: "agent", status: "queued", plan: [],
    evidence: [], input: {}, state: {}, createdAt: now, updatedAt: now,
    attempts: 0, leaseId: null, leaseUntil: null, artifactIds: [] };
}
const resolver = async () => currentTenantScope()?.tenantId ?? "empresa-a";

test("PS-01: prefijo A ya conocido no oculta trabajo B", async () => {
  const db = await createStore();
  try {
    const scoped = new TenantScopedStore(db, resolver);
    await scoped.get("u1", "settings", "warm");
    await db.put("empresa-b:u1", "tasks", task("cold-b", "empresa-b"));
    let called = 0;
    const worker = new TaskWorker(scoped, async () => { called++; return { status: "succeeded" }; });
    await worker.tick();
    assert.equal(called, 1, "B debe descubrirse aunque el proceso ya haya resuelto A");
  } finally { await db.close(); }
});

test("PS-01: fila fisica B con payload A no reclama una fila A del mismo id", async () => {
  const db = await createStore();
  try {
    const scoped = new TenantScopedStore(db, resolver);
    await runInTenantScope({ tenantId: "empresa-b", actorId: "requester" }, () => scoped.get("u1", "settings", "warm"));
    await db.put("empresa-b:u1", "tasks", task("same-id", "empresa-a"));
    await db.put("empresa-a:u1", "tasks", task("same-id", "empresa-a"));
    // Simulate a scheduler page containing only B. A remains eligible on a later page.
    const scan = scoped.scanBackgroundByStatus.bind(scoped);
    scoped.scanBackgroundByStatus = async <T>(kind: string, statuses: string[], limit?: number) =>
      (await scan<T>(kind, statuses, limit)).filter((row) => row.tenantId === "empresa-b");
    let called = 0;
    const worker = new TaskWorker(scoped, async () => { called++; return { status: "succeeded" }; });
    await worker.tick();
    assert.equal(called, 0, "la contradicción de B no autoriza ejecutar A");
    assert.equal((await db.get<AgentTask>("empresa-a:u1", "tasks", "same-id"))?.status, "queued");
    assert.equal((await db.get<AgentTask>("empresa-b:u1", "tasks", "same-id"))?.status, "paused");
  } finally { await db.close(); }
});

test("PS-01: aprobacion pendiente de B no se sustituye por aprobacion A", async () => {
  const db = await createStore();
  try {
    const scoped = new TenantScopedStore(db, resolver);
    await runInTenantScope({ tenantId: "empresa-b", actorId: "requester" }, () => scoped.get("u1", "settings", "warm"));
    await db.put("empresa-b:u1", "actions", { id: "approval", status: "awaiting_review", expiresAt: new Date(Date.now() + 600000).toISOString() });
    await db.put("empresa-a:u1", "actions", { id: "approval", status: "approved" });
    await db.put("empresa-b:u1", "tasks", { ...task("approval-task", "empresa-b"), status: "waiting_approval", actionId: "approval" });
    let called = 0;
    const worker = new TaskWorker(scoped, async () => { called++; return { status: "succeeded" }; });
    await worker.tick();
    assert.equal(called, 0, "B sigue awaiting_review y no puede reanudarse por el estado de A");
  } finally { await db.close(); }
});
