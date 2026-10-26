// F3_ASSIGNMENT_SERVICE_ASSIGN_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AssignmentService } from "../../apps/server/src/engine/assignments/service.ts";
import { defaultAssignmentRegistry } from "../../apps/server/src/engine/assignments/registry.ts";

function fakePdp(allow: boolean) {
  return { can: async () => (allow ? "allow" : "deny") } as never;
}

function fakeDb(record: Record<string, unknown>) {
  const store = new Map<string, Record<string, unknown>>();
  return {
    get: async (_o: string, _k: string, id: string) => store.get(id) ?? null,
    put: async (_o: string, _k: string, data: Record<string, unknown>) => { store.set(String(data.id), data); },
    list: async () => [...store.values()],
    compareAndSwap: async () => null,
    insertIfAbsent: async () => true,
    seed: (data: Record<string, unknown>) => { store.set(String(data.id), data); },
  };
}

describe("AssignmentService.assign", () => {
  it("rechaza assignedBy distinto de ctx.actor.id", async () => {
    const db = fakeDb({});
    const svc = new AssignmentService({ pdp: fakePdp(true), db: db as never, registry: defaultAssignmentRegistry() });
    const ctx = { tenantId: "t", actor: { kind: "human", id: "u1", tenantId: "t", userId: "u1", roles: ["employee"], profile: { name: "u", language: "es" }, active: true } } as never;
    let threw = false;
    try {
      await svc.assign(ctx, "task", "t1", null, "u2");
    } catch { threw = true; }
    assert.equal(threw, true);
  });
  it("acepta assignedBy = ctx.actor.id", async () => {
    const db = fakeDb({});
    db.seed({ id: "t1", title: "x", status: "queued", assignedTo: null, createdAt: "2026-01-01", updatedAt: "2026-01-01", evidence: [], plan: [], attempts: 0, artifactIds: [], tenantId: "t", kind: "agent", prompt: "p", input: {}, state: {} });
    const svc = new AssignmentService({ pdp: fakePdp(true), db: db as never, registry: defaultAssignmentRegistry() });
    const ctx = { tenantId: "t", actor: { kind: "human", id: "u1", tenantId: "t", userId: "u1", roles: ["employee"], profile: { name: "u", language: "es" }, active: true } } as never;
    const out = await svc.assign(ctx, "task", "t1", "u2", "u1");
    assert.equal(out.kind, "task");
    assert.equal(out.assignedBy, "u1");
    assert.equal(out.assignedTo, "u2");
  });
});
