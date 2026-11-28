import assert from "node:assert/strict";
import { test } from "node:test";
import { EventBus } from "../apps/server/src/engine/events/bus.ts";
import { createStore } from "../apps/server/src/db.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
const payload = {
  schemaVersion: "1.0",
  identity: { tenantId: "a", actorId: "actor", owner: "actor", purpose: "chat", policyRevision: "policy" },
  threadId: "thread",
  runId: "run",
  messageId: "message",
  text: "synthetic intent",
  inputDigest: "a".repeat(64),
};

test("human turn event requires an authenticated matching causal root envelope", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db, undefined, undefined, { tenantForOwner: async () => "a" });
    const emit = () =>
      bus.emit("actor", "cognition.v2.turn.admitted", { kind: "context", id: "thread" }, payload, {
        tenantId: "a",
        actorId: "actor",
        correlationId: "thread-run",
        causal: { kind: "root" },
      });
    const unauthenticated = await emit();
    assert.equal(unauthenticated.persisted, false);
    assert.match(String(unauthenticated.error), /ACTOR_NOT_AUTHENTICATED/);
    const noEnvelope = await runInTenantScope({ tenantId: "a", actorId: "actor" }, () =>
      bus.emit("actor", "cognition.v2.turn.admitted", { kind: "context", id: "thread" }, payload),
    );
    assert.equal(noEnvelope.persisted, false);
    assert.match(String(noEnvelope.error), /HUMAN_TURN_ENVELOPE_DENIED/);
    const result = await runInTenantScope({ tenantId: "a", actorId: "actor" }, emit);
    assert.equal(result.persisted, true);
    const event = await db.get<{ actorId: string; actorKind: string; causalKind: string }>(
      "actor",
      "system-events",
      result.id,
    );
    assert.deepEqual(event && { actorId: event.actorId, actorKind: event.actorKind, causalKind: event.causalKind }, {
      actorId: "actor",
      actorKind: "human",
      causalKind: "root",
    });
  } finally {
    await db.close();
  }
});
