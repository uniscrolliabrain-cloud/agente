import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertCardPublicationUnambiguous,
  CardPriorityConflict,
  selectCard,
} from "../packages/domain/src/card-selection.ts";

const base = {
  id: "general", status: "approved" as const, locale: "es-ES", channels: ["panel"],
  roleIds: ["laia"], intents: ["estado"], sopIds: [] as string[], states: [] as string[], priority: 30,
};
const revision = (card: Partial<Omit<typeof base, "status">> & { status?: "approved" | "draft" | "retired" } = {}, tenantId = "a") => ({
  tenantId, card: { ...base, ...card },
});
const match = { tenantId: "a", locale: "es-ES", roleId: "laia", channel: "panel", intent: "estado" };

test("selecciona la prioridad mayor dentro del contexto autorizado", () => {
  const general = revision();
  const specific = revision({ id: "specific", priority: 50, states: ["abierta"], sopIds: ["captacion"] });
  const draft = revision({ id: "draft", priority: 100, status: "draft" });
  const foreign = revision({ id: "foreign", priority: 100 }, "b");
  const active = [draft, general, specific, foreign];

  assert.equal(selectCard(active, match), general);
  assert.equal(selectCard(active, { ...match, state: "abierta", sopId: "captacion" }), specific);
  assert.equal(selectCard(active, { ...match, intent: "ausente" }), undefined);
  assert.deepEqual(active, [draft, general, specific, foreign]);
});

test("un empate en la prioridad máxima falla en ambos órdenes", () => {
  const a = revision();
  const b = revision({ id: "alternativa" });
  assert.throws(() => selectCard([a, b], match), CardPriorityConflict);
  assert.throws(() => selectCard([b, a], match), CardPriorityConflict);
  const higher = revision({ id: "preferida", priority: 31 });
  assert.equal(selectCard([a, higher, b], match), higher);
});

test("publicar rechaza el solape entre una tarjeta general y una acotada", () => {
  const current = revision();
  const candidate = revision({ id: "acotada", states: ["abierta"], sopIds: ["captacion"] });
  assert.throws(() => assertCardPublicationUnambiguous([current], candidate), CardPriorityConflict);
  assert.doesNotThrow(() => assertCardPublicationUnambiguous([current], revision({ id: "acotada", priority: 31 })));
  assert.doesNotThrow(() => assertCardPublicationUnambiguous([current], revision({}, "a")));
});

test("publicar admite dimensiones disjuntas y tenants distintos", () => {
  const current = revision({ id: "actual", states: ["abierta"] });
  assert.doesNotThrow(() => assertCardPublicationUnambiguous([current], revision({ id: "cerrada", states: ["cerrada"] })));
  assert.doesNotThrow(() => assertCardPublicationUnambiguous([current], revision({ id: "otro" }, "b")));
  assert.doesNotThrow(() => assertCardPublicationUnambiguous([current], revision({ id: "correo", channels: ["email"] })));
});
