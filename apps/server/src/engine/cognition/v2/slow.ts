// C07_ASYNC_SLOW_V2: durable jobs; model work is outside projection transactions.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { cognitiveIdentitySchema, cognitiveRefSchema, slowOutputSchema, classificationV2Schema, cognitiveRecordSchema,
  type CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import { payloadSchemas } from "../../events/schemas.ts";
import type { SystemEvent } from "../../events/types.ts";
import type { Store } from "../../../db.ts";
import { DurableEventSink, digest } from "./storage.ts";
import type { ContextServingFacade } from "./context.ts";
import { InferenceLane } from "./inference.ts";
import { CardOntologyService } from "../chromatic/card-ontology.ts";
const jobInput = z.strictObject({ identity: cognitiveIdentitySchema, prompt: z.string().min(1).max(4000),
  evidence: z.array(cognitiveRefSchema).min(1).max(30) }).refine((j) => j.evidence.every((e) => e.tenantId === j.identity.tenantId), "cross-tenant evidence");
export type SlowInput = z.infer<typeof jobInput>;
export type SlowInferenceInput = SlowInput & { context?: { id: string; body: string; epistemic: string }[]; contextDigest?: string };
export interface SlowProvider { infer(input: SlowInferenceInput, signal: AbortSignal): Promise<unknown> }
export interface SemanticEvaluationContext {
  identity: CognitiveIdentity; evidence: SlowInput["evidence"]; contextDigest: string;
  ontologyId: "agntiapro.cards"; ontologyVersion: "1.0.0";
}
export interface SemanticClassifier { classify(body: string, signal: AbortSignal, context?: SemanticEvaluationContext): Promise<unknown> }
export class RulesClassifier implements SemanticClassifier {
  async classify(body: string) {
    const labels: ("risk" | "question" | "summary" | "uncertain")[] = [];
    if (/riesgo|risk/iu.test(body)) labels.push("risk");
    if (/\?/u.test(body)) labels.push("question");
    if (!labels.length) labels.push("summary");
    return classificationV2Schema.parse({ classifier: "rules", version: "1", labels, uncertainty: 1, review: "proposed" });
  }
}
export class SlowCognitionQueue {
  capture?: (identity: CognitiveIdentity, input: { operationId: string; content: string; createdAt: string; epistemic: string }) => Promise<{ id: string }>;
  readonly lane: InferenceLane;
  readonly ontology: CardOntologyService;
  constructor(readonly db: Store, readonly sink: DurableEventSink, readonly context: ContextServingFacade,
    readonly provider: SlowProvider, readonly classifier: SemanticClassifier = new RulesClassifier(),
    readonly clock = () => Date.now()) {
    this.lane = new InferenceLane(db, "slow", 2, 45000, 100);
    this.ontology = new CardOntologyService(db);
  }
  private async emit(input: SlowInput, id: string, state: "queued" | "running" | "completed" | "failed" | "cancelled", suffix: string) {
    const event: SystemEvent = { id: digest([id, suffix]), tenantId: input.identity.tenantId, owner: input.identity.actorId,
      type: "cognition.v2.slow.status", schemaVersion: "1.0", emittedAt: new Date(this.clock()).toISOString(),
      source: { kind: "system", id: "slow-v2" }, payload: { jobId: id, state, receiptId: digest([id, suffix]) } };
    payloadSchemas[event.type].parse(event.payload); await this.sink.write(event);
  }
  async enqueue(raw: SlowInput, key: string): Promise<{ id: string; state: string }> {
    const input = jobInput.parse(raw); await this.context.assertAuthorized(input.identity);
    for (const ref of input.evidence) {
      if (ref.kind !== "card" && ref.kind !== "memory") throw Error("UNRESOLVABLE_EVIDENCE");
      if (!await this.context.resolve(input.identity, ref.id, ref.revision)) throw Error("EVIDENCE_DENIED");
    }
    await this.ontology.install();
    const id = digest([input.identity.tenantId, input.identity.actorId, key]);
    return this.db.transaction(async () => {
      const rows = await this.db.rawQuery(`INSERT INTO cognition_v2_slow_jobs(tenant,id,actor,data,state,next_at)
        VALUES($1,$2,$3,$4::jsonb,'queued',$5) ON CONFLICT DO NOTHING RETURNING id`,
        [input.identity.tenantId, id, input.identity.actorId, JSON.stringify(input), new Date(this.clock()).toISOString()]);
      const [job] = await this.db.rawQuery<{ data: SlowInput; state: string }>(`SELECT data,state FROM cognition_v2_slow_jobs WHERE tenant=$1 AND id=$2`, [input.identity.tenantId, id]);
      if (digest(job.data) !== digest(input)) throw Error("IDEMPOTENCY_CONFLICT");
      if (rows.length) await this.emit(input, id, "queued", "accepted");
      return { id, state: job.state };
    });
  }
  async cancel(identity: CognitiveIdentity, id: string): Promise<boolean> {
    await this.context.assertAuthorized(identity);
    return this.db.transaction(async () => {
      const [job] = await this.db.rawQuery<{ data: SlowInput }>(`UPDATE cognition_v2_slow_jobs SET state='cancelled',fence=fence+1
        WHERE tenant=$1 AND id=$2 AND actor=$3 AND state IN ('queued','running') RETURNING data`, [identity.tenantId, id, identity.actorId]);
      if (job) await this.emit(job.data, id, "cancelled", "cancelled");
      return Boolean(job);
    });
  }
  async tick(tenant: string, shutdown?: AbortSignal): Promise<boolean> {
    const job = await this.db.transaction(async () => {
      // Exhausted abandoned jobs must reach an auditable terminal state.
      const exhausted = await this.db.rawQuery<{ id: string; data: SlowInput }>(`UPDATE cognition_v2_slow_jobs SET state='failed',failure_code='LEASE_ATTEMPTS_EXHAUSTED' WHERE tenant=$1 AND attempts>=5 AND lease_until<=$2 AND state='running' RETURNING id,data`, [tenant, new Date(this.clock()).toISOString()]);
      for (const failed of exhausted) await this.emit(failed.data, failed.id, "failed", "failed");
      const [claimed] = await this.db.rawQuery<{ id: string; data: SlowInput; fence: string; attempts: number; output: unknown }>(
        `UPDATE cognition_v2_slow_jobs SET state='running',fence=fence+1,attempts=attempts+1,lease_until=$3
        WHERE tenant=$1 AND id=(SELECT id FROM cognition_v2_slow_jobs WHERE tenant=$1 AND attempts<5
          AND ((state='queued' AND next_at<=$2) OR (state='running' AND lease_until<=$2)) ORDER BY next_at,id FOR UPDATE SKIP LOCKED LIMIT 1)
        RETURNING id,data,fence,attempts,output`, [tenant, new Date(this.clock()).toISOString(), new Date(this.clock() + 60000).toISOString()]);
      if (claimed) await this.emit(claimed.data, claimed.id, "running", `running:${claimed.fence}`);
      return claimed;
    });
    if (!job) return false;
    const cancellation = new AbortController();
    let checking = false, lastAuthorization = 0;
    const monitor = setInterval(() => {
      if (checking) return;
      checking = true;
      void this.db.rawQuery<{ state: string; fence: string }>(`SELECT state,fence FROM cognition_v2_slow_jobs WHERE tenant=$1 AND id=$2`, [tenant, job.id])
        .then(async ([r]) => {
          if (!r || r.state !== "running" || r.fence !== job.fence) { cancellation.abort(); return; }
          if (this.clock() - lastAuthorization >= 1000) {
            lastAuthorization = this.clock();
            await this.context.assertAuthorized(job.data.identity);
            for (const ref of job.data.evidence) if (!await this.context.resolve(job.data.identity, ref.id, ref.revision)) cancellation.abort();
          }
        })
        .catch(() => cancellation.abort()).finally(() => { checking = false; });
    }, 100);
    try {
      await this.context.assertAuthorized(job.data.identity);
      const preparedContext: NonNullable<SlowInferenceInput["context"]> = [];
      for (const ref of job.data.evidence) {
        const record = await this.context.resolve(job.data.identity, ref.id, ref.revision);
        if (!record) throw Error("EVIDENCE_REVOKED");
        preparedContext.push({ id: record.id, body: record.body, epistemic: record.epistemic });
      }
      if (Buffer.byteLength(JSON.stringify(preparedContext), "utf8") > 32000) throw Error("SLOW_CONTEXT_BUDGET");
      const contextDigest = digest({ context: preparedContext, prompt: job.data.prompt, identity: job.data.identity });
      const raw = job.output ?? await this.lane.run(tenant, async (signal) => {
        await this.context.assertAuthorized(job.data.identity);
        for (const ref of job.data.evidence) if (!await this.context.resolve(job.data.identity, ref.id, ref.revision)) throw Error("EVIDENCE_REVOKED");
        signal.throwIfAborted();
        return this.provider.infer({ ...job.data, context: preparedContext, contextDigest }, signal);
      }, AbortSignal.any([cancellation.signal, ...(shutdown ? [shutdown] : [])]));
      if (Buffer.byteLength(JSON.stringify(raw), "utf8") > 32000) throw Error("SLOW_OUTPUT_BUDGET");
      const saved = await this.db.rawQuery(`UPDATE cognition_v2_slow_jobs SET output=$4::jsonb WHERE tenant=$1 AND id=$2 AND fence=$3 AND state='running' AND lease_until>$5 RETURNING id`,
        [tenant, job.id, job.fence, JSON.stringify(raw), new Date(this.clock()).toISOString()]);
      if (!saved.length) throw Error("STALE_SLOW_FENCE");
      // Durable raw output receipt precedes structured extraction/verification.
      const output = slowOutputSchema.parse(raw);
      if (output.evidence.some((r) => !job.data.evidence.some((e) => digest(e) === digest(r)))) throw Error("FABRICATED_EVIDENCE");
      // Classification is optional and bounded; it never promotes factuality.
      let classification = await new RulesClassifier().classify(output.body);
      try {
        classification = classificationV2Schema.parse(await Promise.race([
          this.classifier.classify(output.body, AbortSignal.any([cancellation.signal, AbortSignal.timeout(500)]),
            { identity: job.data.identity, evidence: output.evidence, contextDigest, ontologyId: "agntiapro.cards", ontologyVersion: "1.0.0" }),
          new Promise((_, reject) => { const t = setTimeout(() => reject(Error("CLASSIFIER_TIMEOUT")), 500); t.unref(); }),
        ]));
        if (classification.ontology) {
          const proposal = classification.ontology;
          if ([...proposal.evidenceRefs, ...(proposal.targetGoalRef ? [proposal.targetGoalRef] : [])].some(r => !output.evidence.some(e => digest(e) === digest(r)))) throw Error("unanchored_evidence");
          if (proposal.contextDigest && proposal.contextDigest !== contextDigest) throw Error("context_mismatch");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        classification = { ...await new RulesClassifier().classify(output.body), fallbackReason:
          message === "unanchored_evidence" || message === "context_mismatch" ? message : message === "CLASSIFIER_TIMEOUT" || message === "JEV_TIMEOUT" ? "timeout" : error instanceof z.ZodError ? "invalid_response" : "provider_error" };
      }
      const ontology = await this.ontology.annotate({ slow: output.ontology,
        evaluator: classification.ontology ? { proposal: classification.ontology, name: classification.classifier, version: classification.version } : undefined,
        evidence: output.evidence, contextDigest, evaluatedAt: new Date(this.clock()).toISOString() });
      await this.db.transaction(async () => {
        const [current] = await this.db.rawQuery<{ fence: string; state: string; valid: boolean }>(`SELECT fence,state,lease_until>$3 AS valid FROM cognition_v2_slow_jobs WHERE tenant=$1 AND id=$2 FOR UPDATE`, [tenant, job.id, new Date(this.clock()).toISOString()]);
        if (!current || current.state !== "running" || current.fence !== job.fence || !current.valid) throw Error("STALE_SLOW_FENCE");
        await this.context.assertAuthorized(job.data.identity);
        for (const ref of output.evidence) if (!await this.context.resolve(job.data.identity, ref.id, ref.revision)) throw Error("EVIDENCE_REVOKED");
        if (!this.capture) throw Error("KERNEL_CAPTURE_UNCONFIGURED");
        const createdAt = new Date(this.clock()).toISOString();
        const thought = await this.capture(job.data.identity, { operationId: job.id, content: output.body, createdAt, epistemic: output.epistemic });
        const record = cognitiveRecordSchema.parse({ schemaVersion: "2.0", id: `slow:${job.id}`, tenantId: tenant, revision: 1,
          kind: "card", title: output.title, body: output.body, epistemic: output.epistemic, evidence: [...output.evidence, { tenantId: tenant, kind: "thought", id: thought.id, revision: 1 }],
          sourceEventId: job.id, sourceRevision: 1, visibility: { tenantId: tenant, ownerActorId: job.data.identity.actorId,
            scope: "private", allowedActorIds: [], policyRevision: job.data.identity.policyRevision },
          signals: { relevance: .5, confidence: 0, novelty: .5, urgency: 0, contradiction: 0 }, classification, ontology, lifecycle: "active", createdAt: new Date(this.clock()).toISOString() });
        const event: SystemEvent = { id: digest([job.id, "record"]), tenantId: tenant, owner: job.data.identity.actorId,
          type: "cognition.v2.record.proposed", schemaVersion: "1.0", emittedAt: record.createdAt,
          source: { kind: "system", id: "slow-v2" }, payload: { record } };
        payloadSchemas[event.type].parse(event.payload); await this.sink.write(event);
        await this.db.rawQuery(`UPDATE cognition_v2_slow_jobs SET state='completed',output=$3::jsonb,classification=$4::jsonb WHERE tenant=$1 AND id=$2`, [tenant, job.id, JSON.stringify(output), JSON.stringify(classification)]);
        await this.emit(job.data, job.id, "completed", "completed");
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const code = ["DENIED", "EVIDENCE_REVOKED", "FABRICATED_EVIDENCE", "INFERENCE_TIMEOUT", "INFERENCE_CANCELLED", "LANE_SATURATED", "LANE_BUDGET_EXHAUSTED", "STALE_SLOW_FENCE", "SLOW_CONTEXT_BUDGET"].includes(message) ? message : "SLOW_EXECUTION_FAILED";
      await this.db.transaction(async () => {
        const rows = await this.db.rawQuery(`UPDATE cognition_v2_slow_jobs SET state=$4,next_at=$5,lease_until=NULL,failure_code=$6
          WHERE tenant=$1 AND id=$2 AND fence=$3 AND state='running' RETURNING id`, [tenant, job.id, job.fence,
          job.attempts >= 5 ? "failed" : "queued", new Date(this.clock() + 1000 * 2 ** job.attempts).toISOString(), code]);
        if (rows.length && job.attempts >= 5) await this.emit(job.data, job.id, "failed", "failed");
      });
    }
    finally { clearInterval(monitor); }
    return true;
  }
}
