// C05_AGENT_DISABLE_WORKER_V1 — campaña C05 (PS15), subgate local.
//
// Cierra el límite anotado en RUN-2026-11-17-10: la validación de agente
// (existe, activo, SOP autorizado) solo corría al crear la tarea tipada. Si el
// rol se deshabilitaba DESPUÉS de encolar, el worker la reclamaba y ejecutaba
// igual. Aquí se prueba por el worker real del servicio:
//   - rol deshabilitado después de encolar: la tarea queda `queued`, sin
//     intento ni efecto;
//   - al rehabilitar el rol, el mismo tick la ejecuta sin cambiar su identidad;
//   - una tarea asignada al owner (sin rol de agente) y otra con un rol que ya
//     no existe conservan el comportamiento previo: no se bloquean.
//
// No cubre: ejecución real de LLM/proveedor, worker multi-proceso, abort de una
// tarea ya `running` al deshabilitar el rol, ni revocación de capabilities.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import type { AgentRole, AgentTask } from "../packages/domain/src/agent.ts";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { testConfig } from "./helpers/config.ts";

const OWNER = "c05w-owner";
const CREATED_AT = "2026-01-01T00:00:00.000Z";

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let directory: string;

function role(id: string, active: boolean): AgentRole {
  return {
    id,
    name: `Agente ${id}`,
    tone: "warm",
    avatar: "sky",
    objetivo: "fixture local sin proveedor",
    sops: [],
    active,
    memories: [],
  };
}

function task(id: string, assignedTo: string, roleId?: string): AgentTask {
  return {
    id,
    tenantId: "default",
    assignedTo,
    assignedBy: OWNER,
    title: `trabajo ${id}`,
    prompt: "fixture local sin proveedor",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: roleId ? { roleId } : {},
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

const readTask = (id: string) => server.agent.db.get<AgentTask>(OWNER, "tasks", id);

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-c05w-"));
  db = await createStore({ dataDir: join(directory, "db") });
  server = await createApp(db, testConfig({ dataDir: directory }));
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("deshabilitar el agente después de encolar detiene el trabajo y rehabilitarlo lo reanuda", async () => {
  const scoped = server.agent.db;
  await scoped.put(OWNER, "agent-roles", role("marcos", false));
  await scoped.put(OWNER, "agent-roles", role("laia", true));
  await scoped.put(
    OWNER,
    "tasks",
    task("tarea-marcos", "marcos", "marcos"),
  );
  await scoped.put(OWNER, "tasks", task("tarea-laia", "laia", "laia"));
  // Compatibilidad: asignada al owner o a un rol que ya no existe.
  await scoped.put(OWNER, "tasks", task("tarea-owner", OWNER));
  await scoped.put(OWNER, "tasks", task("tarea-rol-borrado", "rol-borrado"));

  await server.agent.worker.tick();

  const blocked = await readTask("tarea-marcos");
  assert.equal(blocked?.status, "queued", "el agente deshabilitado no debe ejecutar");
  assert.equal(blocked?.attempts, 0);
  assert.equal(blocked?.assignedTo, "marcos");
  assert.equal(blocked?.assignedBy, OWNER);

  const active = await readTask("tarea-laia");
  assert.ok(active && active.attempts >= 1, "el agente activo si se ejecuta");
  assert.notEqual(active?.status, "queued");

  for (const id of ["tarea-owner", "tarea-rol-borrado"]) {
    const ran = await readTask(id);
    assert.ok(ran && ran.attempts >= 1, `${id} conserva el comportamiento previo`);
  }

  // Rehabilitar el rol reanuda la misma tarea, sin reescribir su identidad.
  await scoped.put(OWNER, "agent-roles", role("marcos", true));
  await server.agent.worker.tick();

  const resumed = await readTask("tarea-marcos");
  assert.ok(resumed && resumed.attempts >= 1, "al rehabilitar el agente la tarea corre");
  assert.notEqual(resumed?.status, "queued");
  assert.equal(resumed?.assignedTo, "marcos");
  assert.equal(resumed?.assignedBy, OWNER);
});
