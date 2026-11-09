import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import { BusinessGraph } from "../apps/server/src/engine/business/graph.ts";
import { ContextEngine } from "../apps/server/src/engine/context/engine.ts";
import { renderContext } from "../apps/server/src/engine/context/assembly.ts";
import { MemoryService } from "../apps/server/src/engine/memory.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";

async function makeFixture() {
  const db = await createStore();
  const graph = new BusinessGraph(db);
  const rag = new RagService(db);
  const memory = new MemoryService(db, rag);
  const bus = new EventBus(db);
  const context = new ContextEngine(db, graph, memory, bus);
  return { db, graph, memory, context, bus };
}

test("assemble sin entidad devuelve rol con sus memorias", async () => {
  const f = await makeFixture();
  try {
    await f.db.put("o1", "agent-roles", {
      id: "comercial", name: "Leo", tone: "concise", avatar: "sky",
      objetivo: "Cerrar ventas", sops: [], active: true, memories: [],
      createdAt: new Date().toISOString(),
    });
    await f.db.put("o1", "memories", {
      id: "m1", text: "Tutear siempre", source: "Rol Leo",
      category: "rol-identidad", roleId: "comercial",
      createdAt: new Date().toISOString(),
    });
    const pkg = await f.context.assemble("o1", { roleId: "comercial", query: "hola" });
    assert.equal(pkg.role.id, "comercial");
    assert.equal(pkg.role.name, "Leo");
    assert.equal(pkg.role.memories.length, 1);
    assert.equal(pkg.entity, undefined);
    assert.equal(pkg.relations.length, 0);
  } finally { await f.db.close(); }
});

test("assemble con entidad devuelve relaciones", async () => {
  const f = await makeFixture();
  try {
    await f.db.put("o1", "agent-roles", {
      id: "operaciones", name: "Omar", tone: "concise", avatar: "sky",
      objetivo: "Desbloquear", sops: [], active: true, memories: [],
      createdAt: new Date().toISOString(),
    });
    const job = await f.graph.createEntity("o1", { id: "job-1", type: "job", name: "Fontaneria", actor: "t", source: "s" });
    const tech = await f.graph.createEntity("o1", { id: "tech-1", type: "technician", name: "Ana", actor: "t", source: "s" });
    await f.graph.createRelation("o1", { fromEntityId: job.id, toEntityId: tech.id, type: "assigned_to", actor: "t", source: "s" });
    const pkg = await f.context.assemble("o1", { roleId: "operaciones", query: "estado", entityId: "job-1" });
    assert.equal(pkg.entity?.id, "job-1");
    assert.equal(pkg.relations.length, 1);
    assert.equal(pkg.relations[0].type, "assigned_to");
  } finally { await f.db.close(); }
});

test("renderContext incluye rol, entidad y memorias", async () => {
  const f = await makeFixture();
  try {
    await f.db.put("o1", "agent-roles", {
      id: "rrhh", name: "Elena", tone: "thoughtful", avatar: "lilac",
      objetivo: "Onboarding", sops: [], active: true,
      memories: [{ kind: "identidad", text: "Empatica" }],
      createdAt: new Date().toISOString(),
    });
    const cand = await f.graph.createEntity("o1", { id: "cand-1", type: "candidate", name: "Maria", actor: "t", source: "s", properties: { role: "developer" } });
    const pkg = await f.context.assemble("o1", { roleId: "rrhh", query: "candidata", entityId: cand.id });
    const text = renderContext(pkg);
    assert.match(text, /Elena/);
    assert.match(text, /Maria/);
    assert.match(text, /candidate/);
    assert.match(text, /Empatica/);
  } finally { await f.db.close(); }
});

test("assemble falla si el rol no existe", async () => {
  const f = await makeFixture();
  try {
    await assert.rejects(
      f.context.assemble("o1", { roleId: "no-existe", query: "x" }),
      /Role not found/i,
    );
  } finally { await f.db.close(); }
});

test("assemble limits recent events to the selected entity before applying the limit", async () => {
  const { db, graph, bus, context } = await makeFixture();
  try {
    const owner = "o1";
    const roleId = "operaciones";
    await db.put(owner, "agent-roles", {
      id: roleId, name: "Omar", tone: "concise", objetivo: "Desbloquear",
      sops: [], active: true, memories: [], createdAt: new Date().toISOString(),
    });
    const first = await graph.createEntity(owner, { id: "job-1", type: "job", name: "One", actor: "t", source: "s" });
    const second = await graph.createEntity(owner, { id: "job-2", type: "job", name: "Two", actor: "t", source: "s" });
    await bus.emit(owner, "entity.created", { kind: "entity", id: first.id }, { entityId: first.id, entityType: first.type, version: 1 });
    await bus.emit(owner, "entity.created", { kind: "entity", id: second.id }, { entityId: second.id, entityType: second.type, version: 1 });

    const pkg = await context.assemble(owner, { roleId, query: "estado", entityId: first.id, eventLimit: 1 });
    assert.deepEqual(pkg.events.map((event) => event.source.id), [first.id]);
  } finally { await db.close(); }
});

// CONTEXT_EXECUTION_TEST_V1 (campana 13) - la consulta de un hilo vinculado cita
// su ejecucion y resuelve su entidad; sin vinculo no se inventa ninguna.
test("assemble resuelve la ejecucion vinculada y su entidad", async () => {
  const { db, graph, context } = await makeFixture();
  try {
    const owner = "o1";
    await db.put(owner, "agent-roles", {
      id: "operaciones", name: "Omar", tone: "concise", objetivo: "Desbloquear",
      sops: [], active: true, memories: [], createdAt: new Date().toISOString(),
    });
    await graph.createEntity(owner, { id: "job-1", type: "job", name: "Fontaneria", actor: "t", source: "s" });
    const now = new Date().toISOString();
    await db.put(owner, "tasks", {
      id: "exec-1", tenantId: owner, title: "Reactivacion", prompt: "reactivar",
      kind: "sop", status: "waiting_input", assignedTo: "marta", plan: [], evidence: [],
      input: {}, state: { entityId: "job-1", sopId: "sop-react" },
      createdAt: now, updatedAt: now, attempts: 0, leaseId: null, leaseUntil: null, artifactIds: [],
    });

    const pkg = await context.assemble(owner, {
      roleId: "operaciones", query: "por que se paro", executionId: "exec-1", entityId: "job-1",
    });
    assert.deepEqual(pkg.execution, {
      id: "exec-1", title: "Reactivacion", status: "waiting_input", sopId: "sop-react", entityId: "job-1",
    });
    assert.equal(pkg.entity?.id, "job-1");

    const plain = await context.assemble(owner, { roleId: "operaciones", query: "hola" });
    assert.equal(plain.execution, undefined);
  } finally { await db.close(); }
});
