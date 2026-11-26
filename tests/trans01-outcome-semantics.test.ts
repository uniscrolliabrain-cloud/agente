// TRANS01_K01_OUTCOME_SEMANTICS_V1 - la ausencia de evidencia sobre un efecto
// externo no demuestra su ausencia. Solo una declaracion positiva del adaptador
// permite reintentar; todo lo demas queda pendiente de conciliacion.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { CapabilityRunner } from "../apps/server/src/engine/execution/capability-runner.ts";
import { classifyAdapterFailure, classifyAdapterResult, confirmed } from "../apps/server/src/engine/execution/outcome.ts";
import type { ExecutionContext, PlanStep } from "../packages/domain/src/index.ts";

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});

const capability = {
  id: "cap-trans01-outcome",
  requiresApproval: false,
  idempotency: "at-most-once",
  sideEffects: [{ kind: "external_write" }],
};

const governance = {
  canExecuteTool: async () => ({ allowed: true }),
  canExecuteAction: async () => ({ allowed: true }),
};

const step = (id: string, inputs: Record<string, unknown> = { amount: 10 }): PlanStep => ({
  id,
  title: id,
  capabilityId: capability.id,
  inputs,
  dependsOn: [],
  status: "pending",
});

function runnerFor(run: () => Promise<unknown>) {
  const registry = { get: async () => capability };
  const executors = new Map([[capability.id, { run }]]);
  return new CapabilityRunner(
    registry as never,
    executors as never,
    governance as never,
    (async () => ({ id: "role-1", name: "Agent" })) as never,
    db,
    "governed_v2",
  );
}

const ctx: ExecutionContext = {
  tenantId: "tenant-outcome",
  owner: "owner-outcome",
  role: "agent",
  roleId: "role-1",
  requestId: "req-outcome",
  actorId: "actor-outcome",
};

async function claimOf(stepId: string) {
  const claims = await db.list<{ stepId?: string; status?: string; retrySafe?: boolean; outcome?: string }>(
    ctx.tenantId,
    "idempotency-claims",
  );
  return claims.find((row) => row.stepId === stepId);
}

test("un error generico posterior al despacho queda como resultado desconocido", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls += 1;
    throw new Error("socket hang up");
  });
  await assert.rejects(runner.run(ctx, step("generico")), /socket hang up/);
  const claim = await claimOf("generico");
  assert.equal(claim?.status, "outcome_unknown");
  assert.notEqual(claim?.retrySafe, true);
  await assert.rejects(runner.run(ctx, step("generico")), /outcome_unknown, reconcile first/);
  assert.equal(calls, 1, "sin evidencia no hay segundo envio");
});

test("un timeout tras el envio no se reintenta aunque el mensaje sea generico", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls += 1;
    throw Object.assign(new Error("ETIMEDOUT"), { code: "ETIMEDOUT" });
  });
  await assert.rejects(runner.run(ctx, step("timeout")));
  assert.equal((await claimOf("timeout"))?.status, "outcome_unknown");
  await assert.rejects(runner.run(ctx, step("timeout")), /outcome_unknown/);
  assert.equal(calls, 1);
});

test("un rechazo confirmado antes del despacho si permite reintentar", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls += 1;
    if (calls === 1)
      throw Object.assign(new Error("invalid recipient"), { outcome: "rejected_before_dispatch" });
    return confirmed({ receipt: "r-1" });
  });
  await assert.rejects(runner.run(ctx, step("rechazo")), /invalid recipient/);
  const failed = await claimOf("rechazo");
  assert.equal(failed?.status, "failed");
  assert.equal(failed?.retrySafe, true);
  await runner.run(ctx, step("rechazo"));
  assert.equal(calls, 2);
  assert.equal((await claimOf("rechazo"))?.status, "done");
});

test("un fallo confirmado sin efecto si permite reintentar", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls += 1;
    if (calls === 1)
      throw Object.assign(new Error("validation"), { outcome: "failed_without_effect" });
    return confirmed("ok");
  });
  await assert.rejects(runner.run(ctx, step("sin-efecto")));
  assert.equal((await claimOf("sin-efecto"))?.retrySafe, true);
  await runner.run(ctx, step("sin-efecto"));
  assert.equal(calls, 2);
});

test("un resultado aceptado no se declara confirmado ni se reenvia", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls += 1;
    return { outcome: "accepted", providerRef: "p-1" };
  });
  await assert.rejects(runner.run(ctx, step("aceptado")), /OUTCOME_ACCEPTED_RECONCILE/);
  const claim = await claimOf("aceptado");
  assert.equal(claim?.status, "accepted");
  await assert.rejects(
    runner.run(ctx, step("aceptado")),
    /accepted awaiting confirmation/,
  );
  assert.equal(calls, 1, "un aceptado no confirmado no se despacha dos veces");
});

test("un exito sin discriminante no cierra el paso como confirmado", async () => {
  let calls = 0;
  const runner = runnerFor(async () => {
    calls += 1;
    return { receipt: "sin-declaracion" };
  });
  await assert.rejects(runner.run(ctx, step("sin-discriminante")), /OUTCOME_UNCLASSIFIED_RECONCILE/);
  const claim = await claimOf("sin-discriminante");
  assert.equal(claim?.status, "outcome_unknown");
  assert.equal(claim?.outcome, "unknown");
  await assert.rejects(runner.run(ctx, step("sin-discriminante")), /outcome_unknown, reconcile first/);
  assert.equal(calls, 1, "un exito no declarado no se reenvia a ciegas");
});

test("el contrato distingue rechazo, fallo sin efecto y ambiguedad", () => {
  assert.deepEqual(
    classifyAdapterFailure(Object.assign(new Error("x"), { outcome: "rejected_before_dispatch" })),
    { outcome: "rejected_before_dispatch", retrySafe: true, reason: "adapter declared rejected_before_dispatch" },
  );
  assert.equal(
    classifyAdapterFailure(Object.assign(new Error("x"), { outcome: "failed_without_effect" })).retrySafe,
    true,
  );
  assert.equal(classifyAdapterFailure(new Error("x")).retrySafe, false);
  assert.equal(classifyAdapterFailure(new Error("x")).outcome, "unknown");
  assert.equal(
    classifyAdapterFailure(Object.assign(new Error("x"), { outcomeUnknown: true })).retrySafe,
    false,
  );
  assert.equal(
    classifyAdapterFailure(Object.assign(new Error("x"), { code: "outcome_unknown" })).outcome,
    "unknown",
  );
  // EXECUTION_OUTCOME_RESULT_EXPLICIT_V1 - un valor devuelto sin discriminante
  // no prueba que el proveedor confirmo el efecto.
  assert.equal(classifyAdapterResult({ receipt: "r" }), "unknown");
  assert.equal(classifyAdapterResult("ok"), "unknown");
  assert.equal(classifyAdapterResult(confirmed({ receipt: "r" })), "confirmed");
  assert.equal(classifyAdapterResult({ outcome: "accepted" }), "accepted");
  assert.equal(classifyAdapterResult({ outcome: "unknown" }), "unknown");
  assert.equal(
    classifyAdapterResult({ outcome: "rejected_before_dispatch" }),
    "unknown",
    "un exito que declara ausencia de efecto es contradictorio",
  );
});
