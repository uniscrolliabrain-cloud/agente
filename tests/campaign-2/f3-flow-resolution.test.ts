// F3_FLOW_RESOLUTION_TEST_V1
import { describe, expect, it } from "vitest";
import { flowSchema, flowRelationSchema } from "../../packages/domain/src/flow.ts";

describe("Flow", () => {
  it("flowRelationSchema acepta un actor del mismo tenant", () => {
    const r = flowRelationSchema.parse({ actorId: "a1", personaId: "p1", kind: "human", role: "employee", tenantId: "t1" });
    expect(r.actorId).toBe("a1");
    expect(r.tenantId).toBe("t1");
  });
  it("flowSchema con reportsTo y peers", () => {
    const f = flowSchema.parse({ reportsTo: { actorId: "a1", personaId: "p1", kind: "agent", role: "agent", tenantId: "t1" }, peers: [] });
    expect(f.reportsTo?.actorId).toBe("a1");
    expect(f.peers.length).toBe(0);
  });
  it("flowSchema sin reportsTo es valido", () => {
    const f = flowSchema.parse({ peers: [] });
    expect(f.reportsTo).toBeUndefined();
  });
});
