import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";
import { test } from "node:test";
import { ActionService } from "../../../../apps/server/src/actions.ts";
import { createStore } from "../../../../apps/server/src/db.ts";
import { runInTenantScope } from "../../../../apps/server/src/tenant-scope.ts";

test("the approval projection retains the tenant and decision actor on completion", async () => {
  const db = await createStore();
  try {
    const owner = "fixture-owner";
    const tenantId = "fixture-tenant";
    const actorId = "fixture-approver";
    let proposalId = "";
    const observed: { approval?: Record<string, unknown> | null } = {};
    await runInTenantScope({ tenantId, actorId }, async () => {
      const service = new ActionService(db, {
        connected: async () => true,
        execute: async () => {
          observed.approval = await db.get(owner, "approval-requests", proposalId);
          return "fixture-result";
        },
      });
      const proposal = await service.propose(owner, {
        kind: "email.send",
        data: {
          to: ["fixture@example.invalid"], subject: "Fixture", body: "Fixture",
          cc: [], bcc: [], attachmentIds: [],
        },
      });
      proposalId = proposal.id;
      const finished = await service.decide(owner, proposal.id, proposal.hash, "approve", actorId);
      assert.equal(finished.status, "succeeded");
      assert.deepEqual(
        [observed.approval?.tenantId, observed.approval?.decidedBy],
        [tenantId, actorId],
      );
      for (let attempt = 0; attempt < 50; attempt++) {
        const approval = await db.get(owner, "approval-requests", proposalId);
        if (approval?.result === "fixture-result") {
          assert.equal(approval.tenantId, tenantId);
          assert.equal(approval.decidedBy, actorId);
          return;
        }
        await setTimeout(20);
      }
      assert.fail("The final approval projection was not persisted");
    });
  } finally {
    await db.close();
  }
});
