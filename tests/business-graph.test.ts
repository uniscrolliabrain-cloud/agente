import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { BusinessGraph } from "../apps/server/src/engine/business/graph.ts";
import { BusinessTruth } from "../apps/server/src/engine/business/truth.ts";

test("createEntity guarda provenance obligatoria", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    const entity = await graph.createEntity("owner", {
      type: "customer", name: "Acme S.L.", actor: "test", source: "unit-test", properties: { cif: "B12345678" },
    });
    assert.equal(entity.type, "customer");
    assert.equal(entity.name, "Acme S.L.");
    assert.equal(entity.provenance.actor, "test");
    assert.equal(entity.provenance.source, "unit-test");
    assert.ok(entity.provenance.updatedAt);
    const stored = await graph.getEntity("owner", entity.id);
    assert.deepEqual(stored, entity);
  } finally { await db.close(); }
});

test("createEntity con id duplicado lanza 409", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    await graph.createEntity("owner", { id: "fixed", type: "customer", name: "A", actor: "t", source: "s" });
    await assert.rejects(
      graph.createEntity("owner", { id: "fixed", type: "customer", name: "B", actor: "t", source: "s" }),
      /already exists/i,
    );
  } finally { await db.close(); }
});

test("updateEntity preserva properties no tocadas y actualiza provenance", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    const entity = await graph.createEntity("owner", {
      type: "customer", name: "A", actor: "first", source: "s1", properties: { cif: "X", city: "Valencia" },
    });
    const updated = await graph.updateEntity("owner", entity.id, {
      name: "A updated", properties: { city: "Madrid" }, actor: "second", source: "s2",
    });
    assert.equal(updated.name, "A updated");
    assert.equal(updated.properties.cif, "X");
    assert.equal(updated.properties.city, "Madrid");
    assert.equal(updated.provenance.actor, "second");
    assert.equal(updated.provenance.source, "s2");
  } finally { await db.close(); }
});

test("listEntities filtra por type", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    await graph.createEntity("owner", { type: "customer", name: "A", actor: "t", source: "s" });
    await graph.createEntity("owner", { type: "job", name: "B", actor: "t", source: "s" });
    await graph.createEntity("owner", { type: "customer", name: "C", actor: "t", source: "s" });
    assert.equal((await graph.listEntities("owner", "customer")).length, 2);
    assert.equal((await graph.listEntities("owner", "job")).length, 1);
    assert.equal((await graph.listEntities("owner")).length, 3);
  } finally { await db.close(); }
});

test("createRelation exige que ambas entidades existan", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    const a = await graph.createEntity("owner", { type: "customer", name: "A", actor: "t", source: "s" });
    const b = await graph.createEntity("owner", { type: "job", name: "B", actor: "t", source: "s" });
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: a.id, toEntityId: "missing", type: "has", actor: "t", source: "s" }),
      /To entity not found/i,
    );
    const relation = await graph.createRelation("owner", { fromEntityId: a.id, toEntityId: b.id, type: "has", actor: "t", source: "s" });
    assert.equal(relation.fromEntityId, a.id);
    assert.equal(relation.toEntityId, b.id);
    assert.equal(relation.type, "has");
  } finally { await db.close(); }
});

test("relation no puede ser self-referencial", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    const a = await graph.createEntity("owner", { type: "customer", name: "A", actor: "t", source: "s" });
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: a.id, toEntityId: a.id, type: "self", actor: "t", source: "s" }),
      /self-referential/i,
    );
  } finally { await db.close(); }
});

test("neighborhood depth 1 y 2 devuelve entidades conectadas", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    await graph.createEntity("owner", { id: "a", type: "customer", name: "A", actor: "t", source: "s" });
    await graph.createEntity("owner", { id: "b", type: "job", name: "B", actor: "t", source: "s" });
    await graph.createEntity("owner", { id: "c", type: "job", name: "C", actor: "t", source: "s" });
    await graph.createRelation("owner", { fromEntityId: "a", toEntityId: "b", type: "has", actor: "t", source: "s" });
    await graph.createRelation("owner", { fromEntityId: "b", toEntityId: "c", type: "next", actor: "t", source: "s" });
    const n1 = await graph.neighborhood("owner", "a", 1);
    assert.equal(n1.entities.length, 2);
    assert.equal(n1.relations.length, 1);
    const n2 = await graph.neighborhood("owner", "a", 2);
    assert.equal(n2.entities.length, 3);
    assert.equal(n2.relations.length, 2);
  } finally { await db.close(); }
});

test("deleteEntity borra tambien sus relaciones huerfanas", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    const a = await graph.createEntity("owner", { type: "customer", name: "A", actor: "t", source: "s" });
    const b = await graph.createEntity("owner", { type: "job", name: "B", actor: "t", source: "s" });
    await graph.createRelation("owner", { fromEntityId: a.id, toEntityId: b.id, type: "has", actor: "t", source: "s" });
    await graph.deleteEntity("owner", a.id, "t");
    assert.equal(await graph.getEntity("owner", a.id), null);
    assert.equal((await graph.listRelations("owner")).length, 0);
  } finally { await db.close(); }
});

test("BusinessTruth proyecta cada property con su provenance", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    const truth = new BusinessTruth(graph);
    const entity = await graph.createEntity("owner", {
      type: "invoice", name: "F-2026-001", actor: "sop:factura", source: "sop:factura",
      properties: { amount: 350, currency: "EUR" }, confidence: 0.95,
    });
    const t = await truth.forEntity("owner", entity.id);
    assert.ok(t);
    assert.equal(t.entityId, entity.id);
    assert.equal(t.properties.amount.value, 350);
    assert.equal(t.properties.amount.actor, "sop:factura");
    assert.equal(t.properties.amount.confidence, 0.95);
  } finally { await db.close(); }
});

test("business entities estan scoped por owner", async () => {
  const db = await createStore();
  try {
    const graph = new BusinessGraph(db);
    await graph.createEntity("owner-a", { type: "customer", name: "A", actor: "t", source: "s" });
    assert.equal((await graph.listEntities("owner-b")).length, 0);
  } finally { await db.close(); }
});
