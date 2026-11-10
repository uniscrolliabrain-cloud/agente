import assert from "node:assert/strict";
import { test } from "node:test";
import { parseViewEnvelope } from "../packages/domain/src/view-envelope.ts";

test("view envelope accepts a valid runtime spec and defaults", () => {
  const generatedAt = new Date().toISOString();
  const view = parseViewEnvelope({
    id: "workspace:leads",
    tenantId: "tenant-1",
    workspaceId: "hubspot",
    spec: { kind: "dashboard", title: "Leads", kpis: [] },
    freshness: { generatedAt },
    permissions: { canView: true },
    source: { provider: "workspace", workspaceId: "hubspot" },
    generatedAt,
  });
  assert.ok(view);
  assert.equal(view.spec.kind, "dashboard");
  assert.equal(view.permissions.canView, true);
  assert.deepEqual(view.permissions.canAct, []);
  assert.deepEqual(view.provenance, []);
});

test("view envelope rejects an invalid runtime spec", () => {
  const generatedAt = new Date().toISOString();
  const view = parseViewEnvelope({
    id: "broken",
    tenantId: "tenant-1",
    spec: { kind: "dashboard", title: "Broken" },
    freshness: { generatedAt },
    permissions: { canView: true },
    source: { provider: "legacy" },
    generatedAt,
  });
  assert.equal(view, null);
});
