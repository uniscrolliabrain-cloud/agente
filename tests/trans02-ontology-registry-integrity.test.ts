import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import {
  approvedCardOntology,
  CardOntologyService,
} from "../apps/server/src/engine/cognition/chromatic/card-ontology.ts";
import { ChromaticOntologyRegistry } from "../apps/server/src/engine/cognition/chromatic/ontology-registry.ts";
import { digest } from "../apps/server/src/engine/cognition/v2/storage.ts";

test("approved ontology cannot be substituted under another requested identity or version", async () => {
  const db = await createStore();
  try {
    const service = new CardOntologyService(db);
    await service.install();
    for (const [ontologyId, version] of [
      ["another-ontology", approvedCardOntology.version],
      [approvedCardOntology.ontologyId, "99.0.0"],
    ]) {
      const id = digest([ontologyId, version]);
      await db.put("system", "chromatic-ontology-v2", { id, ontology: approvedCardOntology });
      await assert.rejects(service.registry.runtime(ontologyId, version), /ONTOLOGY_BINDING_MISMATCH/);
    }
    await service.assertApproved();
  } finally {
    await db.close();
  }
});

test("persisted ontology is parsed before invoking approval authority", async () => {
  const db = await createStore();
  let verified = 0;
  try {
    const registry = new ChromaticOntologyRegistry(db, {
      verify: async () => {
        verified++;
        return true;
      },
    });
    const id = digest([approvedCardOntology.ontologyId, approvedCardOntology.version]);
    for (const patch of [
      { axes: "malformed" },
      { status: "approved", approvalReceiptId: undefined },
      { injectedAuthority: true },
    ]) {
      await db.put("system", "chromatic-ontology-v2", { id, ontology: { ...approvedCardOntology, ...patch } });
      await assert.rejects(registry.runtime(approvedCardOntology.ontologyId, approvedCardOntology.version));
    }
    assert.equal(verified, 0);
  } finally {
    await db.close();
  }
});
