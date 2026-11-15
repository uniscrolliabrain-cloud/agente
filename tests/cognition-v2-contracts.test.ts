import { test } from "node:test";
import assert from "node:assert/strict";
import { cognitiveRecordSchema, classificationV2Schema, cognitiveEdgeSchema, chromaticOntologyV2Schema } from "../packages/domain/src/cognition-v2.ts";
import { record } from "./fixtures/cognition-v2/record.ts";

test("C01 rejects authority injection, incompatible schema, cross-tenant evidence and false verification", () => {
  const r = record();
  for (const patch of [{ schemaVersion: "3.0" }, { permissions: ["admin"] }, { epistemic: "verified_fact" },
    { evidence: [{ tenantId: "B", kind: "event", id: "x", revision: 1 }] },
    { visibility: { ...r.visibility, allowedActorIds: ["bob", "bob"] } },
    { kind: "memory", memoryKind: "working" }]) {
    assert.equal(cognitiveRecordSchema.safeParse({ ...r, ...patch }).success, false);
  }
});
test("C01 classifier has no authority fields; edges cannot cross tenants; ontology needs approval", () => {
  assert.equal(classificationV2Schema.safeParse({ classifier: "jev", version: "1", labels: [], uncertainty: 0, review: "proposed", approved: true }).success, false);
  const ref = record().evidence[0];
  assert.equal(cognitiveEdgeSchema.safeParse({ id: "e", tenantId: "A", from: ref, to: { ...ref, tenantId: "B" }, relation: "supports" }).success, false);
  assert.equal(chromaticOntologyV2Schema.safeParse({ schemaVersion: "2.0", ontologyId: "x", version: "1", status: "approved", axes: [], dimensions: [] }).success, false);
});
