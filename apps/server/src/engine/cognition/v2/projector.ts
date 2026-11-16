import { cognitiveRecordSchema, cognitiveEdgeSchema } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { SystemEvent } from "../../events/types.ts";
import { CognitiveProjectionStore, DurableProjector, digest } from "./storage.ts";
import { CardOntologyService } from "../chromatic/card-ontology.ts";
import { RuntimeOutcomeProjector } from "./runtime-outcome.ts";
export class CognitiveProjector {
  readonly runner: DurableProjector;
  constructor(readonly store: CognitiveProjectionStore) { this.runner = new DurableProjector(store.db); }
  async apply(event: SystemEvent, sequence: string): Promise<void> {
    if (event.type === "cognition.v2.record.proposed") {
      const record = cognitiveRecordSchema.parse(event.payload.record);
      if (record.ontology) await new CardOntologyService(this.store.db).assertApproved();
      if (record.tenantId !== event.tenantId || record.visibility.ownerActorId !== event.owner || record.epistemic === "verified_fact" || record.runtimeOutcome) throw Error("INVALID_PROPOSAL_AUTHORITY");
      await this.store.apply(record, sequence);
      for (const evidence of record.evidence) {
        const edge = cognitiveEdgeSchema.parse({ id: digest([record.id, record.revision, evidence]), tenantId: record.tenantId,
          from: { tenantId: record.tenantId, kind: record.kind === "memory" ? "memory" : "card", id: record.id, revision: record.revision },
          to: evidence, relation: "derived_from" });
        await this.store.db.rawQuery(`INSERT INTO cognition_v2_edges(tenant,id,data) VALUES($1,$2,$3::jsonb) ON CONFLICT DO NOTHING`, [record.tenantId, edge.id, JSON.stringify(edge)]);
      }
    } else if (event.type === "cognition.v2.slow.status" && (event.payload.state === "completed" || event.payload.state === "failed" || event.payload.state === "cancelled")) {
      const outcome = await new RuntimeOutcomeProjector(this.store.db).fromSlowReceipt(event);
      await this.store.apply(outcome, sequence);
      if (event.payload.state === "cancelled") return;
      const [job] = await this.store.db.rawQuery<{ data: { identity: { actorId: string; policyRevision: string } } }>(
        `SELECT data FROM cognition_v2_slow_jobs WHERE tenant=$1 AND id=$2 AND actor=$3`, [event.tenantId, event.payload.jobId, event.owner]);
      if (!job) throw Error("SLOW_RECEIPT_NOT_FOUND");
      const record = cognitiveRecordSchema.parse({ schemaVersion: "2.0", id: `hint:${event.id}`, tenantId: event.tenantId,
        revision: 1, kind: "meta_hint", title: event.payload.state === "completed" ? "Análisis guardado" : "Análisis fallido",
        body: JSON.stringify({ jobId: event.payload.jobId, state: event.payload.state, receiptId: event.payload.receiptId }),
        epistemic: "reported_fact", evidence: [{ tenantId: event.tenantId, kind: "event", id: event.id, revision: 1 }],
        sourceEventId: event.id, sourceRevision: 1,
        visibility: { tenantId: event.tenantId, ownerActorId: job.data.identity.actorId, scope: "private", allowedActorIds: [], policyRevision: job.data.identity.policyRevision },
        signals: { relevance: .5, confidence: 0, novelty: 1, urgency: event.payload.state === "failed" ? 1 : .5, contradiction: 0 },
        lifecycle: "active", createdAt: event.emittedAt, expiresAt: new Date(Date.parse(event.emittedAt) + 86400000).toISOString() });
      await this.store.apply(record, sequence);
    } else if (event.type === "cognition.v2.source.revoked") {
      // Publisher is an internal authorized route/worker, not an LLM tool.
      const source = String(event.payload.sourceId);
      await this.store.revoke(event.tenantId, source);
    }
  }
  async tick(tenant: string, limit = 100): Promise<number> {
    const lease = await this.runner.acquire(tenant);
    if (!lease) return 0;
    try { return await this.runner.batch(lease, (e, s) => this.apply(e, s), limit); }
    finally { await this.runner.release(lease); }
  }
}
