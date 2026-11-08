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

test("un worker nuevo restaura tenant y actor persistidos al reclamar o recuperar", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "a03-worker-"));
  try {
    const original = await createStore({ dataDir });
    const receivedAt = "2026-01-01T00:00:00.000Z";
    try {
      for (const status of ["queued", "running"] as const) {
        const task: AgentTask = {
          id: status, tenantId: "empresa-b", assignedBy: "solicitante",
          title: status, prompt: status, kind: "agent", status,
          plan: [], evidence: [], input: {}, state: {},
          createdAt: receivedAt, updatedAt: receivedAt, attempts: 0,
          leaseId: status === "running" ? "lease-anterior" : null,
          leaseUntil: status === "running" ? receivedAt : null,
          artifactIds: [],
        };
        await original.put("empresa-b:propietario", "tasks", task);
      }
    } finally {
      await original.close();
    }

    const reopened = await createStore({ dataDir });
    try {
      const scoped = new TenantScopedStore(reopened, async () => currentTenantScope()?.tenantId ?? "empresa-a");
      const seen = new Map<string, ReturnType<typeof currentTenantScope>>();
      const worker = new TaskWorker(scoped, async (_owner, task) => {
        seen.set(task.id, currentTenantScope());
        return { status: "succeeded" };
      });
      await worker.tick();

      for (const id of ["queued", "running"]) {
        assert.deepEqual(seen.get(id), { tenantId: "empresa-b", actorId: "solicitante" });
        const task = await reopened.get<AgentTask>("empresa-b:propietario", "tasks", id);
        assert.equal(task?.status, "succeeded");
        assert.equal(task.tenantId, "empresa-b");
        assert.equal(task.assignedBy, "solicitante");
        assert.equal(await reopened.get("empresa-a:propietario", "tasks", id), null);
      }
    } finally {
      await reopened.close();
    }
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});
