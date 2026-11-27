import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Store } from "../../../db.ts";
import type { SemanticEvaluationContext } from "./slow.ts";
import { jevTargetSchema, type JevEgressGate, type JevEgressGrant } from "./jev-classifier.ts";
import type { ContextServingFacade } from "./context.ts";
import { digest } from "./storage.ts";

type Target = Parameters<JevEgressGate["prepare"]>[3];
const decisionSchema = z.strictObject({ consentId: z.string().min(1).max(200), revision: z.string().min(1).max(200),
  expiresAt: z.iso.datetime({ offset: true }), maxDailyRequests: z.number().int().min(1).max(100000),
  maxInFlight: z.number().int().min(1).max(100) });
/** Trusted server PDP/consent and minimization ports. No grants come from LLM output. */
export interface JevEgressPolicy {
  authorize(scope: SemanticEvaluationContext, target: Target, signal: AbortSignal): Promise<z.infer<typeof decisionSchema> | null>;
  minimize(body: string, scope: SemanticEvaluationContext, signal: AbortSignal): Promise<string | null>;
}
const resultSchema = z.strictObject({ state: z.enum(["succeeded", "failed"]), requestDigest: z.string().regex(/^[a-f0-9]{64}$/),
  reason: z.string().regex(/^JEV_[A-Z0-9_]+$/).max(100).optional(), model: z.string().max(200).optional(),
  usage: z.strictObject({ input_tokens: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    output_tokens: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), cost: z.number().finite().nonnegative().optional() }).optional() });
interface Receipt { actor: string; state: string; grant_digest: string; binding: { policyDigest: string; scopeDigest: string }; result_digest: string | null }
const targetOf = (grant: JevEgressGrant): Target => ({ provider: grant.provider, model: grant.model, ontologyId: grant.ontologyId, ontologyVersion: grant.ontologyVersion });
const grantDigest = (grant: JevEgressGrant) => digest({ ...grant, text: digest(grant.text) });

async function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(Error("JEV_CANCELLED"));
    signal.addEventListener("abort", abort, { once: true });
    work.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
    if (signal.aborted) abort();
  });
}

/** One explicitly configured tenant per instance; no startup/env auto-activation. */
export class DurableJevEgressGate implements JevEgressGate {
  constructor(private readonly db: Store, private readonly context: ContextServingFacade,
    private readonly tenant: string, private readonly policy: JevEgressPolicy, private readonly clock = () => Date.now()) {
    if (db !== context.projections.db || !tenant) throw Error("JEV_EGRESS_STORE_MISMATCH");
  }
  private async authorize(scope: SemanticEvaluationContext, target: Target, signal: AbortSignal) {
    signal.throwIfAborted();
    if (scope.identity.tenantId !== this.tenant || !scope.operationId || scope.operationId.length > 200 || !scope.evidence.length || scope.evidence.length > 30) throw Error("JEV_EGRESS_DENIED");
    if (!jevTargetSchema.safeParse({provider:target.provider,model:target.model}).success || target.ontologyId !== "agntiapro.cards" || target.ontologyVersion !== "1.0.0") throw Error("JEV_EGRESS_DENIED");
    await this.context.assertAuthorized(scope.identity);
    for (const ref of scope.evidence) {
      if (ref.tenantId !== this.tenant || !["card", "memory"].includes(ref.kind) || !await this.context.resolve(scope.identity, ref.id, ref.revision)) throw Error("JEV_EGRESS_DENIED");
    }
    const decision = decisionSchema.parse(await abortable(this.policy.authorize(scope, target, signal), signal));
    signal.throwIfAborted();
    if (Date.parse(decision.expiresAt) <= this.clock()) throw Error("JEV_EGRESS_DENIED");
    return decision;
  }
  async prepare(body: string, scope: SemanticEvaluationContext, signal: AbortSignal, target: Target): Promise<JevEgressGrant | null> {
    if (Buffer.byteLength(body, "utf8") > 32000) throw Error("JEV_INPUT_TOO_LARGE");
    const decision = await this.authorize(scope, target, signal);
    const text = await abortable(this.policy.minimize(body, scope, signal), signal);
    if (!text || Buffer.byteLength(text, "utf8") > 8192) throw Error("JEV_EGRESS_DENIED");
    const current = await this.authorize(scope, target, signal);
    if (digest(current) !== digest(decision)) throw Error("JEV_EGRESS_REVOKED");
    const grant: JevEgressGrant = { ...target, receiptId: randomUUID(), text, sourceDigest: digest(body),
      contextDigest: scope.contextDigest, evidenceDigest: digest(scope.evidence), policyRevision: scope.identity.policyRevision,
      expiresAt: new Date(Math.min(this.clock() + 30000, Date.parse(decision.expiresAt))).toISOString() };
    const operation = digest({ scope, target, sourceDigest: grant.sourceDigest });
    const day = new Date(this.clock()).toISOString().slice(0, 10);
    return this.db.transaction(async () => {
      // One tenant/day row serializes both admission and the quota counter across workers.
      await this.db.rawQuery(`INSERT INTO cognition_v2_egress_quotas(tenant,day,calls) VALUES($1,$2,0) ON CONFLICT DO NOTHING`, [this.tenant, day]);
      const [quota] = await this.db.rawQuery<{ calls: number }>(`SELECT calls FROM cognition_v2_egress_quotas WHERE tenant=$1 AND day=$2 FOR UPDATE`, [this.tenant, day]);
      const existing = await this.db.rawQuery(`SELECT id FROM cognition_v2_egress_receipts WHERE tenant=$1 AND operation=$2`, [this.tenant, operation]);
      // Never resend a potentially billed request after restart, timeout or lost provider ACK.
      if (existing.length) return null;
      const [active] = await this.db.rawQuery<{ count: string }>(`SELECT count(*) AS count FROM cognition_v2_egress_receipts WHERE tenant=$1 AND state='reserved' AND expires_at>$2`, [this.tenant, new Date(this.clock()).toISOString()]);
      if (Number(quota.calls) >= decision.maxDailyRequests || Number(active.count) >= decision.maxInFlight) return null;
      await this.authorize(scope, target, signal).then(d => { if (digest(d) !== digest(decision)) throw Error("JEV_EGRESS_REVOKED"); });
      await this.db.rawQuery(`INSERT INTO cognition_v2_egress_receipts(tenant,id,actor,operation,state,grant_digest,binding,expires_at,created_at)
        VALUES($1,$2,$3,$4,'reserved',$5,$6::jsonb,$7,$8)`, [this.tenant, grant.receiptId, scope.identity.actorId, operation, grantDigest(grant),
        JSON.stringify({ policyDigest: digest(decision), scopeDigest: digest(scope) }), grant.expiresAt, new Date(this.clock()).toISOString()]);
      await this.db.rawQuery(`UPDATE cognition_v2_egress_quotas SET calls=calls+1 WHERE tenant=$1 AND day=$2`, [this.tenant, day]);
      signal.throwIfAborted();
      return grant;
    });
  }
  async isCurrent(grant: JevEgressGrant, scope: SemanticEvaluationContext, signal: AbortSignal): Promise<boolean> {
    try {
      const policy = await this.authorize(scope, targetOf(grant), signal);
      const [row] = await this.db.rawQuery<Receipt>(`SELECT actor,state,grant_digest,binding,result_digest FROM cognition_v2_egress_receipts WHERE tenant=$1 AND id=$2`, [this.tenant, grant.receiptId]);
      return Boolean(row && row.actor === scope.identity.actorId && row.state === "reserved" && row.grant_digest === grantDigest(grant)
        && row.binding.scopeDigest === digest(scope) && row.binding.policyDigest === digest(policy) && Date.parse(grant.expiresAt) > this.clock());
    } catch { return false; }
  }
  async record(grant: JevEgressGrant, input: Parameters<JevEgressGate["record"]>[1]): Promise<void> {
    const result = resultSchema.parse(input), resultDigest = digest(result);
    await this.db.transaction(async () => {
      const [row] = await this.db.rawQuery<Receipt>(`SELECT actor,state,grant_digest,binding,result_digest FROM cognition_v2_egress_receipts WHERE tenant=$1 AND id=$2 FOR UPDATE`, [this.tenant, grant.receiptId]);
      if (!row || row.grant_digest !== grantDigest(grant)) throw Error("JEV_EGRESS_DENIED");
      if (row.result_digest) { if (row.result_digest !== resultDigest) throw Error("JEV_ACCOUNTING_CONFLICT"); return; }
      // Accounting survives consent revocation: it records an already attempted request, not a new permission.
      await this.db.rawQuery(`UPDATE cognition_v2_egress_receipts SET state=$3,result=$4::jsonb,result_digest=$5,finished_at=$6 WHERE tenant=$1 AND id=$2`,
        [this.tenant, grant.receiptId, result.state, JSON.stringify(result), resultDigest, new Date(this.clock()).toISOString()]);
    });
  }
  async reconcileExpired(limit = 100): Promise<number> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw Error("JEV_RECOVERY_LIMIT");
    return this.db.transaction(async () => {
      const rows = await this.db.rawQuery<{ id: string }>(`SELECT id FROM cognition_v2_egress_receipts WHERE tenant=$1 AND state='reserved' AND expires_at<=$2 ORDER BY id LIMIT $3 FOR UPDATE SKIP LOCKED`, [this.tenant, new Date(this.clock()).toISOString(), limit]);
      for (const row of rows) await this.db.rawQuery(`UPDATE cognition_v2_egress_receipts SET state='uncertain',finished_at=$3 WHERE tenant=$1 AND id=$2`, [this.tenant, row.id, new Date(this.clock()).toISOString()]);
      // No quota refund: network timeout is not proof of zero provider billing.
      return rows.length;
    });
  }
}
