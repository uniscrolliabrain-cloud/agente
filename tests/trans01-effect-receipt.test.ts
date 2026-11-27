import assert from "node:assert/strict";
import { test } from "node:test";
import { ActionService } from "../apps/server/src/actions.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";
import { createStore } from "../apps/server/src/db.ts";
const input = {
  kind: "email.send" as const,
  data: { to: ["fixture@example.invalid"], subject: "synthetic", body: "fixture", cc: [], bcc: [], attachmentIds: [] },
};

test("governed ActionService retains provider acceptance evidence without inventing delivery", async () => {
  const db = await createStore();
  try {
    const service = new ActionService(db, {
      connected: async () => true,
      requireTypedEffect: true,
      execute: async () => ({
        mode: "live",
        state: "accepted",
        summary: "Accepted by fixture provider",
        evidence: { family: "gmail", messageId: "provider-1" },
      }),
    });
    const proposal = await service.propose("owner", input);
    const result = await service.decide("owner", proposal.id, proposal.hash, "approve");
    assert.equal(result.status, "succeeded");
    assert.equal(result.effectReceipt?.state, "accepted");
    assert.deepEqual(result.effectReceipt?.mode === "live" && result.effectReceipt.evidence, {
      family: "gmail",
      messageId: "provider-1",
    });
    assert.equal((await db.get<ActionProposal>("owner", "actions", proposal.id))?.effectReceipt?.state, "accepted");
  } finally {
    await db.close();
  }
});

test("an untyped or mismatched governed receipt becomes unknown and cannot be retried", async () => {
  for (const receipt of [
    "provider said success",
    {
      mode: "live" as const,
      state: "accepted" as const,
      summary: "wrong family",
      evidence: { family: "drive" as const, fileId: "file", operation: "trash" as const },
    },
  ]) {
    const db = await createStore();
    try {
      let calls = 0;
      const service = new ActionService(db, {
        connected: async () => true,
        requireTypedEffect: true,
        execute: async () => {
          calls++;
          return receipt;
        },
      });
      const proposal = await service.propose("owner", input);
      const result = await service.decide("owner", proposal.id, proposal.hash, "approve");
      assert.equal(result.status, "outcome_unknown");
      await assert.rejects(service.retry("owner", proposal.id));
      assert.equal(calls, 1);
      assert.equal((await db.get("owner", "approval-requests", proposal.id))?.status, "approved");
    } finally {
      await db.close();
    }
  }
});
