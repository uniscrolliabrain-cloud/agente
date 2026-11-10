import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { ALL_WORKSPACES } from "../packages/workspaces/src/index.ts";
import { WorkspaceModuleRegistry } from "../apps/server/src/engine/workspaces/registry.ts";
import { WorkspaceDispatcher } from "../apps/server/src/engine/workspaces/dispatcher.ts";
import { viewsRoutes } from "../apps/server/src/routes/views.ts";

const store = {
  get: async () => null,
  put: async <T extends { id: string }>(_owner: string, _kind: string, value: T) => value,
  list: async () => [],
  insertIfAbsent: async () => null,
  remove: async () => {},
};

test("POST /api/views/resolve returns a workspace envelope", async () => {
  const hubspot = ALL_WORKSPACES.find((workspace) => workspace.manifest.id === "hubspot");
  assert.ok(hubspot);
  const registry = new WorkspaceModuleRegistry();
  registry.register(hubspot);
  const dispatcher = new WorkspaceDispatcher({ db: store as never });
  const app = new Hono<{ Variables: { owner: string; ctx: { tenantId: string } } }>();
  app.use("*", async (c, next) => {
    c.set("owner", "owner-1");
    c.set("ctx", { tenantId: "tenant-1" });
    await next();
  });
  app.route("/api/views", viewsRoutes(registry, dispatcher));

  const response = await app.request("/api/views/resolve", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workspaceId: "hubspot" }),
  });
  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    view: { spec: { kind: string }; tenantId: string; source: { workspaceId?: string } };
  };
  assert.equal(body.view.tenantId, "tenant-1");
  assert.equal(body.view.source.workspaceId, "hubspot");
  assert.equal(body.view.spec.kind, "table");
});
