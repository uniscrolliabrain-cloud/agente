// C04_FIVE_MEMORIES_V2: all kinds reuse the revisioned projection store and
// authoritative source bus. Memory content never becomes executable SOP code.
import { randomUUID } from "node:crypto";
import type { CognitiveIdentity, CognitiveRecord } from "../../../../../../packages/domain/src/cognition-v2.ts";
import { cognitiveRecordSchema } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { ContextServingFacade } from "./context.ts";
import { DurableEventSink, digest } from "./storage.ts";
import type { SystemEvent } from "../../events/types.ts";
export class FiveMemories {
  constructor(readonly context: ContextServingFacade, readonly sink: DurableEventSink, private readonly clock = () => Date.now()) {}
  private async propose(identity: CognitiveIdentity, memoryKind: NonNullable<CognitiveRecord["memoryKind"]>,
    id: string, body: string, evidence: CognitiveRecord["evidence"], createdAt: string, expiresAt?: string, epistemic: CognitiveRecord["epistemic"] = "reported_fact") {
    await this.context.assertAuthorized(identity);
    if (evidence.some((ref) => ref.tenantId !== identity.tenantId)) throw Error("EVIDENCE_TENANT_MISMATCH");
    const record = cognitiveRecordSchema.parse({ schemaVersion: "2.0", id, tenantId: identity.tenantId, revision: 1,
      kind: "memory", memoryKind, title: `${memoryKind} memory`, body, epistemic, evidence,
      sourceEventId: evidence[0].id, sourceRevision: evidence[0].revision,
      visibility: { tenantId: identity.tenantId, ownerActorId: identity.actorId, scope: "private", allowedActorIds: [], policyRevision: identity.policyRevision },
      signals: { relevance: .5, confidence: 0, novelty: .5, urgency: 0, contradiction: 0 }, lifecycle: "active", createdAt, ...(expiresAt ? { expiresAt } : {}) });
    const event: SystemEvent = { id: memoryKind === "working" ? id : digest([identity.tenantId, id]), schemaVersion: "1.0", tenantId: identity.tenantId,
      owner: identity.actorId, type: "cognition.v2.record.proposed", emittedAt: createdAt,
      source: { kind: "system", id: "five-memories-v2" }, payload: { record } };
    await this.sink.write(event); return { id, receiptId: event.id };
  }
  async fromEvent(identity: CognitiveIdentity, eventId: string, kind: "episodic" | "procedural") {
    await this.context.assertAuthorized(identity);
    const [source] = await this.context.projections.db.rawQuery<{ event: SystemEvent }>(`SELECT event FROM cognition_v2_events
      WHERE tenant=$1 AND event_id=$2 AND event->>'owner'=$3`, [identity.tenantId, eventId, identity.actorId]);
    if (!source || (kind === "procedural" && source.event.type !== "sop.step_completed")) throw Error("SOURCE_NOT_A_RUNTIME_RECEIPT");
    const event = source.event;
    const body = JSON.stringify({ eventType: event.type, at: event.emittedAt, source: event.source,
      ...(kind === "procedural" ? { sopId: event.payload.sopId, stepId: event.payload.stepId } : {}) });
    return this.propose(identity, kind, digest([eventId, kind]), body,
      [{ tenantId: identity.tenantId, kind: "event", id: eventId, revision: 1 }], event.emittedAt);
  }
  async semanticFromCard(identity: CognitiveIdentity, id: string) {
    const source = await this.context.resolve(identity, id);
    if (source?.kind !== "card") throw Error("CARD_REQUIRED");
    // A derived summary retains attribution, not an inherited verification
    // certificate. Hypotheses remain hypotheses; verified source status stays
    // in the quoted metadata and the authorized parent reference.
    return this.propose(identity, "semantic", digest([id, source.revision, "semantic"]),
      JSON.stringify({ text: source.body, epistemic: source.epistemic }),
      [{ tenantId: identity.tenantId, kind: "card", id, revision: source.revision }], source.createdAt, undefined,
      source.epistemic === "verified_fact" ? "reported_fact" : source.epistemic);
  }
  async autobiographical(identity: CognitiveIdentity, episodeIds: string[]) {
    if (!episodeIds.length || episodeIds.length > 20) throw Error("EPISODE_BUDGET");
    const episodes = [];
    for (const id of episodeIds) {
      const r = await this.context.resolve(identity, id);
      if (r?.memoryKind !== "episodic") throw Error("AUTHORIZED_EPISODE_REQUIRED");
      episodes.push(r);
    }
    episodes.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
    return this.propose(identity, "autobiographical", digest(["autobiographical-v2", identity.actorId, identity.policyRevision, episodes.map((r) => ({id:r.id,revision:r.revision}))]),
      JSON.stringify(episodes.map((r) => ({ episodeId: r.id, at: r.createdAt, summary: r.body }))),
      episodes.map((r) => ({ tenantId: identity.tenantId, kind: "memory", id: r.id, revision: r.revision })), episodes.at(-1)!.createdAt);
  }
  async working(identity: CognitiveIdentity, body: string, ttlMs: number) {
    if (!Number.isFinite(ttlMs) || ttlMs < 1000 || ttlMs > 3600000) throw Error("WORKING_TTL_INVALID");
    const createdAt = new Date(this.clock()).toISOString();
    const sourceId = randomUUID();
    return this.propose(identity, "working", sourceId, body,
      [{ tenantId: identity.tenantId, kind: "event", id: sourceId, revision: 1 }], createdAt, new Date(this.clock() + ttlMs).toISOString());
  }
  async recall(identity: CognitiveIdentity, kind: NonNullable<CognitiveRecord["memoryKind"]>) {
    await this.context.assertAuthorized(identity);
    const rows = await this.context.projections.latest(identity.tenantId, 2000, identity.actorId, {memoryKind:kind,policyRevision:identity.policyRevision,now:new Date(this.clock()).toISOString()});
    const hits = [];
    for (const row of rows) {
      if (row.kind !== "memory" || row.memoryKind !== kind) continue;
      if (await this.context.resolve(identity, row.id, row.revision)) hits.push(row);
    }
    return { hits, degraded: rows.length >= 2000, reason: rows.length >= 2000 ? "MEMORY_QUERY_LIMIT" : null };
  }
}
