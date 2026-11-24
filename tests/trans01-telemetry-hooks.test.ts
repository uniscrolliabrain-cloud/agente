// TRANS01_K07_TELEMETRY_HOOKS_V1 - la observabilidad se publica despues del
// resultado durable, nunca bloquea ni cambia la decision y no exporta tenant,
// owner, actor ni payload.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import { CapabilityRunner } from "../apps/server/src/engine/execution/capability-runner.ts";
import {
  registerKernelTelemetrySink,
  type KernelObservation,
} from "../apps/server/src/engine/observability/hooks.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import type { ExecutionContext, PlanStep } from "../packages/domain/src/index.ts";

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});

const ALLOWED = new Set([
  "stage",
  "status",
  "durationMs",
  "correlationId",
  "capabilityId",
  "errorClass",
]);

test("un commit de evento publica la etapa sin identidad ni payload", async () => {
  const observations: KernelObservation[] = [];
  const off = registerKernelTelemetrySink({ record: (entry) => void observations.push(entry) });
  try {
    const bus = new EventBus(db);
    const result = await runInTenantScope({ tenantId: "tenant-tel", actorId: "user-tel" }, () =>
      bus.emit(
        "owner-tel",
        "task.created",
        { kind: "task", id: "t-tel" },
        { title: "T", kind: "agent" },
        { tenantId: "tenant-tel", correlationId: "corr-tel", causal: { kind: "root" } },
      ),
    );
    assert.equal(result.persisted, true);
    const commit = observations.find((entry) => entry.stage === "bus.commit");
    assert.ok(commit, "debe observarse el commit");
    assert.equal(commit?.status, "ok");
    assert.equal(commit?.correlationId, "corr-tel");
    for (const entry of observations) {
      for (const key of Object.keys(entry)) {
        assert.ok(ALLOWED.has(key), `atributo no permitido en telemetria: ${key}`);
      }
    }
    assert.ok(!("tenantId" in (commit ?? {})));
    assert.ok(!("owner" in (commit ?? {})));
    assert.ok(!("actorId" in (commit ?? {})));
  } finally {
    off();
  }
});

test("un sink que falla no rompe ni cambia el resultado del emit", async () => {
  const off = registerKernelTelemetrySink({
    record: () => {
      throw new Error("collector down");
    },
  });
  try {
    const bus = new EventBus(db);
    const result = await runInTenantScope({ tenantId: "tenant-tel-2", actorId: "user-tel-2" }, () =>
      bus.emit(
        "owner-tel-2",
        "task.created",
        { kind: "task", id: "t-tel-2" },
        { title: "T", kind: "agent" },
        { tenantId: "tenant-tel-2", correlationId: "corr-tel-2", causal: { kind: "root" } },
      ),
    );
    assert.equal(result.persisted, true);
    assert.equal(result.error, undefined);
  } finally {
    off();
  }
});

test("un sink asincrono lento no retrasa el resultado", async () => {
  let finished = false;
  const off = registerKernelTelemetrySink({
    record: () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          finished = true;
          resolve();
        }, 50);
      }),
  });
  try {
    const bus = new EventBus(db);
    const result = await runInTenantScope({ tenantId: "tenant-tel-3", actorId: "user-tel-3" }, () =>
      bus.emit(
        "owner-tel-3",
        "task.created",
        { kind: "task", id: "t-tel-3" },
        { title: "T", kind: "agent" },
        { tenantId: "tenant-tel-3", correlationId: "corr-tel-3", causal: { kind: "root" } },
      ),
    );
    assert.equal(result.persisted, true);
    assert.equal(finished, false, "el emit no espera al sink");
  } finally {
    off();
  }
});

test("una denegacion del kernel se observa como denegacion, no como exito", async () => {
  const observations: KernelObservation[] = [];
  const off = registerKernelTelemetrySink({ record: (entry) => void observations.push(entry) });
  try {
    const capability = {
      id: "cap-tel-denied",
      requiresApproval: false,
      idempotency: "at-most-once",
      sideEffects: [{ kind: "external_write" }],
    };
    let effects = 0;
    const runner = new CapabilityRunner(
      { get: async () => capability } as never,
      new Map([[capability.id, { run: async () => void (effects += 1) }]]) as never,
      {
        canExecuteTool: async () => ({ allowed: false, reason: "policy says no" }),
        canExecuteAction: async () => ({ allowed: false, reason: "policy says no" }),
      } as never,
      (async () => ({ id: "role-1", name: "Agent" })) as never,
      db,
      "governed_v2",
    );
    const ctx: ExecutionContext = {
      tenantId: "tenant-tel-denied",
      owner: "owner-tel-denied",
      role: "agent",
      roleId: "role-1",
      requestId: "req-tel-denied",
      actorId: "actor-tel-denied",
    };
    const step: PlanStep = {
      id: "denied",
      title: "denied",
      capabilityId: capability.id,
      inputs: {},
      dependsOn: [],
      status: "pending",
    };
    await assert.rejects(runner.run(ctx, step), /authz denied/);
    assert.equal(effects, 0);
    const denial = observations.find((entry) => entry.stage === "kernel.denial");
    assert.ok(denial);
    assert.equal(denial?.status, "denied");
    assert.equal(denial?.capabilityId, capability.id);
    assert.ok(!observations.some((entry) => entry.stage === "runtime.result"));
  } finally {
    off();
  }
});
