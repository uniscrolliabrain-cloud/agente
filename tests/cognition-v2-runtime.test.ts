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
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
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
      emit({ type: EventType.TEXT_MESSAGE_START, messageId: "response", role: "assistant" });
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
      assert.ok(ttft !== undefined); latencies.push(ttft!);
    }
    release(); await pending;
    assert.equal(calls, 10);
    const rows = await db.rawQuery<{ response: string; receipt_id: string }>("SELECT response,receipt_id FROM cognition_v2_chat_runs WHERE tenant='A' AND state='completed'");
    assert.equal(rows.length, 10); assert.ok(rows.every((r) => r.response === "Hola desde Fast" && r.receipt_id));
    assert.equal((await runtime.context.getSnapshot(identity, { query: "", maxTokens: 4000, maxRefs: 10 })).refs.length, 1);
    const unauthorized = await collect(runInTenantScope({ tenantId: "A", actorId: "mallory" }, () => runtime.chat("alice", input())));
    assert.equal(unauthorized.at(-1)?.type, EventType.RUN_ERROR); assert.equal(calls, 10);
    const large = input(); large.messages = [{ id: "large", role: "user", content: "x".repeat(50000) }];
    assert.equal((await collect(runInTenantScope({ tenantId: "A", actorId: "alice" }, () => runtime.chat("alice", large)))).at(-1)?.type, EventType.RUN_ERROR);
    await db.put("system", "users", { id: "alice", data: { active: false } });
    await assert.rejects(runtime.identity("A", "alice", "alice", "chat"), /DENIED/, "deactivated actor remains blocked even with membership");
    await memberships.removeMembership("alice", "A"); await assert.rejects(runtime.context.readSnapshot(identity, "any"), /DENIED/);
    latencies.sort((a, b) => a - b);
    const result = { provider: "deterministic in-process fixture; no network/model SLA", samples: latencies.length, ttftMs: { p50: latencies[4], p95: latencies[9], p99: latencies[9] }, providerCost: "NOT_MEASURED", slo: "NOT_APPROVED" };
    await mkdir("artifacts/cognition-v2", { recursive: true }); await writeFile("artifacts/cognition-v2/fixture-latency.json", JSON.stringify(result, null, 2));
  } finally { await db.close(); }
});