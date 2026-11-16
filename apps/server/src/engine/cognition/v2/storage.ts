// C02_DURABLE_PROJECTIONS_V2: additive storage; source remains the existing EventBus.
import { createHash, randomUUID } from "node:crypto";
import { currentTenantScope, runInTenantScope } from "../../../tenant-scope.ts";
import type { Store } from "../../../db.ts";
import { TenantScopedStore } from "../../../db-tenant.ts";
import type { EventSink, SystemEvent } from "../../events/types.ts";
import { cognitiveRecordSchema, type CognitiveRecord } from "../../../../../../packages/domain/src/cognition-v2.ts";
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => [key, canonical(val)]));
  return value;
}
export const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
export type SqlStore = Pick<Store, "rawQuery" | "transaction">;
export async function installCognitionV2(db: Store): Promise<void> {
  // No destructive changes; event source records and legacy readers remain intact.
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS cognition_v2_rag_refs (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,source_id text NOT NULL,source_version text NOT NULL,PRIMARY KEY(tenant,id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_import_plans (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,data jsonb NOT NULL,state text NOT NULL,expires_at timestamptz NOT NULL,PRIMARY KEY(tenant,id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_import_receipts (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,source_id text NOT NULL,source_revision integer NOT NULL,source_digest text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(tenant,id),UNIQUE(tenant,actor,source_id,source_revision))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_attention (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(tenant,id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_chat_runs (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,state text NOT NULL,response text,receipt_id text,PRIMARY KEY(tenant,id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_lane_locks (tenant text NOT NULL,lane text NOT NULL,PRIMARY KEY(tenant,lane))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_lane_slots (tenant text NOT NULL,lane text NOT NULL,token text NOT NULL,expires_at timestamptz NOT NULL,PRIMARY KEY(tenant,lane,token))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_lane_usage (tenant text NOT NULL,lane text NOT NULL,day text NOT NULL,calls integer NOT NULL,PRIMARY KEY(tenant,lane,day))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_slow_jobs (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,data jsonb NOT NULL,state text NOT NULL,
      fence bigint NOT NULL DEFAULT 0,attempts integer NOT NULL DEFAULT 0,lease_until timestamptz,next_at timestamptz NOT NULL,output jsonb,classification jsonb,failure_code text,PRIMARY KEY(tenant,id))`,
    `ALTER TABLE cognition_v2_slow_jobs ADD COLUMN IF NOT EXISTS failure_code text`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_sequences (tenant text PRIMARY KEY, sequence bigint NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_events (tenant text NOT NULL, sequence bigint NOT NULL, event_id text NOT NULL,
      event jsonb NOT NULL, PRIMARY KEY(tenant,sequence), UNIQUE(tenant,event_id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_cursors (tenant text NOT NULL, consumer text NOT NULL, sequence bigint NOT NULL DEFAULT 0,
      fence bigint NOT NULL DEFAULT 0, lease_owner text, lease_until timestamptz, PRIMARY KEY(tenant,consumer))`,
    `ALTER TABLE cognition_v2_cursors ADD COLUMN IF NOT EXISTS scan_actor text NOT NULL DEFAULT ''`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_inbox (tenant text NOT NULL, consumer text NOT NULL, event_id text NOT NULL,
      attempts integer NOT NULL DEFAULT 0, status text NOT NULL, digest text, next_at timestamptz, PRIMARY KEY(tenant,consumer,event_id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_objects (tenant text NOT NULL, id text NOT NULL, revision integer NOT NULL,
      kind text NOT NULL, data jsonb NOT NULL, sequence bigint NOT NULL, PRIMARY KEY(tenant,id,revision))`,
    `CREATE INDEX IF NOT EXISTS cognition_v2_objects_kind ON cognition_v2_objects(tenant,kind,id,revision DESC)`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_edges (tenant text NOT NULL,id text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(tenant,id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_revocations (tenant text NOT NULL, source text NOT NULL, PRIMARY KEY(tenant,source))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_deliveries (tenant text NOT NULL, id text NOT NULL, actor text NOT NULL,
      card_id text NOT NULL, revision integer NOT NULL, snapshot_id text NOT NULL, status text NOT NULL,
      fence bigint NOT NULL DEFAULT 0, lease_until timestamptz, receipt_id text, PRIMARY KEY(tenant,id))`,
    `ALTER TABLE cognition_v2_deliveries ADD COLUMN IF NOT EXISTS consumer_ref text`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_delivery_recoveries (tenant text NOT NULL,id text NOT NULL,actor text NOT NULL,data jsonb NOT NULL,PRIMARY KEY(tenant,id))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_snapshots (tenant text NOT NULL, id text NOT NULL, actor text NOT NULL,
      data jsonb NOT NULL, PRIMARY KEY(tenant,id))`,
  ]) await db.rawQuery(sql);
}
export class DurableEventSink implements EventSink {
  usesTransactionStore(db: Store): boolean {
    return this.db === db && (this.records === db || (this.records instanceof TenantScopedStore && this.records.usesTransactionStore(db)));
  }
  constructor(private readonly db: Store, private readonly records: Store | TenantScopedStore,
    private readonly tenants: ReadonlySet<string>) {}
  async write(event: SystemEvent): Promise<void> {
    if (!this.tenants.has(event.tenantId)) {
      await this.records.insertIfAbsent(event.owner, "system-events", event);
      return;
    }
    const scoped = currentTenantScope();
    if (scoped && scoped.tenantId !== event.tenantId) throw Error("EVENT_TENANT_SCOPE_MISMATCH");
    await runInTenantScope({ tenantId: event.tenantId, actorId: event.owner }, () => this.db.transaction(async () => {
      // Row lock serializes commit order per tenant. A sequence allocated by a
      // different uncommitted transaction can never be skipped by the reader.
      await this.db.rawQuery(`INSERT INTO cognition_v2_sequences(tenant,sequence) VALUES($1,0) ON CONFLICT DO NOTHING`, [event.tenantId]);
      await this.db.rawQuery(`SELECT sequence FROM cognition_v2_sequences WHERE tenant=$1 FOR UPDATE`, [event.tenantId]);
      const existing = await this.db.rawQuery<{ event: SystemEvent }>(`SELECT event FROM cognition_v2_events WHERE tenant=$1 AND event_id=$2`, [event.tenantId, event.id]);
      if (existing.length) {
        if (digest(existing[0].event) !== digest(event)) throw Error("EVENT_ID_CONFLICT");
        return;
      }
      await this.records.insertIfAbsent(event.owner, "system-events", event);
      const [counter] = await this.db.rawQuery<{ sequence: string }>(`UPDATE cognition_v2_sequences SET sequence=sequence+1 WHERE tenant=$1 RETURNING sequence`, [event.tenantId]);
      await this.db.rawQuery(`INSERT INTO cognition_v2_events(tenant,sequence,event_id,event) VALUES($1,$2,$3,$4::jsonb)`, [event.tenantId, counter.sequence, event.id, JSON.stringify(event)]);
    }));
  }
}
export interface ProjectionLease { tenant: string; consumer: string; fence: number; owner: string }
export interface OrderedEvent { sequence: string; event: SystemEvent }
export class DurableProjector {
  constructor(readonly db: Store, readonly consumer = "cognitive-v2.1", private readonly clock = () => Date.now()) {}
  async acquire(tenant: string, owner: string = randomUUID(), leaseMs = 30000): Promise<ProjectionLease | null> {
    return this.db.transaction(async () => {
      await this.db.rawQuery(`INSERT INTO cognition_v2_cursors(tenant,consumer) VALUES($1,$2) ON CONFLICT DO NOTHING`, [tenant, this.consumer]);
      const rows = await this.db.rawQuery<{ fence: string }>(`UPDATE cognition_v2_cursors SET fence=fence+1,lease_owner=$3,lease_until=$4
        WHERE tenant=$1 AND consumer=$2 AND (lease_until IS NULL OR lease_until <= $5) RETURNING fence`,
      [tenant, this.consumer, owner, new Date(this.clock() + leaseMs).toISOString(), new Date(this.clock()).toISOString()]);
      return rows[0] ? { tenant, consumer: this.consumer, owner, fence: Number(rows[0].fence) } : null;
    });
  }
  async release(lease: ProjectionLease): Promise<void> {
    await this.db.rawQuery(`UPDATE cognition_v2_cursors SET lease_until=NULL WHERE tenant=$1 AND consumer=$2 AND fence=$3 AND lease_owner=$4`, [lease.tenant, lease.consumer, lease.fence, lease.owner]);
  }
  async batch(lease: ProjectionLease, apply: (event: SystemEvent, sequence: string) => Promise<void>, limit = 100): Promise<number> {
    let count = 0;
    for (let i = 0; i < Math.min(500, Math.max(1, limit)); i++) {
      let candidate: OrderedEvent | undefined;
      try {
        const processed = await this.db.transaction(async () => {
          const [cursor] = await this.db.rawQuery<{ sequence: string; fence: string; lease_owner: string; valid: boolean }>(
            `SELECT sequence,fence,lease_owner,lease_until>$3::timestamptz AS valid FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2 FOR UPDATE`,
            [lease.tenant, lease.consumer, new Date(this.clock()).toISOString()]);
          if (!cursor || !cursor.valid || Number(cursor.fence) !== lease.fence || cursor.lease_owner !== lease.owner) throw Error("STALE_FENCE");
          [candidate] = await this.db.rawQuery<OrderedEvent>(`SELECT sequence,event FROM cognition_v2_events WHERE tenant=$1 AND sequence>$2 ORDER BY sequence LIMIT 1`, [lease.tenant, cursor.sequence]);
          if (!candidate) return false;
          const [inbox] = await this.db.rawQuery<{ status: string; next_at: string | null }>(`SELECT status,next_at FROM cognition_v2_inbox WHERE tenant=$1 AND consumer=$2 AND event_id=$3`, [lease.tenant, lease.consumer, candidate.event.id]);
          if (inbox?.status === "retry" && inbox.next_at && Date.parse(inbox.next_at) > this.clock()) return false;
          if (inbox?.status !== "committed" && inbox?.status !== "dead_letter") {
            await apply(candidate.event, candidate.sequence);
            await this.db.rawQuery(`INSERT INTO cognition_v2_inbox(tenant,consumer,event_id,status,digest) VALUES($1,$2,$3,'committed',$4)
              ON CONFLICT(tenant,consumer,event_id) DO UPDATE SET status='committed',digest=$4`, [lease.tenant, lease.consumer, candidate.event.id, digest(candidate.event)]);
          }
          await this.db.rawQuery(`UPDATE cognition_v2_cursors SET sequence=$3 WHERE tenant=$1 AND consumer=$2 AND fence=$4`, [lease.tenant, lease.consumer, candidate.sequence, lease.fence]);
          return true;
        });
        if (!processed) break;
        count++;
      } catch (error) {
        if (!candidate || (error instanceof Error && error.message === "STALE_FENCE")) throw error;
        // Revalidate fence while recording failure: a stale worker cannot
        // overwrite inbox committed by its successor.
        await this.db.transaction(async () => {
          const valid = await this.db.rawQuery(`SELECT tenant FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2 AND fence=$3
            AND lease_owner=$4 AND lease_until>$5 FOR UPDATE`, [lease.tenant, lease.consumer, lease.fence, lease.owner, new Date(this.clock()).toISOString()]);
          if (!valid.length) return;
          await this.db.rawQuery(`INSERT INTO cognition_v2_inbox(tenant,consumer,event_id,attempts,status,next_at)
            VALUES($1,$2,$3,1,'retry',$4) ON CONFLICT(tenant,consumer,event_id) DO UPDATE
            SET attempts=cognition_v2_inbox.attempts+1,
            status=CASE WHEN cognition_v2_inbox.attempts>=4 THEN 'dead_letter' ELSE 'retry' END,next_at=$4
            WHERE cognition_v2_inbox.status NOT IN ('committed','dead_letter')`,
            [lease.tenant, lease.consumer, candidate!.event.id, new Date(this.clock() + 1000).toISOString()]);
        });
        break;
      }
    }
    return count;
  }
}
export class CognitiveProjectionStore {
  constructor(readonly db: Store) {}
  async apply(raw: unknown, sequence: string): Promise<void> {
    const record = cognitiveRecordSchema.parse(raw);
    const dependencies = [record.id, record.sourceEventId, ...record.evidence.map((e) => e.id)];
    for (const source of dependencies) {
      if (await this.revoked(record.tenantId, source)) {
        await this.revoke(record.tenantId, record.id);
        return;
      }
    }
    const [existing] = await this.db.rawQuery<{ data: CognitiveRecord }>(`SELECT data FROM cognition_v2_objects WHERE tenant=$1 AND id=$2 AND revision=$3`, [record.tenantId, record.id, record.revision]);
    if (existing) {
      if (digest(existing.data) !== digest(record)) throw Error("REVISION_CONFLICT");
      return;
    }
    await this.db.rawQuery(`INSERT INTO cognition_v2_objects(tenant,id,revision,kind,data,sequence) VALUES($1,$2,$3,$4,$5::jsonb,$6)`, [record.tenantId, record.id, record.revision, record.kind, JSON.stringify(record), sequence]);
  }
  async revoke(tenant: string, source: string): Promise<void> {
    await this.db.transaction(async () => {
      await this.db.rawQuery(`INSERT INTO cognition_v2_revocations(tenant,source) VALUES($1,$2) ON CONFLICT DO NOTHING`, [tenant, source]);
      // Transitive closure through evidence references: source and logical IDs
      // are tombstoned, so replay cannot resurrect dependent revisions.
      await this.db.rawQuery(`WITH RECURSIVE invalid(id) AS (
        SELECT $2::text UNION
        SELECT o.id FROM cognition_v2_objects o JOIN invalid i ON
          (o.data->>'sourceEventId'=i.id OR EXISTS(SELECT 1 FROM jsonb_array_elements(o.data->'evidence') e WHERE e->>'id'=i.id))
          WHERE o.tenant=$1
      ) INSERT INTO cognition_v2_revocations(tenant,source) SELECT $1,id FROM invalid ON CONFLICT DO NOTHING`, [tenant, source]);
    });
  }
  async revoked(tenant: string, source: string): Promise<boolean> {
    return (await this.db.rawQuery(`SELECT source FROM cognition_v2_revocations WHERE tenant=$1 AND source=$2`, [tenant, source])).length > 0;
  }
  async latest(tenant: string, limit = 500, actor?: string): Promise<CognitiveRecord[]> {
    const rows = await this.db.rawQuery<{ data: CognitiveRecord }>(`SELECT latest.data FROM (
      SELECT DISTINCT ON (id) id,data FROM cognition_v2_objects WHERE tenant=$1 ORDER BY id,revision DESC
    ) latest WHERE NOT EXISTS (SELECT 1 FROM cognition_v2_revocations r WHERE r.tenant=$1 AND r.source=latest.data->>'sourceEventId')
    AND ($3::text IS NULL OR (latest.data->'visibility'->>'scope'='tenant' OR latest.data->'visibility'->>'ownerActorId'=$3))
    ORDER BY latest.id LIMIT $2`, [tenant, Math.min(limit, 2000), actor ?? null]);
    return rows.map((r) => cognitiveRecordSchema.parse(r.data));
  }
}
