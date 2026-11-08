// VERTICAL_SLICE_MEMORY_TEST_V1 - hechos compartidos y recall acreditado (10).
//
// Cierre de campana:
//   - dos humanos de A recuperan el hecho sembrado; B no;
//   - el hecho vigente es el de version mas alta, con su origen;
//   - el recuerdo privado solo lo recupera su dueno (ni companero ni otra
//     empresa), y sobrevive a reiniciar el servicio;
//   - el ensamblador solo inyecta privados del humano que pregunta;
//   - los meta-hints se persisten por turno y no se mezclan con el perfil.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { BusinessGraph } from "../apps/server/src/engine/business/graph.ts";
import { ContextEngine } from "../apps/server/src/engine/context/engine.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import { MetaHintsStore } from "../apps/server/src/engine/feedback/meta-hints-store.ts";
import {
  MemoryService,
  PROFILE_FACTS_COLLECTION,
  publishProfileFact,
} from "../apps/server/src/engine/memory.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { seedProfileFacts } from "../scripts/lib/agency-bootstrap.ts";

const PROFILE_A = {
  tenantId: "agencia-a",
  displayName: "Agencia A",
  offer: "Captacion de leads para clinicas pequenas",
  tone: "Directo, sin jerga",
};
const PROFILE_B = {
  tenantId: "agencia-b",
  displayName: "Agencia B",
  offer: "Contenido para marcas de deporte",
  tone: "Cercano",
};

const FUNDADOR_A = "agencia-a:fundador-a";
const OPS_A = "agencia-a:ops-a";
const FUNDADOR_B = "agencia-b:fundador-b";

async function fixture() {
  const db = await createStore();
  const memory = new MemoryService(db, new RagService(db));
  await seedProfileFacts({
    db,
    tenantId: "agencia-a",
    owners: ["fundador-a", "ops-a"],
    profile: PROFILE_A,
    version: 1,
    origin: "tpl_a",
  });
  await seedProfileFacts({
    db,
    tenantId: "agencia-b",
    owners: ["fundador-b"],
    profile: PROFILE_B,
    version: 1,
    origin: "tpl_b",
  });
  return { db, memory };
}

test("dos humanos de A recuperan el hecho sembrado y B no", async () => {
  const { db, memory } = await fixture();
  try {
    const fundador = await memory.recall(FUNDADOR_A, "que oferta tenemos");
    const ops = await memory.recall(OPS_A, "que oferta tenemos");
    assert.equal(fundador.facts.length, 1);
    assert.equal(ops.facts.length, 1);
    assert.equal(fundador.facts[0].key, "oferta");
    assert.match(fundador.facts[0].value, /clinicas pequenas/);
    assert.equal(fundador.facts[0].origin, "tpl_a");
    assert.match(fundador.text, /Hechos de empresa/);
    assert.deepEqual(
      fundador.facts.map(({ key, value, version, origin }) => ({ key, value, version, origin })),
      ops.facts.map(({ key, value, version, origin }) => ({ key, value, version, origin })),
    );

    const otra = await memory.recall(FUNDADOR_B, "que oferta tenemos");
    assert.ok(otra.facts.every((fact) => fact.value !== fundador.facts[0].value));
    assert.doesNotMatch(otra.text, /clinicas pequenas/);
  } finally {
    await db.close();
  }
});

test("precedencia por version: gana la ultima, la vieja no degrada y el origen queda", async () => {
  const { db, memory } = await fixture();
  try {
    const v2 = await publishProfileFact(db, FUNDADOR_A, {
      key: "oferta",
      value: "Captacion de leads para clinicas y estudios",
      version: 2,
      origin: "edicion-owner",
    });
    assert.equal(v2.created, true);

    const facts = await memory.currentFacts(FUNDADOR_A);
    const oferta = facts.find((fact) => fact.key === "oferta");
    assert.equal(oferta?.version, 2);
    assert.equal(oferta?.origin, "edicion-owner");

    // Republicar la version vieja no pisa la vigente.
    const old = await publishProfileFact(db, FUNDADOR_A, {
      key: "oferta",
      value: "texto viejo",
      version: 1,
      origin: "tpl_a",
    });
    assert.equal(old.created, false);
    assert.equal((await memory.currentFacts(FUNDADOR_A)).find((f) => f.key === "oferta")?.version, 2);

    // La misma version con otro valor es conflicto, no sobrescritura silenciosa.
    await assert.rejects(
      () =>
        publishProfileFact(db, FUNDADOR_A, {
          key: "oferta",
          value: "otro texto",
          version: 2,
          origin: "edicion-owner",
        }),
      /FACT_VERSION_CONFLICT/,
    );
  } finally {
    await db.close();
  }
});

test("relectura tras reinicio: un servicio nuevo ve el hecho vigente", async () => {
  const { db, memory } = await fixture();
  try {
    await publishProfileFact(db, FUNDADOR_A, {
      key: "tono",
      value: "Directo y breve",
      version: 3,
      origin: "edicion-owner",
    });
    const restarted = new MemoryService(db, new RagService(db));
    const facts = await restarted.currentFacts(FUNDADOR_A);
    assert.equal(facts.find((fact) => fact.key === "tono")?.value, "Directo y breve");
    assert.equal(facts.find((fact) => fact.key === "tono")?.origin, "edicion-owner");
  } finally {
    await db.close();
  }
});

test("el recuerdo privado solo lo ve su dueno: ni companero ni otra empresa", async () => {
  const { db, memory } = await fixture();
  try {
    await memory.rememberPrivate(OPS_A, "No mencionar el descuento del 20% delante del cliente");
    await memory.rememberPrivate(FUNDADOR_B, "Margen minimo: 30 por ciento");

    const own = await memory.recall(OPS_A, "descuento del cliente", { privateOwner: OPS_A });
    assert.equal(own.privateMemories.length, 1);
    assert.match(own.text, /descuento del 20%/);

    // Companero de la misma empresa: mismos hechos de empresa, cero privados.
    const peer = await memory.recall(OPS_A, "descuento del cliente", { privateOwner: FUNDADOR_A });
    assert.equal(peer.privateMemories.length, 0);
    assert.doesNotMatch(peer.text, /descuento del 20%/);

    // Otra empresa: tampoco ve el recuerdo privado de A ni el suyo se cruza.
    const other = await memory.recall(FUNDADOR_B, "descuento del cliente", {
      privateOwner: FUNDADOR_B,
    });
    assert.equal(other.privateMemories.length, 1);
    assert.doesNotMatch(other.text, /descuento del 20%/);
    assert.match(other.text, /Margen minimo/);

    // Y sin privateOwner no hay recuerdos privados de nadie.
    const anonymous = await memory.recall(OPS_A, "descuento del cliente");
    assert.equal(anonymous.privateMemories.length, 0);
  } finally {
    await db.close();
  }
});

test("el ensamblador inyecta solo los privados del humano que pregunta", async () => {
  const { db, memory } = await fixture();
  try {
    const now = new Date().toISOString();
    await db.put(OPS_A, "agent-roles", {
      id: "comercial",
      name: "Leo",
      tone: "concise",
      objetivo: "Cerrar ventas",
      sops: [],
      active: true,
      memories: [],
      createdAt: now,
    });
    await memory.rememberPrivate(OPS_A, "Prefiero cerrar por telefono, no por email");

    const context = new ContextEngine(db, new BusinessGraph(db), memory, new EventBus(db));
    const mine = await context.assemble(OPS_A, {
      roleId: "comercial",
      query: "que oferta tenemos",
      viewerId: OPS_A,
    });
    assert.equal(mine.recall.privateMemories.length, 1);
    assert.match(mine.recall.text, /cerrar por telefono/);
    assert.equal(mine.recall.facts.length, 1, "el hecho de empresa tambien llega");

    const peer = await context.assemble(OPS_A, {
      roleId: "comercial",
      query: "que oferta tenemos",
      viewerId: FUNDADOR_A,
    });
    assert.equal(peer.recall.privateMemories.length, 0);
    assert.doesNotMatch(peer.recall.text, /cerrar por telefono/);
  } finally {
    await db.close();
  }
});

test("los meta-hints se persisten por turno sin mezclarse con el perfil canonico", async () => {
  const { db, memory } = await fixture();
  try {
    const store = new MetaHintsStore(db);
    const persisted = await store.persist("agencia-a", "fundador-a", "turn-1", [
      {
        rule: "slow_ready_fast_idle",
        urgency: "medium",
        message: "Evita prometer resultados garantizados",
      },
    ]);
    assert.equal(persisted.length, 1);
    assert.equal(persisted[0].tenantId, "agencia-a");

    const byTurn = await store.byTurn("agencia-a", "turn-1");
    assert.equal(byTurn.length, 1);
    assert.match(byTurn[0].message, /resultados garantizados/);

    // Canal separado: no crea hechos de perfil ni memorias de empresa.
    const facts = await db.list(PROFILE_FACTS_COLLECTION, "profile-facts").catch(() => []);
    assert.ok(Array.isArray(facts));
    const current = await memory.currentFacts(FUNDADOR_A);
    assert.ok(current.every((fact) => !fact.value.includes("resultados garantizados")));
    const recall = await memory.recall(FUNDADOR_A, "resultados garantizados");
    assert.equal(recall.facts.length, 0);
  } finally {
    await db.close();
  }
});
