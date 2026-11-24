// TRANS01_A02_GOVERNED_PROFILE_V1 - perfil gobernado explicito del
// CapabilityRunner: sin principal/PDP/store de claims niega y no ejecuta.
// El perfil legacy conserva su comportamiento hasta inventariar callers.
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
  id: "cap-trans01-governed",
  requiresApproval: false,
  idempotency: "at-most-once",
  sideEffects: [{ kind: "external_write" }],
};

function runnerFor(
  effects: { count: number },
  options: {
    governance?: unknown;
    getAgentRole?: unknown;
    store?: Store | undefined;
    profile?: "legacy_v1" | "governed_v2";
  } = {},
) {
  const registry = { get: async () => capability };
  const executors = new Map([
    [
      capability.id,
      {
        run: async () => {
          effects.count++;
          return { receipt: "r-1" };
        },
      },
    ],
  ]);
  return new CapabilityRunner(
    registry as never,
    executors as never,
    options.governance as never,
    options.getAgentRole as never,
    options.store,
    options.profile ?? "governed_v2",
  );
}

const step: PlanStep = {
  id: "paso-gobernado",
  title: "paso",
  capabilityId: capability.id,
  inputs: { amount: 10 },
  dependsOn: [],
  status: "pending",
};

const baseCtx: ExecutionContext = {
  tenantId: "tenant-governed",
  owner: "owner-governed",
  role: "agent",
  roleId: "role-1",
  requestId: "req-governed",
  actorId: "actor-governed",
};

test("gobernado sin actor resuelto niega antes de ejecutar", async () => {
  const effects = { count: 0 };
  const runner = runnerFor(effects, { store: db });
  const withoutActor = { ...baseCtx, actorId: undefined } as unknown as ExecutionContext;
  await assert.rejects(runner.run(withoutActor, step), /GOVERNED_PRINCIPAL_REQUIRED/);
  assert.equal(effects.count, 0);
});

test("gobernado sin PDP/governance niega antes de ejecutar", async () => {
  const effects = { count: 0 };
  const runner = runnerFor(effects, { store: db });
  await assert.rejects(runner.run(baseCtx, step), /GOVERNED_PRINCIPAL_REQUIRED/);
  assert.equal(effects.count, 0);
});

test("gobernado con efecto externo y sin store de claims niega", async () => {
  const effects = { count: 0 };
  const runner = runnerFor(effects, {
    store: undefined,
    governance: {
      canExecuteTool: async () => ({ allowed: true }),
      canExecuteAction: async () => ({ allowed: true }),
    },
    getAgentRole: async () => ({ id: "role-1", name: "Agent" }),
  });
  await assert.rejects(runner.run(baseCtx, step), /GOVERNED_CLAIM_STORE_REQUIRED/);
  assert.equal(effects.count, 0);
});

test("gobernado completo ejecuta una vez y deja el claim en done", async () => {
  const effects = { count: 0 };
  const runner = runnerFor(effects, {
    store: db,
    governance: {
      canExecuteTool: async () => ({ allowed: true }),
      canExecuteAction: async () => ({ allowed: true }),
    },
    getAgentRole: async () => ({ id: "role-1", name: "Agent" }),
  });
  await runner.run(baseCtx, step);
  assert.equal(effects.count, 1);
  const claims = await db.list<{ status?: string }>(baseCtx.tenantId, "idempotency-claims");
  assert.equal(claims.length, 1);
  assert.equal(claims[0].status, "done");
});

test("el perfil legacy conserva la ruta sin principal", async () => {
  const effects = { count: 0 };
  const runner = runnerFor(effects, { store: db, profile: "legacy_v1" });
  const legacyCtx = { ...baseCtx, actorId: undefined, roleId: undefined } as unknown as ExecutionContext;
  // Paso distinto: el claim de los tests gobernados ya esta en `done`.
  await runner.run(legacyCtx, { ...step, id: "paso-legacy" });
  assert.equal(effects.count, 1);
});
