// C06_C09_C10_CONTEXT_V2: authorized projection reads and durable delivery.
import { randomUUID } from "node:crypto";
import type { CognitiveIdentity, CognitiveRecord } from "../../../../../../packages/domain/src/cognition-v2.ts";
import { cognitiveIdentitySchema, contextRequestV2Schema, deliveryAckV2Schema } from "../../../../../../packages/domain/src/cognition-v2.ts";
import { CognitiveProjectionStore, digest } from "./storage.ts";
export interface CognitivePolicy {
  // Must revalidate current membership/policy, not trust claims from a prompt.
  authorize(identity: CognitiveIdentity, record?: CognitiveRecord): Promise<boolean>;
}
export interface ContextSnapshotV2 {
  schemaVersion: "2.0"; id: string; identity: CognitiveIdentity;
  refs: { id: string; revision: number; sourceEventId: string }[];
  segments: { refId: string; text: string; trust: "untrusted_data"; tokens: number }[];
  watermark: string; usedTokens: number; maxTokens: number; createdAt: string;
  expiresAt: string; digest: string; truncated: boolean;
}
export class ContextServingFacade {
  constructor(readonly projections: CognitiveProjectionStore, readonly policy: CognitivePolicy,
    private readonly clock = () => Date.now(),
    // UTF-8 bytes is an intentionally conservative byte-level upper bound for
    // byte/BPE tokenizers, not a claim of exact provider tokenization.
    private readonly countTokens = (text: string) => Buffer.byteLength(text, "utf8")) {}
  async assertAuthorized(identity: CognitiveIdentity, record?: CognitiveRecord, seen = new Set<string>()): Promise<void> {
    cognitiveIdentitySchema.parse(identity);
    if (record && (record.tenantId !== identity.tenantId || record.visibility.tenantId !== identity.tenantId)) throw Error("DENIED");
    if (!(await this.policy.authorize(identity, record))) throw Error("DENIED");
    if (record) {
      if (seen.has(record.id)) return;
      if (seen.size >= 100) throw Error("EVIDENCE_GRAPH_BUDGET");
      seen.add(record.id);
      const v = record.visibility;
      if (v.policyRevision !== identity.policyRevision ||
        (v.scope === "private" && v.ownerActorId !== identity.actorId) ||
        (v.allowedActorIds.length > 0 && !v.allowedActorIds.includes(identity.actorId))) throw Error("DENIED");
      if (record.lifecycle !== "active" || (record.expiresAt && Date.parse(record.expiresAt) <= this.clock()) ||
        await this.projections.revoked(record.tenantId, record.sourceEventId) || await this.projections.revoked(record.tenantId, record.id)) throw Error("REVOKED");
      for (const evidence of record.evidence) {
        if (await this.projections.revoked(identity.tenantId, evidence.id)) throw Error("EVIDENCE_REVOKED");
        if (evidence.kind === "card" || evidence.kind === "memory") {
          const [parent] = await this.projections.db.rawQuery<{ data: CognitiveRecord }>(`SELECT data FROM cognition_v2_objects WHERE tenant=$1 AND id=$2 ORDER BY revision DESC LIMIT 1`, [identity.tenantId, evidence.id]);
          if (!parent || parent.data.revision !== evidence.revision) throw Error("EVIDENCE_UNAVAILABLE");
          await this.assertAuthorized(identity, parent.data, seen);
        }
      }
    }
  }
  async resolve(identity: CognitiveIdentity, id: string, revision?: number): Promise<CognitiveRecord | null> {
    await this.assertAuthorized(identity);
    // Query the latest revision directly. Never return a superseded historical
    // revision because a caller knows its old ID/revision.
    const [row] = await this.projections.db.rawQuery<{ data: CognitiveRecord }>(
      `SELECT data FROM cognition_v2_objects WHERE tenant=$1 AND id=$2 ORDER BY revision DESC LIMIT 1`, [identity.tenantId, id]);
    if (row?.data.kind === "thought_ref") return null;
    if (!row || (revision !== undefined && row.data.revision !== revision)) return null;
    try { await this.assertAuthorized(identity, row.data); return row.data; } catch { return null; }
  }
  async getSnapshot(identity: CognitiveIdentity, options: { query: string; maxTokens: number; maxRefs: number }): Promise<ContextSnapshotV2> {
    options = contextRequestV2Schema.parse(options);
    await this.assertAuthorized(identity);
    const records = await this.projections.latest(identity.tenantId, Math.min(200, options.maxRefs * 8) + 1, identity.actorId);
    const eligible: CognitiveRecord[] = [];
    for (const r of records) {
      // Internal Thought references are not public reasoning/context.
      if (r.kind === "thought_ref" || r.kind === "entity_ref") continue;
      try { await this.assertAuthorized(identity, r); eligible.push(r); } catch { /* private/expired/denied excluded without metadata */ }
    }
    const words = options.query.toLocaleLowerCase().split(/\W+/u).filter(Boolean);
    const score = (r: CognitiveRecord) =>
      r.signals.relevance * .5 + r.signals.urgency * .3 + r.signals.novelty * .2 +
      words.filter((w) => `${r.title} ${r.body}`.toLocaleLowerCase().includes(w)).length;
    eligible.sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
    const refs: ContextSnapshotV2["refs"] = [], segments: ContextSnapshotV2["segments"] = [];
    let usedTokens = 0;
    for (const r of eligible) {
      if (refs.length >= options.maxRefs) break;
      const text = JSON.stringify({ title: r.title, content: r.body, epistemic: r.epistemic, evidence: r.evidence });
      const tokens = this.countTokens(text);
      if (tokens + usedTokens > options.maxTokens) continue;
      refs.push({ id: r.id, revision: r.revision, sourceEventId: r.sourceEventId });
      segments.push({ refId: r.id, text, trust: "untrusted_data", tokens }); usedTokens += tokens;
    }
    // Every chosen revision is revalidated at the serving boundary.
    for (const ref of refs) {
      if (!await this.resolve(identity, ref.id, ref.revision)) throw Error("CONTEXT_CHANGED_RETRY");
    }
    // Revalidation catches a membership/policy change during preparation.
    await this.assertAuthorized(identity);
    const [counter] = await this.projections.db.rawQuery<{ sequence: string }>(`SELECT sequence FROM cognition_v2_cursors WHERE tenant=$1 AND consumer='cognitive-v2.1'`, [identity.tenantId]);
    const content = { identity, refs, segments, watermark: String(counter?.sequence ?? "0"), usedTokens, maxTokens: options.maxTokens };
    const snapshot: ContextSnapshotV2 = { schemaVersion: "2.0", id: randomUUID(), ...content,
      createdAt: new Date(this.clock()).toISOString(), expiresAt: new Date(this.clock() + 60000).toISOString(),
      digest: digest(content), truncated: records.length > Math.min(200, options.maxRefs * 8) || eligible.length > refs.length };
    await this.projections.db.rawQuery(`INSERT INTO cognition_v2_snapshots(tenant,id,actor,data) VALUES($1,$2,$3,$4::jsonb)`, [identity.tenantId, snapshot.id, identity.actorId, JSON.stringify(snapshot)]);
    return snapshot;
  }
  async prepared(identity: CognitiveIdentity, query: string, maxTokens = 4000, maxRefs = 10): Promise<ContextSnapshotV2> {
    await this.assertAuthorized(identity);
    const candidates = await this.projections.db.rawQuery<{ id: string }>(`SELECT id FROM cognition_v2_snapshots WHERE tenant=$1 AND actor=$2
      AND data->'identity'->>'policyRevision'=$3 AND (data->>'expiresAt')::timestamptz>$4
      ORDER BY data->>'createdAt' DESC LIMIT 5`, [identity.tenantId, identity.actorId, identity.policyRevision, new Date(this.clock()).toISOString()]);
    const [cursor] = await this.projections.db.rawQuery<{ sequence: string }>(`SELECT sequence FROM cognition_v2_cursors WHERE tenant=$1 AND consumer='cognitive-v2.1'`, [identity.tenantId]);
    for (const candidate of candidates) {
      const snapshot = await this.readSnapshot(identity, candidate.id);
      if (snapshot && snapshot.maxTokens <= maxTokens && snapshot.refs.length <= maxRefs && snapshot.watermark === String(cursor?.sequence ?? "0")) return snapshot;
    }
    // Cold start remains bounded SQL only. Slow, embeddings and external RAG
    // never run on this path; prepared sources are refreshed separately.
    return this.getSnapshot(identity, { query, maxTokens, maxRefs });
  }
  async readSnapshot(identity: CognitiveIdentity, id: string): Promise<ContextSnapshotV2 | null> {
    await this.assertAuthorized(identity);
    const [row] = await this.projections.db.rawQuery<{ data: ContextSnapshotV2 }>(`SELECT data FROM cognition_v2_snapshots WHERE tenant=$1 AND id=$2 AND actor=$3`, [identity.tenantId, id, identity.actorId]);
    const s = row?.data;
    if (!s || digest(s.identity) !== digest(identity) || Date.parse(s.expiresAt) <= this.clock()) return null;
    for (const r of s.refs) if (!await this.resolve(identity, r.id, r.revision)) return null;
    return s;
  }
  async getDelta(identity: CognitiveIdentity, baseId: string, nextId: string) {
    const base = await this.readSnapshot(identity, baseId), next = await this.readSnapshot(identity, nextId);
    if (!base || !next) return null;
    return { baseId, nextId, policyRevision: identity.policyRevision, watermark: next.watermark,
      added: next.refs.filter((r) => !base.refs.some((b) => b.id === r.id)),
      changed: next.refs.filter((r) => base.refs.some((b) => b.id === r.id && b.revision !== r.revision)),
      removedIds: base.refs.filter((b) => !next.refs.some((r) => r.id === b.id)).map((r) => r.id) };
  }
}
export class CardDeliveryLedger {
  constructor(readonly context: ContextServingFacade, private readonly clock = () => Date.now()) {}
  async reserve(identity: CognitiveIdentity, snapshotId: string, cardId: string, leaseMs = 30000) {
    if (!Number.isInteger(leaseMs) || leaseMs < 1 || leaseMs > 60000) throw Error("INVALID_DELIVERY_LEASE");
    const db = this.context.projections.db;
    return db.transaction(async () => {
      const snapshot = await this.context.readSnapshot(identity, snapshotId);
      const ref = snapshot?.refs.find((r) => r.id === cardId);
      if (!ref) throw Error("SNAPSHOT_INVALID");
      const card = await this.context.resolve(identity, cardId, ref.revision);
      if (card?.kind !== "card" && card?.kind !== "meta_hint") throw Error("CARD_REQUIRED");
      const id = digest([identity.tenantId, identity.actorId, identity.purpose, snapshotId, cardId, ref.revision]);
      await db.rawQuery(`INSERT INTO cognition_v2_deliveries(tenant,id,actor,card_id,revision,snapshot_id,status)
        VALUES($1,$2,$3,$4,$5,$6,'pending') ON CONFLICT DO NOTHING`, [identity.tenantId, id, identity.actorId, cardId, ref.revision, snapshotId]);
      const [lease] = await db.rawQuery<{ fence: string }>(`UPDATE cognition_v2_deliveries SET status='leased',fence=fence+1,lease_until=$4
        WHERE tenant=$1 AND id=$2 AND actor=$3 AND status<>'acknowledged' AND (lease_until IS NULL OR lease_until<=$5) RETURNING fence`,
        [identity.tenantId, id, identity.actorId, new Date(this.clock() + leaseMs).toISOString(), new Date(this.clock()).toISOString()]);
      return lease ? { id, fence: Number(lease.fence), cardId, revision: ref.revision } : null;
    });
  }
  async rendered(identity: CognitiveIdentity, id: string, fence: number): Promise<boolean> {
    return this.transition(identity, id, fence, "rendered");
  }
  async ack(identity: CognitiveIdentity, id: string, fence: number, receiptId: string): Promise<boolean> {
    deliveryAckV2Schema.parse({ deliveryId: id, fence, receiptId });
    return this.transition(identity, id, fence, "acknowledged", receiptId);
  }
  /** Reconcile expired reservations; recovery never implies delivery or ACK. */
  async recover(identity: CognitiveIdentity, limit = 100): Promise<number> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw Error("INVALID_RECOVERY_LIMIT");
    const db = this.context.projections.db;
    return db.transaction(async () => {
      await this.context.assertAuthorized(identity);
      const now = new Date(this.clock()).toISOString();
      const rows = await db.rawQuery<{ id: string; snapshot_id: string; fence: string; status: string }>(
        `SELECT id,snapshot_id,fence,status FROM cognition_v2_deliveries
         WHERE tenant=$1 AND actor=$2 AND status IN ('leased','rendered') AND lease_until<=$3
         ORDER BY lease_until,id LIMIT $4 FOR UPDATE SKIP LOCKED`, [identity.tenantId, identity.actorId, now, limit]);
      for (const row of rows) {
        const [snapshot] = await db.rawQuery<{ identity: unknown }>(`SELECT data->'identity' AS identity FROM cognition_v2_snapshots WHERE tenant=$1 AND actor=$2 AND id=$3`, [identity.tenantId, identity.actorId, row.snapshot_id]);
        const original = cognitiveIdentitySchema.safeParse(snapshot?.identity);
        const sameScope = original.success && original.data.tenantId === identity.tenantId && original.data.actorId === identity.actorId &&
          original.data.owner === identity.owner && original.data.policyRevision === identity.policyRevision;
        const valid = sameScope && await this.context.readSnapshot(original.data, row.snapshot_id);
        const next = valid ? "pending" : "invalidated";
        const receipt = { deliveryId: row.id, previousFence: String(row.fence), previousState: row.status,
          state: next, reason: valid ? "lease_expired" : "snapshot_unavailable", recoveredAt: now,
          policyRevision: identity.policyRevision };
        await db.rawQuery(`UPDATE cognition_v2_deliveries SET status=$4,fence=fence+1,lease_until=NULL
          WHERE tenant=$1 AND actor=$2 AND id=$3`, [identity.tenantId, identity.actorId, row.id, next]);
        await db.rawQuery(`INSERT INTO cognition_v2_delivery_recoveries(tenant,id,actor,data) VALUES($1,$2,$3,$4::jsonb)`,
          [identity.tenantId, digest([row.id, String(row.fence)]), identity.actorId, JSON.stringify(receipt)]);
      }
      await this.context.assertAuthorized(identity);
      return rows.length;
    });
  }
  private async transition(identity: CognitiveIdentity, id: string, fence: number, state: string, receiptId?: string): Promise<boolean> {
    const db = this.context.projections.db;
    return db.transaction(async () => {
      await this.context.assertAuthorized(identity);
      const [delivery] = await db.rawQuery<{ snapshot_id: string; status: string; receipt_id: string; fence: string }>(`SELECT snapshot_id,status,receipt_id,fence FROM cognition_v2_deliveries WHERE tenant=$1 AND id=$2 AND actor=$3 FOR UPDATE`, [identity.tenantId, id, identity.actorId]);
      if (!delivery || Number(delivery.fence) !== fence) return false;
      if (delivery.status === "acknowledged") return state === "acknowledged" && delivery.receipt_id === receiptId;
      if (!await this.context.readSnapshot(identity, delivery.snapshot_id)) return false;
      const rows = await db.rawQuery(`UPDATE cognition_v2_deliveries SET status=$5,receipt_id=$6 WHERE tenant=$1 AND id=$2 AND actor=$3
        AND fence=$4 AND lease_until>$7 AND status=$8 RETURNING id`,
      [identity.tenantId, id, identity.actorId, fence, state, receiptId ?? null, new Date(this.clock()).toISOString(), state === "rendered" ? "leased" : "rendered"]);
      return rows.length === 1;
    });
  }
}
