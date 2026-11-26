import type { CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import { contextScorer, type ContextServingFacade } from "./context.ts";
import { digest } from "./storage.ts";
/** Global means competition inside this authorized actor, never cross-tenant access. */
export class GlobalAttentionWorkspace {
  constructor(readonly context: ContextServingFacade) {}
  async select(identity: CognitiveIdentity, query: string, maxTokens: number) {
    const snapshot = await this.context.getSnapshot(identity, { query, maxTokens, maxRefs: 50 });
    const selected = [];
    const score = contextScorer(query);
    for (const ref of snapshot.refs) {
      const r = await this.context.resolve(identity, ref.id, ref.revision);
      if (!r) throw Error("ATTENTION_SOURCE_CHANGED");
      // All dimensions are kept separate. Confidence never changes epistemia.
      selected.push({ id: r.id, revision: r.revision, signals: r.signals, score: score(r), epistemic: r.epistemic });
    }
    const data = { identity, algorithmVersion: "attention-v2.2", contextSnapshotId: snapshot.id,
      sourceWatermark: snapshot.watermark, selected, expiresAt: snapshot.expiresAt };
    const id = digest({ identity, algorithmVersion: data.algorithmVersion, contextDigest: snapshot.digest, selected });
    await this.context.projections.db.rawQuery(`INSERT INTO cognition_v2_attention(tenant,id,actor,data) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT(tenant,id) DO UPDATE SET data=$4::jsonb`, [identity.tenantId, id, identity.actorId, JSON.stringify(data)]);
    return { id, ...data };
  }
  async read(identity: CognitiveIdentity, id: string) {
    await this.context.assertAuthorized(identity);
    const [row] = await this.context.projections.db.rawQuery<{ data: { contextSnapshotId: string; identity: CognitiveIdentity } }>(`SELECT data FROM cognition_v2_attention WHERE tenant=$1 AND id=$2 AND actor=$3`, [identity.tenantId, id, identity.actorId]);
    if (!row || digest(row.data.identity) !== digest(identity) || !await this.context.readSnapshot(identity, row.data.contextSnapshotId)) return null;
    return row.data;
  }
}
