import type { Store } from "../../../db.ts";
import { TenantScopedStore } from "../../../db-tenant.ts";
import { currentTenantScope, runInTenantScope } from "../../../tenant-scope.ts";
import { projectKernelAuditEvent } from "../../../kernel/subscribers/audit-consumer.ts";
import { projectKernelNotificationEvent } from "../../../kernel/subscribers/notifications-consumer.ts";
import { DurableProjector } from "./storage.ts";

/** Replace live-only audit/notification consumers for opted-in V2 tenants. */
export class KernelReceiptProjector {
  readonly runner: DurableProjector;
  private readonly records: TenantScopedStore;
  constructor(db: Store, records: Store | TenantScopedStore, private readonly tenants: ReadonlySet<string>, clock = () => Date.now()) {
    if (records !== db && !(records instanceof TenantScopedStore && records.usesTransactionStore(db))) throw Error("PROJECTION_STORE_MISMATCH");
    this.runner = new DurableProjector(db, "kernel-receipts-v2.1", clock);
    this.records = records instanceof TenantScopedStore ? records : new TenantScopedStore(db, async () => {
      const tenant = currentTenantScope()?.tenantId;
      if (!tenant) throw Error("PROJECTION_TENANT_REQUIRED");
      return tenant;
    });
  }
  async tick(tenant: string, limit = 100): Promise<number> {
    if (!this.tenants.has(tenant)) throw Error("DENIED");
    const lease = await this.runner.acquire(tenant);
    if (!lease) return 0;
    try {
      return await this.runner.batch(lease, async event => {
        if (event.tenantId !== tenant) throw Error("PROJECTION_TENANT_MISMATCH");
        await runInTenantScope({ tenantId: tenant, actorId: "kernel-receipts-worker" }, async () => {
          // Both effects and the inbox/cursor are on the same pinned transaction.
          await projectKernelAuditEvent(this.records, event);
          await projectKernelNotificationEvent(this.records, event);
        });
      }, limit);
    } finally { await this.runner.release(lease); }
  }
}
