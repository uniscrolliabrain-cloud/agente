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
    // META_HINTS_PURGE_CURSOR_V1 - keyset pagination para no cargar 5000 en memoria.
    const cutoff = Date.now() - maxAgeMs;
    let removed = 0;
    let cursorUpdatedAt: string | undefined;
    let cursorId: string | undefined;
    const PAGE = 500;
    for (;;) {
      const page = await this.db.listPaged<PersistedMetaHint>(tenantId, "meta-hints", {
        limit: PAGE,
        ...(cursorUpdatedAt && cursorId ? { cursorUpdatedAt, cursorId } : {}),
      });
      if (page.length === 0) break;
      for (const { data: h } of page) {
        if (Date.parse(h.persistedAt) < cutoff) {
          await this.db.remove(tenantId, "meta-hints", h.id);
          removed++;
        }
      }
      const last = page[page.length - 1];
      cursorUpdatedAt = last.updatedAt;
      cursorId = last.data.id;
      if (page.length < PAGE) break;
    }
    return removed;
  }

  async pendingForOwner(tenantId: string, owner: string, limit = 20): Promise<PersistedMetaHint[]> {
    const all = await this.db.list<PersistedMetaHint>(tenantId, "meta-hints", { limit });
    return all.filter((h) => h.owner === owner && !h.consumedAt).slice(0, limit);
  }
}