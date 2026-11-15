import type { Store } from "../../../apps/server/src/db.ts";
import { Kernel } from "../../../apps/server/src/kernel/kernel.ts";
import { StoreTurnStore, type StorePort } from "../../../apps/server/src/kernel/graph/store-store.ts";
import { StoreAuditStore } from "../../../apps/server/src/kernel/audit/store-store.ts";
import { EnvTenantConfigResolver } from "../../../apps/server/src/kernel/config/env-resolver.ts";
export function persistentKernel(db: Store) {
  const port: StorePort = {
    put: async (tenant, kind, _id, value) => { await db.put(tenant, kind, value as { id: string }); },
    get: (tenant, kind, id) => db.get(tenant, kind, id),
    list: async (tenant, kind, limit) => (await db.list<{ id: string }>(tenant, kind, { limit })).map((data) => ({ id: data.id, data })),
    transaction: (fn) => db.transaction(() => fn(port)),
    lockKey: async (tenant, key) => {
      await db.insertIfAbsent(tenant, "kernel-operation-lock", { id: key });
      await db.rawQuery("SELECT id FROM records WHERE owner=$1 AND kind='kernel-operation-lock' AND id=$2 FOR UPDATE", [tenant, key]);
    },
  };
  return new Kernel({ store: new StoreTurnStore(port), tenants: { resolve: async () => "A" }, audit: new StoreAuditStore(db), config: new EnvTenantConfigResolver() });
}
