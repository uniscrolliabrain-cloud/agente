import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { communicationCardSchema } from "../packages/domain/src/communication-card.ts";

const card = {
  id: "laia-estado",
  version: 1,
  status: "draft",
  locale: "es-ES",
  channels: ["panel"],
  roleIds: ["laia"],
  intents: ["estado"],
  sopIds: [],
  states: [],
  priority: 10,
  mode: "guided",
  structure: ["Estado", "Evidencia"],
  requiredFacts: ["estado"],
  forbiddenClaims: [],
  template: "Estado: {estado}",
  missingFactScript: "No puedo verificar el estado.",
  fallback: "explain_missing",
};

test("accepts a valid card and rejects unknown fields", () => {
  assert.deepEqual(communicationCardSchema.parse(card), card);

  const result = communicationCardSchema.safeParse({ ...card, approver: "forged" });
  assert.equal(result.success, false);
  assert.equal(result.error?.issues[0]?.code, "unrecognized_keys");
});

test("validates the eight Agntia card seeds as unpublished drafts", () => {
  const path = new URL("../clientes/agntia/communication-cards.json", import.meta.url);
  const seeds = communicationCardSchema.array().length(8).parse(
    JSON.parse(readFileSync(path, "utf8")),
  );
  assert.equal(new Set(seeds.map((seed) => seed.id)).size, seeds.length);
  for (const seed of seeds) assert.equal(seed.status, "draft", seed.id);
});
