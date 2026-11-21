import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import { installCognitionV2, CognitiveProjectionStore } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { ContextServingFacade } from "../apps/server/src/engine/cognition/v2/context.ts";
import { VoiceTurnCoordinator, installVoiceV2 } from "../apps/server/src/engine/voice-v2/coordinator.ts";
import { UnavailableAvatarProvider, type SharedFastVoicePort } from "../apps/server/src/engine/voice-v2/contracts.ts";
import type { CognitiveIdentity } from "../packages/domain/src/cognition-v2.ts";
const identity: CognitiveIdentity = { tenantId: "A", actorId: "alice", owner: "alice", policyRevision: "1", purpose: "chat" };
const authority = { authorizeAgent: async (_identity: CognitiveIdentity, agent: string, role: string) => agent === "laia" && role === "employee" };
const fast: SharedFastVoicePort = { stream: async (_identity, _input, _signal, emit) => { await emit("Respuesta factual"); return { receiptId: "fast-receipt", text: "Respuesta factual" }; } };
test("C13 durable consent/session/final transcript survive restart; private scope and provider gate are enforced", async () => {
  const path = await mkdtemp(join(tmpdir(), "cognition-v2-voice-"));
  let db = await createStore({ dataDir: path });
  const now = Date.now();
  try {
    await installCognitionV2(db); await installVoiceV2(db);
    let context = new ContextServingFacade(new CognitiveProjectionStore(db), { authorize: async () => true }, () => now);
    let coordinator = new VoiceTurnCoordinator(db, context, authority, fast, undefined, () => now);
    const snapshot = await context.getSnapshot(identity, { query: "", maxTokens: 1000, maxRefs: 5 });
    await assert.rejects(coordinator.grantConsent(identity, { transcript: true, recording: true, purpose: "conversation" }));
    const consent = await coordinator.grantConsent(identity, { transcript: true, recording: false, purpose: "conversation" });
    const input = { agentId: "laia", roleId: "employee", threadId: "shared-chat-thread", consentReceiptId: consent.id, contextSnapshotId: snapshot.id };
    await assert.rejects(coordinator.create(identity, { ...input, roleId: "admin" }), /VOICE_AGENT_DENIED/);
    await assert.rejects(coordinator.create(identity, { ...input, consentReceiptId: "unknown" }), /VOICE_CONSENT_REQUIRED/);
    const session = await coordinator.create(identity, input);
    assert.equal(session.state, "authorized", "local authorization never claims media connected");
    assert.equal(await coordinator.inspect({ ...identity, tenantId: "B" }, session.sessionId), null);
    assert.equal(await coordinator.inspect({ ...identity, actorId: "bob", owner: "bob" }, session.sessionId), null);
    assert.equal(await coordinator.acceptTranscript(identity, session.sessionId, { utteranceId: "utterance", revision: 1, status: "partial", text: "secreto oral" }), null);
    const turn = await coordinator.acceptTranscript(identity, session.sessionId, { utteranceId: "utterance", revision: 1, status: "final", text: "secreto oral" });
    assert.ok(turn);
    assert.deepEqual(await coordinator.acceptTranscript(identity, session.sessionId, { utteranceId: "utterance", revision: 1, status: "final", text: "secreto oral" }), turn);
    await assert.rejects(coordinator.acceptTranscript(identity, session.sessionId, { utteranceId: "utterance", revision: 2, status: "final", text: "otra orden" }), /VOICE_UTTERANCE_CONFLICT/);
    const [persisted] = await db.rawQuery<{ data: unknown }>("SELECT data FROM cognition_v2_voice_turns WHERE tenant=$1 AND id=$2", ["A", turn.turnId]);
    assert.equal(JSON.stringify(persisted.data).includes("secreto oral"), false);
    await db.close(); db = await createStore({ dataDir: path });
    context = new ContextServingFacade(new CognitiveProjectionStore(db), { authorize: async () => true }, () => now);
    coordinator = new VoiceTurnCoordinator(db, context, authority, fast, undefined, () => now);
    assert.equal((await coordinator.inspect(identity, session.sessionId))?.threadId, "shared-chat-thread");
    const text: string[] = [];
    const completed = await coordinator.renderTurn(identity, session.sessionId, turn.turnId, "secreto oral", new AbortController().signal, async (chunk) => { text.push(chunk); });
    assert.equal(completed.state, "completed"); assert.equal(completed.receiptId, "fast-receipt");
    assert.deepEqual(text, ["Respuesta factual"]);
    assert.equal((await coordinator.inspect(identity, session.sessionId))?.state, "authorized", "Fast completion does not claim media ready");
    await assert.rejects(coordinator.renderTurn(identity, session.sessionId, turn.turnId, "secreto oral", new AbortController().signal, async () => {}), /VOICE_TURN_INVALID/);
    const blocked = new UnavailableAvatarProvider();
    assert.equal(blocked.verified, false);
    await assert.rejects(blocked.createSession(), /BLOCKED_EXTERNAL_PROVIDER/);
    await coordinator.revokeConsent(identity, consent.id);
    assert.equal(await coordinator.acceptsOutput(identity, session.sessionId, 0), false);
  } finally { await db.close(); await rm(path, { recursive: true, force: true }); }
});
test("C13 concurrent renderer is fenced and late text after barge-in is rejected", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db); await installVoiceV2(db);
    const context = new ContextServingFacade(new CognitiveProjectionStore(db), { authorize: async () => true });
    let entered!: () => void, release!: () => void, aborted!: () => void;
    const ready = new Promise<void>((resolve) => { entered = resolve; });
    const providerAborted = new Promise<void>((resolve) => { aborted = resolve; });
    const provider: SharedFastVoicePort = { stream: async (_identity, _input, signal, emit) => {
      signal.addEventListener("abort", aborted, { once: true });
      entered(); await new Promise<void>((resolve) => { release = resolve; });
      await emit("obsolete speech"); return { receiptId: "never", text: "obsolete speech" };
    } };
    const coordinator = new VoiceTurnCoordinator(db, context, authority, provider);
    const snapshot = await context.getSnapshot(identity, { query: "", maxTokens: 1000, maxRefs: 5 });
    await db.put("alice", "threads", { id: "thread", tenantId: "A", title: "Chat", updatedAt: new Date().toISOString() });
    const consent = await coordinator.grantConsent(identity, { transcript: true, recording: false, purpose: "conversation", saveToThread: true });
    const session = await coordinator.create(identity, { agentId: "laia", roleId: "employee", threadId: "thread", consentReceiptId: consent.id, contextSnapshotId: snapshot.id });
    const turn = (await coordinator.acceptTranscript(identity, session.sessionId, { utteranceId: "u", revision: 1, status: "final", text: "hola" }))!;
    let delivered = false;
    const render = coordinator.renderTurn(identity, session.sessionId, turn.turnId, "hola", new AbortController().signal, async () => { delivered = true; });
    await ready;
    await assert.rejects(coordinator.renderTurn(identity, session.sessionId, turn.turnId, "hola", new AbortController().signal, async () => {}), /VOICE_TURN_INVALID/);
    const otherWorker = new VoiceTurnCoordinator(db, context, authority, provider);
    const interrupted = await otherWorker.interrupt(identity, session.sessionId);
    assert.equal(interrupted.epoch, 1);
    await providerAborted;
    release(); await assert.rejects(render, /VOICE_STALE_EPOCH/);
    assert.equal(delivered, false);
    assert.equal(await db.get("alice", "conversations", "thread"), null);
    const [stored] = await db.rawQuery<{ data: { state: string } }>("SELECT data FROM cognition_v2_voice_turns WHERE tenant=$1 AND id=$2", ["A", turn.turnId]);
    assert.equal(stored.data.state, "interrupted");
  } finally { await db.close(); }
});
test("C13 expiry/silence are recovered from durable timestamps, no timer or provider pricing assumption", async () => {
  const directory = await mkdtemp(join(tmpdir(), "voice-reap-"));
  const databaseUrl = process.env.COGNITION_TEST_POSTGRES_URL;
  const options = databaseUrl ? { databaseUrl } : { dataDir: directory };
  let db = await createStore(options);
  try {
    await installCognitionV2(db); await installVoiceV2(db);
    let now = Date.now();
    const context = new ContextServingFacade(new CognitiveProjectionStore(db), { authorize: async () => true }, () => now);
    const coordinator = new VoiceTurnCoordinator(db, context, authority, fast, { maxSessionMs: 10000, silenceMs: 1000, maxConcurrentSessions: 1 }, () => now);
    const snapshot = await context.getSnapshot(identity, { query: "", maxTokens: 1000, maxRefs: 5 });
    const consent = await coordinator.grantConsent(identity, { transcript: true, recording: false, purpose: "conversation" });
    const input = { agentId: "laia", roleId: "employee", threadId: "thread", consentReceiptId: consent.id, contextSnapshotId: snapshot.id };
    const session = await coordinator.create(identity, input);
    await assert.rejects(coordinator.create(identity, input), /VOICE_CONCURRENT_LIMIT/);
    now += 1001;
    await db.close();
    db = await createStore(options);
    const restartedContext = new ContextServingFacade(new CognitiveProjectionStore(db), { authorize: async () => true }, () => now);
    const restarted = new VoiceTurnCoordinator(db, restartedContext, authority, fast, { maxSessionMs: 10000, silenceMs: 1000, maxConcurrentSessions: 1 }, () => now);
    await restarted.reapExpired("B");
    assert.ok(await restarted.inspect(identity, session.sessionId));
    await restarted.reapExpired("A");
    await restarted.reapExpired("A");
    assert.equal(await restarted.reap(identity), 0);
    assert.equal(await restarted.acceptsOutput(identity, session.sessionId, 0), false);
    const [stored] = await db.rawQuery<{ data: { state: string; closedReason: string } }>("SELECT data FROM cognition_v2_voice_sessions WHERE tenant=$1 AND id=$2", ["A", session.sessionId]);
    assert.equal(stored.data.closedReason, "silence");
  } finally { await db.close(); await rm(directory, { recursive: true, force: true }); }
});
test("C13 Fast voice adapter reuses the shared runtime and cancels subscription when output is rejected", async () => {
  const { Observable } = await import("rxjs");
  const { EventType } = await import("@ag-ui/core");
  const { CognitionFastVoiceAdapter } = await import("../apps/server/src/engine/voice-v2/fast-adapter.ts");
  const { currentTenantScope } = await import("../apps/server/src/tenant-scope.ts");
  const db = await createStore();
  try {
    const previous = { id: "text-turn", role: "assistant", content: "Respuesta del chat" };
    await db.put("alice", "threads", { id: "shared-thread", tenantId: "A" });
    await db.put("alice", "conversations", { id: "shared-thread", messages: [previous] });
    await db.put("alice", "threads", { id: "foreign-thread", tenantId: "B" });
    let called = 0, stopped = 0;
    const runtime = {
      db,
      memberships: { resolveStrict: async () => ({ tenantId: "A" }) },
      context: { assertAuthorized: async () => {}, readSnapshot: async () => ({ id: "snapshot" }) },
      chat: (owner: string, input: import("@ag-ui/core").RunAgentInput) => {
        called++;
        assert.equal(owner, "alice");
        assert.equal(currentTenantScope()?.tenantId, "A");
        assert.deepEqual(input.tools, []);
        assert.equal(input.threadId, "shared-thread");
        assert.deepEqual(input.state, { roleId: "employee" });
        assert.deepEqual(input.messages, [previous, { id: "turn:user", role: "user", content: "hola" }]);
        return new Observable<import("@ag-ui/core").BaseEvent>((subscriber) => {
          subscriber.next({ type: EventType.TEXT_MESSAGE_CONTENT, delta: "texto" });
          return () => { stopped++; };
        });
      },
    } as unknown as import("../apps/server/src/engine/cognition/v2/runtime.ts").CognitionV2Runtime;
    const adapter = new CognitionFastVoiceAdapter(runtime);
    const input = { threadId: "shared-thread", turnId: "turn", text: "hola", contextSnapshotId: "snapshot", roleId: "employee" };
    const signal = new AbortController().signal;
    await assert.rejects(adapter.stream(identity, { ...input, threadId: "foreign-thread" }, signal, async () => {}), /Thread not found/);
    assert.equal(called, 0);
    await assert.rejects(adapter.stream(identity, input, signal, async () => { throw Error("stale epoch"); }), /VOICE_OUTPUT_REJECTED/);
    assert.equal(called, 1);
    assert.equal(stopped, 1);
  } finally {
    await db.close();
  }
});

test("voice writes only a completed, explicitly consented turn to the authorized chat history", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    await installVoiceV2(db);
    const context = new ContextServingFacade(new CognitiveProjectionStore(db), { authorize: async () => true });
    const coordinator = new VoiceTurnCoordinator(db, context, authority, fast);
    const snapshot = await context.getSnapshot(identity, { query: "", maxTokens: 1000, maxRefs: 5 });
    const consent = await coordinator.grantConsent(identity, {
      transcript: true, recording: false, purpose: "conversation", saveToThread: true,
    });
    const threadId = "common";
    const previous = { id: "text", role: "user", content: "Turno anterior" };
    const thread = { title: "Chat", updatedAt: new Date().toISOString(), messageCount: 1 };
    await db.put("alice", "threads", { ...thread, id: threadId, tenantId: "A" });
    await db.put("alice", "threads", { ...thread, id: "foreign", tenantId: "B" });
    await db.put("alice", "conversations", { id: threadId, messages: [previous] });
    const request = { agentId: "laia", roleId: "employee", threadId, consentReceiptId: consent.id, contextSnapshotId: snapshot.id };
    await assert.rejects(coordinator.create(identity, { ...request, threadId: "foreign" }), /Thread not found/);
    const session = await coordinator.create(identity, request);
    const final = { utteranceId: "voice", revision: 1, status: "final", text: "Turno de voz" };
    const turn = (await coordinator.acceptTranscript(identity, session.sessionId, final))!;
    const readHistory = async () => (await db.get<{ messages: unknown[] }>("alice", "conversations", threadId))?.messages;
    assert.deepEqual(await readHistory(), [previous]);
    const render = () => coordinator.renderTurn(identity, session.sessionId, turn.turnId, final.text, new AbortController().signal, async () => {});
    assert.equal((await render()).state, "completed");
    const history = await readHistory();
    assert.equal(history?.length, 3);
    assert.deepEqual(history?.[0], previous);
    assert.match(JSON.stringify(history?.[1]), /Turno de voz/);
    assert.match(JSON.stringify(history?.[2]), /Respuesta factual/);
    await assert.rejects(render(), /VOICE_TURN_INVALID/);
    assert.deepEqual(await readHistory(), history);

    const full = Array.from({ length: 999 }, (_, i) => ({ id: `filled-${i}`, role: "user", content: "Texto" }));
    await db.put("alice", "conversations", { id: threadId, messages: full });
    const overflow = (await coordinator.acceptTranscript(identity, session.sessionId, { ...final, utteranceId: "overflow" }))!;
    await assert.rejects(
      coordinator.renderTurn(identity, session.sessionId, overflow.turnId, final.text, new AbortController().signal, async () => {}),
      /Thread message limit reached/,
    );
    assert.deepEqual(await readHistory(), full);
    const [failed] = await db.rawQuery<{ data: { state: string; receiptId?: string } }>(
      "SELECT data FROM cognition_v2_voice_turns WHERE tenant=$1 AND id=$2", ["A", overflow.turnId],
    );
    assert.equal(failed.data.state, "failed");
    assert.equal(failed.data.receiptId, undefined);
  } finally {
    await db.close();
  }
});
