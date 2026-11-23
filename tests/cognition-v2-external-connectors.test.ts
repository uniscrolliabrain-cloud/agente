import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertConnectorGrant, connectorReadiness, externalConnectorStubs, StubExternalConnector,
} from "../apps/server/src/engine/cognition/v2/external-connectors.ts";

const grant = {
  tenantId: "tenant-a", actorId: "alice", policyRevision: "policy-v2",
  operationId: "op-1", grantId: "kernel-receipt-1", expiresAt: "2099-01-01T00:00:00.000Z",
};
const expected = {
  tenantId: "tenant-a", actorId: "alice", policyRevision: "policy-v2", operationId: "op-1",
};

test("C06 external connectors are non-operational stubs and never claim readiness", async () => {
  for (const provider of ["jev", "anam", "elevenlabs"] as const) {
    const port = externalConnectorStubs[provider];
    assert.deepEqual(connectorReadiness(port), { provider, state: "stub", canConnect: false, reason: "STUB_ONLY" });
    await assert.rejects(port.execute({}, grant, new AbortController().signal), new RegExp(`CONNECTOR_STUB_ONLY:${provider}`));
  }
});

test("C06 external grant is tenant/actor/policy/operation fenced", () => {
  assert.doesNotThrow(() => assertConnectorGrant(grant, expected, Date.parse("2026-11-23T00:00:00.000Z")));
  for (const changes of [
    { tenantId: "tenant-b" }, { actorId: "bob" },
    { policyRevision: "old-policy" }, { operationId: "op-2" },
    { grantId: "" }, { expiresAt: "2020-01-01T00:00:00.000Z" },
  ]) {
    assert.throws(() => assertConnectorGrant({ ...grant, ...changes }, expected, Date.parse("2026-11-23T00:00:00.000Z")), /CONNECTOR_GRANT_DENIED/);
  }
});

test("C06 abort prevents stub execution", async () => {
  const abort = new AbortController();
  abort.abort(Error("cancelled"));
  const port = new StubExternalConnector("jev");
  await assert.rejects(port.execute({}, grant, abort.signal), /cancelled/);
});
