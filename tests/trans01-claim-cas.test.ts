// TRANS01_A03_CLAIM_CAS_V1 - el claim de un efecto externo se transiciona con
// CAS y fencing: un worker tardio no pisa `done`, un timeout conserva la
// ambiguedad y un fallo sin evidencia no se reintenta a ciegas.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { CapabilityRunner } from "../apps/server/src/engine/execution/capability-runner.ts";
import { makeIdempotencyKey } from "../apps/server/src/engine/idempotency.ts";
import { confirmed } from "../apps/server/src/engine/execution/outcome.ts";
import type { ExecutionContext, PlanStep } from "../packages/domain/src/index.ts";

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});

const capability = {
  id: "cap-trans01-claim",
  requiresApproval: false,
  idempotency: "at-most-once",
  sideEffects: [{ kind: "external_write" }],
};

const step = (id: string): PlanStep => ({
  id,
  title: id,
  capabilityId: capability.id,
  inputs: { amount: 10 },
  dependsOn: [],
  status: "pending",
});

const governance = {
  canExecuteTool: async () => ({ allowed: true }),
  canExecuteAction: async () => ({ allowed: true }),
};

function runnerFor(run: () => Promise<unknown>, store: Store | undefined = db) {
  const registry = { get: async () => capability };
  const executors = new Map([[capability.id, { run }]]);
  return new CapabilityRunner(
    registry as never,
    executors as never,
    governance as never,
    (async () => ({ id: "role-1", name: "Agent" })) as never,
    store,
  );
}

const ctx: ExecutionContext = {
  tenantId: "tenant-claim",
  owner: "owner-claim",
  role: "agent",
  roleId: "role-1",
  requestId: "req-claim",
  actorId: "actor-claim",
};

test("dos workers concurrentes producen un solo efecto y un solo claim", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls++;
    return confirmed({ receipt: "r-1" });
  });
  const results = await Promise.allSettled([
    runner.run(ctx, step("dos-workers")),
    runner.run(ctx, step("dos-workers")),
  ]);
  assert.equal(calls, 1, "el claim solo puede pertenecer a un intento");
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const claims = await db.list<{ status?: string; fence?: number }>(ctx.tenantId, "idempotency-claims");
  assert.equal(claims.length, 1);
  assert.equal(claims[0].status, "done");
  assert.equal(claims[0].fence, 1);
});

test("un claim viejo pasa a outcome_unknown por CAS y no se reintenta", async () => {
  const key = makeIdempotencyKey("computer", {
    tenantId: ctx.tenantId,
    stepId: "stale",
    capabilityId: capability.id,
    inputs: { amount: 10 },
  });
  await db.put(ctx.tenantId, "idempotency-claims", {
    id: key.key,
    tenantId: ctx.tenantId,
    stepId: "stale",
    capabilityId: capability.id,
    status: "claimed",
    fence: 3,
    attemptId: "attempt-viejo",
    claimedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  });
  let calls = 0;
  const runner = runnerFor(async () => {
    calls++;
    return "no deberia ejecutarse";
  });
  await assert.rejects(runner.run(ctx, step("stale")), /stale claim, reconcile first/);
  assert.equal(calls, 0);
  const claim = await db.get<{ status?: string; fence?: number; error?: string }>(
    ctx.tenantId,
    "idempotency-claims",
    key.key,
  );
  assert.equal(claim?.status, "outcome_unknown");
  assert.equal(claim?.fence, 3, "la transicion conserva el fence del intento");
  await assert.rejects(runner.run(ctx, step("stale")), /outcome_unknown, reconcile first/);
  assert.equal(calls, 0);
});

test("un resultado incierto del adaptador no se reintenta", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls++;
    throw Object.assign(new Error("timeout tras envio"), { outcomeUnknown: true });
  });
  await assert.rejects(runner.run(ctx, step("ambiguo")), /timeout tras envio/);
  assert.equal(calls, 1);
  const claims = await db.list<{ status?: string }>(ctx.tenantId, "idempotency-claims");
  const claim = claims.find((row) => (row as { stepId?: string }).stepId === "ambiguo");
  assert.equal(claim?.status, "outcome_unknown");
  await assert.rejects(runner.run(ctx, step("ambiguo")), /outcome_unknown, reconcile first/);
  assert.equal(calls, 1, "una ambiguedad exige conciliacion, no otro envio");
});

test("un worker tardio no puede pisar un done ajeno", async () => {
  const runner = runnerFor(async () => {
    const claims = await db.list<{ id: string }>(ctx.tenantId, "idempotency-claims");
    const own = claims.find((row) => (row as { stepId?: string }).stepId === "tardio");
    assert.ok(own, "el claim debe existir mientras corre el efecto");
    await db.compareAndSwap(
      ctx.tenantId,
      "idempotency-claims",
      own.id,
      { status: "claimed" },
      { status: "done", attemptId: "otro-intento", result: "resultado-ajeno" },
    );
    return "resultado-local";
  });
  await assert.rejects(runner.run(ctx, step("tardio")), /CLAIM_FENCE_LOST/);
  const claims = await db.list<{
    status?: string;
    result?: string;
    attemptId?: string;
    stepId?: string;
  }>(ctx.tenantId, "idempotency-claims");
  const claim = claims.find((row) => row.stepId === "tardio");
  assert.equal(claim?.status, "done");
  assert.equal(claim?.result, "resultado-ajeno", "la finalizacion tardia no reescribe el resultado");
  assert.equal(claim?.attemptId, "otro-intento");
});

test("sin CAS el runner deniega en vez de escribir el claim a ciegas", async () => {
  const noCas = {
    get: async () => null,
    put: async () => undefined,
    insertIfAbsent: async () => ({}),
  } as unknown as Store;
  let calls = 0;
  const runner = runnerFor(async () => {
    calls++;
    return confirmed("no deberia ejecutarse");
  }, noCas);
  await assert.rejects(runner.run(ctx, step("sin-cas")), /GOVERNED_CAS_REQUIRED/);
  assert.equal(calls, 0, "sin exclusion concurrente no hay efecto");
});

test("una capability declarada idempotente con efectos exige claim", async () => {
  const writeCapability = {
    id: "cap-trans01-write",
    requiresApproval: false,
    idempotency: "idempotent",
    sideEffects: [{ kind: "write" }],
  };
  let calls = 0;
  const registry = { get: async () => writeCapability };
  const executors = new Map([
    [
      writeCapability.id,
      {
        run: async () => {
          calls++;
          return confirmed("ok");
        },
      },
    ],
  ]);
  const runner = new CapabilityRunner(
    registry as never,
    executors as never,
    governance as never,
    (async () => ({ id: "role-1", name: "Agent" })) as never,
    db,
  );
  const writeStep = { ...step("idempotente-write"), capabilityId: writeCapability.id };
  await runner.run(ctx, writeStep);
  await runner.run(ctx, writeStep);
  assert.equal(calls, 1, "la etiqueta idempotent no exime del claim");
  const claims = await db.list<{ stepId?: string; status?: string }>(ctx.tenantId, "idempotency-claims");
  assert.equal(claims.find((row) => row.stepId === "idempotente-write")?.status, "done");
});

test("un claim failed sin fencing no se reintenta", async () => {
  const key = makeIdempotencyKey("computer", {
    tenantId: ctx.tenantId,
    stepId: "legacy-failed",
    capabilityId: capability.id,
    inputs: { amount: 10 },
  });
  await db.put(ctx.tenantId, "idempotency-claims", {
    id: key.key,
    tenantId: ctx.tenantId,
    stepId: "legacy-failed",
    capabilityId: capability.id,
    status: "failed",
    error: "resultado sin clasificar",
  });
  let calls = 0;
  const runner = runnerFor(async () => {
    calls++;
    return "no deberia ejecutarse";
  });
  await assert.rejects(
    runner.run(ctx, step("legacy-failed")),
    /failed claim requires reconciliation/,
  );
  assert.equal(calls, 0, "sin evidencia de no-efecto no hay reintento");
});
