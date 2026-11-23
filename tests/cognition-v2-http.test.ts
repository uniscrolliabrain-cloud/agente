import { test } from "node:test";
import { EventType } from "@ag-ui/core";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import { createApp } from "../apps/server/src/app.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { testConfig } from "./helpers/config.ts";
import { SlowCognitionQueue } from "../apps/server/src/engine/cognition/v2/slow.ts";
import { CognitiveGraphQuery } from "../apps/server/src/engine/cognition/v2/graph.ts";
test("C15 synthetic authenticated HTTP: working memory → snapshot → durable Slow → kernel Thought/card → revoke; cross-tenant denied", async () => {
  const old = process.env.COGNITION_V2_TENANTS;
  process.env.COGNITION_V2_TENANTS = "tenant-a,tenant-b";
  const directory = await mkdtemp(join(tmpdir(), "cognition-v2-http-"));
  const db = await createStore();
  let server: Awaited<ReturnType<typeof createApp>> | undefined;
  try {
    const config = testConfig({ dataDir: directory }); server = await createApp(db, config);
    const membership = new TenantService(db, config);
    async function user(name: string, tenant: string) {
      const u = await server!.users.create({ email: `${name}@synthetic.local`, password: "synthetic-long-password", name, role: "admin" });
      await membership.setMembership(u.id, tenant); await membership.addMembership(u.id, tenant);
      const response = await server!.app.request("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: u.email, password: "synthetic-long-password" }) });
      assert.equal(response.status, 200); return { id: u.id, token: (await response.json() as { token: string }).token };
    }
    const alice = await user("alice", "tenant-a"), bob = await user("bob", "tenant-b"), charlie = await user("charlie", "tenant-a");
    const request = (path: string, token: string, method = "GET", body?: unknown) => server!.app.request(`/api/cognition-v2${path}`, { method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    assert.equal((await request("/snapshots", alice.token, "POST", { query: "x", maxTokens: 1000, maxRefs: 10, tenantId: "tenant-b" })).status, 422);
    const accepted = await request("/working", alice.token, "POST", { body: "Dato sintético para el análisis; cualquier conclusión será una hipótesis." });
    assert.equal(accepted.status, 202);
    const runtime = server.agent.cognitionV2!; assert.ok(runtime);
    const chatHeaders = { Authorization: `Bearer ${alice.token}`, "Content-Type": "application/json" };
    const createThread = await server.app.request("/api/threads", { method: "POST", headers: chatHeaders, body: "{}" });
    assert.equal(createThread.status, 201);
    const { id: chatThread } = await createThread.json();
    let providerInput: string | undefined;
    let providerHistory: unknown[] = [];
    runtime.provider.stream = async (input, _prompt, _profile, _signal, emit) => {
      providerHistory = input.messages;
      const latest = input.messages.at(-1);
      providerInput = typeof latest?.content === "string" ? latest.content : undefined;
      emit({ type: EventType.TEXT_MESSAGE_START, messageId: "fixture", role: "assistant" });
      emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "fixture", delta: "Respuesta de prueba" });
      emit({ type: EventType.TEXT_MESSAGE_END, messageId: "fixture" });
      return "Respuesta de prueba";
    };
    const chat = (id: string, attachmentId?: string) => server!.app.request("/api/copilotkit/run", {
      method: "POST", headers: { ...chatHeaders, Accept: "text/event-stream" },
      body: JSON.stringify({
        threadId: chatThread, runId: id, persistTurn: true, state: {}, tools: [], context: [],
        attachmentId,
        messages: [{ id, role: "user", content: attachmentId ? "" : "Hola" }],
      }),
    });
    const completedChat = await chat("first-turn");
    assert.equal(completedChat.status, 200);
    assert.equal(completedChat.headers.get("X-Conversation-Persistence"), "server");
    const stream = await completedChat.text();
    assert.match(stream, /conversation\.turn\.persisted/);
    assert.match(stream, /RUN_FINISHED/);
    const readChat = async () => (await server!.app.request(`/api/threads/${chatThread}`, { headers: chatHeaders })).json();
    const stored = await readChat();
    assert.deepEqual(stored.messages.map((message: { role: string; content: string }) => [message.role, message.content]),
      [["user", "Hola"], ["assistant", "Respuesta de prueba"]]);
    assert.equal((await chat("first-turn")).status, 409);

    const attachment = { id: "owned-file", name: "acta.pdf", size: 123 };
    await db.put(`tenant-a:${alice.id}`, "files", { ...attachment, url: "private-signed-url" });
    await db.put(`tenant-b:${alice.id}`, "files", { ...attachment, id: "foreign-file" });
    assert.equal((await chat("foreign-attachment", "foreign-file")).status, 404);
    const attachmentStream = await (await chat("attached-turn", attachment.id)).text();
    assert.match(attachmentStream, /conversation\.turn\.persisted/);
    assert.equal(providerInput, "(sin texto)\n\n[Adjunto: acta.pdf, id: owned-file]");
    const afterAttachment = await readChat();
    assert.deepEqual(afterAttachment.messages[2].attachment, attachment);
    assert.equal(afterAttachment.messages[2].content, "Adjunto: acta.pdf");
    assert.ok(!JSON.stringify(afterAttachment).includes("private-signed-url"));

    await db.put(`tenant-a:${alice.id}`, "agent-roles", { id: "laia", name: "Laia", active: true });
    const voice = (path: string, method: string, body?: unknown) => server!.app.request(`/api/cognition-v2/voice${path}`, {
      method, headers: chatHeaders, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const consent = await voice("/consents", "POST", {
      transcript: true, recording: false, purpose: "conversation", saveToThread: true,
    });
    assert.equal(consent.status, 201);
    const { id: consentReceiptId } = await consent.json();
    const startSession = async (channel: "voice" | "video") => {
      const response = await voice("/sessions", "POST", { threadId: chatThread, roleId: "laia", consentReceiptId, channel });
      assert.equal(response.status, 201);
      const session = await response.json();
      assert.equal(session.channel, channel);
      return session.sessionId as string;
    };
    const transcript = (sessionId: string, text: string, status = "final") =>
      voice(`/sessions/${sessionId}/transcripts`, "POST", { utteranceId: text, revision: 1, status, text });
    const voiceId = await startSession("voice");
    assert.equal((await transcript(voiceId, "borrador", "partial")).status, 204);
    assert.equal((await transcript(voiceId, "Turno de voz")).status, 200);
    assert.equal((await transcript(voiceId, "Turno de voz")).status, 200);
    const completedProvider = runtime.provider.stream;
    const startSlow = (sessionId: string, text: string) => {
      let started!: () => void;
      let aborted!: () => void;
      const ready = new Promise<void>((resolve) => { started = resolve; });
      const stopped = new Promise<void>((resolve) => { aborted = resolve; });
      runtime.provider.stream = async (_input, _prompt, _profile, signal) => new Promise<string>((_resolve, reject) => {
        const abort = () => { aborted(); reject(signal.reason); };
        if (signal.aborted) abort();
        else signal.addEventListener("abort", abort, { once: true });
        started();
      });
      return { ready, stopped, response: transcript(sessionId, text) };
    };
    const interrupted = startSlow(voiceId, "Interrumpido");
    await interrupted.ready;
    const concurrent = await transcript(voiceId, "Interrumpido");
    assert.equal(concurrent.status, 409);
    assert.equal((await concurrent.json()).code, "VOICE_TURN_INVALID");
    assert.equal((await voice(`/sessions/${voiceId}/interrupt`, "POST")).status, 200);
    await interrupted.stopped;
    const interruptedResponse = await interrupted.response;
    assert.equal(interruptedResponse.status, 409);
    assert.equal((await interruptedResponse.json()).code, "VOICE_INTERRUPTED");

    runtime.provider.stream = completedProvider;
    const videoId = await startSession("video");
    const foreign = await server.app.request(`/api/cognition-v2/voice/sessions/${videoId}/transcripts`, {
      method: "POST", headers: { ...chatHeaders, Authorization: `Bearer ${bob.token}` },
      body: JSON.stringify({ utteranceId: "foreign", revision: 1, status: "final", text: "Foreign" }),
    });
    assert.equal(foreign.status, 404);
    assert.equal((await foreign.json()).code, "VOICE_SESSION_NOT_FOUND");
    assert.equal((await transcript(videoId, "Turno de vídeo")).status, 200);
    assert.match(JSON.stringify(providerHistory), /Turno de voz/);

    const revoking = startSlow(videoId, "Revocación activa");
    await revoking.ready;
    assert.equal((await voice(`/consents/${consentReceiptId}`, "DELETE")).status, 204);
    await revoking.stopped;
    const revokedResponse = await revoking.response;
    assert.equal(revokedResponse.status, 403);
    assert.equal((await revokedResponse.json()).code, "VOICE_CONSENT_REVOKED");
    assert.equal((await transcript(videoId, "Revocado")).status, 403);
    runtime.provider.stream = completedProvider;

    const returnToText = await (await chat("return-to-text")).text();
    assert.match(returnToText, /conversation\.turn\.persisted/);
    assert.match(JSON.stringify(providerHistory), /Turno de voz/);
    assert.match(JSON.stringify(providerHistory), /Turno de vídeo/);
    const unifiedHistory = await readChat();
    assert.deepEqual(unifiedHistory.messages.filter((message: { role: string }) => message.role === "user")
      .map((message: { content: string }) => message.content),
    ["Hola", "Adjunto: acta.pdf", "Turno de voz", "Turno de vídeo", "Hola"]);

    const fullHistory = Array.from({ length: 999 }, (_, id) => ({ id: `seed-${id}`, role: "user", content: "Semilla" }));
    await db.put(alice.id, "conversations", { id: chatThread, messages: fullHistory });
    const failedStream = await (await chat("overflow-turn")).text();
    assert.match(failedStream, /RUN_ERROR/);
    assert.doesNotMatch(failedStream, /conversation\.turn\.persisted|RUN_FINISHED/);
    assert.deepEqual((await readChat()).messages, fullHistory);
    const completedRuns = await db.rawQuery("SELECT id FROM cognition_v2_chat_runs WHERE state='completed'");
    assert.equal(completedRuns.length, 5);

    await runtime.projector.tick("tenant-a");
    const snapshotResponse = await request("/snapshots", alice.token, "POST", { query: "análisis", maxTokens: 4000, maxRefs: 10 });
    assert.equal(snapshotResponse.status, 200);
    const snapshot = await snapshotResponse.json() as { id: string; refs: { id: string }[] }; assert.ok(snapshot.refs.length);
    assert.equal((await request(`/snapshots/${snapshot.id}`, bob.token)).status, 404);
    const queued = await request("/slow", alice.token, "POST", { snapshotId: snapshot.id, prompt: "Resume como hipótesis", key: "synthetic-job" });
    assert.equal(queued.status, 202); const job = await queued.json() as { id: string };
    const worker = new SlowCognitionQueue(db, runtime.sink, runtime.context, { infer: async (input) => ({ title: "Resultado sintético", body: "Hipótesis de prueba", epistemic: "hypothesis", evidence: input.evidence }) });
    worker.capture = runtime.slow.capture;
    await worker.tick("tenant-a"); await runtime.projector.tick("tenant-a");
    const cardId = `slow:${job.id}`;
    const own = await request(`/references/${encodeURIComponent(cardId)}`, alice.token); assert.equal(own.status, 200);
    assert.equal((await own.json() as { epistemic: string }).epistemic, "hypothesis");
    assert.equal((await request(`/references/${encodeURIComponent(cardId)}`, bob.token)).status, 404);
    const identity = await runtime.identity("tenant-a", alice.id, alice.id, "chat");
    const graph = new CognitiveGraphQuery(runtime.context); const sources = await graph.evidence(identity, cardId);
    assert.ok(sources?.refs.some((ref) => ref.kind === "thought" && ref.available));
    const thoughtId = sources!.refs.find(ref => ref.kind === "thought")!.id;
    await db.put(alice.id, "cognition-cards", { id: "legacy-http", tenantId: "tenant-a", owner: alice.id, turnId: "legacy-turn", thoughtId,
      kind: "decision", title: "Propuesta antigua", body: "No es una aprobación", status: "consumed", scope: "tenant", confidence: 1,
      evidence: { thoughtIds: [thoughtId], entityRefs: [] }, attention: { primary: thoughtId, matched: [] }, provenance: { source: "slow.llm", createdAt: "2026-11-15T00:00:00Z" }, version: 1 });
    assert.equal((await request("/migration/legacy-cards/prepare", alice.token, "POST", { key: "bad", tenantId: "tenant-b" })).status, 422);
    const previewResponse = await request("/migration/legacy-cards/prepare", alice.token, "POST", { key: "http-preview" });
    assert.equal(previewResponse.status, 200);
    const preview = await previewResponse.json() as { id: string; planDigest: string; ready: number }; assert.equal(preview.ready, 1);
    const applyPath = `/migration/legacy-cards/${preview.id}/apply`;
    assert.equal((await request(applyPath, bob.token, "POST", { planDigest: preview.planDigest })).status, 404);
    assert.equal((await request(applyPath, charlie.token, "POST", { planDigest: preview.planDigest })).status, 404);
    assert.equal((await request(applyPath, alice.token, "POST", { planDigest: preview.planDigest })).status, 202);
    assert.equal((await request(applyPath, alice.token, "POST", { planDigest: preview.planDigest })).status, 202);
    await runtime.projector.tick("tenant-a");
    const imported = (await runtime.context.projections.latest("tenant-a", 100, alice.id)).find(card => card.id.startsWith("legacy:"));
    assert.equal(imported?.epistemic, "unknown"); assert.equal(imported?.visibility.scope, "private"); assert.equal(imported?.lifecycle, "active");
    const journey = await request("/journey", alice.token); assert.equal(journey.status, 200);
    assert.deepEqual((await journey.json() as { phases: { state: string }[] }).phases.map((p) => p.state), ["queued", "running", "completed"]);
    assert.equal((await request(`/references/${encodeURIComponent(cardId)}`, alice.token, "DELETE")).status, 200);
    assert.equal((await request(`/references/${encodeURIComponent(cardId)}`, alice.token)).status, 404);
    await membership.removeMembership(alice.id, "tenant-a");
    assert.equal((await request("/snapshots", alice.token, "POST", { query: "x", maxTokens: 1000, maxRefs: 10 })).status, 403);
  } finally {
    if (old === undefined) delete process.env.COGNITION_V2_TENANTS; else process.env.COGNITION_V2_TENANTS = old;
    await server?.agent.stop(); await db.close(); await rm(directory, { recursive: true, force: true });
  }
});
