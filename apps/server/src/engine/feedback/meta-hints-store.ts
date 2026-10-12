// KERNEL_META_HINTS_DB_V1
import type { Store } from "../../db.ts";
import type { MetaHint } from "../../kernel/observers/meta.ts";

export interface PersistedMetaHint extends MetaHint {
  id: string;
  tenantId: string;
  owner: string;
  turnId: string;
  persistedAt: string;
  consumedAt?: string;
}

export class MetaHintsStore {
  constructor(private readonly db: Store) {}

  async persist(
    tenantId: string,
    owner: string,
    turnId: string,
    hints: MetaHint[],
  ): Promise<PersistedMetaHint[]> {
    const out: PersistedMetaHint[] = [];
    for (let i = 0; i < hints.length; i++) {
      const h = hints[i];
      const value: PersistedMetaHint = {
        ...h,
        id: `mh-${turnId}-${i}`,
        tenantId,
        owner,
        turnId,
        persistedAt: new Date().toISOString(),
      };
      await this.db.put(tenantId, "meta-hints", value);
      out.push(value);
    }
    return out;
  }

  async consume(tenantId: string, id: string): Promise<void> {
    const existing = await this.db.get<PersistedMetaHint>(tenantId, "meta-hints", id);
    if (!existing) return;
    await this.db.put(tenantId, "meta-hints", { ...existing, consumedAt: new Date().toISOString() });
  }

  // KERNEL_META_HINTS_CLEANUP_METHOD_V1
  // KERNEL_META_HINT_INDEX_V1
  async byTurn(tenantId: string, turnId: string): Promise<PersistedMetaHint[]> {
    const all = await this.db.list<PersistedMetaHint>(tenantId, "meta-hints", { limit: 500 });
    return all.filter((h) => h.turnId === turnId);
  }

  async purgeOlderThan(tenantId: string, maxAgeMs: number): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    const all = await this.db.list<PersistedMetaHint>(tenantId, "meta-hints", { limit: 5000 });
    let removed = 0;
    for (const h of all) {
      if (Date.parse(h.persistedAt) < cutoff) {
        await this.db.remove(tenantId, "meta-hints", h.id);
        removed++;
      }
    }
    return removed;
  }

  async pendingForOwner(tenantId: string, owner: string, limit = 20): Promise<PersistedMetaHint[]> {
    const all = await this.db.list<PersistedMetaHint>(tenantId, "meta-hints", { limit });
    return all.filter((h) => h.owner === owner && !h.consumedAt).slice(0, limit);
  }
}