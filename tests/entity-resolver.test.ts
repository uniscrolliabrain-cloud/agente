// ENTITY_RESOLVER_TEST_V1
import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";

test("entity resolver encuentra por CIF", async () => {
  const db = await createStore();
  try {
    const { EntityResolver } = await import("../apps/server/src/engine/business/resolver.ts");
    const resolver = new EntityResolver(db);
    const { BusinessGraph } = await import("../apps/server/src/engine/business/graph.ts");
    const graph = new BusinessGraph(db);
    await graph.createEntity("owner", {
      id: "c1", type: "customer", name: "ACME SL",
      properties: { cif: "B12345678", email: "info@acme.com" },
      actor: "test", source: "test",
    });
    const matches = await resolver.findCandidates("default", "owner", "customer", {
      cif: "B12345678",
    });
    assert.equal(matches.length, 1);
    assert.equal(matches[0].entityId, "c1");
  } finally {
    await db.close();
  }
});