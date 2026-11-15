import { cognitiveRecordSchema, cognitiveEdgeSchema } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { SystemEvent } from "../../events/types.ts";
import { CognitiveProjectionStore, DurableProjector, digest } from "./storage.ts";
export class CognitiveProjector {
  readonly runner: DurableProjector;
  constructor(readonly store: CognitiveProjectionStore) { this.runner = new DurableProjector(store.db); }
  async apply(event: SystemEvent, sequence: string): Promise<void> {
    if (event.type === "cognition.v2.record.proposed") {
      const record = cognitiveRecordSchema.parse(event.payload.record);
      if (record.tenantId !== event.tenantId || record.visibility.ownerActorId !== event.owner || record.epistemic === "verified_fact") throw Error("INVALID_PROPOSAL_AUTHORITY");
      await this.store.apply(record, sequence);
      for (const evidence of record.evidence) {
        const edge = cognitiveEdgeSchema.parse({ id: digest([record.id, record.revision, evidence]), tenantId: record.tenantId,
          from: { tenantId: record.tenantId, kind: record.kind === "memory" ? "memory" : "card", id: record.id, revision: record.revision },
          to: evidence, relation: "derived_from" });
        await this.store.db.rawQuery(`INSERT INTO cognition_v2_edges(tenant,id,data) VALUES($1,$2,$3::jsonb) ON CONFLICT DO NOTHING`, [record.tenantId, edge.id, JSON.stringify(edge)]);
      }
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
