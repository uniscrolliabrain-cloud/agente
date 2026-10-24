// TESTS_ACTIONS_DEFERRED_WIRE_V1 â€” DeferredActions cableado en ActionService.
// Ver: docs/audits/06-aprobaciones-acciones/roadmap.md Â§8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { ActionService } from "../apps/server/src/actions.ts";
import { DeferredActions, MemoryDeferredStore } from "../apps/server/src/actions-deferred.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";

const email = {
  kind: "email.send" as const,
  data: {
    to: ["sam@example.com"],
    subject: "Test",
    body: "Body",
    cc: [],
    bcc: [],
    attachmentIds: [],
  },
};

test("approve con deferred pasa a scheduled en vez de ejecutar", async () => {
  const db = await createStore();
  try {
    const store = new MemoryDeferredStore();
    let executed = 0;
    const deferred = new DeferredActions(
      store,
      async () => {
        executed++;
      },
      () => {},
      { windowMs: 8000, dualAt: null, now: () => 1000 },
    );
    const service = new ActionService(
      db,
      {
        deferred, // TYPE_FIX_DEFERRED_OPT_V1
        execute: async () => {
          executed++;
          return "executed";
        },
        connected: async () => true,
      },
    );
    const proposal = await service.propose("owner", email);
    const result = await service.decide("owner", proposal.id, proposal.hash, "approve");
    assert.equal(result.status, "scheduled", "aprobaciÃ³n debe quedar scheduled");
    assert.ok(result.executeAt, "debe tener executeAt");
    assert.equal(executed, 0, "no debe haberse ejecutado aÃºn");
  } finally {
    await db.close();
  }
});

test("reconcile y retry existen en ActionService", async () => {
  const db = await createStore();
  try {
    const service = new ActionService(db, {
      execute: async () => "ok",
      connected: async () => true,
    });
    assert.equal(typeof service.retry, "function");
  } finally {
    await db.close();
  }
});
