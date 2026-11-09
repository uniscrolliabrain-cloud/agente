// CONTRACTS_WIRING_TEST_V1 - campana 21: los contratos del dominio se consumen
// desde el motor, no solo se declaran.
import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesTrigger } from "../apps/server/src/engine/reactions/engine.ts";
import { parsePlannerResponse } from "../apps/server/src/engine/planner/planner.ts";
import { LearningObserver } from "../apps/server/src/engine/learning/observer.ts";
import { EntityResolver } from "../apps/server/src/engine/business/resolver.ts";
import { bootstrapCapabilities } from "../apps/server/src/engine/capabilities/bootstrap.ts";
import { CapabilityRegistry } from "../apps/server/src/engine/capabilities/registry.ts";

test("matchesTrigger respeta eventType y filter", () => {
  const trigger = { eventType: "lead.created", filter: { source: "web" } };
  assert.equal(matchesTrigger(trigger, "lead.created", { source: "web" }), true);
  assert.equal(matchesTrigger(trigger, "lead.created", { source: "mail" }), false);
  assert.equal(matchesTrigger(trigger, "lead.updated", { source: "web" }), false);
});

test("parsePlannerResponse devuelve un Plan del dominio", () => {
  const raw = '```json\n[{"title":"Leer","capabilityId":"read_mail_thread"}]\n```';
  const plan = parsePlannerResponse(raw, "plan-1", "t1", "owner", "goal-1");
  assert.ok(plan);
  assert.equal(plan.status, "draft");
  assert.equal(plan.steps[0]?.status, "pending");
});

test("EntityResolver devuelve EntityMatch con MatchReason", async () => {
  const db = {
    list: async () => [
      { id: "e1", type: "company", name: "Acme S.L.", properties: { email: "hola@acme.es" } },
    ],
  };
  const matches = await new EntityResolver(db as never).findCandidates("t1", "owner", "company", {
    id: "cand-1",
    type: "company",
    name: "Acme S.L.",
    email: "hola@acme.es",
  });
  assert.equal(matches[0]?.existingId, "e1");
  assert.equal(matches[0]?.candidateId, "cand-1");
  assert.deepEqual([...(matches[0]?.reasons ?? [])].sort(), ["normalized_name", "same_email"]);
});

test("bootstrapCapabilities publica riesgo y efectos del contrato", async () => {
  const registry = new CapabilityRegistry();
  bootstrapCapabilities(registry);
  const caps = await registry.list();
  const send = caps.find((c) => c.id === "send_email");
  assert.equal(send?.risk, "medium");
  assert.equal(send?.sideEffects[0]?.kind, "external_write");
});

test("LearningObserver guarda un hecho con la forma LearningFact", async () => {
  const rows = new Map<string, unknown>();
  const db = {
    put: async (_t: string, kind: string, value: { id: string }) => {
      rows.set(`${kind}:${value.id}`, value);
      return value;
    },
    get: async () => undefined,
    list: async () => [],
  };
  const observer = new LearningObserver(db as never);
  await observer.observe({
    tenantId: "t1",
    goal: { id: "g1", title: "Cerrar lead" },
    plan: { id: "p1", steps: [{ id: "s1", status: "pending" }] },
    outcome: { status: "achieved", summary: "ok" },
  } as never);
  const fact = [...rows.entries()].find(([k]) => k.startsWith("learning-facts:"))?.[1] as {
    text: string;
    createdAt: string;
  };
  assert.ok(fact.text.includes("Cerrar lead"));
  assert.ok(fact.createdAt);
});
