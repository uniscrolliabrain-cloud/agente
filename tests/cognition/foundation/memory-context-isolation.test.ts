import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { createApp } from "../../../apps/server/src/app.ts";
import { createStore } from "../../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../../apps/server/src/db-tenant.ts";
import type { MemoryService } from "../../../apps/server/src/engine/memory.ts";
import { RagService } from "../../../apps/server/src/engine/rag.ts";
import { currentTenantScope, runInTenantScope } from "../../../apps/server/src/tenant-scope.ts";
import { testConfig } from "../../helpers/config.ts";

test("createApp shares scoped memory with context and graph; raw legacy remains inaccessible", { timeout: 90000 }, async () => {
  const db = await createStore();
  const prefix = join(tmpdir(), "nc-memory-context-");
  const dataDir = await mkdtemp(prefix);
  const server = await createApp(db, testConfig({ dataDir }));
  const originalFetch = globalThis.fetch;
  const embeddingKey = process.env.EMBEDDINGS_LLM_API_KEY;
  const fastKey = process.env.FAST_LLM_API_KEY;
  process.env.EMBEDDINGS_LLM_API_KEY = "";
  process.env.FAST_LLM_API_KEY = "";
  let networkCalls = 0;
  globalThis.fetch = (async () => { networkCalls++; throw new Error("No provider allowed in this test"); }) as typeof fetch;
  try {
    await server.agent.stop();
    const owner = "same-user";
    const role = { id: "role", name: "RAW-LEGACY-SECRET", tone: "concise", avatar: "sky", objetivo: "needle", sops: [], active: true, memories: [] };
    await db.put(owner, "agent-roles", role);
    await db.put(owner, "memories", { id: "legacy", text: "needle RAW-LEGACY-SECRET", source: "legacy", createdAt: new Date().toISOString() });
    await db.put(owner, "learning-facts", { id: "legacy", text: "needle RAW-LEGACY-SECRET", source: "legacy", confidence: 1 });
    let recalls = 0;
    const recall = server.agent.memory.recall.bind(server.agent.memory);
    server.agent.memory.recall = async (...args: Parameters<MemoryService["recall"]>) => {
      recalls++;
      assert.equal(args[2]?.roleId, "role", "context must pass the selected role to recall");
      return recall(...args);
    };
    for (const tenantId of ["tenant-a", "tenant-b"]) {
      await runInTenantScope({ tenantId, actorId: "requester" }, async () => {
        await server.agent.db.put(owner, "agent-roles", { ...role, name: tenantId });
        await server.agent.memory.remember(owner, `needle memory ${tenantId}`);
        await server.agent.db.put(owner, "memories", { id: "other-role", text: "needle OTHER-ROLE-SECRET", roleId: "other-role", source: "other", createdAt: new Date().toISOString() });
        await server.agent.db.put(owner, "learning-facts", { id: "fact", text: `needle learning ${tenantId}`, source: "test", confidence: 1 });
        await server.agent.graph!.createEntity(owner, { id: "entity", name: tenantId, type: "test", actor: "requester", source: "test" });
      });
    }
    for (const tenantId of ["tenant-a", "tenant-b"]) {
      await runInTenantScope({ tenantId, actorId: "requester" }, async () => {
        const pkg = await server.agent.context!.assemble(owner, { roleId: "role", query: "needle", entityId: "entity" });
        assert.equal(pkg.role.name, tenantId);
        assert.equal(pkg.entity?.name, tenantId);
        assert.ok(pkg.recall.memories.some(m => m.text === `needle memory ${tenantId}`));
        assert.ok(pkg.learning.some(f => f.text === `needle learning ${tenantId}`));
        const serialized = JSON.stringify(pkg);
        assert.doesNotMatch(serialized, /RAW-LEGACY-SECRET|OTHER-ROLE-SECRET/);
        assert.ok(!serialized.includes(tenantId === "tenant-a" ? "tenant-b" : "tenant-a"));
      });
    }
    assert.equal(recalls, 2, "AgentService and ContextEngine must share the same memory instance");
    assert.equal((await db.get<{ name: string }>(owner, "agent-roles", "role"))?.name, "RAW-LEGACY-SECRET", "legacy data is preserved, not migrated");
    assert.equal(networkCalls, 0, "missing tenant embedding config must not invoke global providers");
  } finally {
    globalThis.fetch = originalFetch;
    if (embeddingKey === undefined) delete process.env.EMBEDDINGS_LLM_API_KEY;
    else process.env.EMBEDDINGS_LLM_API_KEY = embeddingKey;
    if (fastKey === undefined) delete process.env.FAST_LLM_API_KEY;
    else process.env.FAST_LLM_API_KEY = fastKey;
    await server.agent.stop();
    await db.close();
    const target = resolve(dataDir);
    assert.ok(target.startsWith(resolve(prefix)) && target !== resolve(tmpdir()));
    await rm(target, { recursive: true, force: true });
  }
});

test("RAG resolves the active tenant and refuses missing/failed credentials without global fallback", { timeout: 60000 }, async () => {
  const db = await createStore();
  const scoped = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "primary-a");
  const originalFetch = globalThis.fetch;
  const previousGlobal = process.env.GOOGLE_API_KEY;
  const calls: string[] = [];
  const resolved: string[] = [];
  process.env.GOOGLE_API_KEY = "forbidden-global-test-key";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response(JSON.stringify({ embedding: { values: [1, 0] } }), { status: 200 });
  }) as typeof fetch;
  try {
    const tenantService = { tenantIdFor: async () => { throw new Error("membership must not determine active tenant"); } };
    const rag = new RagService(scoped, tenantService, { resolve: async tenantId => {
      resolved.push(tenantId);
      return { tenantId, embeddings: { apiKey: "tenant-b-test-key" } };
    } });
    await runInTenantScope({ tenantId: "tenant-b", actorId: "requester" }, () => rag.search("same-user", "needle"));
    assert.deepEqual(resolved, ["tenant-b"]);
    assert.equal(calls.length, 1);
    assert.match(calls[0], /key=tenant-b-test-key/);
    assert.doesNotMatch(calls[0], /forbidden-global/);
    const missing = new RagService(scoped, tenantService, { resolve: async () => ({ embeddings: {} }) });
    const broken = new RagService(scoped, tenantService, { resolve: async () => { throw new Error("resolver unavailable"); } });
    await runInTenantScope({ tenantId: "tenant-b", actorId: "requester" }, async () => {
      assert.deepEqual(await missing.search("same-user", "needle"), []);
      await assert.rejects(broken.search("same-user", "needle"), /resolver unavailable/);
      assert.deepEqual(await new RagService(scoped).search("same-user", "needle"), []);
    });
    await assert.rejects(rag.search("same-user", "needle"), /authorized tenant scope/);
    assert.equal(calls.length, 1, "failed tenant config cannot use the global key");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousGlobal === undefined) delete process.env.GOOGLE_API_KEY;
    else process.env.GOOGLE_API_KEY = previousGlobal;
    await db.close();
  }
});
