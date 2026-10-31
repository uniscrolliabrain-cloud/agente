// TESTS_TASK_CONTEXT_V1 - PS-01: una tarea conserva tenant y solicitante
// cuando se ejecuta fuera de la peticion HTTP que la creo.
//
// El resolver del TenantScopedStore devuelve el tenant del scope y, sin el,
// "tenant-a" (membership primaria). La tarea vive en "tenant-b". Sin el scope
// restaurado desde la tarea, el worker escribe run-events y eventos en tenant-a.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createApp } from "../../../apps/server/src/app.ts";
import { createStore } from "../../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../../apps/server/src/db-tenant.ts";
import type { EventBus } from "../../../apps/server/src/engine/events/index.ts";
import { TenantService } from "../../../apps/server/src/engine/tenant.ts";
import { TaskWorker } from "../../../apps/server/src/engine/worker.ts";
import { currentTenantScope, runInTenantScope } from "../../../apps/server/src/tenant-scope.ts";
import type { AgentTask } from "../../../packages/domain/src/agent.ts";
import { testConfig } from "../../helpers/config.ts";

interface EmittedEvent {
  owner: string;
  type: string;
  payload: Record<string, unknown>;
}

function makeTask(overrides: Partial<AgentTask> & { id: string }): AgentTask {
  const now = new Date().toISOString();
  return {
    tenantId: "tenant-b",
    title: "PS-01 task",
    prompt: "prueba de contexto",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
    ...overrides,
  };
}

function stubBus(sink: EmittedEvent[]): EventBus {
  return {
    emit: async (owner: string, type: string, _source: unknown, payload: Record<string, unknown>) => {
      sink.push({ owner, type, payload });
    },
  } as unknown as EventBus;
}

async function waitFor(check: () => Promise<boolean>, timeoutMs = 4000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("timeout esperando el estado de la tarea");
}

test("PS-01: ejecuta y escribe en el tenant de la tarea, no en la membership", { timeout: 30000 }, async () => {
  const store = await createStore();
  try {
    // Igual que app.ts: el scope de la peticion manda; sin el, membership A.
    const scoped = new TenantScopedStore(store, async () => currentTenantScope()?.tenantId ?? "tenant-a");
    const owner = "user-1";
    const task = makeTask({ id: "task-b", tenantId: "tenant-b", requestedBy: "user-1" });
    await runInTenantScope({ tenantId: "tenant-b", actorId: "user-1" }, () => scoped.put(owner, "tasks", task));

    const emitted: EmittedEvent[] = [];
    const worker = new TaskWorker(
      scoped,
      async (_owner, _task, ctx) => {
        await ctx.event("step", "inicio");
        await ctx.busEvent("task.status_changed", { from: "running", to: "succeeded" });
        return { status: "succeeded", result: "ok" };
      },
      { pollMs: 60_000, bus: stubBus(emitted) },
    );

    worker.start();
    try {
      await waitFor(
        async () => (await store.get<AgentTask>(`tenant-b:${owner}`, "tasks", task.id))?.status === "succeeded",
      );
    } finally {
      await worker.stop();
    }

    const bRuns = await store.list(`tenant-b:${owner}`, "run-events");
    const aRuns = await store.list(`tenant-a:${owner}`, "run-events");
    assert.ok(bRuns.length > 0, "la tarea debe escribir run-events en tenant-b");
    assert.equal(aRuns.length, 0, "no debe escribir run-events en tenant-a");

    const statusEvent = emitted.find((event) => event.type === "task.status_changed");
    assert.equal(statusEvent?.payload.compat, "real");
    assert.equal(statusEvent?.payload.requestingActorId, "user-1");
    assert.equal(statusEvent?.payload.actorId, owner);
  } finally {
    await store.close();
  }
});

test("PS-01: una tarea sin requestedBy se ejecuta y se marca legacy", { timeout: 30000 }, async () => {
  const store = await createStore();
  try {
    const scoped = new TenantScopedStore(store, async () => currentTenantScope()?.tenantId ?? "tenant-a");
    const owner = "user-2";
    const task = makeTask({ id: "task-legacy", tenantId: "tenant-b" });
    await runInTenantScope({ tenantId: "tenant-b", actorId: "user-2" }, () => scoped.put(owner, "tasks", task));

    const emitted: EmittedEvent[] = [];
    const worker = new TaskWorker(
      scoped,
      async (_owner, _task, ctx) => {
        await ctx.busEvent("task.status_changed", { from: "running", to: "succeeded" });
        return { status: "succeeded", result: "ok" };
      },
      { pollMs: 60_000, bus: stubBus(emitted) },
    );

    worker.start();
    try {
      await waitFor(
        async () => (await store.get<AgentTask>(`tenant-b:${owner}`, "tasks", task.id))?.status === "succeeded",
      );
    } finally {
      await worker.stop();
    }

    const statusEvent = emitted.find((event) => event.type === "task.status_changed");
    assert.equal(statusEvent?.payload.compat, "legacy");
    assert.equal(statusEvent?.payload.requestingActorId, owner);
  } finally {
    await store.close();
  }
});

test("PS-01: recupera la tarea running caducada en el tenant de la tarea", { timeout: 90000 }, async () => {
  const store = await createStore();
  // dataDir propio: testConfig() por defecto apunta a "unused" y createApp
  // deja ahí la clave de sesión.
  const dir = await mkdtemp(join(tmpdir(), "openmuse-ps01-rec-"));
  const app = await createApp(store, testConfig({ dataDir: dir }));
  try {
    // Sin worker para que la tarea no cambie de estado durante la prueba.
    await app.agent.stop();
    const owner = "user-rec";
    // membership primaria A: sin el scope de la tarea, el CAS se resuelve en A.
    await new TenantService(store, app.agent.config as never).setMembership(owner, "tenant-a");
    const task = makeTask({
      id: "task-rec",
      tenantId: "tenant-b",
      requestedBy: owner,
      status: "running",
      leaseId: "lease-1",
      leaseUntil: new Date(Date.now() - 60_000).toISOString(),
    });
    await runInTenantScope({ tenantId: "tenant-b", actorId: owner }, () => app.agent.db.put(owner, "tasks", task));

    const recovered = await app.agent.recoverInterruptedTasks();
    assert.ok(recovered >= 1, "debe recuperar la tarea de tenant-b");

    const inB = await store.get<AgentTask>(`tenant-b:${owner}`, "tasks", task.id);
    assert.equal(inB?.status, "queued");
    assert.equal(inB?.leaseId, null);
    assert.equal(await store.get(`tenant-a:${owner}`, "tasks", task.id), null);
  } finally {
    await store.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test("PS-01: un worker recién arrancado descubre la tarea de otro tenant", { timeout: 30000 }, async () => {
  const store = await createStore();
  try {
    const writer = new TenantScopedStore(store, async () => currentTenantScope()?.tenantId ?? "tenant-a");
    const owner = "user-3";
    const task = makeTask({ id: "task-cold", tenantId: "tenant-b", requestedBy: "user-3" });
    await runInTenantScope({ tenantId: "tenant-b", actorId: "user-3" }, () => writer.put(owner, "tasks", task));

    // Proceso nuevo: este store todavía no ha resuelto ningún prefijo.
    const fresh = new TenantScopedStore(store, async () => currentTenantScope()?.tenantId ?? "tenant-a");
    assert.deepEqual(fresh.allTenantPrefixes(), []);

    const emitted: EmittedEvent[] = [];
    const worker = new TaskWorker(
      fresh,
      async (_owner, _task, ctx) => {
        await ctx.event("step", "reinicio");
        return { status: "succeeded", result: "ok" };
      },
      { pollMs: 60_000, bus: stubBus(emitted) },
    );

    worker.start();
    try {
      await waitFor(
        async () => (await store.get<AgentTask>(`tenant-b:${owner}`, "tasks", task.id))?.status === "succeeded",
      );
    } finally {
      await worker.stop();
    }

    assert.equal(await store.get(`tenant-a:${owner}`, "tasks", task.id), null);
    assert.ok((await store.list(`tenant-b:${owner}`, "run-events")).length > 0);
  } finally {
    await store.close();
  }
});
