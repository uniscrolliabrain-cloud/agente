import { test } from "node:test";
import assert from "node:assert/strict";
import { MockMediaTransport } from "../apps/server/src/engine/voice-v2/media-transport.ts";
import type { VoiceSessionV2 } from "../apps/server/src/engine/voice-v2/contracts.ts";

const session = {
  sessionId: "s", tenantId: "tenant", actorId: "actor", agentId: "laia", roleId: "laia",
  threadId: "thread", consentReceiptId: "consent", contextSnapshotId: "snapshot",
  policyRevision: "p", channel: "voice", schemaVersion: "2.0", state: "authorized",
  revision: 1, epoch: 0, createdAt: new Date(0).toISOString(),
  lastActivityAt: new Date(0).toISOString(), expiresAt: new Date(60_000).toISOString(),
} as VoiceSessionV2;

test("C05 mock transport opens, fences epochs, and closes idempotently", async () => {
  const port = new MockMediaTransport();
  const signal = new AbortController().signal;
  await port.open(session, signal);
  await port.open(session, signal);
  assert.deepEqual(port.inspect("s"), { epoch: 0, closed: false });
  await port.interrupt("s", 1, signal);
  await assert.rejects(port.interrupt("s", 0, signal), /VOICE_STALE_EPOCH/);
  await assert.rejects(port.open(session, signal), /VOICE_STALE_EPOCH/);
  await port.close("s", signal);
  await port.close("s", signal);
  assert.deepEqual(port.inspect("s"), { epoch: 1, closed: true });
  await assert.rejects(port.open({ ...session, epoch: 2 }, signal), /VOICE_SESSION_CLOSED/);
});

test("C05 mock transport respects abort and does not mutate state", async () => {
  const port = new MockMediaTransport();
  const controller = new AbortController();
  controller.abort(Error("aborted"));
  await assert.rejects(port.open(session, controller.signal), /aborted/);
  assert.equal(port.inspect("s"), undefined);
  await assert.rejects(port.interrupt("s", 1, controller.signal), /aborted/);
  await assert.rejects(port.close("s", controller.signal), /aborted/);
});

test("C05 mock transport refuses terminal or unknown sessions", async () => {
  const port = new MockMediaTransport();
  const signal = new AbortController().signal;
  await assert.rejects(port.open({ ...session, state: "closed" }, signal), /VOICE_SESSION_CLOSED/);
  await assert.rejects(port.interrupt("unknown", 1, signal), /VOICE_SESSION_CLOSED/);
  await port.close("unknown", signal);
});
