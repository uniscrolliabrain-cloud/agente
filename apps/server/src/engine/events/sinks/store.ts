import type { Store } from "../../../db.ts";
import type { TenantScopedStore } from "../../../db-tenant.ts";
import type {
  EventAggregate,
  EventFilter,
  EventQuery,
  EventSink,
  SystemEvent,
  SystemEventType,
} from "../types.ts";

const KIND = "system-events";
const HARD_LIMIT = 200;

/**
 * StoreSink: unico sink de escritura hoy. Append-only estricto:
 * usa insertIfAbsent, nunca put ni remove. La purga es un job aparte
 * (EventBus.purge, llamado desde maintain).
 */
export class StoreSink implements EventSink {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async write(event: SystemEvent): Promise<void> {
    // El aislamiento por tenant lo compone el db que se inyecta (TenantScopedStore).
    // Aqui solo se escribe bajo owner plano; si el db es un Store crudo, el bus
    // sigue funcionando igual que antes del multitenant.
    // EVENTS_APPEND_LEGACY_STORE_V1 - un store que no expone el contador
    // (dobles de test, adaptadores anteriores) no puede prometer orden de
    // commit. Se escribe sin posicion y su replay es el scan historico, no el
    // cursor: el bus no finge una garantia que el almacenamiento no da.
    const canSequence =
      typeof (this.db as { nextSequence?: unknown }).nextSequence === "function";
    if (!canSequence) {
      await this.db.insertIfAbsent(
        event.owner,
        KIND,
        event as unknown as { id: string },
      );
      return;
    }
    const append = async () => {
      // EVENTS_COMMIT_SEQUENCE_V1 - la posicion se asigna en el mismo append,
      // bajo el lock del contador por tenant. Contador y fila deben commitear
      // juntos: por eso el append sin transaccion propia abre una.
      const seq = await this.db.nextSequence(event.tenantId, KIND);
      event.seq = seq;
      await this.db.insertIfAbsent(
        event.owner,
        KIND,
        event as unknown as { id: string },
      );
    };
    // EVENTS_APPEND_ATOMIC_V1 - dentro de una transaccion del llamador el lock
    // del contador llega hasta su commit, que es justo la garantia que el
    // cursor necesita. Sin transaccion, el append abre una para no dejar una
    // posicion commiteada sin su fila (o al reves).
    if (this.db.inTransaction) return append();
    await this.db.transaction(append);
  }
}

/**
 * StoreQuery: lectura. Separada del sink porque manana KafkaSink no
 * puede implementar "list con filtro" sin un consumer group efimero.
 * Hoy resuelve con SQL nativo sobre records.
 */
export class StoreQuery implements EventQuery {
  constructor(private readonly db: Store | TenantScopedStore) {}

  // EVENTS_RECENT_SQL_V1 - filtros en SQL cuando el backend los soporta.
  async recent(owner: string, filter: EventFilter): Promise<SystemEvent[]> {
    const limit = Math.min(filter.limit ?? 100, HARD_LIMIT);
    const types = filter.type
      ? Array.isArray(filter.type)
        ? filter.type
        : [filter.type]
      : undefined;
    const selectFn = (this.db as unknown as {
      select?: <T>(sql: string, params: unknown[]) => Promise<T[]>;
    }).select;
    // EVENTBUS_RECENT_SQL_V1
    if (typeof selectFn === "function") {
      try {
        const params: unknown[] = [owner, KIND];
        let sql = "SELECT data FROM records WHERE owner = $1 AND kind = $2";
        if (filter.since) { params.push(filter.since); sql += ` AND (data->>'emittedAt') >= $${params.length}`; }
        if (filter.until) { params.push(filter.until); sql += ` AND (data->>'emittedAt') <= $${params.length}`; }
        if (filter.sourceId) { params.push(filter.sourceId); sql += ` AND (data->'source'->>'id') = $${params.length}`; }
        if (filter.projectId) { params.push(filter.projectId); sql += ` AND (data->'payload'->>'projectId') = $${params.length}`; }
        if (types && types.length > 0) {
          params.push(types);
          sql += ` AND (data->>'type') = ANY($${params.length}::text[])`;
        }
        params.push(limit);
        sql += ` ORDER BY (data->>'emittedAt') DESC, id DESC LIMIT $${params.length}`;
        const rows = await selectFn<{ data: SystemEvent }>(sql, params);
        return rows.map((r) => r.data);
      } catch {
        // Fallback al filtrado en memoria si el SQL no esta soportado.
      }
    }
    const rows = await this.db.list<SystemEvent>(owner, KIND);
    return rows
      .filter((event) => {
        if (types && !types.includes(event.type)) return false;
        if (filter.since && event.emittedAt < filter.since) return false;
        if (filter.until && event.emittedAt > filter.until) return false;
        if (filter.sourceId && event.source.id !== filter.sourceId) return false;
        if (filter.projectId && event.payload?.projectId !== filter.projectId) return false;
        if (filter.sinceId && event.id <= filter.sinceId) return false;
        return true;
      })
      .sort((a, b) => b.emittedAt.localeCompare(a.emittedAt) || b.id.localeCompare(a.id))
      .slice(0, limit);
  }

  /**
   * EVENTS_PAGE_TENANT_V3 - lectura ascendente por tenant con cursor durable.
   *
   * EVENTS_REPLAY_COMMIT_ORDER_V1 - el orden y el cursor usan `seq`, la posicion
   * asignada en el append bajo el lock del contador por tenant, no `emittedAt`
   * ni `updated_at`.
   *
   * `emittedAt` lo fija el productor: una insercion tardia con un timestamp
   * anterior al cursor desaparecia para siempre. `updated_at` usa `now()`, que
   * en Postgres es la hora de INICIO de la transaccion: con dos transacciones
   * concurrentes, la que empieza antes y commitea despues queda con posicion
   * menor que una fila ya visible, y el cursor que avanzo la pierde. `seq` se
   * asigna bajo el lock de fila del contador, que se mantiene hasta el commit,
   * asi que dos escritores del mismo tenant se serializan y toda fila con
   * posicion mayor implica que las menores ya commitearon. Un lector cuyo
   * snapshot ve la posicion N ve tambien todas las anteriores.
   *
   * Un evento sin posicion no puede ordenarse: el cursor deniega en vez de
   * adivinar. El store numera las filas antiguas al arrancar. Filtros y limite
   * se aplican en SQL, nunca despues de truncar.
   */
  async pageTenant(
    tenantId: string,
    filter: EventFilter,
    limit: number,
  ): Promise<SystemEvent[] | null> {
    const selectFn = (
      this.db as unknown as {
        select?: <T>(sql: string, params: unknown[]) => Promise<T[]>;
      }
    ).select?.bind(this.db);
    if (typeof selectFn !== "function") return null;
    const params: unknown[] = [KIND, tenantId];
    let sql = "SELECT data FROM records WHERE kind = $1 AND data->>'tenantId' = $2";
    if (filter.sinceId) {
      const cursorRows = await selectFn<{ data: SystemEvent }>(
        "SELECT data FROM records WHERE kind = $1 AND data->>'tenantId' = $2 AND id = $3",
        [KIND, tenantId, filter.sinceId],
      );
      const cursor = cursorRows[0]?.data;
      if (!cursor) throw new Error(`EVENT_CURSOR_NOT_FOUND: ${filter.sinceId}`);
      if (typeof cursor.seq !== "number")
        throw new Error(`EVENT_CURSOR_NOT_ORDERED: ${filter.sinceId}`);
      params.push(cursor.seq);
      const seqParam = params.length;
      params.push(cursor.id);
      const idParam = params.length;
      sql += ` AND ((data->>'seq')::bigint > $${seqParam}::bigint OR ((data->>'seq')::bigint = $${seqParam}::bigint AND id > $${idParam}))`;
    }
    if (filter.since) {
      params.push(filter.since);
      sql += ` AND (data->>'emittedAt') >= $${params.length}`;
    }
    if (filter.until) {
      params.push(filter.until);
      sql += ` AND (data->>'emittedAt') <= $${params.length}`;
    }
    const types = filter.type
      ? Array.isArray(filter.type)
        ? filter.type
        : [filter.type]
      : undefined;
    if (types && types.length > 0) {
      params.push(types);
      sql += ` AND (data->>'type') = ANY($${params.length}::text[])`;
    }
    params.push(limit);
    sql += ` ORDER BY (data->>'seq')::bigint ASC, id ASC LIMIT $${params.length}`;
    const rows = await selectFn<{ data: SystemEvent }>(sql, params);
    return rows.map((row) => row.data);
  }

  async aggregate(owner: string, hours: number): Promise<EventAggregate[]> {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    // BUS_AGGREGATE_SQL_V1 - antes traia 5000 eventos a memoria y contaba en
    // JS. Con miles de eventos por hora, el agregado mentia (se truncaba) y
    // la query era pesada. Ahora agrupamos en SQL con GROUP BY. El Store
    // expone `select` para queries arbitrarias de lectura.
    try {
      // EVENTBUS_AGGREGATE_SQL_V1
      const rows = await this.db.select<{ type: string; count: number }>(
        `SELECT data->>'type' AS type, count(*)::int AS count
           FROM records
          WHERE owner = $1 AND kind = $2 AND (data->>'emittedAt') >= $3
          GROUP BY data->>'type'
          ORDER BY count DESC`,
        [owner, KIND, since],
      );
      return rows.map((row) => ({ type: row.type as SystemEventType, count: row.count }));
    } catch {
      // Fallback al comportamiento previo si select falla (p. ej. PGlite sin
      // soporte para GROUP BY sobre jsonb). Mantiene la funcionalidad.
      const rows = await this.db.list<SystemEvent>(owner, KIND, { limit: 5000 });
      const counts = new Map<SystemEventType, number>();
      for (const event of rows) {
        if (event.emittedAt < since) continue;
        counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
      }
      return [...counts]
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    }
  }
}