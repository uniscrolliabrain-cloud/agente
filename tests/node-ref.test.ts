// NODE_REF_V1 - la atencion de dos autores debe reconocer el mismo nodo
// aunque uno escriba `entity:acme` y el otro `ACME` o `Ácme`.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  attentionOverlap,
  attentionVectorSchema,
} from "../apps/server/src/kernel/index.ts";
import {
  canonicalNode,
  nodeMentions,
  parseNodeRef,
  sameNode,
} from "../packages/domain/src/node-ref.ts";

function vector(primary: string, matched: Array<{ node: string; weight: number }>) {
  return attentionVectorSchema.parse({
    id: `att-${primary}`,
    author: "slow",
    primary,
    secondary: [],
    query: "consulta",
    matched: matched.map((entry) => ({
      node: entry.node,
      weight: entry.weight,
      reason: "explicit_reference",
      metadata: {},
    })),
    ignored: [],
    intent: "observe",
    confidence: 0.8,
    scope: "turn",
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}

test("canonicalNode normaliza acentos, mayusculas y espacios", () => {
  assert.equal(canonicalNode("  Entidad: Ácme  "), "entidad: acme");
  assert.equal(canonicalNode("ENTITY:ACME"), "entity:acme");
});

test("parseNodeRef separa kind e id solo con prefijos conocidos", () => {
  assert.deepEqual(parseNodeRef("entity:Acme"), {
    kind: "entity",
    id: "acme",
    raw: "entity:acme",
  });
  assert.deepEqual(parseNodeRef("ACME"), { kind: "unknown", id: "acme", raw: "acme" });
  assert.deepEqual(parseNodeRef("http://x"), {
    kind: "unknown",
    id: "http://x",
    raw: "http://x",
  });
});

test("sameNode reconoce el id con y sin prefijo y respeta el kind", () => {
  assert.equal(sameNode("entity:acme", "ACME"), true);
  assert.equal(sameNode("entity:Ácme", "entity:acme"), true);
  assert.equal(sameNode("entity:acme", "entity:other"), false);
  assert.equal(sameNode("task:1", "entity:1"), false);
});

test("nodeMentions encuentra el nodo en texto libre sin falsos cortos", () => {
  assert.equal(nodeMentions("La cuenta de Acme crecio", "entity:acme"), true);
  assert.equal(nodeMentions("La cuenta de Ácme crecio", "entity:acme"), true);
  assert.equal(nodeMentions("Otra empresa", "entity:acme"), false);
  assert.equal(nodeMentions("abc", "entity:ab"), false);
});

test("attentionOverlap es 1 para el mismo nodo escrito distinto", () => {
  const left = vector("entity:acme", [{ node: "entity:acme", weight: 1 }]);
  const right = vector("ACME", [{ node: "ACME", weight: 1 }]);
  assert.equal(attentionOverlap(left, right), 1);
});

test("attentionOverlap baja cuando los nodos no coinciden", () => {
  const left = vector("entity:acme", [{ node: "entity:acme", weight: 1 }]);
  const right = vector("entity:other", [{ node: "entity:other", weight: 1 }]);
  assert.equal(attentionOverlap(left, right), 0);
});
