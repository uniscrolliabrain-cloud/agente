// C04_PREPARED_RAG_V2: reuse the existing registry/retriever off the Fast path.
import type { RagService, RagSourceRecord } from "../../rag.ts";
import type { CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import { cognitiveRecordSchema } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { ContextServingFacade } from "./context.ts";
import { DurableEventSink, digest } from "./storage.ts";
export type PreparedRagPort = Pick<RagService, "source" | "searchReport">;
const sourceVersion = (source: RagSourceRecord) => digest([source.id, source.revision ?? source.indexedAt ?? source.updatedAt, source.status]);
export class PreparedRagContext {
  constructor(readonly context: ContextServingFacade, readonly sink: DurableEventSink, readonly rag: PreparedRagPort) {}
  async valid(identity: CognitiveIdentity, referenceId: string): Promise<boolean> {
    const [ref] = await this.context.projections.db.rawQuery<{ source_id: string; source_version: string }>(
      `SELECT source_id,source_version FROM cognition_v2_rag_refs WHERE tenant=$1 AND id=$2 AND actor=$3`, [identity.tenantId, referenceId, identity.actorId]);
    if (!ref) return false;
    const source = await this.rag.source(identity.owner, ref.source_id);
    return Boolean(source && source.status === "indexed" && sourceVersion(source) === ref.source_version);
  }
  async prepare(identity: CognitiveIdentity, query: string) {
    await this.context.assertAuthorized(identity);
    const result = await this.rag.searchReport(identity.owner, query, 5);
    const ids: string[] = [];
    for (const hit of result.hits) {
      const source = await this.rag.source(identity.owner, hit.sourceId);
      if (!source || source.status !== "indexed" || !hit.verified) continue;
      const version = sourceVersion(source), referenceId = digest([identity.tenantId, identity.actorId, source.id, version]);
      const id = `rag:${digest([referenceId, hit.id, hit.text])}`;
      const record = cognitiveRecordSchema.parse({ schemaVersion: "2.0", id, tenantId: identity.tenantId, revision: 1,
        kind: "memory", memoryKind: "semantic", title: source.sourceName.slice(0, 160), body: hit.text.slice(0, 4000),
        epistemic: "reported_fact", evidence: [{ tenantId: identity.tenantId, kind: "document", id: referenceId, revision: 1 }],
        sourceEventId: referenceId, sourceRevision: 1, visibility: { tenantId: identity.tenantId, ownerActorId: identity.actorId,
          scope: "private", allowedActorIds: [], policyRevision: identity.policyRevision },
        signals: { relevance: Math.min(1, Math.max(0, hit.score)), confidence: 0, novelty: .5, urgency: 0, contradiction: 0 },
        lifecycle: "active", createdAt: source.indexedAt ?? source.updatedAt });
      await this.context.projections.db.transaction(async () => {
        await this.context.assertAuthorized(identity);
        await this.context.projections.db.rawQuery(`INSERT INTO cognition_v2_rag_refs(tenant,id,actor,source_id,source_version) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [identity.tenantId, referenceId, identity.actorId, source.id, version]);
        if (!await this.valid(identity, referenceId)) throw Error("RAG_REVISION_CHANGED");
        await this.sink.write({ id: digest([id, "prepared"]), tenantId: identity.tenantId, owner: identity.actorId,
          schemaVersion: "1.0", type: "cognition.v2.record.proposed", emittedAt: record.createdAt,
          source: { kind: "system", id: "prepared-rag-v2" }, payload: { record } });
      });
      ids.push(id);
    }
    return { ids, degraded: result.degraded, status: result.status, prepared: ids.length };
  }
}
