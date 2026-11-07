import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import type { Store } from "../apps/server/src/db.ts";
import { PersonaRegistry } from "../apps/server/src/engine/agents/personas/registry.ts";
import { personasRoutes } from "../apps/server/src/engine/agents/personas/routes.ts";

test("Laia automation launch requires a session and denies foreign automations", async () => {
  const db = {
    async get(owner: string, kind: string, id: string) {
      return owner === "tenant-a:alice" && kind === "sops" && id === "automation-a" ? { id } : null;
    },
  } as Store;
  const registry = new PersonaRegistry();
  registry.has = (tenant, persona) => tenant === "tenant-a" && persona === "laia";
  const route = personasRoutes({ db, registry });
  const request = () => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threadId: "thread-1" }),
  });
  const url = "/laia/automations/automation-a/chat";
  assert.equal((await route.request(url, request())).status, 401);

  const app = new Hono<{ Variables: { owner: string; ctx: { tenantId: string } } }>();
  app.use("*", async (c, next) => {
    c.set("owner", "alice");
    c.set("ctx", { tenantId: c.req.header("test-tenant") ?? "tenant-b" });
    await next();
  });
  app.route("/", route);
  assert.equal((await app.request(url, request())).status, 403);

  const init = request();
  const allowed = await app.request(url, { ...init, headers: { ...init.headers, "test-tenant": "tenant-a" } });
  assert.equal(allowed.status, 200);
  assert.deepEqual(await allowed.json(), { automationId: "automation-a", threadId: "thread-1", personaId: "laia" });
});
