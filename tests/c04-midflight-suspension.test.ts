// C04_MIDFLIGHT_SUSPENSION_V1 — campaña C04 (PS13) / C05 (PS15), subgate local.
//
// Cierra el límite anotado en RUN-2026-11-17-11/13: la suspensión de empresa y la
// deshabilitación de un agente solo frenaban el SIGUIENTE arranque. Una tarea ya
// `running` seguía ejecutando sus tools. Aquí se prueba con el worker real:
//   - suspender la empresa a mitad de tarea corta el trabajo en el guard
//     siguiente, la tarea vuelve a `queued` sin consumir presupuesto de intentos
//     y se reanuda al levantar la suspensión;
//   - deshabilitar el agente asignado hace lo mismo, y rehabilitarlo reanuda.
//
// No cubre: abort de una llamada al proveedor ya enviada (solo el paso
// siguiente), worker multi-proceso, Postgres ni ejecución real de LLM.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { TaskWorker, type TaskContext } from "../apps/server/src/engine/worker.ts";
import { currentTenantScope } from "../apps/server/src/tenant-scope.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

function queuedTask(id: string, tenantId: string, assignedTo: string): AgentTask {
  return {
    id,
    tenantId,
    assignedTo,
    assignedBy: "solicitante",
    title: `trabajo ${id}`,
    prompt: "fixture local sin proveedor",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: { roleId: assignedTo },
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

interface Control {
  suspended: Set<string>;
  disabled: Set<string>;
  failState: boolean;
  steps: string[];
  runs: number;
}

interface Fixture {
  store: Store;
  scoped: TenantScopedStore;
  worker: TaskWorker;
  control: Control;
  cleanup: () => Promise<void>;
}

async function buildFixture(
  execute: (
    owner: string,
    task: AgentTask,
    ctx: TaskContext,
    control: Control,
  ) => Promise<Partial<AgentTask>>,
): Promise<Fixture> {
  const dataDir = await mkdtemp(join(tmpdir(), "midflight-"));
  const store = await createStore({ dataDir });
  const scoped = new TenantScopedStore(
    store,
    async () => currentTenantScope()?.tenantId ?? "empresa-a",
  );
  const control: Control = {
    suspended: new Set(),
    disabled: new Set(),
    failState: false,
    steps: [],
    runs: 0,
  };
  const worker = new TaskWorker(scoped, (owner, task, ctx) => execute(owner, task, ctx, control), {
    tenantActive: async (tenantId) => {
      if (control.failState) throw new Error("estado no disponible");
      return !control.suspended.has(tenantId);
    },
    assigneeActive: async (_owner, task) => !control.disabled.has(task.assignedTo ?? ""),
  });
  return {
    store,
    scoped,
    worker,
    control,
    cleanup: async () => {
      await store.close();
      await rm(dataDir, { recursive: true, force: true });
    },
  };
}

// Sin caché de guard ni de autorización el corte es determinista en el paso
// siguiente, no "cuando expire el TTL".
const previousGuardCache = process.env.WORKER_GUARD_CACHE_MS;
const previousAuthzCache = process.env.WORKER_AUTHZ_CACHE_MS;

before(() => {
  process.env.WORKER_GUARD_CACHE_MS = "0";
  process.env.WORKER_AUTHZ_CACHE_MS = "0";
});

after(() => {
  if (previousGuardCache === undefined) delete process.env.WORKER_GUARD_CACHE_MS;
  else process.env.WORKER_GUARD_CACHE_MS = previousGuardCache;
  if (previousAuthzCache === undefined) delete process.env.WORKER_AUTHZ_CACHE_MS;
  else process.env.WORKER_AUTHZ_CACHE_MS = previousAuthzCache;
});

test("suspender la empresa a mitad de tarea corta el trabajo y lo reanuda al levantarla", async () => {
  let fixture: Fixture;
  fixture = await buildFixture(async (_owner, task, ctx, control) => {
    control.runs += 1;
    await ctx.guard();
    control.steps.push("inicio");
    if (control.runs === 1) control.suspended.add(task.tenantId!);
    // A partir de aquí la empresa está suspendida: el guard debe cortar antes
    // de que el handler haga otro paso.
    await ctx.guard();
    control.steps.push("paso-prohibido");
    return { status: "succeeded" };
  });
  try {
    // Fila cruda con su clave compuesta: el worker la reclama como cualquier
    // tarea escrita por el engine (`tenant:owner`).
    await fixture.store.put(
      "empresa-a:propietario",
      "tasks",
      queuedTask("tarea-a", "empresa-a", "laia"),
    );

    await fixture.worker.tick();

    // Efecto cortado: el handler no completó el segundo paso.
    assert.deepEqual(fixture.control.steps, ["inicio"]);
    const stopped = await fixture.store.get<AgentTask>(
      "empresa-a:propietario",
      "tasks",
      "tarea-a",
    );
    assert.equal(stopped?.status, "queued", "la tarea vuelve a la cola, no a failed");
    assert.equal(stopped?.error ?? null, null, "parar por suspensión no es un fallo del trabajo");
    assert.equal(stopped?.leaseId ?? null, null);
    assert.equal(stopped?.attempts, 1);
    assert.equal(stopped?.assignedTo, "laia", "no se reescribe la identidad");

    // Levantar la suspensión reanuda la MISMA tarea y termina.
    fixture.control.suspended.clear();
    await fixture.worker.tick();

    assert.deepEqual(fixture.control.steps, ["inicio", "inicio", "paso-prohibido"]);
    const resumed = await fixture.store.get<AgentTask>(
      "empresa-a:propietario",
      "tasks",
      "tarea-a",
    );
    assert.equal(resumed?.status, "succeeded");
    assert.equal(resumed?.attempts, 2);
  } finally {
    await fixture.cleanup();
  }
});

test("deshabilitar el agente asignado a mitad de tarea corta el trabajo y rehabilitarlo lo reanuda", async () => {
  let fixture: Fixture;
  fixture = await buildFixture(async (_owner, task, ctx, control) => {
    control.runs += 1;
    await ctx.guard();
    control.steps.push("inicio");
    if (control.runs === 1) control.disabled.add(task.assignedTo!);
    await ctx.guard();
    control.steps.push("paso-prohibido");
    return { status: "succeeded" };
  });
  try {
    // Fila cruda con su clave compuesta: el worker la reclama como cualquier
    // tarea escrita por el engine (`tenant:owner`).
    await fixture.store.put(
      "empresa-a:propietario",
      "tasks",
      queuedTask("tarea-marcos", "empresa-a", "marcos"),
    );

    await fixture.worker.tick();

    assert.deepEqual(fixture.control.steps, ["inicio"]);
    const stopped = await fixture.store.get<AgentTask>(
      "empresa-a:propietario",
      "tasks",
      "tarea-marcos",
    );
    assert.equal(stopped?.status, "queued");
    assert.equal(stopped?.error ?? null, null);
    assert.equal(stopped?.attempts, 1);

    fixture.control.disabled.clear();
    await fixture.worker.tick();

    assert.deepEqual(fixture.control.steps, ["inicio", "inicio", "paso-prohibido"]);
    const resumed = await fixture.store.get<AgentTask>(
      "empresa-a:propietario",
      "tasks",
      "tarea-marcos",
    );
    assert.equal(resumed?.status, "succeeded");
    assert.equal(resumed?.attempts, 2);
  } finally {
    await fixture.cleanup();
  }
});
