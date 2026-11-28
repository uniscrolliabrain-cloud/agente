import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType } from "@ag-ui/core";
import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { CognitionFastVoiceAdapter } from "../apps/server/src/engine/voice-v2/fast-adapter.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
import { testConfig } from "./helpers/config.ts";

test("voice serves its bound snapshot and returns the actual Fast receipt", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const memberships = new TenantService(db, testConfig());
    await memberships.addMembership("alice", "A", "member");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    let calls = 0;
    const runtime = new CognitionV2Runtime(db, db, new Set(["A"]), memberships, {
      stream: async (_input, prompt, _profile, _signal, emit) => {
        calls++;
        assert.match(prompt, /alpha/);
        assert.doesNotMatch(prompt, /beta/);
        emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "message", delta: "Respuesta" });
        return "Respuesta";
      },
    });
    const identity = await runtime.identity("A", "alice", "alice", "chat");
    for (const id of ["alpha", "beta"])
      await runtime.context.projections.apply(
        {
          ...record("A", "alice", id),
          body: id,
          visibility: { ...record().visibility, policyRevision: identity.policyRevision },
        },
        "1",
      );
    const snapshot = await runtime.context.getSnapshot(identity, { query: "alpha", maxTokens: 4000, maxRefs: 1 });
    const adapter = new CognitionFastVoiceAdapter(runtime);
    const input = { threadId: "thread", turnId: "voice", text: "beta", contextSnapshotId: snapshot.id };
    const chunks: string[] = [];
    const result = await adapter.stream(identity, input, new AbortController().signal, async (text) => {
      chunks.push(text);
    });
    const [receipt] = await db.rawQuery<{ receipt_id: string }>(
      "SELECT receipt_id FROM cognition_v2_chat_runs WHERE tenant='A' AND state='completed'",
    );
    assert.equal(result.receiptId, receipt.receipt_id);
    assert.equal(result.text, chunks.join(""));
    await runtime.context.projections.revoke("A", "alpha");
    await assert.rejects(
      () => adapter.stream(identity, { ...input, turnId: "revoked" }, new AbortController().signal, async () => {}),
      /VOICE_CONTEXT_REVOKED/,
    );
    assert.equal(calls, 1);
  } finally {
    await db.close();
  }
});
