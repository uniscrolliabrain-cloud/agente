import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";
import { CognitiveProjector } from "../apps/server/src/engine/cognition/v2/projector.ts";
import { testConfig } from "./helpers/config.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
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
