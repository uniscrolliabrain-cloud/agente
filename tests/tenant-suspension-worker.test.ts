// C04_C07_TENANT_SUSPENSION_WORKER_V1 — subgate local.
//
// Una empresa suspendida no arranca trabajo nuevo desde el worker: la tarea
// queda en cola y se reanuda al levantar la suspensión. Un fallo al leer el
// estado se trata como suspendida (fail-closed). No se llama a proveedores.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { TaskWorker } from "../apps/server/src/engine/worker.ts";
import { currentTenantScope } from "../apps/server/src/tenant-scope.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

const RECEIVED_AT = "2026-01-01T00:00:00.000Z";

function queuedTask(tenantId: string): AgentTask {
  return {
    id: `task-${tenantId}`,
    tenantId,
    assignedBy: "solicitante",
    title: `trabajo ${tenantId}`,
    prompt: "fixture local sin proveedor",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: RECEIVED_AT,
    updatedAt: RECEIVED_AT,
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

test("el worker no reclama tareas de una empresa suspendida y las reanuda al levantarla", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "tenant-suspension-"));
  try {
    const store = await createStore({ dataDir });
    try {
      for (const tenantId of ["empresa-a", "empresa-b", "empresa-c"]) {
        await store.put(`${tenantId}:propietario`, "tasks", queuedTask(tenantId));
      }
      const scoped = new TenantScopedStore(
        store,
        async () => currentTenantScope()?.tenantId ?? "empresa-a",
      );
      const executed: string[] = [];
      let suspended = new Set(["empresa-b"]);
      let failStateC = true;
      const worker = new TaskWorker(
        scoped,
        async (_owner, task) => {
          executed.push(task.id);
          return { status: "succeeded" };
        },
        {
          tenantActive: async (tenantId) => {
            if (tenantId === "empresa-c" && failStateC) throw new Error("estado no disponible");
            return !suspended.has(tenantId);
          },
        },
      );

      await worker.tick();
      assert.deepEqual(executed, ["task-empresa-a"]);
      assert.equal(
        (await store.get<AgentTask>("empresa-a:propietario", "tasks", "task-empresa-a"))?.status,
        "succeeded",
      );
      for (const tenantId of ["empresa-b", "empresa-c"]) {
        assert.equal(
          (await store.get<AgentTask>(`${tenantId}:propietario`, "tasks", `task-${tenantId}`))
            ?.status,
          "queued",
          `${tenantId} no deberia haberse ejecutado`,
        );
      }

      suspended = new Set();
      failStateC = false;
      await worker.tick();
      assert.deepEqual(executed.sort(), [
        "task-empresa-a",
        "task-empresa-b",
        "task-empresa-c",
      ]);
      for (const tenantId of ["empresa-b", "empresa-c"]) {
        assert.equal(
          (await store.get<AgentTask>(`${tenantId}:propietario`, "tasks", `task-${tenantId}`))
            ?.status,
          "succeeded",
        );
      }
    } finally {
      await store.close();
    }
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});
