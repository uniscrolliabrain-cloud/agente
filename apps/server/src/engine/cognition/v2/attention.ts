import { z } from "zod";
import {
  attentionSignalsSchema,
  cognitiveIdentitySchema,
  epistemicSchema,
  type CognitiveIdentity,
} from "../../../../../../packages/domain/src/cognition-v2.ts";
import { contextScorer, type ContextServingFacade, type ContextSnapshotV2 } from "./context.ts";
import { digest } from "./storage.ts";

const storedViewSchema = z.strictObject({
  identity: cognitiveIdentitySchema,
  algorithmVersion: z.literal("attention-v2.3"),
  contextSnapshotId: z.string().min(1).max(200),
  sourceWatermark: z.string().regex(/^\d+$/),
  selected: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(200),
        revision: z.number().int().positive(),
        signals: attentionSignalsSchema,
        score: z.number().finite(),
        epistemic: epistemicSchema,
      }),
    )
    .max(50),
  expiresAt: z.iso.datetime({ offset: true }),
  // Private replay input, never part of the returned view or telemetry.
  query: z.string().max(4000),
});
/** Global means competition inside this authorized actor, never cross-tenant access. */
export class GlobalAttentionWorkspace {
  constructor(readonly context: ContextServingFacade) {}
  private async derive(identity: CognitiveIdentity, snapshot: ContextSnapshotV2, query: string) {
    const selected = [];
    const score = contextScorer(query);
    for (const ref of snapshot.refs) {
      const r = await this.context.resolve(identity, ref.id, ref.revision);
      if (!r || r.sourceEventId !== ref.sourceEventId) throw Error("ATTENTION_SOURCE_CHANGED");
      // Confidence never changes epistemia; both are read from the authorized source.
      selected.push({ id: r.id, revision: r.revision, signals: r.signals, score: score(r), epistemic: r.epistemic });
    }
    return selected;
  }
  async select(identity: CognitiveIdentity, query: string, maxTokens: number) {
    const boundIdentity = cognitiveIdentitySchema.parse(identity);
    const snapshot = await this.context.getSnapshot(boundIdentity, { query, maxTokens, maxRefs: 50 });
    const selected = await this.derive(boundIdentity, snapshot, query);
    const data = {
      identity: boundIdentity,
      algorithmVersion: "attention-v2.3" as const,
      contextSnapshotId: snapshot.id,
      sourceWatermark: snapshot.watermark,
      selected,
      expiresAt: snapshot.expiresAt,
    };
    const stored = storedViewSchema.parse({ ...data, query });
    if (!(await this.context.readSnapshot(boundIdentity, snapshot.id))) throw Error("ATTENTION_SOURCE_CHANGED");
    const id = digest({
      identity: boundIdentity,
      algorithmVersion: data.algorithmVersion,
      contextDigest: snapshot.digest,
      selected,
    });
    await this.context.projections.db.rawQuery(
      `INSERT INTO cognition_v2_attention(tenant,id,actor,data) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT(tenant,id) DO UPDATE SET data=$4::jsonb`,
      [boundIdentity.tenantId, id, boundIdentity.actorId, JSON.stringify(stored)],
    );
    return { id, ...data };
  }
  async read(identity: CognitiveIdentity, id: string) {
    const boundIdentity = cognitiveIdentitySchema.parse(identity);
    await this.context.assertAuthorized(boundIdentity);
    const [row] = await this.context.projections.db.rawQuery<{ data: unknown }>(
      `SELECT data FROM cognition_v2_attention WHERE tenant=$1 AND id=$2 AND actor=$3`,
      [boundIdentity.tenantId, id, boundIdentity.actorId],
    );
    const parsed = storedViewSchema.safeParse(row?.data);
    if (!parsed.success) return null;
    const { query, ...data } = parsed.data;
    if (digest(data.identity) !== digest(boundIdentity)) return null;
    const snapshot = await this.context.readSnapshot(boundIdentity, data.contextSnapshotId);
    if (
      !snapshot ||
      snapshot.queryDigest !== digest(query) ||
      snapshot.watermark !== data.sourceWatermark ||
      snapshot.expiresAt !== data.expiresAt
    )
      return null;
    const selected = await this.derive(boundIdentity, snapshot, query);
    if (
      digest(selected) !== digest(data.selected) ||
      id !==
        digest({
          identity: boundIdentity,
          algorithmVersion: data.algorithmVersion,
          contextDigest: snapshot.digest,
          selected,
        })
    )
      return null;
    if (!(await this.context.readSnapshot(boundIdentity, snapshot.id))) return null;
    return { ...data, selected };
  }
}
