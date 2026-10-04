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
    this.tenantPrefixes.add(tenantId);
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

  // TENANT_SCAN_SQL_FILTER_V1 - registramos los prefijos de tenant vistos
  // para poder filtrar en SQL. Antes scan traia filas de TODOS los tenants
  // y el caller filtraba en memoria (50x trabajo con 50 tenants).
  private readonly tenantPrefixes = new Set<string>();

  async scan<T>(kind: string, limit = 1000): Promise<{ owner: string; value: T }[]> {
    // TENANT_SCAN_PEEL_V1 - el store subyacente guarda owner = "tenantId:owner".
    // El caller (TaskWorker) espera el owner limpio para poder volver a componer
    // la clave al hacer compareAndSwap/get. Si devolveramos el owner compuesto,
    // el worker compondria doble y no encontraria la tarea.
    // TENANT_SCAN_SQL_FILTER_V1 - si el store subyacente expone
    // scanByOwnerPrefix, filtramos en SQL por tenant. Si no, caemos al scan
    // sin filtro (comportamiento previo).
    const storeWithPrefix = this.store as Store & {
      scanByOwnerPrefix?: <U>(
        kind: string,
        ownerPrefix: string,
        limit: number,
      ) => Promise<{ owner: string; value: U }[]>;
    };
    const prefix = this.tenantPrefixes.values().next().value;
    if (prefix && typeof storeWithPrefix.scanByOwnerPrefix === "function") {
      try {
        const rows = await storeWithPrefix.scanByOwnerPrefix<T>(kind, `${prefix}:`, limit);
        return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
      } catch {
        // Fallback al scan sin filtro si la query falla.
      }
    }
    const rows = await this.store.scan<T>(kind, limit);
    return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
  }

  async scanByStatus<T>(kind: string, statuses: string[], limit = 1000): Promise<{ owner: string; value: T }[]> {
    const rows = await this.store.scanByStatus<T>(kind, statuses, limit);
    return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
  }

  async scanByStatusWithCursor<T>(
    kind: string,
    statuses: string[],
    limit: number,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ) {
    const rows = await this.store.scanByStatusWithCursor<T>(kind, statuses, limit, cursorUpdatedAt, cursorId);
    return rows.map((r) => ({ ...r, owner: this.peel(r.owner) }));
  }

  /**
   * TENANT_SCAN_PEEL_V1 - quita el prefijo "tenantId:" de una clave compuesta.
   * Si no hay prefijo (fila escrita sin tenant), devuelve el owner tal cual.
   * El separador es el primero ":" que separa tenantId de owner.
   * Como los tenantId no contienen ":", esto es seguro.
   */
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    return idx >= 0 ? composed.slice(idx + 1) : composed;
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