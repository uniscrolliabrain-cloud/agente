// TRANS01_K02_APPROVAL_BINDING_V1 - una aprobacion autoriza un contenido, una
// tarea, un tenant, un principal y una generacion de conexion concretos. No es
// reutilizable para otra operacion ni sobrevive a la caducidad o la rotacion.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { CapabilityRunner } from "../apps/server/src/engine/execution/capability-runner.ts";
import type { ExecutionContext, PlanStep } from "../packages/domain/src/index.ts";

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});

const capability = {
  id: "cap-trans01-approval",
  requiresApproval: true,
  idempotency: "at-most-once",
  sideEffects: [{ kind: "external_write" }],
};

const draft = {
  to: ["sam@example.com"],
  subject: "Discovery",
  body: "Hueco el martes.",
  cc: [],
  bcc: [],
  attachmentIds: [],
};

const approvalId = "approval-1";
const owner = "owner-approval";
const tenantId = "tenant-approval";

function runnerFor(effects: { count: number }) {
  const registry = { get: async () => capability };
  const executors = new Map([
    [
      capability.id,
      {
        run: async () => {
          effects.count += 1;
          return { receipt: "r-1" };
        },
      },
    ],
  ]);
  return new CapabilityRunner(
    registry as never,
    executors as never,
    {
      canExecuteTool: async () => ({ allowed: true }),
      canExecuteAction: async () => ({ allowed: true }),
    } as never,
    (async () => ({ id: "role-1", name: "Agent" })) as never,
    db,
    "governed_v2",
  );
}

const step: PlanStep = {
  id: "step-approval",
  title: "step",
  capabilityId: capability.id,
  inputs: { kind: "email.send", data: draft },
  dependsOn: [],
  status: "pending",
};

const ctx: ExecutionContext = {
  tenantId,
  owner,
  role: "agent",
  roleId: "role-1",
  requestId: "req-approval",
  actorId: "actor-approval",
  taskId: "task-approval",
  approvalId,
};

async function seedApproval(patch: Record<string, unknown> = {}) {
  await db.remove(owner, "actions", approvalId).catch(() => {});
  await db.put(owner, "actions", {
    id: approvalId,
    status: "executing",
    kind: "email.send",
    taskId: "task-approval",
    tenantId,
    hash: "hash-1",
    revision: "revision-1",
    principal: "actor-approval",
    expiresAt: new Date(Date.now() + 600000).toISOString(),
    data: draft,
    connectionId: "conn-1",
    connectionGeneration: "g1",
    ...patch,
  });
}

test("una aprobacion completa autoriza exactamente ese contenido", async () => {
  await seedApproval();
  const effects = { count: 0 };
  await runnerFor(effects).run(ctx, step);
  assert.equal(effects.count, 1);
});

test("sin aprobacion no hay efecto", async () => {
  await db.remove(owner, "actions", approvalId).catch(() => {});
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /approval not found/);
  assert.equal(effects.count, 0);
});

test("una aprobacion de otro contenido no autoriza este paso", async () => {
  await seedApproval({ data: { ...draft, subject: "Otro asunto" } });
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /approval content mismatch/);
  assert.equal(effects.count, 0);
});

test("una aprobacion de otra operacion (kind) no autoriza este paso", async () => {
  await seedApproval({ kind: "calendar.create" });
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /approval kind mismatch/);
  assert.equal(effects.count, 0);
});

test("una aprobacion de otra tarea no autoriza este paso", async () => {
  await seedApproval({ taskId: "task-otra" });
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /approval task mismatch/);
  assert.equal(effects.count, 0);
});

test("una aprobacion de otro tenant no autoriza este paso", async () => {
  await seedApproval({ tenantId: "tenant-ajeno" });
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /approval tenant mismatch/);
  assert.equal(effects.count, 0);
});

test("una aprobacion caducada no autoriza este paso", async () => {
  await seedApproval({ expiresAt: new Date(Date.now() - 1000).toISOString() });
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /approval expired/);
  assert.equal(effects.count, 0);
});

test("una aprobacion de otro principal no autoriza este paso", async () => {
  await seedApproval({ principal: "otro-usuario" });
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /approval principal mismatch/);
  assert.equal(effects.count, 0);
});

test("un efecto externo sin generacion de conexion no se autoriza", async () => {
  await seedApproval({ connectionGeneration: undefined });
  const effects = { count: 0 };
  await assert.rejects(runnerFor(effects).run(ctx, step), /no bound connection generation/);
  assert.equal(effects.count, 0);
});

test("una aprobacion ya consumida no se reutiliza para otro paso", async () => {
  await seedApproval({ status: "succeeded" });
  const effects = { count: 0 };
  await assert.rejects(
    runnerFor(effects).run({ ...ctx, taskId: "task-approval" }, { ...step, id: "otro-paso" }),
    /approval already consumed/,
  );
  assert.equal(effects.count, 0);
});

test("la misma aprobacion y el mismo paso son un replay idempotente", async () => {
  await seedApproval();
  const effects = { count: 0 };
  const runner = runnerFor(effects);
  const replayStep = { ...step, id: "step-replay" };
  await runner.run(ctx, replayStep);
  // El claim quedo `done`: el replay devuelve el resultado cacheado. La
  // aprobacion ya figura como consumida por la accion.
  await db.compareAndSwap(owner, "actions", approvalId, { status: "executing" }, { status: "succeeded" });
  await runner.run(ctx, replayStep);
  assert.equal(effects.count, 1);
});
