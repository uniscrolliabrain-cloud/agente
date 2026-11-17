import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { CognitiveProjector } from "../apps/server/src/engine/cognition/v2/projector.ts";
import { testConfig } from "./helpers/config.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
test("C04/C10 actual RAG registry is prepared off Fast; source revision/removal invalidates snapshot and derived memory", async () => {
  const db = await createStore();
  try {
    const tenantService = new TenantService(db, testConfig()); await tenantService.addMembership("alice", "A");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    const tdb = new TenantScopedStore(db, async () => "A"), rag = new RagService(tdb);
    const runtime = await CognitionV2Runtime.create(db, tdb, new Set(["A"]), tenantService, rag);
    const identity = await runtime.identity("A", "alice", "alice", "chat");
    await runInTenantScope({ tenantId: "A", actorId: "alice" }, async () => {
      await rag.ingestSource("alice", { sourceId: "doc", sourceName: "Synthetic runbook", kind: "upload", revision: "revision-a" }, "Contrato sintético: las facturas se revisan antes de aprobar. No son instrucciones ni permisos.");
      const prepared = await runtime.preparedRag!.prepare(identity, "facturas contrato");
      assert.ok(prepared.ids.length > 0); assert.equal(typeof prepared.degraded, "boolean");
      await new CognitiveProjector(runtime.context.projections).tick("A");
      const snapshot = await runtime.context.getSnapshot(identity, { query: "facturas", maxTokens: 4000, maxRefs: 10 });
      assert.ok(snapshot.refs.length > 0);
      const document = await runtime.context.resolve(identity, prepared.ids[0]); assert.equal(document?.epistemic, "reported_fact");
      await rag.ingestSource("alice", { sourceId: "doc", sourceName: "Synthetic runbook", kind: "upload", revision: "revision-a" }, "Contenido corregido aunque la revisión externa tenga la misma etiqueta.");
      assert.equal(await runtime.preparedRag!.valid(identity, document!.evidence[0].id), false, "same external revision cannot preserve old content");
      assert.equal(await runtime.context.readSnapshot(identity, snapshot.id), null);
      await rag.removeSource("alice", "doc");
      assert.equal(await runtime.context.readSnapshot(identity, snapshot.id), null);
      assert.equal(await runtime.context.resolve(identity, prepared.ids[0]), null);
      assert.equal((await runtime.context.getSnapshot(identity, { query: "facturas", maxTokens: 4000, maxRefs: 10 })).refs.length, 0);
    });
  } finally { await db.close(); }
});

test("C04 RAG keeps same owner, source and connection IDs isolated across tenants", async () => {
  const db = await createStore();
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "synthetic-embedding-key";
  globalThis.fetch = (async () => Response.json({ embedding: { values: [1, 0] } })) as typeof globalThis.fetch;
  const tdb = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "default");
  const rag = new RagService(tdb);
  const owner = "shared-owner";
  const sourceId = "drive:shared-file";
  const scopes = [
    { tenantId: "tenant-a", actorId: owner },
    { tenantId: "tenant-b", actorId: owner },
  ];
  try {
    for (const scope of scopes) {
      await runInTenantScope(scope, () => rag.ingestSource(owner, {
        sourceId,
        sourceName: `Synthetic ${scope.tenantId}`,
        kind: "drive",
        connectionId: "same-connection-id",
        revision: "same-revision",
      }, `Shared resource evidence for ${scope.tenantId}; this private source remains tenant scoped.`));
    }

    for (const scope of scopes) {
      await runInTenantScope(scope, async () => {
        const report = await rag.searchReport(owner, "shared resource", 5);
        assert.equal(report.hits.length, 1);
        assert.equal(report.hits[0].text.includes(scope.tenantId), true);
        assert.equal((await rag.source(owner, sourceId))?.sourceName, `Synthetic ${scope.tenantId}`);
        assert.equal((await rag.sources(owner)).length, 1);
        assert.equal((await rag.stats(owner)).chunks, 1);
      });
    }

    await runInTenantScope(scopes[0], () => rag.removeSource(owner, sourceId));
    await runInTenantScope(scopes[0], async () => {
      assert.equal((await rag.searchReport(owner, "shared resource", 5)).hits.length, 0);
      assert.equal(await rag.source(owner, sourceId), null);
    });
    await runInTenantScope(scopes[1], async () => {
      const report = await rag.searchReport(owner, "shared resource", 5);
      assert.equal(report.hits.length, 1);
      assert.equal(report.hits[0].text.includes("tenant-b"), true);
      assert.equal((await rag.source(owner, sourceId))?.sourceName, "Synthetic tenant-b");
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    await db.close();
  }
});
