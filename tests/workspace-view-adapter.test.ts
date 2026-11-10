import assert from "node:assert/strict";
import { test } from "node:test";
import type { QueryResult } from "../packages/workspaces/src/contracts/workspace-query.ts";
import type { WorkspaceViewDeclaration } from "../packages/workspaces/src/contracts/workspace-view.ts";
import { adaptWorkspaceView } from "../apps/server/src/engine/views/workspace-adapter.ts";

const now = new Date("2026-01-01T00:00:00.000Z");

test("adapter builds a table from query rows", () => {
  const declaration: WorkspaceViewDeclaration = {
    id: "leads",
    intent: "leads",
    kind: "table",
    title: "Leads",
    query: "crm.list_segments",
    actions: [],
  };
  const result: QueryResult<unknown> = {
    status: "ok",
    items: [{ id: "1", name: "Acme", status: "open" }],
    total: 1,
  };
  const view = adaptWorkspaceView({
    tenantId: "tenant-1",
    workspaceId: "hubspot",
    declaration,
    result,
    now,
  });
  assert.ok(view);
  if (view.spec.kind !== "table") assert.fail("expected table");
  assert.equal(view.spec.rows.length, 1);
  assert.ok(view.spec.columns.some((column) => column.key === "name"));
  assert.equal(view.source.workspaceId, "hubspot");
  assert.equal(view.freshness.stale, false);
});

test("adapter maps queue statuses and keeps empty results empty", () => {
  const declaration: WorkspaceViewDeclaration = {
    id: "pending",
    intent: "pending",
    kind: "queue",
    title: "Pendientes",
    query: "tasks.list",
    actions: [],
  };
  const result: QueryResult<unknown> = {
    status: "ok",
    items: [{ id: "1", title: "Revisar", status: "running" }],
    total: 1,
  };
  const view = adaptWorkspaceView({
    tenantId: "tenant-1",
    workspaceId: "linear",
    declaration,
    result,
    now,
  });
  assert.ok(view);
  if (view.spec.kind !== "queue") assert.fail("expected queue");
  assert.equal(view.spec.items[0]?.status, "running");

  const empty = adaptWorkspaceView({
    tenantId: "tenant-1",
    workspaceId: "linear",
    declaration,
    result: { status: "empty", items: [], total: 0 },
    now,
  });
  assert.ok(empty);
  if (empty.spec.kind !== "queue") assert.fail("expected queue");
  assert.deepEqual(empty.spec.items, []);
});
