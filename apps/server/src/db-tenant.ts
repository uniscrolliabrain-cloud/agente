// TENANT_SCOPED_STORE_V1 - envuelve el Store para aislar por tenant.
//
// Composicion de clave: `${tenantId}:${owner}`. Asi dos owners identicos en
// tenants distintos no colisionan. Todos los metodos del Store pasan por aqui.

import type { ListOptions, Store } from "./db.ts";
import { currentTenantScope } from "./tenant-scope.ts";

/**
 * VS01_TENANT_KEY_V1 - el tenant de una fila es el prefijo de su clave fisica.
 *
 * La clave es lo unico que el store garantiza: se escribio bajo ese tenant y
 * se lee bajo ese tenant. Por eso el contexto de una tarea en background sale
 * de aqui y no de la membership del owner, que puede haber cambiado desde que
 * la tarea se encolo (o puede ser su empresa primaria y no aquella en la que
 * el trabajo se creo).
 *
 * Devuelve "" cuando la fila se escribio sin prefijo (registros anteriores al
 * scoping multi-tenant): ese caso no se adivina, se trata aparte.
 */
export function tenantIdFromKey(composed: string): string {
  const idx = composed.indexOf(":");
  return idx > 0 ? composed.slice(0, idx) : "";
}

/** Fila con el tenant del que procede, ya separado del owner. */
export interface ScopedRow<T> {
  owner: string;
  /** "" si la fila no tiene prefijo de tenant (legacy). */
  tenantId: string;
  value: T;
}

/** Fila paginada por cursor: conserva la posicion del cursor del store. */
export interface ScopedCursorRow<T> extends ScopedRow<T> {
  updatedAt: string;
  id: string;
}

/**
 * VS01_TENANT_OF_ROW_V1 - tenant de una fila venga del store que venga.
 *
 * `Service` acepta Store o TenantScopedStore: el primero no devuelve tenantId
 * (no hay scoping), el segundo si. Este helper evita que cada call site tenga
 * que distinguir, y cae al tenant persistido en la propia tarea cuando la fila
 * no lo trae. Devuelve "" si no hay dato: el llamante decide (cuarentena), no
 * se inventa un tenant.
 */
export function tenantOfRow(row: { tenantId?: string; value: unknown }): string {
  const stored = (row.value as { tenantId?: string } | null | undefined)?.tenantId;
  return row.tenantId || stored || "";
}

/** Contexto de una fila en un bucle de background. */
export type BackgroundContext =
  | { kind: "unscoped" }
  | { kind: "scoped"; tenantId: string }
  | { kind: "quarantine"; reason: "no-context" | "tenant-mismatch" };

/**
 * VS01_BACKGROUND_CONTEXT_V1 - de donde sale el tenant de una fila de fondo.
 *
 * Distingue tres casos que antes se confundian en uno:
 *  - `unscoped`: el store no tiene scoping (un solo espacio de nombres). Se
 *    ejecuta como siempre; no hay tenant que elegir.
 *  - `scoped`: hay tenant, y sale de la clave fisica o del campo persistido.
 *  - `quarantine`: la fila esta en un store scoped y no trae tenant, o trae dos
 *    distintos. No se ejecuta bajo la membership: eso seria elegir por el
 *    cliente con el unico dato que no acredita la empresa del trabajo.
 */
export function backgroundContext(record: {
  tenantId?: string;
  value?: unknown;
}): BackgroundContext {
  const keyTenant = (("tenantId" in record ? record.tenantId : undefined) ?? "").trim();
  const fieldTenant = (
    (record.value as { tenantId?: string } | null | undefined)?.tenantId ?? ""
  ).trim();
  if (keyTenant && fieldTenant && keyTenant !== fieldTenant)
    return { kind: "quarantine", reason: "tenant-mismatch" };
  if (keyTenant) return { kind: "scoped", tenantId: keyTenant };
  if (fieldTenant) return { kind: "scoped", tenantId: fieldTenant };
  return "tenantId" in record
    ? { kind: "quarantine", reason: "no-context" }
    : { kind: "unscoped" };
}

export class TenantScopedStore {
  constructor(
    private readonly store: Store,
    private readonly resolver: (owner: string) => Promise<string>,
  ) {}

  // DB_TENANT_SCOPED_DEFAULT_V1
  // VS01_SCOPE_PRECEDENCE_V1 - el scope de la peticion/tarea manda sobre la
  // membership del owner. Antes este metodo preguntaba siempre al resolver, asi
  // que cualquier consumidor de background solo estaba aislado si el resolver
  // inyectado miraba el scope. Una tarea de la empresa B ejecutada por un
  // worker cuyo resolver devolvia la primaria acababa escribiendo en la A. La
  // composicion de clave es donde vive el aislamiento, no en cada llamante.
  private async key(owner: string): Promise<string> {
    const scoped = currentTenantScope()?.tenantId;
    const tenantId = scoped || (await this.resolver(owner));
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

  /**
   * TENANT_PREFIXES_SET_V1 Ã¢â‚¬â€ los prefijos vistos durante la vida del proceso.
   * Antes se guardaba solo el ÃƒÂºltimo en una variable; ahora se acumulan
   * en un Set para que un `scan` global pueda iterar por todos.
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  allTenantPrefixes(): string[] {
    return [...this.tenantPrefixes];
  }

  /**
   * TENANT_SCAN_BY_PREFIX_V1 Ã¢â‚¬â€ scan explÃƒÂ­cito por un prefijo concreto.
   * ÃƒÅ¡til en `maintain` cuando ya sabemos el tenant a mantener.
   */
  async scanByPrefix<T>(
    kind: string,
    tenantId: string,
    limit = 500,
  ): Promise<{ owner: string; value: T }[]> {
    const storeWithPrefix = this.store as Store & {
      scanByOwnerPrefix?: <U>(
        kind: string,
        ownerPrefix: string,
        limit: number,
      ) => Promise<{ owner: string; value: U }[]>;
    };
    if (typeof storeWithPrefix.scanByOwnerPrefix !== "function") {
      // Fallback: scan global y filtro en memoria.
      const rows = await this.store.scan<T>(kind, limit * 4);
      return rows
        .filter((r) => r.owner.startsWith(`${tenantId}:`))
        .map((r) => ({ owner: this.peel(r.owner), value: r.value }))
        .slice(0, limit);
    }
    const rows = await storeWithPrefix.scanByOwnerPrefix<T>(kind, `${tenantId}:`, limit);
    return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
  }

  // VS01_SCAN_ALL_TENANTS_V1 - antes este scan se quedaba con UN prefijo: el
  // primero que este proceso hubiera resuelto (`tenantPrefixes.values().next()`).
  // Con dos empresas activas eso significaba que el mantenimiento, la
  // recuperacion y el worker solo veian el trabajo de una de ellas, y cual era
  // dependia del orden de llegada de las peticiones. Tras un reinicio, las
  // tareas de una empresa sin trafico no se veian nunca.
  //
  // El aislamiento no se pierde por devolver todas las filas: se mantiene en
  // (a) la composicion de clave al leer/escribir, y (b) el scope por fila que
  // aplica cada consumidor de background con `row.tenantId`. Ocultar trabajo
  // de un tenant no era aislamiento: era trabajo perdido.
  async scan<T>(kind: string, limit = 1000): Promise<ScopedRow<T>[]> {
    const rows = await this.store.scan<T>(kind, limit);
    return rows.map((r) => ({
      owner: this.peel(r.owner),
      tenantId: tenantIdFromKey(r.owner),
      value: r.value,
    }));
  }

  // VS01_SCAN_ALL_TENANTS_V1 - mismo motivo que `scan`. Los consumidores son
  // bucles de background (worker, recuperacion, mantenimiento): necesitan todas
  // las empresas, no solo las que este proceso ya ha atendido. El filtro por
  // prefijo se conserva solo en `scanByPrefix`, donde el tenant es explicito.
  async scanByStatus<T>(
    kind: string,
    statuses: string[],
    limit = 1000,
  ): Promise<ScopedRow<T>[]> {
    const rows = await this.store.scanByStatus<T>(kind, statuses, limit);
    return rows.map((r) => ({
      owner: this.peel(r.owner),
      tenantId: tenantIdFromKey(r.owner),
      value: r.value,
    }));
  }

  // VS01_SCAN_ALL_TENANTS_V1 - el filtro por "prefijos vistos" tambien aqui
  // escondia trabajo de empresas que este proceso aun no habia atendido: tras
  // un reinicio, una tarea encolada en la empresa B no se recuperaba si el
  // primer trafico habia sido de la A.
  async scanByStatusWithCursor<T>(
    kind: string,
    statuses: string[],
    limit: number,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ): Promise<ScopedCursorRow<T>[]> {
    const rows = await this.store.scanByStatusWithCursor<T>(
      kind,
      statuses,
      limit,
      cursorUpdatedAt,
      cursorId,
    );
    return rows.map((r) => ({
      owner: this.peel(r.owner),
      tenantId: tenantIdFromKey(r.owner),
      value: r.value,
      updatedAt: r.updatedAt,
      id: r.id,
    }));
  }

  /**
   * TENANT_SCAN_PEEL_V1 - quita el prefijo "tenantId:" de una clave compuesta.
   * Si no hay prefijo (fila escrita sin tenant), devuelve el owner tal cual.
   * El separador es el primero ":" que separa tenantId de owner.
   * Como los tenantId no contienen ":", esto es seguro.
   */
  // DB_TENANT_PEEL_V1
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