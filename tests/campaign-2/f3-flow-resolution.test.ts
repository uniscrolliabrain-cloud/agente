// F3_FLOW_RESOLUTION_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flowSchema, flowRelationSchema } from "../../packages/domain/src/flow.ts";

describe("Flow", () => {
  it("flowRelationSchema acepta un actor del mismo tenant", () => {
    const r = flowRelationSchema.parse({ actorId: "a1", personaId: "p1", kind: "human", role: "employee", tenantId: "t1" });
    assert.equal(r.actorId, "a1");
    assert.equal(r.tenantId, "t1");
  });
  it("flowSchema con reportsTo y peers", () => {
    const f = flowSchema.parse({ reportsTo: { actorId: "a1", personaId: "p1", kind: "agent", role: "agent", tenantId: "t1" }, peers: [] });
    assert.equal(f.reportsTo?.actorId, "a1");
    assert.equal(f.peers.length, 0);
  });
  it("flowSchema sin reportsTo es valido", () => {
    const f = flowSchema.parse({ peers: [] });
    assert.equal(f.reportsTo, undefined);
  });
});
