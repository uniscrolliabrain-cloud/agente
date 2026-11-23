// C13_DURABLE_VOICE_COORDINATOR_V2. Voice tables retain receipts and digests, never audio or transcript text.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Store } from "../../db.ts";
import { appendThreadMessages, requireThread } from "../../threads-routes.ts";
import { runInTenantScope } from "../../tenant-scope.ts";
import type { CognitiveIdentity } from "../../../../../packages/domain/src/cognition-v2.ts";
import { cognitiveIdentitySchema } from "../../../../../packages/domain/src/cognition-v2.ts";
import type { ContextServingFacade } from "../cognition/v2/context.ts";
import { digest } from "../cognition/v2/storage.ts";
import { transcriptInputSchema, voiceSessionInputSchema, voiceSessionSchema, type VoiceSessionV2,
  type VoiceTurnV2, type SharedFastVoicePort } from "./contracts.ts";
export interface VoiceAuthorization {
  /** Server registry/policy check; a prompt-selected role never grants access. */
  authorizeAgent(identity: CognitiveIdentity, agentId: string, roleId: string): Promise<boolean>;
}
export interface VoiceLimits { maxSessionMs: number; silenceMs: number; maxConcurrentSessions: number }
const defaultLimits: VoiceLimits = { maxSessionMs: 15 * 60_000, silenceMs: 45_000, maxConcurrentSessions: 2 };
const consentInputSchema = z.strictObject({ transcript: z.literal(true), recording: z.literal(false), purpose: z.literal("conversation"), saveToThread: z.boolean().optional() });
const explicitThreadTenant = { resolveStrict: async () => { throw Error("VOICE_THREAD_TENANT_REQUIRED"); } };
export async function installVoiceV2(db: Store): Promise<void> {
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS cognition_v2_voice_consents (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,data jsonb NOT NULL,expires_at timestamptz NOT NULL,revoked_at timestamptz,PRIMARY KEY(tenant,id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_voice_locks (tenant text NOT NULL,actor text NOT NULL,PRIMARY KEY(tenant,actor))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_voice_sessions (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(tenant,id))`,
    `CREATE INDEX IF NOT EXISTS cognition_v2_voice_sessions_actor ON cognition_v2_voice_sessions(tenant,actor)`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_voice_turns (tenant text NOT NULL,id text NOT NULL,session_id text NOT NULL,actor text NOT NULL,utterance_id text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(tenant,id),UNIQUE(tenant,session_id,utterance_id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_voice_receipts (tenant text NOT NULL,id text NOT NULL,session_id text NOT NULL,actor text NOT NULL,event text NOT NULL,epoch integer NOT NULL,occurred_at timestamptz NOT NULL,PRIMARY KEY(tenant,id))`,
  ]) await db.rawQuery(sql);
}
export class VoiceTurnCoordinator {
  private readonly renders = new Map<string, Set<{ epoch: number; controller: AbortController }>>();

  private renderKey(session: VoiceSessionV2): string {
    return JSON.stringify([session.tenantId, session.actorId, session.sessionId]);
  }

  constructor(readonly db: Store, readonly context: ContextServingFacade, readonly authority: VoiceAuthorization,
    readonly fast: SharedFastVoicePort, readonly limits: VoiceLimits = defaultLimits, readonly clock = () => Date.now()) {
    if (!Number.isFinite(limits.maxSessionMs) || limits.maxSessionMs <= 0 || limits.maxSessionMs > 3_600_000 ||
      !Number.isFinite(limits.silenceMs) || limits.silenceMs <= 0 ||
      !Number.isSafeInteger(limits.maxConcurrentSessions) || limits.maxConcurrentSessions < 1 || limits.maxConcurrentSessions > 10) throw Error("VOICE_LIMITS_INVALID");
  }
  private async authorize(identity: CognitiveIdentity): Promise<void> {
    cognitiveIdentitySchema.parse(identity);
    await this.context.assertAuthorized(identity);
  }
  async grantConsent(identity: CognitiveIdentity, raw: unknown): Promise<{ id: string; expiresAt: string }> {
    await this.authorize(identity);
    const consent = consentInputSchema.parse(raw), id = randomUUID();
    const expiresAt = new Date(this.clock() + this.limits.maxSessionMs).toISOString();
    await this.db.rawQuery(`INSERT INTO cognition_v2_voice_consents(tenant,id,actor,data,expires_at) VALUES($1,$2,$3,$4::jsonb,$5)`,
      [identity.tenantId, id, identity.actorId, JSON.stringify({ ...consent, policyRevision: identity.policyRevision }), expiresAt]);
    return { id, expiresAt };
  }
  private async readConsent(identity: CognitiveIdentity, id: string) {
    const [row] = await this.db.rawQuery<{ data: { saveToThread?: boolean } }>(`SELECT data FROM cognition_v2_voice_consents WHERE tenant=$1 AND id=$2 AND actor=$3
      AND revoked_at IS NULL AND expires_at>$4 AND data->>'policyRevision'=$5`,
      [identity.tenantId, id, identity.actorId, new Date(this.clock()).toISOString(), identity.policyRevision]);
    return row?.data;
  }
  private async save(session: VoiceSessionV2): Promise<void> {
    await this.db.rawQuery(`UPDATE cognition_v2_voice_sessions SET data=$3::jsonb WHERE tenant=$1 AND id=$2`,
      [session.tenantId, session.sessionId, JSON.stringify(voiceSessionSchema.parse(session))]);
    this.db.afterCommit(() => {
      for (const render of this.renders.get(this.renderKey(session)) ?? []) {
        if (render.epoch < session.epoch) {
          const reason = session.closedReason === "consent_revoked" ? "VOICE_CONSENT_REVOKED" : "VOICE_STALE_EPOCH";
          render.controller.abort(Error(reason));
        }
      }
    });
  }
  private async receipt(session: VoiceSessionV2, event: string): Promise<void> {
    await this.db.rawQuery(`INSERT INTO cognition_v2_voice_receipts(tenant,id,session_id,actor,event,epoch,occurred_at) VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [session.tenantId, randomUUID(), session.sessionId, session.actorId, event, session.epoch, new Date(this.clock()).toISOString()]);
  }
  private async locked(identity: CognitiveIdentity, sessionId: string): Promise<VoiceSessionV2> {
    const [row] = await this.db.rawQuery<{ data: VoiceSessionV2 }>(`SELECT data FROM cognition_v2_voice_sessions WHERE tenant=$1 AND id=$2 AND actor=$3 FOR UPDATE`,
      [identity.tenantId, sessionId, identity.actorId]);
    if (!row) throw Error("VOICE_SESSION_NOT_FOUND");
    const session = voiceSessionSchema.parse(row.data);
    if (session.policyRevision !== identity.policyRevision || !await this.authority.authorizeAgent(identity, session.agentId, session.roleId)) throw Error("VOICE_SESSION_DENIED");
    return session;
  }
  private async assertLive(identity: CognitiveIdentity, session: VoiceSessionV2) {
    if (session.closedReason === "consent_revoked") throw Error("VOICE_CONSENT_REVOKED");
    if (session.closedReason === "timeout" || session.closedReason === "silence") throw Error("VOICE_SESSION_EXPIRED");
    if (session.state === "closed" || session.state === "failed") throw Error("VOICE_SESSION_CLOSED");
    if (Date.parse(session.expiresAt) <= this.clock()) throw Error("VOICE_SESSION_EXPIRED");
    const consent = await this.readConsent(identity, session.consentReceiptId);
    if (!consent) throw Error("VOICE_CONSENT_REQUIRED");
    return consent;
  }
  async create(identity: CognitiveIdentity, raw: unknown): Promise<VoiceSessionV2> {
    await this.authorize(identity);
    const input = voiceSessionInputSchema.parse(raw);
    if (!await this.authority.authorizeAgent(identity, input.agentId, input.roleId)) throw Error("VOICE_AGENT_DENIED");
    if (!await this.context.readSnapshot(identity, input.contextSnapshotId)) throw Error("VOICE_CONTEXT_REQUIRED");
    return this.db.transaction(async () => {
      const consent = await this.readConsent(identity, input.consentReceiptId);
      if (!consent) throw Error("VOICE_CONSENT_REQUIRED");
      if (consent.saveToThread === true) {
        await runInTenantScope(identity, () => requireThread(this.db, explicitThreadTenant, identity.owner, input.threadId));
      }
      await this.db.rawQuery(`INSERT INTO cognition_v2_voice_locks(tenant,actor) VALUES($1,$2) ON CONFLICT DO NOTHING`, [identity.tenantId, identity.actorId]);
      await this.db.rawQuery(`SELECT tenant FROM cognition_v2_voice_locks WHERE tenant=$1 AND actor=$2 FOR UPDATE`, [identity.tenantId, identity.actorId]);
      const [count] = await this.db.rawQuery<{ count: string }>(`SELECT count(*) AS count FROM cognition_v2_voice_sessions WHERE tenant=$1 AND actor=$2
        AND data->>'state' NOT IN ('closed','failed') AND (data->>'expiresAt')::timestamptz>$3`, [identity.tenantId, identity.actorId, new Date(this.clock()).toISOString()]);
      if (Number(count.count) >= this.limits.maxConcurrentSessions) throw Error("VOICE_CONCURRENT_LIMIT");
      const at = new Date(this.clock()).toISOString();
      const session = voiceSessionSchema.parse({ schemaVersion: "2.0", sessionId: randomUUID(), tenantId: identity.tenantId, actorId: identity.actorId,
        ...input, policyRevision: identity.policyRevision, state: "authorized", revision: 1, epoch: 0, createdAt: at, lastActivityAt: at,
        expiresAt: new Date(this.clock() + this.limits.maxSessionMs).toISOString() });
      await this.db.rawQuery(`INSERT INTO cognition_v2_voice_sessions(tenant,id,actor,data) VALUES($1,$2,$3,$4::jsonb)`, [identity.tenantId, session.sessionId, identity.actorId, JSON.stringify(session)]);
      await this.receipt(session, "session_authorized");
      return session;
    });
  }
  async inspect(identity: CognitiveIdentity, sessionId: string): Promise<VoiceSessionV2 | null> {
    await this.authorize(identity);
    return this.db.transaction(async () => {
      try { const session = await this.locked(identity, sessionId); await this.assertLive(identity, session); return session; }
      catch (error) { if (error instanceof Error && error.message === "VOICE_SESSION_NOT_FOUND") return null; throw error; }
    });
  }
  async refreshContext(identity: CognitiveIdentity, sessionId: string, snapshotId: string): Promise<VoiceSessionV2> {
    await this.authorize(identity);
    if (!await this.context.readSnapshot(identity, snapshotId)) throw Error("VOICE_CONTEXT_REQUIRED");
    return this.db.transaction(async () => {
      const session = await this.locked(identity, sessionId); await this.assertLive(identity, session);
      const next: VoiceSessionV2 = { ...session, contextSnapshotId: snapshotId, state: "authorized", epoch: session.epoch + 1,
        revision: session.revision + 1, lastActivityAt: new Date(this.clock()).toISOString() };
      await this.save(next);
      await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=data || '{"state":"interrupted"}'::jsonb
        WHERE tenant=$1 AND session_id=$2 AND data->>'state' IN ('accepted','rendering')`, [identity.tenantId, sessionId]);
      await this.receipt(next, "context_refreshed"); return next;
    });
  }
  async interrupt(identity: CognitiveIdentity, sessionId: string): Promise<VoiceSessionV2> {
    await this.authorize(identity);
    return this.db.transaction(async () => {
      const session = await this.locked(identity, sessionId); await this.assertLive(identity, session);
      const next: VoiceSessionV2 = { ...session, state: "interrupted", epoch: session.epoch + 1, revision: session.revision + 1, lastActivityAt: new Date(this.clock()).toISOString() };
      await this.save(next);
      await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=data || '{"state":"interrupted"}'::jsonb WHERE tenant=$1 AND session_id=$2 AND data->>'state' IN ('accepted','rendering')`, [identity.tenantId, sessionId]);
      await this.receipt(next, "interrupted"); return next;
    });
  }
  async close(identity: CognitiveIdentity, sessionId: string, reason: VoiceSessionV2["closedReason"] = "user"): Promise<VoiceSessionV2> {
    await this.authorize(identity);
    return this.db.transaction(async () => {
      const session = await this.locked(identity, sessionId);
      return this.closeLocked(session, reason);
    });
  }
  private async closeLocked(session: VoiceSessionV2, reason: VoiceSessionV2["closedReason"]): Promise<VoiceSessionV2> {
    if (session.state === "closed") return session;
    const next: VoiceSessionV2 = { ...session, state: "closed", closedReason: reason, epoch: session.epoch + 1, revision: session.revision + 1, lastActivityAt: new Date(this.clock()).toISOString() };
    await this.save(next);
    await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=data || '{"state":"interrupted"}'::jsonb WHERE tenant=$1 AND session_id=$2 AND data->>'state' IN ('accepted','rendering')`, [session.tenantId, session.sessionId]);
    await this.receipt(next, "closed"); return next;
  }
  async revokeConsent(identity: CognitiveIdentity, consentId: string): Promise<void> {
    await this.authorize(identity);
    await this.db.transaction(async () => {
      await this.db.rawQuery(`UPDATE cognition_v2_voice_consents SET revoked_at=$4 WHERE tenant=$1 AND id=$2 AND actor=$3`, [identity.tenantId, consentId, identity.actorId, new Date(this.clock()).toISOString()]);
      const sessions = await this.db.rawQuery<{ data: VoiceSessionV2 }>(`SELECT data FROM cognition_v2_voice_sessions WHERE tenant=$1 AND actor=$2 AND data->>'consentReceiptId'=$3 AND data->>'state'<>'closed' FOR UPDATE`, [identity.tenantId, identity.actorId, consentId]);
      for (const { data } of sessions) {
        const next: VoiceSessionV2 = { ...data, state: "closed", closedReason: "consent_revoked", epoch: data.epoch + 1, revision: data.revision + 1 };
        await this.save(next);
        await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=data || '{"state":"interrupted"}'::jsonb
          WHERE tenant=$1 AND session_id=$2 AND data->>'state' IN ('accepted','rendering')`, [identity.tenantId, data.sessionId]);
        await this.receipt(next, "consent_revoked");
      }
    });
  }
  /** Partial STT is deliberately not persisted, queued, or sent to Fast. */
  async acceptTranscript(identity: CognitiveIdentity, sessionId: string, raw: unknown): Promise<VoiceTurnV2 | null> {
    await this.authorize(identity);
    const input = transcriptInputSchema.parse(raw);
    return this.db.transaction(async () => {
      const session = await this.locked(identity, sessionId); await this.assertLive(identity, session);
      if (input.status === "partial") {
        await this.save({ ...session, revision: session.revision + 1, lastActivityAt: new Date(this.clock()).toISOString() });
        return null;
      }
      const turnId = digest([identity.tenantId, sessionId, input.utteranceId]);
      const [existing] = await this.db.rawQuery<{ data: VoiceTurnV2 }>(`SELECT data FROM cognition_v2_voice_turns WHERE tenant=$1 AND id=$2`, [identity.tenantId, turnId]);
      const transcriptDigest = digest(input.text);
      if (existing) {
        if (existing.data.utteranceRevision !== input.revision || existing.data.transcriptDigest !== transcriptDigest) throw Error("VOICE_UTTERANCE_CONFLICT");
        return existing.data;
      }
      const turn: VoiceTurnV2 = { turnId, tenantId: identity.tenantId, sessionId, actorId: identity.actorId, utteranceId: input.utteranceId,
        utteranceRevision: input.revision, epoch: session.epoch, state: "accepted", transcriptDigest };
      await this.db.rawQuery(`INSERT INTO cognition_v2_voice_turns(tenant,id,session_id,actor,utterance_id,data) VALUES($1,$2,$3,$4,$5,$6::jsonb)`, [identity.tenantId, turnId, sessionId, identity.actorId, input.utteranceId, JSON.stringify(turn)]);
      await this.save({ ...session, state: "processing", revision: session.revision + 1, lastActivityAt: new Date(this.clock()).toISOString() });
      await this.receipt(session, "transcript_final_accepted"); return turn;
    });
  }
  async acceptsOutput(identity: CognitiveIdentity, sessionId: string, epoch: number): Promise<boolean> {
    await this.authorize(identity);
    return this.db.transaction(async () => {
      try {
        const session = await this.locked(identity, sessionId); await this.assertLive(identity, session);
        return session.epoch === epoch && Boolean(await this.context.readSnapshot(identity, session.contextSnapshotId));
      } catch { return false; }
    });
  }
  /** The supplied turn must already have a durable final-transcript receipt. */
  async renderTurn(identity: CognitiveIdentity, sessionId: string, turnId: string, transcript: string,
    signal: AbortSignal, onText: (text: string, epoch: number) => Promise<void>): Promise<VoiceTurnV2> {
    await this.authorize(identity);
    const { session, turn } = await this.db.transaction(async () => {
      const session = await this.locked(identity, sessionId); await this.assertLive(identity, session);
      const [row] = await this.db.rawQuery<{ data: VoiceTurnV2 }>(`SELECT data FROM cognition_v2_voice_turns WHERE tenant=$1 AND id=$2 AND session_id=$3 AND actor=$4 FOR UPDATE`, [identity.tenantId, turnId, sessionId, identity.actorId]);
      if (!row || row.data.state !== "accepted" || row.data.epoch !== session.epoch || row.data.transcriptDigest !== digest(transcript)) throw Error("VOICE_TURN_INVALID");
      const turn: VoiceTurnV2 = { ...row.data, state: "rendering", renderFence: (row.data.renderFence ?? 0) + 1,
        renderLeaseUntil: new Date(this.clock() + 30000).toISOString() };
      await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=$3::jsonb WHERE tenant=$1 AND id=$2`, [identity.tenantId, turnId, JSON.stringify(turn)]);
      return { session, turn };
    });
    const key = this.renderKey(session);
    const controller = new AbortController();
    const active = { epoch: turn.epoch, controller };
    const renders = this.renders.get(key) ?? new Set<typeof active>();
    renders.add(active);
    this.renders.set(key, renders);
    const renderSignal = AbortSignal.any([signal, controller.signal, AbortSignal.timeout(Math.max(1, Date.parse(turn.renderLeaseUntil!) - this.clock()))]);
    let checking = false;
    const check = async () => {
      if (checking || renderSignal.aborted) return;
      checking = true;
      try {
        if (!await this.acceptsOutput(identity, sessionId, turn.epoch)) controller.abort(Error("VOICE_STALE_EPOCH"));
      } catch {
        controller.abort(Error("VOICE_STALE_EPOCH"));
      } finally {
        checking = false;
      }
    };
    const monitor = setInterval(() => { void check(); }, 250);
    monitor.unref();
    let result: { receiptId: string; text: string };
    let emittedText = "";
    try {
      await check();
      renderSignal.throwIfAborted();
      result = await this.fast.stream(identity, { threadId: session.threadId, turnId, text: transcript, contextSnapshotId: session.contextSnapshotId, roleId: session.roleId }, renderSignal, async (text) => {
        renderSignal.throwIfAborted();
        if (!turn.renderLeaseUntil || Date.parse(turn.renderLeaseUntil) <= this.clock()) throw Error("VOICE_RENDER_LEASE_EXPIRED");
        if (!await this.acceptsOutput(identity, sessionId, turn.epoch)) throw Error("VOICE_STALE_EPOCH");
        if (emittedText.length + text.length > 16000) throw Error("VOICE_OUTPUT_TOO_LARGE");
        await onText(text, turn.epoch);
        emittedText += text;
      });
      if (!result.receiptId || result.receiptId.length > 200 || result.text !== emittedText) throw Error("VOICE_OUTPUT_RECEIPT_MISMATCH");
      return await this.db.transaction(async () => {
        await this.authorize(identity);
        const current = await this.locked(identity, sessionId);
        const consent = await this.assertLive(identity, current);
        if (!await this.context.readSnapshot(identity, current.contextSnapshotId)) throw Error("VOICE_CONTEXT_REVOKED");
        if (current.epoch !== turn.epoch || !turn.renderLeaseUntil || Date.parse(turn.renderLeaseUntil) <= this.clock()) throw Error("VOICE_STALE_EPOCH");
        const completed: VoiceTurnV2 = { ...turn, state: "completed", receiptId: result.receiptId };
        const committed = await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=$3::jsonb WHERE tenant=$1 AND id=$2
          AND data->>'state'='rendering' AND (data->>'renderFence')::integer=$4 RETURNING id`, [identity.tenantId, turnId, JSON.stringify(completed), turn.renderFence]);
        if (!committed.length) throw Error("VOICE_STALE_FENCE");
        renderSignal.throwIfAborted();
        if (consent.saveToThread === true) {
          const timestamp = new Date(this.clock()).toISOString();
          await runInTenantScope(identity, () => appendThreadMessages(this.db, explicitThreadTenant, identity.owner, current.threadId, [
            { id: `${turnId}:user`, role: "user", content: transcript, timestamp },
            { id: `${turnId}:assistant`, role: "assistant", content: result.text, timestamp },
          ], true));
        }
        renderSignal.throwIfAborted();
        await this.save({ ...current, state: "authorized", revision: current.revision + 1, lastActivityAt: new Date(this.clock()).toISOString() });
        await this.receipt(current, "fast_output_completed");
        renderSignal.throwIfAborted();
        return completed;
      });
    } catch (error) {
      await this.db.transaction(async () => {
        const current = await this.locked(identity, sessionId);
        await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=data || '{"state":"failed"}'::jsonb
          WHERE tenant=$1 AND id=$2 AND data->>'state'='rendering' AND (data->>'renderFence')::integer=$3`, [identity.tenantId, turnId, turn.renderFence]);
        if (current.epoch === turn.epoch && current.state === "processing") {
          const failed: VoiceSessionV2 = { ...current, state: "failed", closedReason: "error", epoch: current.epoch + 1, revision: current.revision + 1 };
          await this.save(failed); await this.receipt(failed, "fast_output_failed");
        }
      });
      throw error;
    } finally {
      clearInterval(monitor);
      renders.delete(active);
      if (renders.size === 0) this.renders.delete(key);
    }
  }
  /** Durable expiry is recoverable after process restart; no timer grants safety. */
  async reap(identity: CognitiveIdentity): Promise<number> {
    await this.authorize(identity);
    const rows = await this.db.rawQuery<{ data: VoiceSessionV2 }>(`SELECT data FROM cognition_v2_voice_sessions WHERE tenant=$1 AND actor=$2 AND data->>'state' NOT IN ('closed','failed')`, [identity.tenantId, identity.actorId]);
    await this.db.rawQuery(`UPDATE cognition_v2_voice_turns SET data=data || '{"state":"failed"}'::jsonb
      WHERE tenant=$1 AND actor=$2 AND data->>'state'='rendering' AND (data->>'renderLeaseUntil')::timestamptz<=$3`,
      [identity.tenantId, identity.actorId, new Date(this.clock()).toISOString()]);
    let count = 0;
    for (const { data } of rows) {
      const closed = await this.db.transaction(async () => {
        const current = await this.locked(identity, data.sessionId);
        if (current.state === "closed" || current.state === "failed") return false;
        const expired = Date.parse(current.expiresAt) <= this.clock();
        const silent = Date.parse(current.lastActivityAt) + this.limits.silenceMs <= this.clock();
        if (!expired && !silent) return false;
        await this.closeLocked(current, expired ? "timeout" : "silence");
        return true;
      });
      if (closed) count++;
    }
    return count;
  }
  async reapExpired(tenantId: string): Promise<void> {
    const now = this.clock();
    const rows = await this.db.rawQuery<{ id: string }>(`SELECT id FROM cognition_v2_voice_sessions
      WHERE tenant=$1 AND data->>'state' NOT IN ('closed','failed')
        AND ((data->>'expiresAt')::timestamptz <= $2 OR (data->>'lastActivityAt')::timestamptz <= $3)
      ORDER BY data->>'lastActivityAt', id LIMIT 100`,
      [tenantId, new Date(now).toISOString(), new Date(now - this.limits.silenceMs).toISOString()]);
    for (const { id } of rows) {
      await this.db.transaction(async () => {
        const [row] = await this.db.rawQuery<{ data: VoiceSessionV2 }>(
          "SELECT data FROM cognition_v2_voice_sessions WHERE tenant=$1 AND id=$2 FOR UPDATE", [tenantId, id],
        );
        if (!row) return;
        const session = voiceSessionSchema.parse(row.data);
        if (session.state === "closed" || session.state === "failed") return;
        if (Date.parse(session.expiresAt) <= now) await this.closeLocked(session, "timeout");
        else if (Date.parse(session.lastActivityAt) + this.limits.silenceMs <= now) await this.closeLocked(session, "silence");
      });
    }
  }

}
