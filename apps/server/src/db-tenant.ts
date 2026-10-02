// TENANT_SCOPED_STORE_V1 - envuelve el Store para aislar por tenant.
//
// Composicion de clave: `${tenantId}:${owner}`. Asi dos owners identicos en
// tenants distintos no colisionan. Todos los metodos del Store pasan por aqui.

import type { ListOptions, Store } from "./db.ts";

export class TenantScopedStore {
  constructor(
    private readonly store: Store,
    private readonly resolver: (owner: string) => Promise<string>,
  ) {}

  private async key(owner: string): Promise<string> {
    const tenantId = await this.resolver(owner);
    return `${tenantId}:${owner}`;
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

  async scan<T>(kind: string, limit = 1000): Promise<{ owner: string; value: T }[]> {
    return this.store.scan<T>(kind, limit);
  }

  async scanByStatus<T>(kind: string, statuses: string[], limit = 1000): Promise<{ owner: string; value: T }[]> {
    return this.store.scanByStatus<T>(kind, statuses, limit);
  }

  async scanByStatusWithCursor<T>(
    kind: string,
    statuses: string[],
    limit: number,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ) {
    return this.store.scanByStatusWithCursor<T>(kind, statuses, limit, cursorUpdatedAt, cursorId);
  }

  async purgeOlderThan(kind: string, days: number): Promise<number> {
    return this.store.purgeOlderThan(kind, days);
  }

  get backend() { return this.store.backend; }
  get pgvectorReady() { return this.store.pgvectorReady; }

  async select<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.store.select<T>(sql, params);
  }

  async rawQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.store.rawQuery<T>(sql, params);
  }

  async recoverInterruptedActions(): Promise<void> {
    return this.store.recoverInterruptedActions();
  }

  close(): Promise<void> { return this.store.close(); }
}