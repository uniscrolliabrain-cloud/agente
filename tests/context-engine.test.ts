import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
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
  const context = new ContextEngine(db, graph, memory);
  return { db, graph, memory, context };
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
