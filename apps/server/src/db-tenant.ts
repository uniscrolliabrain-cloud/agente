// TENANT_SCOPED_STORE_V1 - envuelve el Store para aislar por tenant.
//
// Composicion de clave: `${tenantId}:${owner}`. Asi dos owners identicos en
// tenants distintos no colisionan. Todos los metodos del Store pasan por aqui.

import type { ListOptions, Store } from "./db.ts";
import { currentTenantScope } from "./tenant-scope.ts";

export interface TenantRecord<T> {
  owner: string;
  value: T;
  storageOwner: string;
  tenantId?: string;
  storageId?: string;
}

export class TenantScopedStore {
  constructor(
    private readonly store: Store,
    private readonly resolver: (owner: string) => Promise<string>,
  ) {}

  // DB_TENANT_SCOPED_DEFAULT_V1
  private async key(owner: string): Promise<string> {
    const tenantId = currentTenantScope()?.tenantId ?? await this.resolver(owner);
    this.tenantPrefixes.add(tenantId);
    return this.storageKey(tenantId, owner);
  }

  private storageKey(tenantId: string, owner: string): string {
    if (!tenantId || tenantId.includes(":") || !owner) throw new Error("Invalid physical tenant/owner");
    return tenantId + ":" + owner;
  }
  private origin<T>(row: { owner: string; value: T }): TenantRecord<T> {
    const at = row.owner.indexOf(":");
    return {
      owner: at > 0 ? row.owner.slice(at + 1) : row.owner,
      value: row.value,
      storageOwner: row.owner,
      ...(at > 0 ? { tenantId: row.owner.slice(0, at) } : {}),
    };
  }

  async get<T = Record<string, unknown>>(owner: string, kind: string, id: string): Promise<T | null> {
    return this.store.get<T>(await this.key(owner), kind, id);
  }

  async list<T = Record<string, unknown>>(owner: string, kind: string, options: ListOptions = {}): Promise<T[]> {
    return this.store.list<T>(await this.key(owner), kind, options);
  }

  async listPaged<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    options: ListOptions = {},
  ): Promise<{ data: T; updatedAt: string }[]> {
    return this.store.listPaged<T>(await this.key(owner), kind, options);
  }

  async count(owner: string, kind: string): Promise<number> {
    return this.store.count(await this.key(owner), kind);
  }

  async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
    return this.store.put(await this.key(owner), kind, value);
  }

  async remove(owner: string, kind: string, id: string): Promise<void> {
    return this.store.remove(await this.key(owner), kind, id);
  }

  async compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    return this.store.compareAndSwap<T>(await this.key(owner), kind, id, expected, patch);
  }

  async getInTenant<T = Record<string, unknown>>(
    tenantId: string,
    owner: string,
    kind: string,
    id: string,
  ): Promise<T | null> {
    return this.store.get<T>(this.storageKey(tenantId, owner), kind, id);
  }
  async listPagedInTenant<T = Record<string, unknown>>(
    tenantId: string,
    owner: string,
    kind: string,
    options: ListOptions = {},
  ): Promise<{ data: T; updatedAt: string }[]> {
    return this.store.listPaged<T>(this.storageKey(tenantId, owner), kind, options);
  }
  async putInTenant<T extends { id: string }>(tenantId: string, owner: string, kind: string, value: T): Promise<T> {
    return this.store.put(this.storageKey(tenantId, owner), kind, value);
  }
  /** Server background operation: use the verified physical tenant, never a membership. */
  async compareAndSwapInTenant<T>(
    tenantId: string,
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    return this.store.compareAndSwap<T>(this.storageKey(tenantId, owner), kind, id, expected, patch);
  }
  /** Quarantine a scanned record at its exact physical key, including unscoped legacy records. */
  async compareAndSwapBackground<T>(
    record: TenantRecord<unknown>,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    return this.store.compareAndSwap<T>(record.storageOwner, kind, record.storageId ?? id, expected, patch);
  }

  async insertIfAbsent<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T | null> {
    return this.store.insertIfAbsent(await this.key(owner), kind, value);
  }

  async claim<T>(owner: string, id: string, status: string, now: string): Promise<T | null> {
    return this.store.claim(await this.key(owner), id, status, now);
  }

  async take<T>(owner: string, kind: string, id: string): Promise<T | null> {
    return this.store.take<T>(await this.key(owner), kind, id);
  }

  async updateCredential(owner: string, connectionId: string, secret: string): Promise<boolean> {
    return this.store.updateCredential(await this.key(owner), connectionId, secret);
  }

  async transaction<T>(fn: (tx: TenantScopedStore) => Promise<T>): Promise<T> {
    return this.store.transaction(() => fn(this));
  }

  // Prefixes are diagnostic only; durable background discovery never depends on them.
  private readonly tenantPrefixes = new Set<string>();

  /**
   * TENANT_PREFIXES_SET_V1 Ã¢â‚¬â€ los prefijos vistos durante la vida del proceso.
   * Antes se guardaba solo el ÃƒÂºltimo en una variable; ahora se acumulan
   * en un Set para que un `scan` global pueda iterar por todos.
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  allTenantPrefixes(): string[] {
    return [...this.tenantPrefixes];
  }

  async scanByPrefix<T>(kind: string, tenantId: string, limit = 500): Promise<TenantRecord<T>[]> {
    this.storageKey(tenantId, "validation");
    const rows = await this.store.scanByOwnerPrefix<T>(kind, tenantId + ":", limit);
    return rows.map((row) => this.origin(row));
  }
  async scan<T>(kind: string, limit = 1000): Promise<TenantRecord<T>[]> {
    const tenantId = currentTenantScope()?.tenantId;
    if (tenantId) return this.scanByPrefix<T>(kind, tenantId, limit);
    return (await this.store.scan<T>(kind, limit)).map((row) => this.origin(row));
  }
  /** Privileged scheduler scan, independent of observed prefixes and HTTP scopes. */
  async scanBackgroundByStatus<T>(kind: string, statuses: string[], limit = 1000): Promise<TenantRecord<T>[]> {
    const rows = await this.store.scanByStatusWithCursor<T>(kind, statuses, limit);
    return rows.map((row) => ({ ...this.origin(row), storageId: row.id }));
  }
  async scanByStatus<T>(kind: string, statuses: string[], limit = 1000): Promise<TenantRecord<T>[]> {
    const tenantId = currentTenantScope()?.tenantId;
    if (!tenantId) return this.scanBackgroundByStatus<T>(kind, statuses, limit);
    const rows = await this.statusRows<T>(kind, statuses, limit, tenantId);
    return rows.map((row) => this.origin({ owner: row.owner, value: row.data }));
  }
  private async statusRows<T>(
    kind: string,
    statuses: string[],
    limit: number,
    tenantId: string,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ): Promise<{ owner: string; data: T; updated_at: string | Date; id: string }[]> {
    if (!statuses.length) return [];
    this.storageKey(tenantId, "validation");
    const prefix = tenantId + ":";
    const params: unknown[] = [kind, prefix, statuses];
    let sql =
      "SELECT owner,data,updated_at,id FROM records WHERE kind=$1 AND left(owner,length($2))=$2 AND data->>'status'=ANY($3::text[])";
    if (cursorUpdatedAt !== undefined && cursorId !== undefined) {
      params.push(cursorUpdatedAt, cursorId);
      sql += " AND (updated_at,id)>($4::timestamptz,$5)";
    }
    params.push(Math.min(Math.max(1, Math.floor(limit)), 50000));
    sql += " ORDER BY updated_at ASC,id ASC LIMIT $" + params.length;
    return this.store.select(sql, params);
  }
  async scanByStatusWithCursor<T>(
    kind: string,
    statuses: string[],
    limit: number,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ): Promise<(TenantRecord<T> & { updatedAt: string; id: string })[]> {
    const tenantId = currentTenantScope()?.tenantId;
    if (!tenantId)
      return (await this.store.scanByStatusWithCursor<T>(kind, statuses, limit, cursorUpdatedAt, cursorId)).map(
        (row) => ({ ...this.origin(row), updatedAt: row.updatedAt, id: row.id }),
      );
    const rows = await this.statusRows<T>(kind, statuses, limit, tenantId, cursorUpdatedAt, cursorId);
    return rows.map((row) => ({
      ...this.origin({ owner: row.owner, value: row.data }),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
      id: row.id,
    }));
  }

  async scanOwnerByStatus<T>(
    tenantId: string,
    owner: string,
    kind: string,
    statuses: string[],
    limit: number,
    cursor?: { updatedAt: string; id: string },
  ): Promise<(TenantRecord<T> & { updatedAt: string; storageId: string })[]> {
    const params: unknown[] = [this.storageKey(tenantId, owner), kind, statuses];
    let sql = "SELECT owner, data, updated_at::text AS updated_at, id FROM records " +
      "WHERE owner=$1 AND kind=$2 AND data->>'status'=ANY($3::text[])";
    if (cursor) {
      params.push(cursor.updatedAt, cursor.id);
      sql += " AND (updated_at,id)>($4::timestamptz,$5)";
    }
    params.push(limit);
    sql += " ORDER BY updated_at ASC,id ASC LIMIT $" + params.length;
    const rows = await this.store.select<{ owner: string; data: T; updated_at: string; id: string }>(sql, params);
    return rows.map((row) => ({
      ...this.origin({ owner: row.owner, value: row.data }),
      updatedAt: row.updated_at,
      storageId: row.id,
    }));
  }

  async purgeOlderThan(kind: string, days: number): Promise<number> {
    return this.store.purgeOlderThan(kind, days);
  }

  get backend() {
    return this.store.backend;
  }
  get pgvectorReady() {
    return this.store.pgvectorReady;
  }

  async select<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.store.select<T>(sql, params);
  }

  async rawQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.store.rawQuery<T>(sql, params);
  }

  async recoverInterruptedActions(): Promise<void> {
    return this.store.recoverInterruptedActions();
  }

  close(): Promise<void> {
    return this.store.close();
  }
}
