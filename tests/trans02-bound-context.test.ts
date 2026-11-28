import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType, type BaseEvent } from "@ag-ui/core";
import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { testConfig } from "./helpers/config.ts";
import { record } from "./fixtures/cognition-v2/record.ts";

test("internal context binding serves the selected snapshot and returns its durable receipt", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const memberships = new TenantService(db, testConfig());
    await memberships.addMembership("alice", "A", "member");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    let prompt = "";
    const runtime = new CognitionV2Runtime(db, db, new Set(["A"]), memberships, {
      stream: async (_input, text, _profile, _signal, emit) => {
        prompt = text;
        emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "response", delta: "Respuesta" });
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
    const selected = await runtime.context.getSnapshot(identity, { query: "alpha", maxTokens: 4000, maxRefs: 1 });
    let receipt: { id: string; contextSnapshotId: string } | undefined;
    const events: BaseEvent[] = [];
    await new Promise<void>((resolve, reject) =>
      runInTenantScope({ tenantId: "A", actorId: "alice" }, () =>
        runtime.chat(
          "alice",
          {
            threadId: "thread",
            runId: "bound",
            messages: [{ id: "user", role: "user", content: "beta" }],
            state: {},
            tools: [],
            context: [],
            forwardedProps: {},
          },
          {
            contextSnapshotId: selected.id,
            onReceipt: (value) => {
              receipt = value;
            },
          },
        ),
      ).subscribe({ next: (event) => events.push(event), error: reject, complete: resolve }),
    );
    assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
    assert.match(prompt, /alpha/);
    assert.doesNotMatch(prompt, /beta/);
    assert.equal(receipt?.contextSnapshotId, selected.id);
    const [saved] = await db.rawQuery<{ receipt_id: string }>(
      "SELECT receipt_id FROM cognition_v2_chat_runs WHERE tenant='A' AND state='completed'",
    );
    assert.equal(saved.receipt_id, receipt?.id);
  } finally {
    await db.close();
  }
});
