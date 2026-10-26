// F3_T13_NO_ESCALATION_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AssignmentService } from "../../apps/server/src/engine/assignments/service.ts";
import { defaultAssignmentRegistry } from "../../apps/server/src/engine/assignments/registry.ts";

function fakePdp(allow: boolean) {
  return { can: async () => (allow ? "allow" : "deny") } as never;
}

function fakeDb() {
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

describe("T13: no escalacion de permisos", () => {
  it("agente no puede asignar con assignedBy distinto de su actor.id", async () => {
    const svc = new AssignmentService({ pdp: fakePdp(true), db: fakeDb() as never, registry: defaultAssignmentRegistry() });
    const agentCtx = { tenantId: "t", actor: { kind: "agent", id: "a1", tenantId: "t", roleId: "r1", runtimeId: "rt1", roles: ["agent"], profile: { name: "a", language: "es" }, active: true } } as never;
    let threw = false;
    try { await svc.assign(agentCtx, "task", "t1", "u2", "u1"); } catch { threw = true; }
    assert.equal(threw, true);
  });
  it("agente puede asignar con su propio actor.id", async () => {
    // La tarea tiene que existir: assign() es un withWrite sobre un registro real.
    const db = fakeDb();
    db.seed({ id: "t1", title: "x", status: "queued", assignedTo: null, createdAt: "2026-01-01", updatedAt: "2026-01-01", evidence: [], plan: [], attempts: 0, artifactIds: [], tenantId: "t", kind: "agent", prompt: "p", input: {}, state: {} });
    const svc = new AssignmentService({ pdp: fakePdp(true), db: db as never, registry: defaultAssignmentRegistry() });
    const agentCtx = { tenantId: "t", actor: { kind: "agent", id: "a1", tenantId: "t", roleId: "r1", runtimeId: "rt1", roles: ["agent"], profile: { name: "a", language: "es" }, active: true } } as never;
    let threw = false;
    try { await svc.assign(agentCtx, "task", "t1", "u2", "a1"); } catch (e) { threw = true; console.log(e); }
    assert.equal(threw, false);
  });
});
