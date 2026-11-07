// IDEMPOTENCY_DOUBLE_EXECUTION_TEST_V1 - el audit de marcas no ejecuta nada.
//
// Este fichero mide lo que el audit no mide: que una operacion con la misma
// clave ocurra **una sola vez** y que su segundo intento no vuelva a producir
// el efecto. Tres rutas reales con efecto, cada una con su control negativo:
//
//   1. `ActionService.propose`  - misma clave -> una sola propuesta + un registro.
//   2. `ActionService.decide`   - aprobar dos veces -> el adapter se llama una vez.
//   3. `CapabilityRunner.run`   - claim `external_write` -> el executor corre una vez.
//
// Si el mecanismo se quita, el control de cada ruta lo detecta: la ruta 1 vuelve
// a crear dos propuestas, la 2 llama al adapter dos veces y la 3 ejecuta dos
// veces el mismo paso.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { ActionService } from "../../apps/server/src/actions.ts";
import { createStore, type Store } from "../../apps/server/src/db.ts";
import { CapabilityRunner } from "../../apps/server/src/engine/execution/capability-runner.ts";
import type { ActionProposal, ExecutionContext, PlanStep } from "../../packages/domain/src/index.ts";

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});

const email = {
  kind: "email.send" as const,
  data: {
    to: ["sam@example.com"],
    subject: "Discovery call",
    body: "Hueco el martes.",
    cc: [],
    bcc: [],
    attachmentIds: [],
  },
};

// ---------------------------------------------------------------------------
// Ruta 1: proponer una accion
// ---------------------------------------------------------------------------

test("ruta 1: la misma clave produce una sola propuesta y un solo registro", async () => {
  const owner = "idem-propose";
  const service = new ActionService(db, {
    execute: async () => "sent",
    connected: async () => true,
  });
  const first = await service.propose(owner, email, "clave-propuesta-1");
  const second = await service.propose(owner, email, "clave-propuesta-1");
  assert.equal(first.id, second.id, "la segunda llamada debe devolver la misma propuesta");
  assert.equal((await db.list<ActionProposal>(owner, "actions")).length, 1);
  assert.equal((await db.list(owner, "activity")).length, 1, "el registro de actividad no se duplica");
});

test("ruta 1 (control): sin clave, dos llamadas son dos propuestas", async () => {
  const owner = "idem-propose-nokey";
  const service = new ActionService(db, {
    execute: async () => "sent",
    connected: async () => true,
  });
  const first = await service.propose(owner, email);
  const second = await service.propose(owner, email);
  assert.notEqual(first.id, second.id);
  assert.equal((await db.list<ActionProposal>(owner, "actions")).length, 2);
});

// ---------------------------------------------------------------------------
// Ruta 2: aprobar una accion (efecto externo)
// ---------------------------------------------------------------------------

test("ruta 2: aprobar dos veces ejecuta el efecto una vez", async () => {
  const owner = "idem-approve";
  let effects = 0;
  const service = new ActionService(db, {
    execute: async () => {
      effects++;
      return "provider-receipt";
    },
    connected: async () => true,
  });
  const proposal = await service.propose(owner, email, "clave-aprobacion-1");
  const approved = await service.decide(owner, proposal.id, proposal.hash, "approve");
  assert.equal(approved.status, "succeeded");
  const again = await service.decide(owner, proposal.id, proposal.hash, "approve");
  assert.equal(again.status, "succeeded");
  assert.equal(effects, 1, "el adapter no puede llamarse dos veces para la misma propuesta");
});

// ---------------------------------------------------------------------------
// Ruta 3: capability con efecto externo (claim + cache de resultado)
// ---------------------------------------------------------------------------

const capability = {
  id: "cap-cobrar",
  requiresApproval: false,
  idempotency: "at-most-once",
  sideEffects: [{ kind: "external_write" }],
};

function runnerFor(effects: { count: number }) {
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
  return new CapabilityRunner(registry as never, executors as never, undefined, undefined, db as never);
}

const step = (id: string): PlanStep => ({
  id,
  title: id,
  capabilityId: capability.id,
  inputs: { amount: 10 },
  dependsOn: [],
  status: "pending",
});

const ctx: ExecutionContext = {
  tenantId: "tenant-idem",
  owner: "idem-runner",
  role: "agent",
  requestId: "req-idem-1",
  actorId: "actor-idem-1",
};

test("ruta 3: el mismo paso con efecto externo corre una vez", async () => {
  const effects = { count: 0 };
  const runner = runnerFor(effects);
  await runner.run(ctx, step("paso-1"));
  await runner.run(ctx, step("paso-1"));
  assert.equal(effects.count, 1, "el segundo intento debe devolver el resultado cacheado");
  const claims = await db.list<{ status?: string }>(ctx.tenantId, "idempotency-claims");
  assert.equal(claims.length, 1);
  assert.equal(claims[0].status, "done");
});

test("ruta 3 (control): otro paso es otra clave y si ejecuta", async () => {
  const effects = { count: 0 };
  const runner = runnerFor(effects);
  await runner.run(ctx, step("paso-2"));
  await runner.run(ctx, step("paso-3"));
  assert.equal(effects.count, 2, "dos pasos distintos son dos efectos");
});

test("ruta 3: un claim fallido permite el reintento", async () => {
  const owner = "idem-runner-failed";
  const tenantId = "tenant-idem-failed";
  let calls = 0;
  const registry = { get: async () => capability };
  const executors = new Map([
    [
      capability.id,
      {
        run: async () => {
          calls++;
          if (calls === 1) throw new Error("proveedor caido");
          return { receipt: "r-2" };
        },
      },
    ],
  ]);
  const runner = new CapabilityRunner(registry as never, executors as never, undefined, undefined, db as never);
  const localCtx: ExecutionContext = { ...ctx, tenantId, owner };
  await assert.rejects(() => runner.run(localCtx, step("paso-4")), /proveedor caido/);
  await runner.run(localCtx, step("paso-4"));
  assert.equal(calls, 2, "un fallo no puede dejar el paso bloqueado para siempre");
  const claims = await db.list<{ status?: string }>(tenantId, "idempotency-claims");
  assert.equal(claims[0].status, "done");
});
