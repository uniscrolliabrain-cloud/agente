import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { BusinessGraph } from "../apps/server/src/engine/business/graph.ts";
import { BusinessTruth } from "../apps/server/src/engine/business/truth.ts";

// BUSINESS_SCHEMA_FIXTURE_V1 - schema pequeno con relaciones y estados
// declarados. Se guarda crudo, como lo hace el instalador/admin.
async function seedSchema(db: Store, owner: string): Promise<void> {
  const now = new Date().toISOString();
  await db.put(owner, "business-schemas", {
    id: "default",
    tenantId: owner,
    version: "1.0",
    entities: [
      { type: "client", label: "Cliente", fields: [] },
      {
        type: "invoice",
        label: "Factura",
        fields: [{ name: "amount", label: "Importe", type: "number", required: true }],
        states: [
          { name: "draft", terminal: false, initialState: true },
          { name: "issued", terminal: false, initialState: false },
        ],
      },
      { type: "lead", label: "Lead", fields: [] },
    ],
    relations: [
      { type: "has_invoice", label: "Tiene factura", fromType: "client", toType: "invoice", cardinality: "one-to-many" },
      { type: "converted_to", label: "Convertido en", fromType: "lead", toType: "client", cardinality: "one-to-one" },
    ],
    createdAt: now,
    updatedAt: now,
  });
}

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

test("createRelation valida el tipo declarado y los tipos de sus extremos", async () => {
  const db = await createStore();
  try {
    await seedSchema(db, "owner");
    const graph = new BusinessGraph(db);
    const client = await graph.createEntity("owner", { type: "client", name: "Cliente A", actor: "t", source: "s" });
    const invoice = await graph.createEntity("owner", { type: "invoice", name: "F-1", actor: "t", source: "s", properties: { amount: 10 } });
    const lead = await graph.createEntity("owner", { type: "lead", name: "Lead A", actor: "t", source: "s" });
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: client.id, toEntityId: invoice.id, type: "invented", actor: "t", source: "s" }),
      /not declared/i,
    );
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: client.id, toEntityId: lead.id, type: "has_invoice", actor: "t", source: "s" }),
      /requires to type invoice/i,
    );
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: lead.id, toEntityId: invoice.id, type: "has_invoice", actor: "t", source: "s" }),
      /requires from type client/i,
    );
    const relation = await graph.createRelation("owner", { fromEntityId: client.id, toEntityId: invoice.id, type: "has_invoice", actor: "t", source: "s" });
    assert.equal(relation.type, "has_invoice");
  } finally { await db.close(); }
});

test("cardinalidad one-to-many rechaza una segunda fuente para el mismo destino", async () => {
  const db = await createStore();
  try {
    await seedSchema(db, "owner");
    const graph = new BusinessGraph(db);
    const a = await graph.createEntity("owner", { type: "client", name: "Cliente A", actor: "t", source: "s" });
    const b = await graph.createEntity("owner", { type: "client", name: "Cliente B", actor: "t", source: "s" });
    const f1 = await graph.createEntity("owner", { type: "invoice", name: "F-1", actor: "t", source: "s", properties: { amount: 10 } });
    const f2 = await graph.createEntity("owner", { type: "invoice", name: "F-2", actor: "t", source: "s", properties: { amount: 20 } });
    await graph.createRelation("owner", { fromEntityId: a.id, toEntityId: f1.id, type: "has_invoice", actor: "t", source: "s" });
    await graph.createRelation("owner", { fromEntityId: a.id, toEntityId: f2.id, type: "has_invoice", actor: "t", source: "s" });
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: b.id, toEntityId: f1.id, type: "has_invoice", actor: "t", source: "s" }),
      /cardinality/i,
    );
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: a.id, toEntityId: f1.id, type: "has_invoice", actor: "t", source: "s" }),
      /cardinality/i,
    );
    assert.equal((await graph.listRelations("owner")).length, 2);
  } finally { await db.close(); }
});

test("cardinalidad one-to-one rechaza en ambos sentidos", async () => {
  const db = await createStore();
  try {
    await seedSchema(db, "owner");
    const graph = new BusinessGraph(db);
    const l1 = await graph.createEntity("owner", { type: "lead", name: "Lead 1", actor: "t", source: "s" });
    const l2 = await graph.createEntity("owner", { type: "lead", name: "Lead 2", actor: "t", source: "s" });
    const c1 = await graph.createEntity("owner", { type: "client", name: "Cliente 1", actor: "t", source: "s" });
    const c2 = await graph.createEntity("owner", { type: "client", name: "Cliente 2", actor: "t", source: "s" });
    await graph.createRelation("owner", { fromEntityId: l1.id, toEntityId: c1.id, type: "converted_to", actor: "t", source: "s" });
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: l2.id, toEntityId: c1.id, type: "converted_to", actor: "t", source: "s" }),
      /one-to-one/i,
    );
    await assert.rejects(
      graph.createRelation("owner", { fromEntityId: l1.id, toEntityId: c2.id, type: "converted_to", actor: "t", source: "s" }),
      /one-to-one/i,
    );
    const second = await graph.createRelation("owner", { fromEntityId: l2.id, toEntityId: c2.id, type: "converted_to", actor: "t", source: "s" });
    assert.equal(second.fromEntityId, l2.id);
  } finally { await db.close(); }
});

test("las cardinalidades son por owner y no se contaminan entre tenants", async () => {
  const db = await createStore();
  try {
    await seedSchema(db, "tenant-a");
    await seedSchema(db, "tenant-b");
    const graph = new BusinessGraph(db);
    for (const owner of ["tenant-a", "tenant-b"]) {
      await graph.createEntity(owner, { id: "shared-client", type: "client", name: `${owner} client`, actor: "t", source: "s" });
      await graph.createEntity(owner, { id: "shared-invoice", type: "invoice", name: `${owner} invoice`, actor: "t", source: "s", properties: { amount: 10 } });
      await graph.createRelation(owner, { fromEntityId: "shared-client", toEntityId: "shared-invoice", type: "has_invoice", actor: "t", source: "s" });
    }
    assert.equal((await graph.listRelations("tenant-a")).length, 1);
    assert.equal((await graph.listRelations("tenant-b")).length, 1);
  } finally { await db.close(); }
});

test("subir la version del schema no invalida las entidades anteriores", async () => {
  const db = await createStore();
  try {
    await seedSchema(db, "owner");
    const graph = new BusinessGraph(db);
    const legacy = await graph.createEntity("owner", { type: "invoice", name: "F-legacy", actor: "t", source: "s", properties: { amount: 10 } });
    const now = new Date().toISOString();
    await db.put("owner", "business-schemas", {
      id: "default",
      tenantId: "owner",
      version: "2.0",
      entities: [
        { type: "client", label: "Cliente", fields: [] },
        {
          type: "invoice",
          label: "Factura",
          fields: [
            { name: "amount", label: "Importe", type: "number", required: true },
            { name: "taxId", label: "NIF", type: "string", required: true },
          ],
          states: [
            { name: "draft", terminal: false, initialState: true },
            { name: "issued", terminal: false, initialState: false },
          ],
        },
        { type: "lead", label: "Lead", fields: [] },
      ],
      relations: [
        { type: "has_invoice", label: "Tiene factura", fromType: "client", toType: "invoice", cardinality: "one-to-many" },
        { type: "converted_to", label: "Convertido en", fromType: "lead", toType: "client", cardinality: "one-to-one" },
      ],
      createdAt: now,
      updatedAt: now,
    });

    // El registro anterior sigue legible y actualizable en los campos que toca.
    assert.deepEqual(await graph.getEntity("owner", legacy.id), legacy);
    const renamed = await graph.updateEntity("owner", legacy.id, { name: "F-legacy 2", actor: "t", source: "s" });
    assert.equal(renamed.name, "F-legacy 2");
    assert.equal(renamed.properties.amount, 10);

    // Las escrituras nuevas si cumplen el schema 2.0.
    await assert.rejects(
      graph.createEntity("owner", { type: "invoice", name: "F-nueva", actor: "t", source: "s", properties: { amount: 20 } }),
      /requires field taxId/i,
    );
    const current = await graph.createEntity("owner", { type: "invoice", name: "F-nueva", actor: "t", source: "s", properties: { amount: 20, taxId: "B1" } });
    assert.equal(current.properties.taxId, "B1");
  } finally { await db.close(); }
});

test("un tipo de campo que el metamodelo no conoce falla cerrado", async () => {
  const db = await createStore();
  try {
    const now = new Date().toISOString();
    await db.put("owner", "business-schemas", {
      id: "default",
      tenantId: "owner",
      version: "1.0",
      entities: [
        { type: "customer", label: "Cliente", fields: [{ name: "id", label: "ID", type: "uuid", required: false }] },
      ],
      relations: [],
      createdAt: now,
      updatedAt: now,
    });
    const graph = new BusinessGraph(db);
    await assert.rejects(
      graph.createEntity("owner", { type: "customer", name: "A", actor: "t", source: "s" }),
      /unknown type uuid/i,
    );
  } finally { await db.close(); }
});

test("el schema valida estado en create/update y tipos de campo solo en el patch", async () => {
  const db = await createStore();
  try {
    await seedSchema(db, "owner");
    const graph = new BusinessGraph(db);
    await assert.rejects(
      graph.createEntity("owner", { type: "invoice", name: "F-0", status: "paid", actor: "t", source: "s", properties: { amount: 1 } }),
      /not declared/i,
    );
    const invoice = await graph.createEntity("owner", { type: "invoice", name: "F-1", status: "draft", actor: "t", source: "s", properties: { amount: 10 } });
    await assert.rejects(
      graph.updateEntity("owner", invoice.id, { properties: { amount: "diez" }, actor: "t", source: "s" }),
      /must be number/i,
    );
    await assert.rejects(
      graph.updateEntity("owner", invoice.id, { status: "paid", actor: "t", source: "s" }),
      /not declared/i,
    );
    const issued = await graph.updateEntity("owner", invoice.id, { status: "issued", actor: "t", source: "s" });
    assert.equal(issued.status, "issued");
    // Un registro legacy sin el required historico puede actualizar su nombre:
    // el patch solo valida los campos que toca.
    await db.put("owner", "business-entities", {
      id: "legacy-invoice",
      type: "invoice",
      name: "Legacy",
      properties: {},
      schemaVersion: "1.0",
      version: 1,
      provenance: { source: "legacy", actor: "t", updatedAt: new Date().toISOString() },
    });
    const legacy = await graph.updateEntity("owner", "legacy-invoice", { name: "Legacy 2", actor: "t", source: "s" });
    assert.equal(legacy.name, "Legacy 2");
  } finally { await db.close(); }
});
