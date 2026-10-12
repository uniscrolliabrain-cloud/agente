// KERNEL_TURN_INDEX_QUERY_V1
import type { Store } from "../../db.ts";

export interface IndexedTurn {
  id: string;
  tenantId: string;
  owner: string;
  triggers: string[];
  openedAt: string;
}

export class KernelTurnIndex {
  constructor(private readonly db: Store) {}

  // KERNEL_TURN_INDEX_SQL_RECENT_V1
  async recent(tenantId: string, limit = 100): Promise<IndexedTurn[]> {
    try {
      const rows = await this.db.select<IndexedTurn>(
        "SELECT data FROM records WHERE kind='kernel-turn-index' AND (data->>'tenantId')=$1 ORDER BY (data->>'openedAt') DESC LIMIT $2",
        [tenantId, limit],
      );
      return rows;
    } catch {
      const all = await this.db.list<IndexedTurn>(tenantId, "kernel-turn-index", { limit });
      return all.sort((a, b) => b.openedAt.localeCompare(a.openedAt)).slice(0, limit);
    }
  }

  // KERNEL_TURN_INDEX_SQL_OWNER_V1
  async byOwner(tenantId: string, owner: string, limit = 100): Promise<IndexedTurn[]> {
    try {
      const rows = await this.db.select<IndexedTurn>(
        "SELECT data FROM records WHERE kind='kernel-turn-index' AND (data->>'tenantId')=$1 AND (data->>'owner')=$2 ORDER BY (data->>'openedAt') DESC LIMIT $3",
        [tenantId, owner, limit],
      );
      return rows;
    } catch {
      const all = await this.db.list<IndexedTurn>(tenantId, "kernel-turn-index", { limit });
      return all
        .filter((t) => t.owner === owner)
        .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
        .slice(0, limit);
    }
  }

  async byTrigger(tenantId: string, trigger: string, limit = 100): Promise<IndexedTurn[]> {
    const all = await this.db.list<IndexedTurn>(tenantId, "kernel-turn-index", { limit });
    return all.filter((t) => t.triggers.includes(trigger)).slice(0, limit);
  }
}