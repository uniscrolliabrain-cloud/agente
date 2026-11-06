// TENANT_WORKER_CLAIM_TEST_V1 - el worker debe reclamar la tarea de la empresa
// correcta cuando el mismo usuario pertenece a dos y actua fuera de una peticion.
//
// El fallo que cubre: `TaskWorker.tick` recibia owners ya pelados (sin tenant) y
// `compareAndSwap` volvia a resolver la membership PRIMARIA del usuario. La tarea
// de la segunda empresa se buscaba en la primera y no se ejecutaba nunca. Este
// test la siembra en dos tenants y exige que las dos corran, cada una con su
// tenant fijado en el scope.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { TaskWorker } from "../apps/server/src/engine/worker.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

const OWNER = "dueno-compartido";

function task(id: string, title: string): AgentTask {
  return {
    id,
    tenantId: "placeholder",
    title,
    prompt: title,
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

test("el worker reclama tambien la tarea de la segunda empresa del usuario", async (t) => {
  const db = await createStore();
  t.after(() => db.close());

  // Membership primaria: empresa-a. El usuario tambien esta en empresa-b, pero
  // el worker no tiene claim que lo diga: tiene que salir de la fila.
  const tdb = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "empresa-a");

  await runInTenantScope({ tenantId: "empresa-a", actorId: OWNER }, () =>
    tdb.put(OWNER, "tasks", task("tarea-1", "alpha")),
  );
  await runInTenantScope({ tenantId: "empresa-b", actorId: OWNER }, () =>
    tdb.put(OWNER, "tasks", task("tarea-2", "beta")),
  );

  const seen: string[] = [];
  const worker = new TaskWorker(tdb, async (_owner, value) => {
    // El handler ve el tenant de SU fila, no el primario del usuario.
    seen.push(`${currentTenantScope()?.tenantId}:${value.title}`);
    return { status: "succeeded" };
  });

  await worker.tick();

  assert.deepEqual(seen.sort(), ["empresa-a:alpha", "empresa-b:beta"]);

  // Y cada fila termina en su propio tenant: la de B no se escribio en A.
  const a = await db.get<AgentTask>(`empresa-a:${OWNER}`, "tasks", "tarea-1");
  const b = await db.get<AgentTask>(`empresa-b:${OWNER}`, "tasks", "tarea-2");
  assert.equal(a?.status, "succeeded");
  assert.equal(b?.status, "succeeded");
  assert.equal(await db.get(`empresa-a:${OWNER}`, "tasks", "tarea-2"), null);
});

test("sin scopes guardados, el worker sigue reclamando filas sin prefijo", async (t) => {
  // Compatibilidad: tests y datos anteriores escriben owner plano en el store
  // crudo. Esas filas no declaran tenant y deben seguir ejecutandose.
  const db = await createStore();
  t.after(() => db.close());
  await db.put("owner", "tasks", task("tarea-plana", "plana"));

  let ran = 0;
  const worker = new TaskWorker(db, async () => {
    ran++;
    return { status: "succeeded" };
  });
  await worker.tick();

  assert.equal(ran, 1);
  assert.equal((await db.get<AgentTask>("owner", "tasks", "tarea-plana"))?.status, "succeeded");
});
