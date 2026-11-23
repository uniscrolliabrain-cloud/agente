import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import { tap, type Observable } from "rxjs";
import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { testConfig } from "./helpers/config.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { withConversationTurnPersistence } from "../apps/server/src/conversation-turn.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
const collect = (events: Observable<BaseEvent>) => new Promise<BaseEvent[]>((resolve, reject) => {
  const all: BaseEvent[] = []; events.subscribe({ next: (e) => all.push(e), error: reject, complete: () => resolve(all) });
});
function input(): RunAgentInput { return { threadId: "thread", runId: randomUUID(), state: { tenantId: "B", permissions: ["admin"] }, context: [], tools: [], forwardedProps: {}, messages: [{ id: randomUUID(), role: "user", content: "Hola" }] }; }
test("C10/C11/C12 Fast path uses authorized snapshot while Slow is busy; receipts match streamed response", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db); const memberships = new TenantService(db, testConfig()); await memberships.addMembership("alice", "A", "member");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    let calls = 0;
    const runtime = new CognitionV2Runtime(db, db, new Set(["A"]), memberships, { stream: async (request, prompt, profile, signal, emit) => {
      calls++; assert.equal(profile, "fast"); assert.equal(request.tools.length, 0); assert.deepEqual(request.state, {});
      assert.ok(prompt.includes("hypothesis")); assert.ok(!prompt.includes("private-raw-thought")); signal.throwIfAborted();
      emit({ type: EventType.REASONING_MESSAGE_CONTENT, messageId: "private", delta: "PRIVATE_SYNTHETIC_REASONING" });
      emit({ type: EventType.STATE_SNAPSHOT, snapshot: { secret: "PRIVATE_SYNTHETIC_REASONING" } });
      emit({ type: EventType.CUSTOM, name: "private", value: "PRIVATE_SYNTHETIC_REASONING" });
      emit({ type: EventType.TEXT_MESSAGE_START, messageId: "response", role: "assistant", rawEvent: { reasoning: "PRIVATE_SYNTHETIC_REASONING" } });
      emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "response", delta: "Hola desde Fast" });
      emit({ type: EventType.TEXT_MESSAGE_END, messageId: "response" }); return "Hola desde Fast";
    } });
    const identity = await runtime.identity("A", "alice", "alice", "chat");
    const source = record(); source.visibility.policyRevision = identity.policyRevision; await runtime.context.projections.apply(source, "1");
    await runtime.context.projections.apply({ ...record("A", "alice", "private-thought"), kind: "thought_ref", body: "private-raw-thought", visibility: source.visibility }, "1");
    let release!: () => void, started!: () => void;
    const ready = new Promise<void>((r) => { started = r; });
    const pending = runtime.slow.lane.run("A", async () => { started(); await new Promise<void>((r) => { release = r; }); });
    await ready;
    const latencies: number[] = [];
    for (let i = 0; i < 10; i++) {
      const began = performance.now(); let ttft: number | undefined;
      const req = input();
      const events = await collect(runInTenantScope({ tenantId: "A", actorId: "alice" }, () => runtime.chat("alice", req)).pipe(tap((e) => {
        if (e.type === EventType.TEXT_MESSAGE_CONTENT) ttft ??= performance.now() - began;
      })));
      assert.equal(events[0].type, EventType.RUN_STARTED); assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
      assert.deepEqual(events.map(e=>e.type),[EventType.RUN_STARTED,EventType.TEXT_MESSAGE_START,EventType.TEXT_MESSAGE_CONTENT,EventType.TEXT_MESSAGE_END,EventType.RUN_FINISHED]);
      assert.ok(!JSON.stringify(events).includes("PRIVATE_SYNTHETIC_REASONING"),"private provider events and raw metadata never reach clients");
      assert.ok(ttft !== undefined); latencies.push(ttft!);
    }
    release(); await pending;
    assert.equal(calls, 10);
    const rows = await db.rawQuery<{ response: string; receipt_id: string }>("SELECT response,receipt_id FROM cognition_v2_chat_runs WHERE tenant='A' AND state='completed'");
    assert.equal(rows.length, 10); assert.ok(rows.every((r) => r.response === "Hola desde Fast" && r.receipt_id));
    const deliveries = await db.rawQuery<{consumer_ref:string;receipt_id:string;status:string}>("SELECT consumer_ref,receipt_id,status FROM cognition_v2_deliveries WHERE tenant='A'");
    assert.equal(deliveries.length, 10, "warm snapshots still require one delivery per independent chat run");
    assert.equal(new Set(deliveries.map(d=>d.consumer_ref)).size,10);
    assert.ok(deliveries.every(d=>d.status==="acknowledged" && rows.some(r=>r.receipt_id===d.receipt_id)));
    assert.equal((await runtime.context.getSnapshot(identity, { query: "", maxTokens: 4000, maxRefs: 10 })).refs.length, 1);
    const unauthorized = await collect(runInTenantScope({ tenantId: "A", actorId: "mallory" }, () => runtime.chat("alice", input())));
    assert.equal(unauthorized.at(-1)?.type, EventType.RUN_ERROR); assert.equal(calls, 10);
    const large = input(); large.messages = [{ id: "large", role: "user", content: "x".repeat(50000) }];
    assert.equal((await collect(runInTenantScope({ tenantId: "A", actorId: "alice" }, () => runtime.chat("alice", large)))).at(-1)?.type, EventType.RUN_ERROR);
    const ack = runtime.ledger.ack.bind(runtime.ledger);
    runtime.ledger.ack = async () => false;
    const failedAck = await collect(runInTenantScope({ tenantId: "A", actorId: "alice" }, () =>
      withConversationTurnPersistence(
        async (assistant) => { await db.put("alice", "test-turns", { ...assistant, id: "pending" }); },
        () => runtime.chat("alice", input()),
      ),
    ));
    assert.equal(failedAck.at(-1)?.type, EventType.RUN_ERROR);
    assert.ok(failedAck.every((event) => event.type !== EventType.CUSTOM));
    assert.equal(await db.get("alice", "test-turns", "pending"), null, "failed ACK rolls back the turn write");
    assert.equal((await db.rawQuery("SELECT id FROM cognition_v2_chat_runs WHERE tenant='A' AND state='completed'")).length,10,"failed ACK rolls back completion receipt");
    const [failed] = await db.rawQuery<{response:string|null;receipt_id:string|null}>("SELECT response,receipt_id FROM cognition_v2_chat_runs WHERE tenant='A' AND state='failed'");
    assert.equal(failed.response,null); assert.equal(failed.receipt_id,null);
    runtime.ledger.ack = ack;
    await db.put("system", "users", { id: "alice", data: { active: false } });
    await assert.rejects(runtime.identity("A", "alice", "alice", "chat"), /DENIED/, "deactivated actor remains blocked even with membership");
    await memberships.removeMembership("alice", "A"); await assert.rejects(runtime.context.readSnapshot(identity, "any"), /DENIED/);
    latencies.sort((a, b) => a - b);
    const result = { provider: "deterministic in-process fixture; no network/model SLA", samples: latencies.length, ttftMs: { p50: latencies[4], p95: latencies[9], p99: latencies[9] }, providerCost: "NOT_MEASURED", slo: "NOT_APPROVED" };
    await mkdir("artifacts/cognition-v2", { recursive: true }); await writeFile("artifacts/cognition-v2/fixture-latency.json", JSON.stringify(result, null, 2));
  } finally { await db.close(); }
});
test("Fast uses only the active role in the request tenant and stops accepting its output after revocation", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const memberships = new TenantService(db, testConfig());
    const records = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
    const scope = (tenantId: string) => ({ tenantId, actorId: "alice" });
    await memberships.addMembership("alice", "A", "member");
    await memberships.addMembership("alice", "B", "member");
    await db.put("system", "users", { id: "alice", data: { active: true } });

    const role = { id: "editor", name: "Editora A", objetivo: "Revisión sintética", active: true };
    await runInTenantScope(scope("A"), () => records.put("alice", "agent-roles", role));
    await runInTenantScope(scope("B"), () => records.put("alice", "agent-roles", { ...role, name: "Editora B", active: false }));

    let calls = 0;
    let revokeDuringStream = false;
    const runtime = new CognitionV2Runtime(db, records, new Set(["A", "B"]), memberships, {
      stream: async (request, prompt) => {
        calls++;
        assert.match(prompt, /Editora A/);
        assert.match(prompt, /Revisión sintética/);
        assert.doesNotMatch(prompt, /Editora B|Eres LAIA/);
        assert.deepEqual(request.state, {});
        assert.deepEqual(request.tools, []);
        if (revokeDuringStream) await runInTenantScope(scope("A"), () => records.put("alice", "agent-roles", { ...role, active: false }));
        return "";
      },
    });
    const run = (tenantId: string, state: object) =>
      collect(runInTenantScope(scope(tenantId), () => runtime.chat("alice", { ...input(), state })));

    assert.equal((await run("A", { roleId: "editor" })).at(-1)?.type, EventType.RUN_FINISHED);
    assert.equal((await run("B", { roleId: "editor" })).at(-1)?.type, EventType.RUN_ERROR);
    assert.equal((await run("A", { roleId: "editor", personaId: "other" })).at(-1)?.type, EventType.RUN_ERROR);
    assert.equal(calls, 1);

    revokeDuringStream = true;
    assert.equal((await run("A", { roleId: "editor" })).at(-1)?.type, EventType.RUN_ERROR);
    assert.equal((await run("A", { roleId: "editor" })).at(-1)?.type, EventType.RUN_ERROR);
    assert.equal(calls, 2);
    const completed = await db.rawQuery("SELECT id FROM cognition_v2_chat_runs WHERE state='completed'");
    assert.equal(completed.length, 1);
  } finally {
    await db.close();
  }
});
