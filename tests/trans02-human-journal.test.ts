import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import type { Observable } from "rxjs";
import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { testConfig } from "./helpers/config.ts";
const collect = (source: Observable<BaseEvent>) =>
  new Promise<BaseEvent[]>((resolve, reject) => {
    const events: BaseEvent[] = [];
    source.subscribe({ next: (event) => events.push(event), error: reject, complete: () => resolve(events) });
  });
function input(runId: string, threadId = "thread", content = "No ejecutes sin mi aprobación."): RunAgentInput {
  return {
    runId,
    threadId,
    messages: [{ id: "message-" + runId, role: "user", content }],
    state: { tenantId: "forged", permissions: ["admin"] },
    tools: [],
    context: [],
    forwardedProps: {},
  };
}
async function fixture() {
  const db = await createStore();
  await installCognitionV2(db);
  const memberships = new TenantService(db, testConfig());
  for (const actor of ["alice", "bob"]) {
    await memberships.addMembership(actor, "A", "member");
    await db.put("system", "users", { id: actor, data: { active: true } });
  }
  let calls = 0,
    observedInput: RunAgentInput | undefined;
  const runtime = new CognitionV2Runtime(db, db, new Set(["A"]), memberships, {
    stream: async (request, _prompt, _profile, _signal, emit) => {
      calls++;
      observedInput = request;
      const runs = await db.rawQuery<{ input_event_id: string }>(
        "SELECT input_event_id FROM cognition_v2_chat_runs WHERE state='accepted'",
      );
      assert.ok(
        runs.some((run) => run.input_event_id?.startsWith("human:")),
        "human input is durable before inference",
      );
      emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "response", delta: "Respuesta" });
      return "Respuesta";
    },
  });
  const chat = (actor: string, request: RunAgentInput) =>
    collect(runInTenantScope({ tenantId: "A", actorId: actor }, () => runtime.chat(actor, request)));
  return { db, runtime, chat, calls: () => calls, observed: () => observedInput };
}

test("Fast admission captures a scoped human root before inference without operational authority", async () => {
  const f = await fixture();
  try {
    const request = input("first");
    assert.equal((await f.chat("alice", request)).at(-1)?.type, EventType.RUN_FINISHED);
    const identity = await f.runtime.identity("A", "alice", "alice", "chat");
    const entries = await f.runtime.humanTurns.thread(identity, "thread");
    assert.equal(entries.length, 1);
    assert.equal(entries[0].event.payload.text, request.messages[0].content);
    assert.equal(entries[0].event.actorId, "alice");
    assert.equal(entries[0].event.causalKind, "root");
    assert.equal(entries[0].event.payload.identity.tenantId, "A");
    assert.deepEqual(f.observed()?.tools, []);
    assert.deepEqual(f.observed()?.state, {});
    assert.equal(f.calls(), 1);
  } finally {
    await f.db.close();
  }
});

test("journal failure rolls back both captured event and run claim before any provider call", async () => {
  const f = await fixture();
  try {
    const write = f.runtime.sink.write.bind(f.runtime.sink);
    f.runtime.sink.write = async (event) => {
      await write(event);
      throw Error("synthetic storage failure");
    };
    const request = input("storage-failure");
    const events = await f.chat("alice", request);
    assert.deepEqual(
      events.map((event) => event.type),
      [EventType.RUN_ERROR],
    );
    assert.equal((await f.db.rawQuery("SELECT id FROM cognition_v2_chat_runs")).length, 0);
    assert.equal((await f.db.rawQuery("SELECT event_id FROM cognition_v2_events")).length, 0);
    assert.equal((await f.db.list("alice", "system-events")).length, 0);
    assert.equal(f.calls(), 0);
    f.runtime.sink.write = write;
    assert.equal((await f.chat("alice", request)).at(-1)?.type, EventType.RUN_FINISHED);
    assert.equal(f.calls(), 1);
  } finally {
    await f.db.close();
  }
});

test("concurrent replay of the same run produces one input event and one inference", async () => {
  const f = await fixture();
  try {
    const request = input("concurrent");
    const results = await Promise.all([f.chat("alice", request), f.chat("alice", request)]);
    assert.equal(results.filter((events) => events.at(-1)?.type === EventType.RUN_FINISHED).length, 1);
    assert.equal(f.calls(), 1);
    assert.equal((await f.db.rawQuery("SELECT id FROM cognition_v2_chat_runs")).length, 1);
    assert.equal((await f.db.rawQuery("SELECT event_id FROM cognition_v2_events")).length, 1);
  } finally {
    await f.db.close();
  }
});

test("private journal reads isolate actors and threads, verify payload binding and honor revocation", async () => {
  const f = await fixture();
  try {
    await f.chat("alice", input("a1", "thread-one", "alpha"));
    await f.chat("alice", input("a2", "thread-two", "beta"));
    await f.chat("bob", input("b1", "thread-one", "bob-private"));
    const alice = await f.runtime.identity("A", "alice", "alice", "chat"),
      bob = await f.runtime.identity("A", "bob", "bob", "chat");
    const [first] = await f.runtime.humanTurns.thread(alice, "thread-one");
    assert.equal(first.event.payload.text, "alpha");
    assert.equal((await f.runtime.humanTurns.resolve(alice, "thread-one", first.event.id))?.payload.text, "alpha");
    assert.equal(await f.runtime.humanTurns.resolve(alice, "thread-two", first.event.id), null);
    assert.equal(await f.runtime.humanTurns.resolve(bob, "thread-one", first.event.id), null);
    assert.deepEqual(
      (await f.runtime.humanTurns.thread(bob, "thread-one")).map((row) => row.event.payload.text),
      ["bob-private"],
    );
    assert.equal((await f.runtime.humanTurns.thread(alice, "thread-one", first.sequence)).length, 0);
    await assert.rejects(f.runtime.humanTurns.thread(alice, "thread-one", "9223372036854775808"), /QUERY_INVALID/);
    await f.db.rawQuery(
      "UPDATE cognition_v2_events SET event=jsonb_set(event,'{payload,text}','\"tampered\"'::jsonb) WHERE tenant='A' AND event_id=$1",
      [first.event.id],
    );
    await assert.rejects(f.runtime.humanTurns.thread(alice, "thread-one"), /EVIDENCE_UNAVAILABLE/);
    await f.runtime.context.projections.revoke("A", first.event.id);
    assert.equal((await f.runtime.humanTurns.thread(alice, "thread-one")).length, 0);
    assert.equal(await f.runtime.humanTurns.resolve(alice, "thread-one", first.event.id), null);
  } finally {
    await f.db.close();
  }
});

test("the admitted input snapshot survives caller mutation during identity lookup", async () => {
  const f = await fixture();
  try {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    const identity = f.runtime.identity.bind(f.runtime);
    f.runtime.identity = async (...args) => {
      await barrier;
      return identity(...args);
    };
    const request = input("mutation", "thread", "original");
    const pending = f.chat("alice", request);
    request.messages[0] = { id: "changed", role: "user", content: "mutated" };
    release();
    assert.equal((await pending).at(-1)?.type, EventType.RUN_FINISHED);
    assert.equal(f.observed()?.messages[0].content, "original");
    const who = await identity("A", "alice", "alice", "chat");
    assert.equal((await f.runtime.humanTurns.thread(who, "thread"))[0].event.payload.text, "original");
  } finally {
    await f.db.close();
  }
});

const postgres = process.env.COGNITION_TEST_POSTGRES_URL;
test("Postgres human journal: two connections admit one run and rollback a failed capture", {
  skip: !postgres,
}, async () => {
  const { randomUUID } = await import("node:crypto");
  const db = await createStore({ databaseUrl: postgres }),
    rival = await createStore({ databaseUrl: postgres });
  const tenant = "journal-" + randomUUID(),
    actor = "actor-" + randomUUID();
  try {
    await installCognitionV2(db);
    const membership = new TenantService(db, testConfig());
    await membership.addMembership(actor, tenant, "member");
    await db.put("system", "users", { id: actor, data: { active: true } });
    let calls = 0;
    const provider = {
      stream: async (
        _request: RunAgentInput,
        _prompt: string,
        _profile: "fast" | "slow",
        _signal: AbortSignal,
        emit: (event: BaseEvent) => void,
      ) => {
        calls++;
        emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "response", delta: "Respuesta" });
        return "Respuesta";
      },
    };
    const runtimes = [
      new CognitionV2Runtime(db, db, new Set([tenant]), membership, provider),
      new CognitionV2Runtime(rival, rival, new Set([tenant]), new TenantService(rival, testConfig()), provider),
    ];
    const request = input("run-" + randomUUID());
    const results = await Promise.all(
      runtimes.map((runtime) =>
        collect(runInTenantScope({ tenantId: tenant, actorId: actor }, () => runtime.chat(actor, request))),
      ),
    );
    assert.equal(results.filter((events) => events.at(-1)?.type === EventType.RUN_FINISHED).length, 1);
    assert.equal(calls, 1);
    const [row] = await db.rawQuery<{ input_event_id: string }>(
      "SELECT input_event_id FROM cognition_v2_chat_runs WHERE tenant=$1",
      [tenant],
    );
    const journal = await db.rawQuery<{ event_id: string }>(
      "SELECT event_id FROM cognition_v2_events WHERE tenant=$1",
      [tenant],
    );
    assert.deepEqual(
      journal.map((event) => event.event_id),
      [row.input_event_id],
    );
    assert.ok(await db.get(actor, "system-events", row.input_event_id));
    const identity = await runtimes[0].identity(tenant, actor, actor, "chat");
    assert.equal((await runtimes[0].humanTurns.thread(identity, request.threadId)).length, 1);
    assert.equal(
      (await runtimes[0].humanTurns.resolve(identity, request.threadId, row.input_event_id))?.payload.runId,
      request.runId,
    );
    const write = runtimes[1].sink.write.bind(runtimes[1].sink);
    runtimes[1].sink.write = async (event) => {
      await write(event);
      throw Error("synthetic post-write failure");
    };
    const failed = await collect(
      runInTenantScope({ tenantId: tenant, actorId: actor }, () =>
        runtimes[1].chat(actor, input("failed-" + randomUUID())),
      ),
    );
    assert.equal(failed.at(-1)?.type, EventType.RUN_ERROR);
    assert.equal(calls, 1);
    assert.equal((await db.rawQuery("SELECT event_id FROM cognition_v2_events WHERE tenant=$1", [tenant])).length, 1);
    assert.equal((await db.rawQuery("SELECT id FROM cognition_v2_chat_runs WHERE tenant=$1", [tenant])).length, 1);
  } finally {
    await db.close();
    await rival.close();
  }
});

test("an empty request cannot fabricate a human input event or call inference", async () => {
  const f = await fixture();
  try {
    const request = input("empty");
    request.messages = [];
    assert.deepEqual(
      (await f.chat("alice", request)).map((event) => event.type),
      [EventType.RUN_ERROR],
    );
    assert.equal(f.calls(), 0);
    assert.equal((await f.db.rawQuery("SELECT id FROM cognition_v2_chat_runs")).length, 0);
    assert.equal((await f.db.rawQuery("SELECT event_id FROM cognition_v2_events")).length, 0);
  } finally {
    await f.db.close();
  }
});
