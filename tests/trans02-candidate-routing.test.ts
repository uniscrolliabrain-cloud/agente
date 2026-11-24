import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import { createApp } from "../apps/server/src/app.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { testConfig } from "./helpers/config.ts";

for (const backend of ["sample", "agui"] as const) {
  test(`CopilotKit preserves ${backend === "sample" ? "sample V1 for opt-out" : "explicit AG-UI routing"}`, async () => {
    const previous = process.env.COGNITION_V2_TENANTS;
    const previousFetch = globalThis.fetch;
    process.env.COGNITION_V2_TENANTS = backend === "sample" ? "another-tenant" : "tenant-a";
    const endpoint = "https://synthetic-agui.invalid/run";
    let remote = 0;
    globalThis.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      assert.equal(url, endpoint, "only the synthetic transport may be called");
      remote++;
      const req = JSON.parse(String(init?.body));
      const events = [
        { type: "RUN_STARTED", threadId: req.threadId, runId: req.runId },
        { type: "TEXT_MESSAGE_START", messageId: "m", role: "assistant" },
        { type: "TEXT_MESSAGE_CONTENT", messageId: "m", delta: "synthetic remote" },
        { type: "TEXT_MESSAGE_END", messageId: "m" },
        { type: "RUN_FINISHED", threadId: req.threadId, runId: req.runId },
      ];
      return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(""), { headers: { "Content-Type": "text/event-stream" } });
    };
    const db = await createStore();
    const dataDir = await mkdtemp(join(tmpdir(), "trans02-route-"));
    let server: Awaited<ReturnType<typeof createApp>> | undefined;
    try {
      const config = testConfig({ dataDir, agentBackend: backend, ...(backend === "agui" ? { agentUrl: endpoint } : {}) });
      server = await createApp(db, config);
      const user = await server.users.create({ email: "routing@synthetic.local", password: "synthetic-long-password", name: "Routing", role: "admin" });
      const memberships = new TenantService(db, config);
      await memberships.setMembership(user.id, "tenant-a");
      await memberships.addMembership(user.id, "tenant-a");
      const login = await server.app.request("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email, password: "synthetic-long-password" }) });
      assert.equal(login.status, 200);
      const headers = { Authorization: `Bearer ${(await login.json()).token}`, "Content-Type": "application/json" };
      server.agent.cognitionV2!.provider.stream = async () => { throw Error("UNEXPECTED_COGNITION_ROUTE"); };
      const create = await server.app.request("/api/threads", { method: "POST", headers, body: "{}" });
      assert.equal(create.status, 201);
      const response = await server.app.request("/api/copilotkit/run", { method: "POST", headers: { ...headers, Accept: "text/event-stream" },
        body: JSON.stringify({ threadId: (await create.json()).id, runId: "r", persistTurn: true, messages: [{ id: "m1", role: "user", content: "Hola" }], state: {}, context: [], tools: [], forwardedProps: {} }) });
      assert.equal(response.status, 200);
      const stream = await response.text();
      assert.doesNotMatch(stream, /RUN_ERROR/);
      assert.match(stream, /RUN_FINISHED/);
      assert.equal(remote, backend === "agui" ? 1 : 0);
      assert.equal((await db.rawQuery("SELECT id FROM cognition_v2_chat_runs WHERE tenant=$1", ["tenant-a"])).length, 0);
    } finally {
      await server?.agent.stop();
      await db.close();
      await rm(dataDir, { recursive: true, force: true });
      globalThis.fetch = previousFetch;
      if (previous === undefined) delete process.env.COGNITION_V2_TENANTS; else process.env.COGNITION_V2_TENANTS = previous;
    }
  });
}
