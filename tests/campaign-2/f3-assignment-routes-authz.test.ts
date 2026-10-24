// F3_ASSIGNMENT_ROUTES_AUTHZ_TEST_V1
import { describe, expect, it } from "vitest";
import { assignmentsRoutes } from "../../apps/server/src/engine/assignments/routes.ts";

describe("assignmentsRoutes authz", () => {
  it("acepta kind valido y llama al service", async () => {
    let called = "";
    const fake = { accept: async () => { called = "accept"; return {}; }, reject: async () => ({}), approve: async () => ({}), complete: async () => ({}), escalate: async () => ({}), reassign: async () => ({}), assign: async () => ({}) };
    const app = assignmentsRoutes({ service: fake as never });
    const res = await app.request("/task/t1/accept", { method: "POST" });
    expect(res.status).toBe(200);
    expect(called).toBe("accept");
  });
  it("rechaza kind invalido con 422", async () => {
    const fake = { accept: async () => ({}), reject: async () => ({}), approve: async () => ({}), complete: async () => ({}), escalate: async () => ({}), reassign: async () => ({}), assign: async () => ({}) };
    const app = assignmentsRoutes({ service: fake as never });
    const res = await app.request("/foo/t1/accept", { method: "POST" });
    expect(res.status).toBe(422);
  });
});
