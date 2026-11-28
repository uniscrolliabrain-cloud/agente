import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { CapabilityRunner } from "../apps/server/src/engine/execution/capability-runner.ts";
import { confirmed } from "../apps/server/src/engine/execution/outcome.ts";
import { makeIdempotencyKey } from "../apps/server/src/engine/idempotency.ts";
import type { ExecutionContext, PlanStep } from "../packages/domain/src/index.ts";
const capability = {
  id: "scope-write",
  version: "1.0.0",
  requiresApproval: false,
  idempotency: "at-most-once",
  sideEffects: [{ kind: "write" }],
};
const ctx: ExecutionContext = {
  tenantId: "a",
  owner: "owner",
  actorId: "actor",
  role: "agent",
  roleId: "role",
  requestId: "request",
};
const step: PlanStep = {
  id: "step-1",
  title: "fixture",
  capabilityId: capability.id,
  inputs: { value: 1 },
  dependsOn: [],
  status: "pending",
};
const governance = {
  canExecuteTool: async () => ({ allowed: true }),
  canExecuteAction: async () => ({ allowed: true }),
};
async function fixture() {
  const db = await createStore();
  let effects = 0;
  const registry = { get: async () => capability };
  const runner = new CapabilityRunner(
    registry as never,
    new Map([
      [
        capability.id,
        {
          run: async () => {
            effects++;
            return confirmed();
          },
        },
      ],
    ]) as never,
    governance as never,
    (async () => ({ id: "role", name: "Fixture" })) as never,
    db,
  );
  return { db, runner, count: () => effects };
}

test("claims isolate owners, request actors and distinct task operations", async () => {
  const f = await fixture();
  try {
    await f.runner.run(ctx, step);
    await f.runner.run({ ...ctx, owner: "other-owner" }, step);
    await f.runner.run({ ...ctx, actorId: "other-actor" }, step);
    await f.runner.run({ ...ctx, taskId: "task-a" }, step);
    await f.runner.run({ ...ctx, taskId: "task-b" }, step);
    assert.equal(f.count(), 5);
    await f.runner.run({ ...ctx, taskId: "task-a", actorId: "reassigned-worker" }, step);
    assert.equal(f.count(), 5, "reassignment must not repeat the same task operation");
  } finally {
    await f.db.close();
  }
});

test("changing inputs under the same operation requires reconciliation rather than another effect", async () => {
  const f = await fixture();
  try {
    await f.runner.run({ ...ctx, taskId: "task" }, step);
    await assert.rejects(
      f.runner.run({ ...ctx, taskId: "task" }, { ...step, inputs: { value: 2 } }),
      /BINDING_CHANGED/,
    );
    assert.equal(f.count(), 1);
  } finally {
    await f.db.close();
  }
});

test("an unscoped historical claim blocks migration instead of dispatching a new key", async () => {
  const f = await fixture();
  try {
    const legacy = makeIdempotencyKey("computer", {
      tenantId: ctx.tenantId,
      stepId: step.id,
      capabilityId: capability.id,
      inputs: step.inputs,
    });
    await f.db.put(ctx.tenantId, "idempotency-claims", { id: legacy.key, status: "done" });
    await assert.rejects(f.runner.run(ctx, step), /LEGACY_CLAIM_RECONCILIATION_REQUIRED/);
    assert.equal(f.count(), 0);
  } finally {
    await f.db.close();
  }
});

test("caller mutation during an awaited lookup cannot replace the admitted operation inputs", async () => {
  const db = await createStore();
  try {
    let release!: (value: typeof capability) => void;
    const pending = new Promise<typeof capability>((resolve) => {
      release = resolve;
    });
    let observed: unknown;
    const runner = new CapabilityRunner(
      { get: () => pending } as never,
      new Map([
        [
          capability.id,
          {
            run: async (_ctx: unknown, _id: unknown, inputs: unknown) => {
              observed = inputs;
              return confirmed();
            },
          },
        ],
      ]) as never,
      governance as never,
      (async () => ({ id: "role", name: "Fixture" })) as never,
      db,
    );
    const mutable = { ...step, inputs: { value: 1 } };
    const execution = runner.run(ctx, mutable);
    mutable.inputs.value = 2;
    release(capability);
    await execution;
    assert.deepEqual(observed, { value: 1 });
  } finally {
    await db.close();
  }
});

test("canonical operation digests retain JSON keys named __proto__", () => {
  const a = JSON.parse('{"__proto__":{"amount":1}}');
  const b = JSON.parse('{"__proto__":{"amount":2}}');
  assert.notEqual(makeIdempotencyKey("computer", a).key, makeIdempotencyKey("computer", b).key);
});

test("historical canonicalization collisions still block a v2 dispatch", async () => {
  const f = await fixture();
  try {
    const historical = makeIdempotencyKey("computer", {
      tenantId: ctx.tenantId,
      stepId: step.id,
      capabilityId: capability.id,
      inputs: {},
    });
    await f.db.put(ctx.tenantId, "idempotency-claims", { id: historical.key, status: "outcome_unknown" });
    await assert.rejects(
      f.runner.run(ctx, { ...step, inputs: JSON.parse('{"__proto__":{"amount":1}}') }),
      /outcome_unknown, reconcile first/,
    );
    assert.equal(f.count(), 0);
  } finally {
    await f.db.close();
  }
});
