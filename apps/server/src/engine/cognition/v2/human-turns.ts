import {
  cognitiveHumanTurnPayloadSchema,
  type CognitiveHumanTurnPayload,
  type CognitiveIdentity,
} from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { SystemEvent } from "../../events/types.ts";
import type { Store } from "../../../db.ts";
import type { ContextServingFacade } from "./context.ts";
import { DurableEventSink, digest } from "./storage.ts";

/** Private, authenticated request provenance in the existing durable event journal. */
export class HumanTurnJournal {
  constructor(
    private readonly db: Store,
    private readonly sink: DurableEventSink,
    private readonly context: Pick<ContextServingFacade, "assertAuthorized" | "projections">,
  ) {}

  private boundEvent(
    identity: CognitiveIdentity,
    event: SystemEvent,
    threadId: string,
  ): SystemEvent<CognitiveHumanTurnPayload> {
    const parsed = cognitiveHumanTurnPayloadSchema.safeParse(event.payload);
    if (!parsed.success) throw Error("HUMAN_JOURNAL_EVIDENCE_UNAVAILABLE");
    const payload = parsed.data;
    if (
      event.type !== "cognition.v2.turn.admitted" ||
      event.actorKind !== "human" ||
      event.causalKind !== "root" ||
      event.tenantId !== identity.tenantId ||
      event.owner !== identity.owner ||
      event.actorId !== identity.actorId ||
      payload.identity.tenantId !== identity.tenantId ||
      payload.identity.owner !== identity.owner ||
      payload.identity.actorId !== identity.actorId ||
      payload.threadId !== threadId ||
      event.id !== `human:${digest(payload)}` ||
      event.source?.kind !== "context" ||
      event.source.id !== digest([identity.tenantId, identity.actorId, threadId]) ||
      event.correlationId !== event.id ||
      event.causationId !== undefined ||
      !Number.isFinite(Date.parse(event.emittedAt))
    )
      throw Error("HUMAN_JOURNAL_EVIDENCE_UNAVAILABLE");
    return { ...event, type: "cognition.v2.turn.admitted", payload };
  }

  async admit(
    identity: CognitiveIdentity,
    input: Omit<CognitiveHumanTurnPayload, "identity" | "schemaVersion">,
  ): Promise<string> {
    if (!this.db.inTransaction || !this.sink.usesTransactionStore(this.db))
      throw Error("HUMAN_ADMISSION_TRANSACTION_REQUIRED");
    const payload = cognitiveHumanTurnPayloadSchema.parse({ ...input, identity, schemaVersion: "1.0" });
    if (Buffer.byteLength(JSON.stringify(payload), "utf8") > 32000) throw Error("HUMAN_TURN_BUDGET");
    await this.context.assertAuthorized(identity);
    const id = `human:${digest(payload)}`;
    const runKey = digest([identity.tenantId, identity.actorId, payload.threadId, payload.runId]);
    const bound = await this.db.rawQuery(
      `UPDATE cognition_v2_chat_runs SET input_event_id=$4
      WHERE tenant=$1 AND id=$2 AND actor=$3 AND state='accepted'
      AND (input_event_id IS NULL OR input_event_id=$4) RETURNING id`,
      [identity.tenantId, runKey, identity.actorId, id],
    );
    if (!bound.length) throw Error("HUMAN_RUN_BINDING_REQUIRED");
    const [previous] = await this.db.rawQuery<{ event: SystemEvent }>(
      `SELECT event FROM cognition_v2_events WHERE tenant=$1 AND event_id=$2`,
      [identity.tenantId, id],
    );
    if (previous) {
      this.boundEvent(identity, previous.event, payload.threadId);
      if (digest(previous.event.payload) !== digest(payload)) throw Error("HUMAN_TURN_CONFLICT");
      return id;
    }
    const event: SystemEvent<CognitiveHumanTurnPayload> = {
      id,
      schemaVersion: "1.0",
      tenantId: identity.tenantId,
      owner: identity.owner,
      actorId: identity.actorId,
      actorKind: "human",
      causalKind: "root",
      correlationId: id,
      type: "cognition.v2.turn.admitted",
      emittedAt: new Date().toISOString(),
      source: { kind: "context", id: digest([identity.tenantId, identity.actorId, payload.threadId]) },
      payload,
    };
    await this.sink.write(event);
    return id;
  }

  /** Exact source lookup for a bound thread, independent of history window size. */
  async resolve(
    identity: CognitiveIdentity,
    threadId: string,
    eventId: string,
  ): Promise<SystemEvent<CognitiveHumanTurnPayload> | null> {
    if (!threadId || threadId.length > 200 || !eventId || eventId.length > 200)
      throw Error("HUMAN_JOURNAL_QUERY_INVALID");
    await this.context.assertAuthorized(identity);
    const [row] = await this.db.rawQuery<{ event_id: string; event: SystemEvent }>(
      `SELECT e.event_id,e.event FROM cognition_v2_events e WHERE e.tenant=$1 AND e.event_id=$2
       AND e.event->>'type'='cognition.v2.turn.admitted' AND e.event->>'owner'=$3 AND e.event->>'actorId'=$4
       AND e.event->'payload'->>'threadId'=$5 AND EXISTS (
         SELECT 1 FROM cognition_v2_chat_runs runs WHERE runs.tenant=e.tenant AND runs.actor=$4 AND runs.input_event_id=e.event_id)`,
      [identity.tenantId, eventId, identity.owner, identity.actorId, threadId],
    );
    if (!row || (await this.context.projections.revoked(identity.tenantId, eventId))) return null;
    if (row.event.id !== row.event_id) throw Error("HUMAN_JOURNAL_EVIDENCE_UNAVAILABLE");
    const event = this.boundEvent(identity, row.event, threadId);
    await this.context.assertAuthorized(identity);
    if (await this.context.projections.revoked(identity.tenantId, eventId)) return null;
    return event;
  }

  /** Bounded keyset read, scoped to the currently authorized actor and exact thread. */
  async thread(
    identity: CognitiveIdentity,
    threadId: string,
    after = "0",
    limit = 50,
  ): Promise<{ sequence: string; event: SystemEvent<CognitiveHumanTurnPayload> }[]> {
    if (
      !threadId ||
      threadId.length > 200 ||
      !/^(0|[1-9][0-9]*)$/.test(after) ||
      after.length > 19 ||
      BigInt(after) > 9223372036854775807n ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    )
      throw Error("HUMAN_JOURNAL_QUERY_INVALID");
    await this.context.assertAuthorized(identity);
    const rows = await this.db.rawQuery<{ sequence: string; event_id: string; event: SystemEvent }>(
      `SELECT e.sequence::text,e.event_id,e.event FROM cognition_v2_events e
       WHERE e.tenant=$1 AND e.event->>'type'='cognition.v2.turn.admitted'
       AND e.event->>'owner'=$2 AND e.event->>'actorId'=$3 AND e.event->'payload'->>'threadId'=$4
       AND EXISTS (SELECT 1 FROM cognition_v2_chat_runs runs WHERE runs.tenant=e.tenant AND runs.actor=$3 AND runs.input_event_id=e.event_id)
       AND e.sequence>$5::bigint AND NOT EXISTS (
         SELECT 1 FROM cognition_v2_revocations r WHERE r.tenant=e.tenant AND r.source=e.event_id)
       ORDER BY e.sequence LIMIT $6`,
      [identity.tenantId, identity.owner, identity.actorId, threadId, after, limit],
    );
    const result = [];
    for (const row of rows) {
      if (row.event_id !== row.event.id || (await this.context.projections.revoked(identity.tenantId, row.event_id)))
        throw Error("HUMAN_JOURNAL_EVIDENCE_UNAVAILABLE");
      result.push({ sequence: row.sequence, event: this.boundEvent(identity, row.event, threadId) });
    }
    await this.context.assertAuthorized(identity);
    return result;
  }
}
