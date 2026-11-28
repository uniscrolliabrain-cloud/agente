import assert from "node:assert/strict";
import { test } from "node:test";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import { createStore } from "../apps/server/src/db.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { installCognitionV2 } from "../apps/server/src/engine/cognition/v2/storage.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { record } from "./fixtures/cognition-v2/record.ts";
import { testConfig } from "./helpers/config.ts";

test("Fast drops provider output after revocation aborts the run and records no successful receipt", async () => {
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const memberships = new TenantService(db, testConfig());
    await memberships.addMembership("alice", "A", "member");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    const runtime = new CognitionV2Runtime(db, db, new Set(["A"]), memberships, {
      async stream(_input, _prompt, _profile, signal, emit) {
        const aborted = new Promise<void>((resolve) => signal.addEventListener("abort", () => {
          emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: "response", delta: "late output" });
          resolve();
        }, { once: true }));
        await runtime.context.projections.revoke("A", "card-1");
        await aborted;
        return "late output";
      },
    });
    const identity = await runtime.identity("A", "alice", "alice", "chat");
    const source = record();
    source.visibility.policyRevision = identity.policyRevision;
    await runtime.context.projections.apply(source, "1");

    const request: RunAgentInput = { threadId: "t", runId: "r", messages: [{ id: "human-request", role: "user", content: "Consulta el contexto autorizado." }], tools: [], state: {}, context: [], forwardedProps: {} };
    const stream = runInTenantScope({ tenantId: "A", actorId: "alice" }, () => runtime.chat("alice", request));
    const events: BaseEvent[] = [];
    await new Promise<void>((resolve, reject) => stream.subscribe({
      next: (event) => events.push(event), error: reject, complete: resolve,
    }));
    assert.deepEqual(events.map(event => event.type), [EventType.RUN_STARTED, EventType.RUN_ERROR]);
    const [run] = await db.rawQuery<{ state: string; receipt_id: string | null }>(
      "SELECT state, receipt_id FROM cognition_v2_chat_runs WHERE tenant=$1", ["A"],
    );
    assert.deepEqual(run, { state: "cancelled", receipt_id: null });
  } finally {
    await db.close();
  }
});
