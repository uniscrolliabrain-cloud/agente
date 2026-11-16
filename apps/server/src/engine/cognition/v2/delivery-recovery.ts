import { randomUUID } from "node:crypto";
import type { CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import { runInTenantScope } from "../../../tenant-scope.ts";
import { CardDeliveryLedger } from "./context.ts";
import { DurableProjector } from "./storage.ts";

/** Separate, bounded recovery loop; no provider invocation or implicit ACK. */
export class DeliveryRecoveryWorker {
  private readonly leases: DurableProjector;
  constructor(readonly ledger: CardDeliveryLedger, private readonly tenants: ReadonlySet<string>,
    private readonly authorize: (tenant: string, actor: string) => Promise<CognitiveIdentity | null>,
    private readonly clock = () => Date.now()) {
    this.leases = new DurableProjector(ledger.context.projections.db, "delivery-recovery-v2", clock);
  }
  async tick(tenant: string, limit = 20): Promise<number> {
    if (!this.tenants.has(tenant)) throw Error("DENIED");
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw Error("INVALID_RECOVERY_LIMIT");
    const lease = await this.leases.acquire(tenant, randomUUID(), 30000);
    if (!lease) return 0;
    const db = this.ledger.context.projections.db;
    try {
      const [cursor] = await db.rawQuery<{ scan_actor: string }>(`SELECT scan_actor FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2`, [tenant, lease.consumer]);
      const actors = await db.rawQuery<{ actor: string }>(`SELECT DISTINCT actor FROM cognition_v2_deliveries
        WHERE tenant=$1 AND actor>$2 AND status IN ('leased','rendered') AND lease_until<=$3 ORDER BY actor LIMIT $4`,
        [tenant, cursor.scan_actor, new Date(this.clock()).toISOString(), limit]);
      let count = 0;
      for (const { actor } of actors) {
        const identity = await this.authorize(tenant, actor);
        if (!identity) continue; // No impersonation or writes after membership revocation.
        if (identity.tenantId !== tenant || identity.actorId !== actor || identity.owner !== actor) throw Error("RECOVERY_SCOPE_MISMATCH");
        count += await runInTenantScope({ tenantId: tenant, actorId: actor }, () => this.ledger.recover(identity));
      }
      // Cursor is durable even when a page contains only disabled actors. On
      // wrap, an actor whose authorization is restored is considered again.
      const updated = await db.rawQuery(`UPDATE cognition_v2_cursors SET scan_actor=$5
        WHERE tenant=$1 AND consumer=$2 AND fence=$3 AND lease_owner=$4 AND lease_until>$6 RETURNING tenant`,
        [tenant, lease.consumer, lease.fence, lease.owner, actors.at(-1)?.actor ?? "", new Date(this.clock()).toISOString()]);
      if (!updated.length) throw Error("STALE_FENCE");
      return count;
    } finally { await this.leases.release(lease); }
  }
}
