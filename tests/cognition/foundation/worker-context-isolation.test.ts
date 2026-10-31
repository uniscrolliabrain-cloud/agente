import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../../apps/server/src/db-tenant.ts";
import { TaskWorker } from "../../../apps/server/src/engine/worker.ts";
import { currentTenantScope, runInTenantScope } from "../../../apps/server/src/tenant-scope.ts";
import type { AgentTask } from "../../../packages/domain/src/agent.ts";

const owner = "same-user";
function task(tenantId: string, id = "same-id", actorId = "requester-" + tenantId): AgentTask {
  const now = new Date().toISOString();
  return {
    id,
    tenantId,
    requestedBy: actorId,
    executionContext: { tenantId, owner, actorId },
    title: "context",
    prompt: "test",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    artifactIds: [],
    leaseId: null,
    leaseUntil: null,
  };
}
function scoped(store: Awaited<ReturnType<typeof createStore>>) {
  return new TenantScopedStore(store, async () => currentTenantScope()?.tenantId ?? "tenant-a");
}
async function waitFor(check: () => boolean) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("worker synchronization timed out");
}

test("background discovery retains physical origin with warm prefixes and scoped scans stay isolated", async () => {
  const store = await createStore();
  try {
    await store.put("tenant-a:" + owner, "tasks", task("tenant-a", "a"));
    const db = scoped(store);
    await db.get(owner, "tasks", "a"); // A is known before B is written by another process.
    await store.put("tenant-b:" + owner, "tasks", task("tenant-b", "b"));
    const background = await runInTenantScope({ tenantId: "tenant-a", actorId: "actor" }, () =>
      db.scanBackgroundByStatus<AgentTask>("tasks", ["queued"]),
    );
    assert.deepEqual(background.map((r) => r.tenantId).sort(), ["tenant-a", "tenant-b"]);
    assert.ok(background.every((r) => r.storageOwner === r.tenantId + ":" + r.owner));
    const local = await runInTenantScope({ tenantId: "tenant-b", actorId: "actor" }, () =>
      db.scanByStatus<AgentTask>("tasks", ["queued"]),
    );
    assert.deepEqual(
      local.map((r) => r.value.id),
      ["b"],
    );
    const seen: string[] = [];
    await new TaskWorker(db, async (_owner, t) => {
      seen.push(t.tenantId);
      return { status: "succeeded" };
    }).tick();
    assert.deepEqual(seen.sort(), ["tenant-a", "tenant-b"]);
  } finally {
    await store.close();
  }
});

test("physical tenant mismatch quarantines only its own row before claim", async () => {
  const store = await createStore();
  try {
    await store.put("tenant-a:" + owner, "tasks", task("tenant-b", "same-id", "wrong-actor"));
    await store.put("tenant-b:" + owner, "tasks", task("tenant-b"));
    const seen: string[] = [];
    await new TaskWorker(scoped(store), async (_owner, t) => {
      seen.push(currentTenantScope()!.actorId);
      return { status: "succeeded" };
    }).tick();
    const invalid = await store.get<AgentTask>("tenant-a:" + owner, "tasks", "same-id");
    const valid = await store.get<AgentTask>("tenant-b:" + owner, "tasks", "same-id");
    assert.equal(invalid?.status, "paused");
    assert.match(invalid?.error ?? "", /TASK_CONTEXT_UNVERIFIED/);
    assert.equal(invalid?.attempts, 0);
    assert.equal(valid?.status, "succeeded");
    assert.equal(valid?.attempts, 1);
    assert.deepEqual(seen, ["requester-tenant-b"]);
  } finally {
    await store.close();
  }
});

test("missing requester and missing tenant are quarantined without invoking the handler", async () => {
  const store = await createStore();
  try {
    const legacy = task("tenant-b", "no-actor");
    delete legacy.requestedBy;
    delete legacy.executionContext;
    const noTenant = task("tenant-b", "no-tenant");
    delete (noTenant as Partial<AgentTask>).tenantId;
    await store.put("tenant-b:" + owner, "tasks", legacy);
    await store.put("tenant-b:" + owner, "tasks", noTenant);
    let calls = 0;
    await new TaskWorker(scoped(store), async () => {
      calls++;
      return { status: "succeeded" };
    }).tick();
    assert.equal(calls, 0);
    for (const id of ["no-actor", "no-tenant"])
      assert.equal((await store.get<AgentTask>("tenant-b:" + owner, "tasks", id))?.status, "paused");
  } finally {
    await store.close();
  }
});

test("waiting approvals are read and expired within their task tenant", async () => {
  const store = await createStore();
  try {
    const a = task("tenant-a", "waiting-a");
    a.status = "waiting_approval";
    a.actionId = "shared-action";
    const b = task("tenant-b", "waiting-b");
    b.status = "waiting_approval";
    b.actionId = "shared-action";
    await store.put("tenant-a:" + owner, "tasks", a);
    await store.put("tenant-b:" + owner, "tasks", b);
    await store.put("tenant-a:" + owner, "actions", {
      id: "shared-action",
      status: "awaiting_review",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    });
    await store.put("tenant-b:" + owner, "actions", {
      id: "shared-action",
      status: "awaiting_review",
      expiresAt: new Date(Date.now() - 60000).toISOString(),
    });
    const executed: string[] = [];
    await new TaskWorker(scoped(store), async (_owner, t) => {
      executed.push(t.tenantId);
      return { status: "succeeded" };
    }).tick();
    assert.deepEqual(executed, ["tenant-b"]);
    assert.equal(
      (await store.get<{ status: string }>("tenant-a:" + owner, "actions", "shared-action"))?.status,
      "awaiting_review",
    );
    assert.equal(
      (await store.get<{ status: string }>("tenant-b:" + owner, "actions", "shared-action"))?.status,
      "expired",
    );
  } finally {
    await store.close();
  }
});

test("same task IDs in two tenants keep separate abort controllers", async () => {
  const store = await createStore();
  try {
    for (const tenant of ["tenant-a", "tenant-b"]) await store.put(tenant + ":" + owner, "tasks", task(tenant));
    const signals = new Map<string, AbortSignal>();
    let finishB!: () => void;
    const worker = new TaskWorker(scoped(store), async (_owner, t, ctx) => {
      signals.set(t.tenantId, ctx.signal);
      if (t.tenantId === "tenant-a")
        await new Promise<void>((resolve) => ctx.signal.addEventListener("abort", () => resolve(), { once: true }));
      else
        await new Promise<void>((resolve) => {
          finishB = resolve;
        });
      return { status: "succeeded" };
    });
    const running = worker.tick();
    await waitFor(() => signals.size === 2);
    assert.equal(worker.activeSize(), 2);
    worker.abort("same-id");
    assert.equal(signals.get("tenant-a")!.aborted, false);
    assert.equal(signals.get("tenant-b")!.aborted, false);
    worker.abort("same-id", owner, "tenant-a");
    assert.equal(signals.get("tenant-a")!.aborted, true);
    assert.equal(signals.get("tenant-b")!.aborted, false);
    finishB();
    await running;
    assert.equal(worker.activeSize(), 0);
    assert.equal((await store.get<AgentTask>("tenant-b:" + owner, "tasks", "same-id"))?.status, "succeeded");
  } finally {
    await store.close();
  }
});

test("checkpoints and handler results cannot replace task identity; events and settled retain tenant and requester", async () => {
  const store = await createStore();
  try {
    await store.put("tenant-b:" + owner, "tasks", task("tenant-b", "immutable"));
    const events: unknown[][] = [];
    let requester = "";
    const worker = new TaskWorker(
      scoped(store),
      async (_owner, _task, ctx) => {
        for (const patch of [
          { id: "other" },
          { tenantId: "tenant-a" },
          { requestedBy: "other" },
          { executionContext: { tenantId: "tenant-a", owner, actorId: "other" } },
        ]) {
          await assert.rejects(ctx.checkpoint(patch), /TASK_CONTEXT_IMMUTABLE/);
        }
        await ctx.busEvent("task.status_changed", { from: "running", to: "succeeded", requestingActorId: "forged" });
        return { status: "succeeded" };
      },
      {
        bus: {
          emit: async (...args: unknown[]) => {
            events.push(args);
          },
        } as never,
        settled: async (_owner, _task, actors) => {
          requester = actors.requestingActorId;
        },
      },
    );
    await worker.tick();
    assert.equal(requester, "requester-tenant-b");
    assert.deepEqual(events[0][4], { tenantId: "tenant-b" });
    assert.equal((events[0][3] as { requestingActorId: string }).requestingActorId, "requester-tenant-b");
    const kept = await store.get<AgentTask>("tenant-b:" + owner, "tasks", "immutable");
    assert.equal(kept?.tenantId, "tenant-b");
    assert.equal(kept?.requestedBy, "requester-tenant-b");
    await store.put("tenant-b:" + owner, "tasks", task("tenant-b", "bad-result"));
    await new TaskWorker(scoped(store), async () => ({ status: "succeeded", tenantId: "tenant-a" })).tick();
    const bad = await store.get<AgentTask>("tenant-b:" + owner, "tasks", "bad-result");
    assert.equal(bad?.status, "failed");
    assert.equal(bad?.tenantId, "tenant-b");
    assert.match(bad?.error ?? "", /TASK_CONTEXT_IMMUTABLE/);
  } finally {
    await store.close();
  }
});

test("raw Store requires an explicit snapshot; physical legacy with explicit requester remains supported", async () => {
  const store = await createStore();
  try {
    await store.put(owner, "tasks", task("tenant-b", "raw-explicit"));
    const ambiguous = task("tenant-b", "raw-ambiguous");
    delete ambiguous.executionContext;
    await store.put(owner, "tasks", ambiguous);
    const seen: string[] = [];
    await new TaskWorker(store, async (_owner, t) => {
      seen.push(t.id);
      return { status: "succeeded" };
    }).tick();
    assert.deepEqual(seen, ["raw-explicit"]);
    assert.equal((await store.get<AgentTask>(owner, "tasks", "raw-ambiguous"))?.status, "paused");
    const legacy = task("tenant-b", "physical-legacy");
    delete legacy.executionContext;
    await store.put("tenant-b:" + owner, "tasks", legacy);
    await new TaskWorker(scoped(store), async (_owner, t) => {
      assert.equal(currentTenantScope()?.actorId, t.requestedBy);
      return { status: "succeeded" };
    }).tick();
    assert.equal((await store.get<AgentTask>("tenant-b:" + owner, "tasks", "physical-legacy"))?.status, "succeeded");
  } finally {
    await store.close();
  }
});
