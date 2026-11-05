import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { createApp } from "../../../apps/server/src/app.ts";
import { createStore } from "../../../apps/server/src/db.ts";
import { TenantService } from "../../../apps/server/src/engine/tenant.ts";
import type { AgentTask } from "../../../packages/domain/src/agent.ts";
import { testConfig } from "../../helpers/config.ts";

test("authenticated company B delegates a permitted SOP to its specialist and keeps events in B", { timeout: 90000 }, async () => {
  const prefix = join(tmpdir(), "nc-task-http-");
  const dataDir = await mkdtemp(prefix);
  const db = await createStore();
  let server: Awaited<ReturnType<typeof createApp>> | undefined;
  const readers: ReadableStreamDefaultReader<Uint8Array>[] = [];
  try {
    const owner = "commercial-user";
    const tenants = new TenantService(db, testConfig());
    await tenants.setMembership(owner, "company-a");
    await tenants.addMembership(owner, "company-b");
    server = await createApp(db, testConfig({ dataDir, agentBackend: "model" }));
    const { app, auth, agent, bus } = server;
    async function session(tenantId: string) {
      const { token } = await auth.session(undefined, owner);
      const id = createHash("sha256").update(token).digest("hex");
      await db.put("system", "sessions", { id, tenantId, owner, expiresAt: Date.now() + 60000 });
      return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    }
    const headersA = await session("company-a");
    const headersB = await session("company-b");
    const create = (path: string, body: unknown) =>
      app.request(path, { headers: headersB, method: "POST", body: JSON.stringify(body) });
    const storageOwner = `company-b:${owner}`;
    const sop = {
      id: "qualify",
      name: "Qualify lead",
      trigger: { type: "api" },
      allowedTools: ["save_artifact"],
      steps: [{ id: "evidence", title: "Record qualification", tool: "save_artifact", params: { data: { qualified: true } } }],
    };
    const createSop = await create("/api/sops", sop);
    assert.equal(createSop.status, 201, await createSop.clone().text());
    assert.equal(await db.get(owner, "sops", sop.id), null);
    assert.ok(await db.get(storageOwner, "sops", sop.id));
    await db.put(storageOwner, "agent-roles", { id: "sales", name: "Sales specialist", active: true, sops: [sop.id] });
    await db.put(storageOwner, "agent-roles", { id: "disabled", name: "Disabled specialist", active: false, sops: [sop.id] });
    await db.put(storageOwner, "agent-roles", { id: "unrelated", name: "Unrelated specialist", active: true, sops: [] });
    for (const roleId of ["disabled", "unrelated", "absent"]) {
      const invalid = await create("/api/agent/tasks", {
        kind: "sop", roleId, prompt: "Qualify this lead", input: { sopId: sop.id },
      });
      assert.equal(invalid.status, 403, await invalid.clone().text());
    }

    const openStream = async (headers: typeof headersA) => {
      const response = await app.request("/api/events/stream?types=task.created", { headers });
      assert.equal(response.status, 200);
      const reader = response.body!.getReader();
      readers.push(reader);
      const ready = new TextDecoder().decode((await reader.read()).value);
      assert.match(ready, /event: ready/);
      return reader;
    };
    const streamA = await openStream(headersA);
    const streamB = await openStream(headersB);
    const response = await create("/api/sops/qualify/run", { input: { sopId: "cannot-override-route" } });
    assert.equal(response.status, 201, await response.clone().text());
    const submitted = await response.json() as AgentTask;
    assert.deepEqual(submitted.executionContext, { tenantId: "company-b", owner, actorId: owner });
    assert.equal(submitted.state.roleId, "sales");
    assert.equal(submitted.state.sopId, sop.id);
    await bus.emit(owner, "task.created", { kind: "task", id: "company-a-marker" },
      { taskId: "company-a-marker", title: "A marker", kind: "sop" }, { tenantId: "company-a" });
    const eventA = new TextDecoder().decode((await streamA.read()).value);
    const eventB = new TextDecoder().decode((await streamB.read()).value);
    assert.match(eventA, /company-a-marker/);
    assert.doesNotMatch(eventA, /company-b/);
    assert.match(eventB, /"tenantId":"company-b"/);
    assert.ok(eventB.includes(submitted.id));
    await streamA.cancel();
    await streamB.cancel();

    const malformed = await create("/api/sops", {
      ...sop, id: "wrong-tool", steps: [{ ...sop.steps[0], tool: "read_workspace" }],
    });
    assert.equal(malformed.status, 201, await malformed.clone().text());
    await db.put(storageOwner, "agent-roles", { id: "sales", name: "Sales specialist", active: true, sops: [sop.id, "wrong-tool"] });
    const rejectedResponse = await create("/api/sops/wrong-tool/run", {});
    assert.equal(rejectedResponse.status, 201);
    const rejected = await rejectedResponse.json() as AgentTask;

    agent.start();
    async function wait(id: string) {
      for (let index = 0; index < 150; index++) {
        const current = await db.get<AgentTask>(storageOwner, "tasks", id);
        if (current && ["succeeded", "failed"].includes(current.status)) return current;
        await delay(100);
      }
      assert.fail("worker did not settle " + id);
    }
    const completed = await wait(submitted.id);
    assert.equal(completed.status, "succeeded", completed.error ?? undefined);
    assert.equal(completed.plan[0]?.status, "succeeded");
    assert.equal(completed.state.roleId, "sales");
    assert.equal(completed.requestedBy, owner);
    const turns = await db.list<{ personaId?: string; tenantId: string; triggers?: string[] }>("company-b", "cognitive-turns");
    assert.ok(turns.some((turn) => turn.tenantId === "company-b" && turn.personaId === "sales" &&
      turn.triggers?.includes("sop.qualify")), JSON.stringify(turns.map((turn) => Object.keys(turn))));
    assert.equal((await db.list("company-a", "cognitive-turns")).length, 0);
    assert.equal(await db.get(`company-a:${owner}`, "tasks", completed.id), null);
    const blocked = await wait(rejected.id);
    assert.equal(blocked.status, "failed");
    assert.match(blocked.error ?? "", /does not allow tool read_workspace/);
    assert.ok(!blocked.plan.some((step) => step.status === "succeeded"));
    const eventResponse = await app.request("/api/events?type=sop.step_completed", { headers: headersB });
    assert.equal(eventResponse.status, 200);
    const { events } = await eventResponse.json() as { events: Array<{ tenantId: string; payload: Record<string, unknown> }> };
    assert.ok(events.some((event) => event.tenantId === "company-b" && event.payload.taskId === submitted.id &&
      event.payload.actorId === "sales" && event.payload.requestingActorId === owner));
  } finally {
    await Promise.allSettled(readers.map((reader) => reader.cancel()));
    await server?.agent.stop();
    await db.close();
    const target = resolve(dataDir);
    assert.ok(target.startsWith(resolve(prefix)) && target !== resolve(tmpdir()));
    await rm(target, { recursive: true, force: true });
  }
});
