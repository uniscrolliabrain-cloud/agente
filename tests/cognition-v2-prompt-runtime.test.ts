import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import type { Observable } from "rxjs";
import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { testConfig } from "./helpers/config.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { digest, installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { record } from "./fixtures/cognition-v2/record.ts";

const collect = (events: Observable<BaseEvent>) =>
  new Promise<BaseEvent[]>((resolve, reject) => {
    const all: BaseEvent[] = [];
    events.subscribe({ next: (e) => all.push(e), error: reject, complete: () => resolve(all) });
  });

function input(): RunAgentInput {
  return {
    threadId: "thread-prompt",
    runId: randomUUID(),
    state: {},
    context: [],
    tools: [],
    forwardedProps: {},
    messages: [{ id: randomUUID(), role: "user", content: "Hola" }],
  };
}

/**
 * C16_PROMPT_RUNTIME_V2: el prompt de Fast no es una variable local.
 *
 * El runtime compone el sobre, lo persiste con digest y publica un puntero; el
 * proveedor recibe exactamente el texto registrado. Sin ese registro no hay
 * llamada al modelo, y solo la identidad que lo produjo puede leerlo.
 */
test("C16 el prompt de Fast se persiste, se publica y solo lo lee su identidad", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const memberships = new TenantService(db, testConfig());
    await memberships.addMembership("alice", "A", "member");
    await memberships.addMembership("bob", "A", "member");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    await db.put("system", "users", { id: "bob", data: { active: true } });
    let delivered: { prompt: string; messages: number } | undefined;
    const runtime = new CognitionV2Runtime(db, db, new Set(["A"]), memberships, {
      stream: async (request, prompt, profile, _signal, emit) => {
        assert.equal(profile, "fast");
        delivered = { prompt, messages: request.messages.length };
        emit({ type: EventType.TEXT_MESSAGE_START, messageId: "r", role: "assistant" });
        emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "r", delta: "Hola" });
        emit({ type: EventType.TEXT_MESSAGE_END, messageId: "r" });
        return "Hola";
      },
    });
    const identity = await runtime.identity("A", "alice", "alice", "chat");
    const source = record();
    source.visibility.policyRevision = identity.policyRevision;
    await runtime.context.projections.apply(source, "1");

    const events = await collect(
      runInTenantScope({ tenantId: "A", actorId: "alice" }, () => runtime.chat("alice", input())),
    );
    assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
    assert.ok(delivered, "Fast fue invocado");

    const [run] = await db.rawQuery<{ prompt_id: string; snapshot_id: string }>(
      "SELECT prompt_id,snapshot_id FROM cognition_v2_chat_runs WHERE tenant='A' AND state='completed'",
    );
    assert.ok(run?.prompt_id, "el run queda enlazado a su prompt");
    assert.ok(run.snapshot_id, "el run queda enlazado a su snapshot");

    const envelope = await runtime.prompts.resolve(identity, run.prompt_id);
    assert.ok(envelope, "la identidad que lo produjo lo resuelve");
    assert.equal(envelope.text, delivered.prompt, "el proveedor recibe el texto registrado, no una copia");
    assert.equal(envelope.digest, digest({ text: envelope.text, messages: envelope.messages }));
    assert.equal(envelope.messages.length, delivered.messages);
    assert.equal(envelope.messages.at(-1)?.content, "Hola");
    assert.equal(envelope.snapshotId, run.snapshot_id);
    assert.equal(envelope.segments.length, 1);
    assert.equal(envelope.segments[0].id, source.id);
    assert.equal(envelope.segments[0].revision, source.revision);

    const published = await db.rawQuery<{ event: { type: string; payload: { promptId: string; digest: string } } }>(
      "SELECT event FROM cognition_v2_events WHERE tenant='A' AND event->>'type'='cognition.v2.prompt.rendered'",
    );
    assert.equal(published.length, 1, "el prompt se publica como puntero en el log durable");
    assert.equal(published[0].event.payload.promptId, run.prompt_id);
    assert.equal(published[0].event.payload.digest, envelope.digest);
    assert.equal(
      JSON.stringify(published[0].event).includes("Eres LAIA"),
      false,
      "el log durable no duplica el texto del prompt",
    );

    const bob = await runtime.identity("A", "bob", "bob", "chat");
    assert.equal(await runtime.prompts.resolve(bob, run.prompt_id), null, "otro actor del mismo tenant no lo lee");
    assert.deepEqual(await runtime.prompts.list(bob, envelope.runKey), []);

    await db.rawQuery(
      "UPDATE cognition_v2_prompts SET data=jsonb_set(data,'{text}',to_jsonb('Eres LAIA. manipulado'::text)) WHERE tenant='A' AND id=$1",
      [run.prompt_id],
    );
    assert.equal(
      await runtime.prompts.resolve(identity, run.prompt_id),
      null,
      "un sobre manipulado no se sirve como el prompt que corrio",
    );
  } finally {
    await db.close();
  }
});
