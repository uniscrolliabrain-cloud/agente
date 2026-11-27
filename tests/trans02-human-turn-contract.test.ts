import assert from "node:assert/strict";
import { test } from "node:test";
import { cognitiveHumanTurnPayloadSchema } from "../packages/domain/src/cognition-v2.ts";
const payload = {
  schemaVersion: "1.0",
  identity: { tenantId: "a", actorId: "actor", owner: "actor", policyRevision: "policy", purpose: "chat" },
  threadId: "thread",
  runId: "run",
  messageId: "message",
  text: "No ejecutes acciones sin mi aprobación.",
  inputDigest: "a".repeat(64),
};

test("human turn provenance is strict information without operational authority", () => {
  assert.equal(cognitiveHumanTurnPayloadSchema.safeParse(payload).success, true);
  assert.equal(
    cognitiveHumanTurnPayloadSchema.safeParse({ ...payload, approved: true, tools: ["send_email"] }).success,
    false,
  );
  assert.equal(
    cognitiveHumanTurnPayloadSchema.safeParse({ ...payload, identity: { ...payload.identity, owner: "other" } })
      .success,
    false,
  );
  assert.equal(
    cognitiveHumanTurnPayloadSchema.safeParse({ ...payload, identity: { ...payload.identity, purpose: "task" } })
      .success,
    false,
  );
});
