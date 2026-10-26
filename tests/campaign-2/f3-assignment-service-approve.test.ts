// F3_ASSIGNMENT_SERVICE_APPROVE_TEST_V1
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
  } as never;
}

describe("AssignmentService.approve", () => {
  it("deniega con PDP deny", async () => {
    const db = fakeDb({});
    const svc = new AssignmentService({ pdp: fakePdp(false), db: db as never, registry: defaultAssignmentRegistry() });
    const ctx = { tenantId: "t", actor: { kind: "human", id: "u1", tenantId: "t", userId: "u1", roles: ["employee"], profile: { name: "u", language: "es" }, active: true } } as never;
    let threw = false;
    try { await svc.approve(ctx, "task", "t1"); } catch { threw = true; }
    assert.equal(threw, true);
  });
});
