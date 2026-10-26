// F3_ASSIGNMENT_ROUTES_AUTHZ_TEST_V1
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Hono } from "hono";
import { AppError } from "../../apps/server/src/errors.ts";
import { assignmentsRoutes } from "../../apps/server/src/engine/assignments/routes.ts";

// El modulo de rutas lanza AppError y el mapeo a status vive en app.ts. Para
// probar el contrato HTTP montamos el sub-app con el mismo mapeo.
function mounted(routes: ReturnType<typeof assignmentsRoutes>) {
  const app = new Hono();
  app.onError((error, c) =>
    error instanceof AppError
      ? c.json({ error: error.message }, (error.status ?? 500) as 422)
      : c.json({ error: "internal" }, 500),
  );
  app.route("/", routes);
  return app;
}

describe("assignmentsRoutes authz", () => {
  it("acepta kind valido y llama al service", async () => {
    let called = "";
    const fake = { accept: async () => { called = "accept"; return {}; }, reject: async () => ({}), approve: async () => ({}), complete: async () => ({}), escalate: async () => ({}), reassign: async () => ({}), assign: async () => ({}) };
    const app = assignmentsRoutes({ service: fake as never });
    const res = await app.request("/task/t1/accept", { method: "POST" });
    assert.equal(res.status, 200);
    assert.equal(called, "accept");
  });
  it("rechaza kind invalido con 422", async () => {
    const fake = { accept: async () => ({}), reject: async () => ({}), approve: async () => ({}), complete: async () => ({}), escalate: async () => ({}), reassign: async () => ({}), assign: async () => ({}) };
    const app = mounted(assignmentsRoutes({ service: fake as never }));
    const res = await app.request("/foo/t1/accept", { method: "POST" });
    assert.equal(res.status, 422);
  });
});
