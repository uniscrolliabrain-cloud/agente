import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { CyberSdkBridge, createScopedCyberClient } from "../apps/server/src/engine/security-v2/sdk-adapter.ts";
import { CyberEventRelay, installSecurityBridgeV2 } from "../apps/server/src/engine/security-v2/event-relay.ts";
import { governedSecurityTools } from "../apps/server/src/engine/security-v2/capabilities.ts";
import { childEventEnvelopeSchema, minimizeChildEvent } from "../apps/server/src/engine/security-v2/contracts.ts";
const identity = { tenantId: "tenantA", actorId: "alice", agentId: "pedro", policyRevision: "policy-1" };
const resource = "a".repeat(32), eventId = "b".repeat(32);
const envelope = { schema_version: 1 as const, id: eventId, tenant_id: "tenantA", sequence: 7,
  type: "cyber.job.partial" as const, occurred_at: "2026-11-15T00:00:00Z", correlation_id: "trace-1",
  source: "agntia-ciberseguridad" as const, object_id: resource, interpretation: "recorded_operation_only" as const };
const hash = (value: Record<string, unknown>) => createHash("sha256").update(JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))))).digest("hex");
const item = { envelope, content_hash: hash(envelope) };
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
test("C14 SDK real uses a governed server grant and strips raw fields; prompt cannot choose auth or target", async () => {
  let calls = 0, valid = true;
  const client = createScopedCyberClient({ baseUrl: "https://cyber.invalid", approvedOrigins: ["https://cyber.invalid"], identity,
    credential: async () => "server-credential-not-browser-000000", fetch: async (url, init) => {
      calls++; assert.equal(String(url), "https://cyber.invalid/v1/tenants/tenantA/delegations/use");
      assert.equal(init?.method, "POST");
      assert.deepEqual(JSON.parse(String(init?.body)), { token: "one-use-delegation", capability: "assets.read", resource_id: resource });
      return json({ delegation_id: "c".repeat(32), data: [{ id: resource, state: "registered", revision: 1, tenant_id: "tenantA", secret: "NEVER_RETURN", display_name: "Private title" }], flows: [], limit: 100, security_guarantee: false });
    } });
  const bridge = new CyberSdkBridge({ current: async () => valid, delegation: async () => ({ client, ...identity,
    resourceId: resource, oneUseToken: "one-use-delegation", grantId: "approved-human-grant", expiresAt: "2099-01-01T00:00:00Z" }) });
  const result = await bridge.read(identity, { capability: "assets.read" });
  assert.deepEqual(result.items, [{ id: resource, state: "registered", revision: 1 }]);
  assert.equal(JSON.stringify(result).includes("NEVER_RETURN"), false); assert.equal(result.securityGuarantee, false);
  await assert.rejects(bridge.read(identity, { capability: "assets.read", tenantId: "tenantB", url: "https://attacker.invalid" }));
  const tools = governedSecurityTools(bridge, async () => identity);
  assert.deepEqual(Object.keys(tools).sort(), ["security.assets.read", "security.findings.read", "security.jobs.read"]);
  await assert.rejects(tools["security.assets.read"].execute({ token: "injected", tenantId: "tenantB" }), /CLOSED_INPUT/);
  valid = false; await assert.rejects(bridge.read(identity, { capability: "assets.read" }), /PARENT_DENIED/); assert.equal(calls, 1);
});
test("C14 cross-tenant grant is rejected before SDK invocation, and partial never means complete coverage", async () => {
  let called = false;
  const bridge = new CyberSdkBridge({ current: async () => true, delegation: async () => ({ ...identity, tenantId: "tenantB",
    client: { governedRead: async () => { called = true; throw Error("must not run"); } }, resourceId: resource,
    oneUseToken: "secret", grantId: "grant", expiresAt: "2099-01-01T00:00:00Z" }) });
  await assert.rejects(bridge.read(identity, { capability: "assets.read" }), /GRANT_DENIED/); assert.equal(called, false);
  const projection = minimizeChildEvent(item);
  assert.equal(projection.state, "partial"); assert.equal(projection.coverage, "not_reported"); assert.equal(projection.securityGuarantee, false);
  assert.equal(childEventEnvelopeSchema.safeParse({ ...envelope, rawEvidence: "secret" }).success, false);
});
test("C14 durable relay commits effect before ACK, recovers lost ACK, and deduplicates restart", async () => {
  const db = await createStore();
  try {
    await installSecurityBridgeV2(db);
    await db.rawQuery("CREATE TABLE cognition_v2_cyber_test_effects (id text PRIMARY KEY)");
    let polls = 0, acks = 0, failAck = true;
    const auth = { current: async () => true, client: async () => ({ outbox: async (consumer: string, after = 0) => {
      polls++; return { events: after < 7 ? [item] : [], next_after: after < 7 ? 7 : null, consumer_id: consumer, delivery: "at_least_once" };
    } }) };
    const acknowledger = { acknowledge: async (_: unknown, input: { eventId: string }) => {
      acks++;
      const effects = await db.rawQuery("SELECT id FROM cognition_v2_cyber_test_effects"); assert.equal(effects.length, 1);
      if (failAck) throw Error("lost network response");
      return { id: input.eventId, acknowledged: true as const };
    } };
    const rollbackRelay = new CyberEventRelay(db, auth, acknowledger, async (projection, tx) => {
      await tx.rawQuery("INSERT INTO cognition_v2_cyber_test_effects(id) VALUES($1)", [projection.sourceEventId]);
      throw Error("synthetic projection crash");
    });
    await assert.rejects(rollbackRelay.run(identity, "rollback-consumer"), /projection crash/);
    assert.equal((await db.rawQuery("SELECT event_id FROM cognition_v2_cyber_inbox")).length, 0);
    assert.equal((await db.rawQuery("SELECT id FROM cognition_v2_cyber_test_effects")).length, 0);
    assert.equal(acks, 0);
    const relay = new CyberEventRelay(db, auth, acknowledger, async (projection, tx) => {
      assert.equal(projection.state, "partial"); await tx.rawQuery("INSERT INTO cognition_v2_cyber_test_effects(id) VALUES($1)", [projection.sourceEventId]);
    });
    const first = await relay.run(identity, "agente-v2"); assert.equal(first.committed, 1); assert.equal(first.acknowledged, 0);
    assert.equal(first.blocked, "CHILD_ACK_PENDING");
    const [cursor] = await db.rawQuery<{ sequence: string }>("SELECT sequence FROM cognition_v2_cyber_cursors"); assert.equal(Number(cursor.sequence), 0);
    failAck = false;
    const restarted = new CyberEventRelay(db, auth, acknowledger, async () => assert.fail("duplicate effect"));
    const second = await restarted.run(identity, "agente-v2"); assert.equal(second.committed, 0); assert.equal(second.acknowledged, 1);
    assert.equal(acks, 2); assert.equal(polls, 3);
    assert.equal((await db.rawQuery("SELECT id FROM cognition_v2_cyber_test_effects")).length, 1);
    const noSdkAck = new CyberEventRelay(db, auth);
    const blocked = await noSdkAck.run(identity, "new-consumer"); assert.equal(blocked.blocked, "CHILD_ACK_PENDING");
    const payload = JSON.stringify((await db.rawQuery("SELECT projection FROM cognition_v2_cyber_inbox")));
    assert.equal(payload.includes("rawEvidence"), false);
  } finally { await db.close(); }
});
test("C14 invalid hash/tenant is rejected without effect or ACK", async () => {
  const db = await createStore();
  try {
    await installSecurityBridgeV2(db); let ack = 0;
    const relay = new CyberEventRelay(db, { current: async () => true, client: async () => ({ outbox: async () => ({
      events: [{ ...item, content_hash: "0".repeat(64) }], next_after: 7, consumer_id: "agente-v2", delivery: "at_least_once",
    }) }) }, { acknowledge: async () => { ack++; return { id: eventId, acknowledged: true }; } });
    await assert.rejects(relay.run(identity, "agente-v2"), /EVENT_INVALID/);
    assert.equal(ack, 0); assert.equal((await db.rawQuery("SELECT event_id FROM cognition_v2_cyber_inbox")).length, 0);
  } finally { await db.close(); }
});

test("C14 relay uses the real pinned SDK ACK method after local commit", async () => {
  const db = await createStore();
  try {
    await installSecurityBridgeV2(db); let confirmed = false, ackCalls = 0;
    const client = createScopedCyberClient({ baseUrl: "https://cyber.invalid", approvedOrigins: ["https://cyber.invalid"], identity,
      credential: async () => "synthetic-server-ack-credential-0000", fetch: async (url, init) => {
        if (init?.method === "POST") {
          assert.equal(String(url), `https://cyber.invalid/v1/tenants/tenantA/outbox/${eventId}/ack`);
          assert.deepEqual(JSON.parse(String(init.body)), { consumer_id: "sdk-relay", content_hash: item.content_hash });
          assert.equal((await db.rawQuery("SELECT event_id FROM cognition_v2_cyber_inbox")).length, 1);
          ackCalls++; confirmed = true; return json({ id: eventId, acknowledged: true, duplicate: false });
        }
        return json({ events: confirmed ? [] : [item], next_after: confirmed ? null : 7, consumer_id: "sdk-relay", delivery: "at_least_once" });
      } });
    const relay = new CyberEventRelay(db, { current: async () => true, client: async () => client });
    const result = await relay.run(identity, "sdk-relay");
    assert.deepEqual(result, { committed: 1, acknowledged: 1 }); assert.equal(ackCalls, 1);
    const [cursor] = await db.rawQuery<{ sequence: string }>("SELECT sequence FROM cognition_v2_cyber_cursors"); assert.equal(Number(cursor.sequence), 7);
  } finally { await db.close(); }
});
