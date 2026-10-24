// KERNEL_THOUGHT_INDEX_QUERY_V1
import type { Store } from "../../db.ts";

export interface IndexedThought {
  id: string;
  tenantId: string;
  owner: string;
  type: string;
  turnId: string;
  role: string;
  indexedAt: string;
}

export class KernelThoughtIndex {
  constructor(private readonly db: Store) {}

  // KERNEL_INDEX_SQL_QUERY_V1
  async byTurn(tenantId: string, turnId: string, limit = 200): Promise<IndexedThought[]> {
    try {
      const rows = await this.db.select<IndexedThought>(
        "SELECT data FROM records WHERE kind='kernel-thought-index' AND (data->>'tenantId')=$1 AND (data->>'turnId')=$2 LIMIT $3",
        [tenantId, turnId, limit],
      );
      return rows;
    } catch {
      const all = await this.db.list<IndexedThought>(tenantId, "kernel-thought-index", { limit });
      return all.filter((t) => t.turnId === turnId).slice(0, limit);
    }
  }

  // KERNEL_INDEX_SQL_BY_ROLE_V1
  async byRole(tenantId: string, role: string, limit = 100): Promise<IndexedThought[]> {
    try {
      const rows = await this.db.select<IndexedThought>(
        "SELECT data FROM records WHERE kind='kernel-thought-index' AND (data->>'tenantId')=$1 AND (data->>'role')=$2 LIMIT $3",
        [tenantId, role, limit],
      );
      return rows;
    } catch {
      const all = await this.db.list<IndexedThought>(tenantId, "kernel-thought-index", { limit });
      return all.filter((t) => t.role === role).slice(0, limit);
    }
  }

  async byOwner(tenantId: string, owner: string, limit = 100): Promise<IndexedThought[]> {
    const all = await this.db.list<IndexedThought>(tenantId, "kernel-thought-index", { limit });
    return all.filter((t) => t.owner === owner).slice(0, limit);
  }
}