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
    await this.db.insertIfAbsent(
      event.owner,
      KIND,
      event as unknown as { id: string },
    );
  }
}

/**
 * StoreQuery: lectura. Separada del sink porque manana KafkaSink no
 * puede implementar "list con filtro" sin un consumer group efimero.
 * Hoy resuelve con SQL nativo sobre records.
 */
export class StoreQuery implements EventQuery {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async recent(owner: string, filter: EventFilter): Promise<SystemEvent[]> {
    const limit = Math.min(filter.limit ?? 100, HARD_LIMIT);
    const rows = await this.db.list<SystemEvent>(owner, KIND);
    const types = filter.type
      ? Array.isArray(filter.type)
        ? filter.type
        : [filter.type]
      : undefined;
    return rows
      .filter((event) => {
        if (types && !types.includes(event.type)) return false;
        if (filter.since && event.emittedAt < filter.since) return false;
        if (filter.until && event.emittedAt > filter.until) return false;
        if (filter.sourceId && event.source.id !== filter.sourceId) return false;
        if (filter.projectId && event.payload?.projectId !== filter.projectId) return false;
        return true;
      })
      .sort((a, b) => b.emittedAt.localeCompare(a.emittedAt) || b.id.localeCompare(a.id))
      .slice(0, limit);
  }

  async aggregate(owner: string, hours: number): Promise<EventAggregate[]> {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    // BUS_AGGREGATE_SQL_V1 - antes traia 5000 eventos a memoria y contaba en
    // JS. Con miles de eventos por hora, el agregado mentia (se truncaba) y
    // la query era pesada. Ahora agrupamos en SQL con GROUP BY. El Store
    // expone `select` para queries arbitrarias de lectura.
    try {
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