import assert from "node:assert/strict";
import { test } from "node:test";
import { VoiceMediaLifecycle } from "../apps/server/src/engine/voice-v2/media-lifecycle.ts";
import { MockMediaTransport } from "../apps/server/src/engine/voice-v2/media-transport.ts";
import type { VoiceSessionV2 } from "../apps/server/src/engine/voice-v2/contracts.ts";
import type { CognitiveIdentity } from "../packages/domain/src/cognition-v2.ts";

const identity = { tenantId: "tenant-a", actorId: "alice" } as CognitiveIdentity;
const session = {
  sessionId: "session-a", tenantId: "tenant-a", actorId: "alice",
  agentId: "laia", roleId: "laia", threadId: "thread",
  consentReceiptId: "consent", contextSnapshotId: "snapshot", policyRevision: "policy",
  schemaVersion: "2.0", channel: "voice", state: "authorized",
  revision: 1, epoch: 0, createdAt: new Date(0).toISOString(),
  lastActivityAt: new Date(0).toISOString(), expiresAt: new Date(60_000).toISOString(),
} as VoiceSessionV2;

function fixture() {
  let current = session;
  let allowed = true;
  const port = new MockMediaTransport();
  const coordinator = {
    async inspect(who: CognitiveIdentity, id: string) {
      if (!allowed || who.tenantId !== current.tenantId || id !== current.sessionId) return null;
      return current;
    },
    async interrupt(who: CognitiveIdentity, id: string) {
      if (!allowed || who.tenantId !== current.tenantId || id !== current.sessionId) throw Error("VOICE_SESSION_DENIED");
      current = { ...current, epoch: current.epoch + 1, revision: current.revision + 1 };
      return current;
    },
    async close(who: CognitiveIdentity, id: string) {
      if (!allowed || who.tenantId !== current.tenantId || id !== current.sessionId) throw Error("VOICE_SESSION_DENIED");
      current = { ...current, state: "closed", epoch: current.epoch + 1, revision: current.revision + 1 };
      return current;
    },
  };
  return { port, coordinator, lifecycle: new VoiceMediaLifecycle(coordinator, port), revoke: () => { allowed = false; }, change: () => { current = { ...current, epoch: current.epoch + 1 }; } };
}

test("C05 lifecycle checks tenant authorization before opening media", async () => {
  const f = fixture();
  const signal = new AbortController().signal;
  await assert.rejects(f.lifecycle.open({ ...identity, tenantId: "tenant-b" }, session.sessionId, signal), /VOICE_SESSION_NOT_FOUND/);
  assert.equal(f.port.inspect(session.sessionId), undefined);
  await f.lifecycle.open(identity, session.sessionId, signal);
  assert.deepEqual(f.port.inspect(session.sessionId), { epoch: 0, closed: false });
});

test("C05 lifecycle fences media after durable interruption and closes idempotently", async () => {
  const f = fixture();
  const signal = new AbortController().signal;
  await f.lifecycle.open(identity, session.sessionId, signal);
  assert.equal((await f.lifecycle.interrupt(identity, session.sessionId, signal)).epoch, 1);
  assert.deepEqual(f.port.inspect(session.sessionId), { epoch: 1, closed: false });
  assert.equal((await f.lifecycle.close(identity, session.sessionId, signal)).state, "closed");
  await f.lifecycle.close(identity, session.sessionId, signal);
  assert.equal(f.port.inspect(session.sessionId)?.closed, true);
});

test("C05 lifecycle refuses revoked identity and never opens transport", async () => {
  const f = fixture();
  f.revoke();
  await assert.rejects(f.lifecycle.open(identity, session.sessionId, new AbortController().signal), /VOICE_SESSION_NOT_FOUND/);
  assert.equal(f.port.inspect(session.sessionId), undefined);
});

test("C05 lifecycle cleans up when epoch changes during transport open", async () => {
  const f = fixture();
  const port = {
    open: async (_session: VoiceSessionV2, _signal: AbortSignal) => { f.change(); await f.port.open(session, new AbortController().signal); },
    interrupt: f.port.interrupt.bind(f.port),
    close: f.port.close.bind(f.port),
  };
  const lifecycle = new VoiceMediaLifecycle(f.coordinator, port);
  await assert.rejects(lifecycle.open(identity, session.sessionId, new AbortController().signal), /VOICE_STALE_EPOCH/);
  assert.equal(f.port.inspect(session.sessionId)?.closed, true);
});

test("C05 lifecycle does not mutate state on pre-aborted request", async () => {
  const f = fixture();
  const abort = new AbortController();
  abort.abort(Error("request cancelled"));
  await assert.rejects(f.lifecycle.open(identity, session.sessionId, abort.signal), /request cancelled/);
  assert.equal(f.port.inspect(session.sessionId), undefined);
});
