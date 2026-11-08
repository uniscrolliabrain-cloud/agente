import assert from "node:assert/strict";
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
