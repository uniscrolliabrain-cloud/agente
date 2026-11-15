import { createHash } from "node:crypto";
import type { CyberClient } from "@agntia/ciberseguridad";
import type { Store } from "../../db.ts";
import { childOutboxSchema, minimizeChildEvent, securityIdentitySchema, type SecurityIdentity,
  type SecurityEventProjection } from "./contracts.ts";
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => [k, canonical(v)]));
  return value;
}
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
export async function installSecurityBridgeV2(db: Store): Promise<void> {
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS cognition_v2_cyber_cursors (tenant text NOT NULL, consumer text NOT NULL, sequence bigint NOT NULL DEFAULT 0, PRIMARY KEY(tenant,consumer))`,
    `CREATE TABLE IF NOT EXISTS cognition_v2_cyber_inbox (tenant text NOT NULL,consumer text NOT NULL,event_id text NOT NULL,sequence bigint NOT NULL,
      content_hash text NOT NULL,projection jsonb NOT NULL,acknowledged boolean NOT NULL DEFAULT false,PRIMARY KEY(tenant,consumer,event_id))`,
  ]) await db.rawQuery(sql);
}
export interface CyberRelayAuthorization {
  current(identity: SecurityIdentity): Promise<boolean>;
  // Resolver authenticates the service principal and scopes SDK to this tenant.
  client(identity: SecurityIdentity): Promise<Pick<CyberClient, "outbox"> & Partial<Pick<CyberClient, "ackOutbox">>>;
}
export interface ChildAckPort {
  // Optional test/transport port. Production defaults to the pinned SDK's
  // verified ackOutbox() method; no generic HTTP transport is introduced.
  acknowledge(identity: SecurityIdentity, input: { eventId: string; consumerId: string; contentHash: string }): Promise<{ id: string; acknowledged: true }>;
}
export class CyberEventRelay {
  constructor(readonly db: Store, private readonly authorization: CyberRelayAuthorization,
    private readonly acknowledger?: ChildAckPort,
    private readonly project?: (projection: SecurityEventProjection, tx: Store) => Promise<void>) {}
  private async check(identity: SecurityIdentity): Promise<void> {
    securityIdentitySchema.parse(identity);
    if (!await this.authorization.current(identity)) throw Error("SECURITY_RELAY_DENIED");
  }
  async run(identity: SecurityIdentity, consumerId: string): Promise<{ committed: number; acknowledged: number; blocked?: string }> {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(consumerId)) throw Error("INVALID_CONSUMER");
    await this.check(identity);
    await this.db.rawQuery(`INSERT INTO cognition_v2_cyber_cursors(tenant,consumer) VALUES($1,$2) ON CONFLICT DO NOTHING`, [identity.tenantId, consumerId]);
    const result: { committed: number; acknowledged: number; blocked?: string } = { committed: 0, acknowledged: 0 };
    // A prior process may have committed locally and lost the ACK response.
    // Recover those receipts before moving the source cursor or polling more.
    const pending = await this.db.rawQuery<{ event_id: string; sequence: string; content_hash: string }>(
      `SELECT event_id,sequence,content_hash FROM cognition_v2_cyber_inbox WHERE tenant=$1 AND consumer=$2 AND acknowledged=false ORDER BY sequence`, [identity.tenantId, consumerId]);
    for (const row of pending) {
      if (!await this.ack(identity, consumerId, row.event_id, row.content_hash, String(row.sequence))) return { ...result, blocked: "CHILD_ACK_PENDING" };
      result.acknowledged++;
    }
    const [cursor] = await this.db.rawQuery<{ sequence: string }>(`SELECT sequence FROM cognition_v2_cyber_cursors WHERE tenant=$1 AND consumer=$2`, [identity.tenantId, consumerId]);
    const client = await this.authorization.client(identity);
    await this.check(identity);
    const response = childOutboxSchema.parse(await client.outbox(consumerId, Number(cursor.sequence)));
    if (response.consumer_id !== consumerId) throw Error("SECURITY_CONSUMER_MISMATCH");
    let previous = Number(cursor.sequence);
    for (const item of response.events) {
      const envelope = item.envelope;
      if (envelope.tenant_id !== identity.tenantId || envelope.sequence <= previous || hash(envelope) !== item.content_hash) throw Error("SECURITY_EVENT_INVALID");
      previous = envelope.sequence;
      const projection = minimizeChildEvent(item);
      const inserted = await this.db.transaction(async (tx) => {
        await this.check(identity);
        const [old] = await tx.rawQuery<{ content_hash: string }>(`SELECT content_hash FROM cognition_v2_cyber_inbox WHERE tenant=$1 AND consumer=$2 AND event_id=$3`, [identity.tenantId, consumerId, envelope.id]);
        if (old && old.content_hash !== item.content_hash) throw Error("SECURITY_EVENT_HASH_CONFLICT");
        const rows = await tx.rawQuery(`INSERT INTO cognition_v2_cyber_inbox(tenant,consumer,event_id,sequence,content_hash,projection)
          VALUES($1,$2,$3,$4,$5,$6::jsonb) ON CONFLICT DO NOTHING RETURNING event_id`,
          [identity.tenantId, consumerId, envelope.id, envelope.sequence, item.content_hash, JSON.stringify(projection)]);
        const [stored] = await tx.rawQuery<{ content_hash: string }>(`SELECT content_hash FROM cognition_v2_cyber_inbox WHERE tenant=$1 AND consumer=$2 AND event_id=$3`, [identity.tenantId, consumerId, envelope.id]);
        if (!stored || stored.content_hash !== item.content_hash) throw Error("SECURITY_EVENT_HASH_CONFLICT");
        if (rows.length && this.project) await this.project(projection, tx);
        return rows.length > 0;
      });
      if (inserted) result.committed++;
      // ACK outside and strictly after local transaction commit.
      if (!await this.ack(identity, consumerId, envelope.id, item.content_hash, String(envelope.sequence))) return { ...result, blocked: "CHILD_ACK_PENDING" };
      result.acknowledged++;
    }
    return result;
  }
  private async ack(identity: SecurityIdentity, consumerId: string, eventId: string, contentHash: string, sequence: string): Promise<boolean> {
    await this.check(identity);
    try {
      const client = this.acknowledger ? undefined : await this.authorization.client(identity);
      const receipt = this.acknowledger
        ? await this.acknowledger.acknowledge(identity, { eventId, consumerId, contentHash })
        : client?.ackOutbox
          ? await client.ackOutbox(eventId, { consumer_id: consumerId, content_hash: contentHash })
          : undefined;
      if (!receipt) return false;
      if (receipt.id !== eventId || receipt.acknowledged !== true) return false;
    } catch { return false; }
    await this.db.transaction(async (tx) => {
      await this.check(identity);
      await tx.rawQuery(`UPDATE cognition_v2_cyber_inbox SET acknowledged=true WHERE tenant=$1 AND consumer=$2 AND event_id=$3 AND content_hash=$4`, [identity.tenantId, consumerId, eventId, contentHash]);
      await tx.rawQuery(`UPDATE cognition_v2_cyber_cursors SET sequence=GREATEST(sequence,$3::bigint) WHERE tenant=$1 AND consumer=$2`, [identity.tenantId, consumerId, sequence]);
    });
    return true;
  }
}
