import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { kernelRoutes } from "../apps/server/src/kernel-routes.ts";
import type { Kernel } from "../apps/server/src/kernel/index.ts";
import type { UserService } from "../apps/server/src/users.ts";
import { globalMetrics } from "../apps/server/src/metrics/registry.ts";

function appFor(kernel: Partial<Kernel>, role = "admin") {
  const app = new Hono<{ Variables: { owner: string; ctx: { tenantId: string; actorId: string; owner: string } } }>();
  app.use("*", async (c, next) => {
    c.set("owner", "owner");
    c.set("ctx", { tenantId: "selected-tenant", actorId: "verified-actor", owner: "owner" });
    await next();
  });
  const users = { getById: async () => ({ id: "owner", role }) } as unknown as UserService;
  app.route("/kernel", kernelRoutes(kernel as Kernel, users));
  app.onError((_error, c) => c.text("denied", 500));
  return app;
}

test("kernel route binds authenticated actor and selected tenant instead of resolving a primary tenant", async () => {
  let observed: unknown;
  const app = appFor({
    listTurns: async (ctx) => {
      observed = ctx;
      return [];
    },
  });
  const response = await app.request("/kernel/turns");
  assert.equal(response.status, 200);
  assert.deepEqual(observed, {
    tenantId: "selected-tenant",
    actorId: "verified-actor",
    owner: "owner",
    role: "admin",
    requestId: (observed as { requestId: string }).requestId,
  });
});

test("kernel read context keeps a user's actual role", async () => {
  let observed: unknown;
  const app = appFor(
    {
      thoughtsOf: async (ctx) => {
        observed = ctx;
        return [];
      },
    },
    "user",
  );
  assert.equal((await app.request("/kernel/turns/turn-id")).status, 200);
  assert.equal((observed as { role: string }).role, "user");
});

test("metrics summary distinguishes missing measurements and overflow within the selected tenant", async () => {
  const app = appFor({});
  globalMetrics.observe("agente_http_request_duration_ms", 1, { tenant: "primary-tenant" });
  const empty = (await (await app.request("/kernel/metrics-summary")).json()) as {
    httpLatencyP99Ms: unknown;
    httpLatencyP99State: string;
  };
  assert.equal(empty.httpLatencyP99Ms, null);
  assert.equal(empty.httpLatencyP99State, "no_data");
  globalMetrics.observe("agente_http_request_duration_ms", 6000, { tenant: "selected-tenant" });
  const overflow = (await (await app.request("/kernel/metrics-summary")).json()) as {
    httpLatencyP99Ms: unknown;
    httpLatencyP99State: string;
  };
  assert.equal(overflow.httpLatencyP99Ms, "+Inf");
  assert.equal(overflow.httpLatencyP99State, "overflow");
});
