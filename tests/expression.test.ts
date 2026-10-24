// EXPRESSION_TEST_V1
import assert from "node:assert/strict";
import { test } from "node:test";

test("evaluateExpression compara números", async () => {
  const { evaluateExpression } = await import("../apps/server/src/engine/policy/expression.ts");
  assert.equal(evaluateExpression("amount > 0", { amount: 5 }), true);
  assert.equal(evaluateExpression("amount > 0", { amount: -1 }), false);
  assert.equal(evaluateExpression("state == 'sent'", { state: "sent" }), true);
});

test("evaluateExpression soporta exists e in", async () => {
  const { evaluateExpression } = await import("../apps/server/src/engine/policy/expression.ts");
  assert.equal(evaluateExpression("cif exists", { cif: "B123" }), true);
  assert.equal(evaluateExpression("cif exists", {}), false);
  assert.equal(evaluateExpression("state in [draft, sent]", { state: "sent" }), true);
});