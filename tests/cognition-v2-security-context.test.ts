import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { testConfig } from "./helpers/config.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { CyberEventRelay, installSecurityBridgeV2 } from "../apps/server/src/engine/security-v2/event-relay.ts";
import { cognitiveSecurityProjector } from "../apps/server/src/engine/security-v2/cognition-adapter.ts";
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]));
  return value;
}
test("C14→C02→C10 partial child receipt becomes private context without asserting protection", async () => {
  const db = await createStore();
  try {
    const memberships = new TenantService(db, testConfig()); await memberships.addMembership("alice", "A");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    const runtime = await CognitionV2Runtime.create(db, db, new Set(["A"]), memberships);
    await installSecurityBridgeV2(db);
    const identity = await runtime.identity("A", "alice", "alice", "chat");
    const envelope = { schema_version: 1 as const, id: "a".repeat(32), tenant_id: "A", sequence: 1, type: "cyber.job.partial" as const,
      occurred_at: "2026-11-15T00:00:00Z", correlation_id: "synthetic", source: "agntia-ciberseguridad" as const,
      object_id: "b".repeat(32), interpretation: "recorded_operation_only" as const };
    const content_hash = createHash("sha256").update(JSON.stringify(canonical(envelope))).digest("hex");
    let acknowledged = 0;
    const relay = new CyberEventRelay(db, { current: async () => true, client: async () => ({ outbox: async () => ({ events: [{ envelope, content_hash }], next_after: 1, delivery: "at_least_once", consumer_id: "synthetic-consumer" }) }) },
      { acknowledge: async (_identity, receipt) => {
        assert.ok((await db.rawQuery("SELECT event_id FROM cognition_v2_events WHERE tenant='A' AND event->'source'->>'id'='security-bridge-v2'")).length);
        acknowledged++; return { id: receipt.eventId, acknowledged: true };
      } }, cognitiveSecurityProjector(runtime, identity));
    await relay.run({ tenantId: "A", actorId: "alice", agentId: "pedro", policyRevision: identity.policyRevision }, "synthetic-consumer");
    assert.equal(acknowledged, 1); await runtime.projector.tick("A");
    const snapshot = await runtime.context.getSnapshot(identity, { query: "seguridad", maxTokens: 4000, maxRefs: 10 });
    assert.equal(snapshot.refs.length, 1);
    const data = JSON.parse((await runtime.context.resolve(identity, snapshot.refs[0].id))!.body);
    assert.equal(data.state, "partial"); assert.equal(data.securityGuarantee, false); assert.equal(data.coverage, "not_reported");
    assert.equal((await runtime.context.getSnapshot({ ...identity, actorId: "mallory", owner: "mallory" }, { query: "", maxTokens: 4000, maxRefs: 10 }).catch(() => null)), null);
  } finally { await db.close(); }
});
