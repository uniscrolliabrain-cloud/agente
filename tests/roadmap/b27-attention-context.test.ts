// B-27 - attention.matched debe influir en el ranking de contexto.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreItem } from "../../apps/server/src/engine/context/budget.ts";

test("B-27: scoreItem combina semantic, recency, authority, roleMatch", () => {
  const high = scoreItem({ semantic: 1, recency: 1, authority: 1, roleMatch: 1 });
  const low = scoreItem({ semantic: 0.1, recency: 0.1, authority: 0.1, roleMatch: 0.1 });
  assert.ok(high > low, "item con mejor score debe puntuar mas alto");
  assert.ok(high <= 1, "score acotado a 1");
  assert.ok(low >= 0, "score acotado a 0");
});

// TODO: cuando ContextEngine.assemble exponga el score por item, verificar
// que attention.matched eleva el score de un item concreto. Hoy solo
// podemos verificar que scoreItem existe y combina los 4 factores.