import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { currentTenantScope } from "../apps/server/src/tenant-scope.ts";
import { CognitionBusinessRead } from "../apps/server/src/engine/cognition/v2/business-read.ts";
import { CapabilityRegistry } from "../apps/server/src/engine/capabilities/registry.ts";
import { PolicyDecisionPoint } from "../apps/server/src/engine/authz/pdp.ts";
import { capabilityContractSchema } from "../packages/domain/src/capability.ts";
import type { CognitiveIdentity } from "../packages/domain/src/cognition-v2.ts";
import type { HumanActor } from "../packages/domain/src/actor.ts";

const identity: CognitiveIdentity = { tenantId: "business-a", actorId: "alice", owner: "alice", purpose: "chat", policyRevision: "rev-1" };
const actor: HumanActor = { kind: "human", id: "alice", userId: "alice", tenantId: "business-a", roles: ["owner"], profile: { name: "Alice", language: "es" }, active: true };
const request = { operationId: "read-1", capability: "read_workspace", input: {} };
function registry() {
  const registry = new CapabilityRegistry();
  registry.register(capabilityContractSchema.parse({ id: "read_workspace", name: "Read workspace", kind: "tool", sideEffects: [{ kind: "read", target: "workspace", reversible: true }] }));
  return registry;
}
const allow = () => new PolicyDecisionPoint([{ id: "workspace-read", tenantId: "business-a", subject: { actorId: "alice" }, action: "read", resource: "project", effect: "allow" }]);

test("V2 business read requires an explicit PDP decision and a current actor", async () => {
  const db = await createStore();
  const records = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
  let calls = 0, resolved = identity, currentActor: HumanActor = actor;
  const executors = new Map([["read_workspace", { run: async () => { calls++; } }]]);
  const make = (pdp: PolicyDecisionPoint) => new CognitionBusinessRead(records, async () => resolved, async () => currentActor, pdp, registry(), executors);
  try {
    await assert.rejects(make(new PolicyDecisionPoint([])).run(identity, request), /BUSINESS_PDP_DENIED/);
    resolved = { ...identity, policyRevision: "rev-2" };
    await assert.rejects(make(allow()).run(identity, request), /BUSINESS_IDENTITY_DENIED/);
    resolved = identity; currentActor = { ...actor, active: false };
    await assert.rejects(make(allow()).run(identity, request), /BUSINESS_ACTOR_DENIED/);
    currentActor = actor;
    let checks = 0;
    const revoked = new CognitionBusinessRead(records, async () => ++checks === 1 ? identity : { ...identity, policyRevision: "rev-2" }, async () => actor, allow(), registry(), executors);
    await assert.rejects(revoked.run(identity, { ...request, operationId: "revoked" }), /BUSINESS_IDENTITY_DENIED/);
    await assert.rejects(make(allow()).run(identity, { ...request, capability: "send_email" }));
    await assert.rejects(make(allow()).run(identity, { ...request, input: { tenantId: "business-b" } }));
    assert.equal(calls, 0);
    const runner = make(allow());
    const result = await runner.run(identity, request);
    assert.equal(result.state, "completed"); assert.equal(calls, 1);
    assert.deepEqual(await runner.run(identity, request), result); assert.equal(calls, 1);
    assert.equal((await db.get<{state:string}>("business-a:alice", "cognition-v2-business-receipts", result.receiptId))?.state, "completed");
    assert.equal(await db.get("business-b:alice", "cognition-v2-business-receipts", result.receiptId), null);
  } finally { await db.close(); }
});

const postgres = process.env.COGNITION_TEST_POSTGRES_URL;
test("two Postgres connections cannot execute the same operation concurrently", { skip: !postgres }, async () => {
  const db = await createStore({ databaseUrl: postgres }), other = await createStore({ databaseUrl: postgres });
  const tenant = `business-${randomUUID()}`;
  const scopedIdentity = { ...identity, tenantId: tenant }, scopedActor = { ...actor, tenantId: tenant };
  const pdp = new PolicyDecisionPoint([{ id: "allow", tenantId: tenant, subject: { actorId: "alice" }, action: "read", resource: "project", effect: "allow" }]);
  let unblock!: () => void, started!: () => void, calls = 0;
  const entered = new Promise<void>(resolve => { started = resolve; });
  const hold = new Promise<void>(resolve => { unblock = resolve; });
  const executors = new Map([["read_workspace", { run: async () => { calls++; started(); await hold; } }]]);
  const make = (store: typeof db) => new CognitionBusinessRead(new TenantScopedStore(store, async () => currentTenantScope()!.tenantId), async () => scopedIdentity, async () => scopedActor, pdp, registry(), executors);
  try {
    const first = make(db).run(scopedIdentity, request);
    await entered;
    await assert.rejects(make(other).run(scopedIdentity, request), /BUSINESS_OUTCOME_UNKNOWN/);
    unblock(); await first;
    assert.equal(calls, 1);
  } finally { unblock(); await other.close(); await db.close(); }
});

test("uncertain read outcome is recorded and never automatically retried", async () => {
  const db = await createStore();
  const records = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
  let calls = 0;
  const runner = new CognitionBusinessRead(records, async () => identity, async () => actor, allow(), registry(),
    new Map([["read_workspace", { run: async () => { calls++; throw Error("synthetic outage"); } }]]));
  try {
    await assert.rejects(runner.run(identity, request), /synthetic outage/);
    await assert.rejects(runner.run(identity, request), /BUSINESS_OUTCOME_UNKNOWN/);
    assert.equal(calls, 1);
  } finally { await db.close(); }
});
