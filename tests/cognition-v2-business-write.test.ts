import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { currentTenantScope } from "../apps/server/src/tenant-scope.ts";
import { CognitionBusinessWrite } from "../apps/server/src/engine/cognition/v2/business-write.ts";
import { CapabilityRegistry } from "../apps/server/src/engine/capabilities/registry.ts";
import { PolicyDecisionPoint } from "../apps/server/src/engine/authz/pdp.ts";
import { capabilityContractSchema } from "../packages/domain/src/capability.ts";
import { digest } from "../apps/server/src/engine/cognition/v2/storage.ts";
import type { CognitiveIdentity } from "../packages/domain/src/cognition-v2.ts";
import type { HumanActor } from "../packages/domain/src/actor.ts";
import type { ApprovalRequest } from "../packages/domain/src/messaging.ts";

const identity: CognitiveIdentity = { tenantId: "business-a", actorId: "alice", owner: "alice", purpose: "chat", policyRevision: "rev-1" };
const actor: HumanActor = { kind: "human", id: "alice", userId: "alice", tenantId: "business-a", roles: ["owner"], profile: { name: "Alice", language: "es" }, active: true };
const input = { title: "Reorder supplies" };
const request = { operationId: "write-1", capability: "create_purchase", approvalId: "approval-1", input };
const capability = capabilityContractSchema.parse({ id: "create_purchase", name: "Create purchase", kind: "tool", risk: "medium", requiresApproval: true,
  sideEffects: [{ kind: "external_write", target: "erp", reversible: false }] });
function approval(overrides: Partial<ApprovalRequest> = {}): ApprovalRequest {
  return { id: "approval-1", tenantId: identity.tenantId, owner: identity.owner, capabilityId: "create_purchase", reason: "Approved purchase",
    risk: "medium", status: "approved", payload: { hash: digest(["create_purchase", input]), consumedBy: null },
    requestedAt: new Date(Date.now() - 60_000).toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), ...overrides };
}
const allow = () => new PolicyDecisionPoint([{ id: "execute", tenantId: "business-a", subject: { actorId: "alice" }, action: "execute", resource: "project", effect: "allow" }]);
const registry = () => { const r = new CapabilityRegistry(); r.register(capability); return r; };

test("V2 business write requires an approved, payload-bound approval consumed once", async () => {
  const db = await createStore();
  const records = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
  let calls = 0;
  const make = (pdp = allow(), allowed: string[] = ["create_purchase"]) => new CognitionBusinessWrite(records,
    async () => identity, async () => actor, pdp, registry(), new Map([["create_purchase", { run: async () => { calls++; } }]]), new Set(allowed));
  try {
    await assert.rejects(make(new PolicyDecisionPoint([])).run(identity, request), /BUSINESS_PDP_DENIED/);
    await assert.rejects(make(allow(), []).run(identity, request), /BUSINESS_CAPABILITY_DENIED/);
    await assert.rejects(make().run(identity, request), /ZodError|invalid_type|Expected object/);
    await db.put("business-a:alice", "approval-requests", approval({ payload: { hash: "other-payload", consumedBy: null } }));
    await assert.rejects(make().run(identity, request), /BUSINESS_APPROVAL_MISMATCH/);
    await db.put("business-a:alice", "approval-requests", approval({ expiresAt: new Date(Date.now() - 1000).toISOString() }));
    await assert.rejects(make().run(identity, request), /BUSINESS_APPROVAL_INVALID/);
    await db.put("business-a:alice", "approval-requests", approval({ status: "pending" }));
    await assert.rejects(make().run(identity, request), /BUSINESS_APPROVAL_INVALID/);
    await db.put("business-a:alice", "approval-requests", approval({ payload: { hash: digest(["create_purchase", input]) } }));
    await assert.rejects(make().run(identity, request), /BUSINESS_APPROVAL_UNBOUND/);
    await db.put("business-a:alice", "approval-requests", approval({ tenantId: "business-b" }));
    await assert.rejects(make().run(identity, request), /BUSINESS_APPROVAL_MISMATCH/);
    assert.equal(calls, 0);
    await db.put("business-a:alice", "approval-requests", approval());
    const result = await make().run(identity, request);
    assert.equal(result.state, "completed"); assert.equal(calls, 1);
    const stored = await db.get<ApprovalRequest>("business-a:alice", "approval-requests", "approval-1");
    assert.equal(stored?.payload.consumedBy, result.receiptId);
    assert.equal(stored?.payload.outcome, "succeeded");
    assert.equal((await db.get<{ state: string }>("business-a:alice", "cognition-v2-business-receipts", result.receiptId))?.state, "completed");
    assert.deepEqual(await make().run(identity, request), result); assert.equal(calls, 1, "same operation is not executed twice");
    await assert.rejects(make().run(identity, { ...request, operationId: "write-2" }), /BUSINESS_APPROVAL_CONSUMED/, "a used approval cannot authorize another write");
    assert.equal(calls, 1);
  } finally { await db.close(); }
});

test("a failed write leaves the approval and receipt unreconciled without auto-retry", async () => {
  const db = await createStore();
  const records = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
  let calls = 0;
  const runner = new CognitionBusinessWrite(records, async () => identity, async () => actor, allow(), registry(),
    new Map([["create_purchase", { run: async () => { calls++; throw Error("synthetic outage"); } }]]), new Set(["create_purchase"]));
  try {
    await db.put("business-a:alice", "approval-requests", approval());
    await assert.rejects(runner.run(identity, request), /synthetic outage/);
    const stored = await db.get<ApprovalRequest>("business-a:alice", "approval-requests", "approval-1");
    assert.equal(stored?.payload.outcome, "unknown");
    // The same operation is now uncertain: reconcile before a new attempt.
    await assert.rejects(runner.run(identity, request), /BUSINESS_OUTCOME_UNKNOWN/);
    assert.equal(calls, 1);
  } finally { await db.close(); }
});

const postgres = process.env.COGNITION_TEST_POSTGRES_URL;
test("two Postgres connections cannot spend one approval twice", { skip: !postgres }, async () => {
  const db = await createStore({ databaseUrl: postgres }), other = await createStore({ databaseUrl: postgres });
  const tenant = `business-${randomUUID()}`;
  const scopedIdentity = { ...identity, tenantId: tenant }, scopedActor = { ...actor, tenantId: tenant };
  const scopedApproval = approval({ tenantId: tenant });
  const pdp = new PolicyDecisionPoint([{ id: "execute", tenantId: tenant, subject: { actorId: "alice" }, action: "execute", resource: "project", effect: "allow" }]);
  let unblock!: () => void, started!: () => void, calls = 0;
  const entered = new Promise<void>((resolve) => { started = resolve; });
  const hold = new Promise<void>((resolve) => { unblock = resolve; });
  const executors = new Map([["create_purchase", { run: async () => { calls++; started(); await hold; } }]]);
  const make = (store: typeof db) => new CognitionBusinessWrite(new TenantScopedStore(store, async () => currentTenantScope()!.tenantId),
    async () => scopedIdentity, async () => scopedActor, pdp, registry(), executors, new Set(["create_purchase"]));
  try {
    await db.put(`${tenant}:alice`, "approval-requests", scopedApproval);
    const first = make(db).run(scopedIdentity, request);
    await entered;
    await assert.rejects(make(other).run(scopedIdentity, { ...request, operationId: "write-2" }), /BUSINESS_APPROVAL_CONSUMED/);
    unblock(); await first;
    assert.equal(calls, 1);
  } finally { unblock(); await other.close(); await db.close(); }
});
