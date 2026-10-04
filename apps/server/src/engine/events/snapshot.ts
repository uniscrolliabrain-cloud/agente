// EVENTS_SNAPSHOT_V1 — snapshot del estado observable del bus.
//
// Devuelve un resumen agregado del histórico. Sirve para:
//   - dashboards
//   - detección de anomalías (tipo de evento que sube de golpe)
//   - verificación de retención (qué tipos están guardando mucho)
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md.

import type { EventAggregate, EventQuery, SystemEvent } from "./types.ts";

export interface BusSnapshot {
  owner: string;
  total: number;
  byType: EventAggregate[];
  bySource: Record<string, number>;
  lastEventAt: string | null;
  oldestEventAt: string | null;
}

export async function snapshotBus(
  query: EventQuery,
  owner: string,
  hours = 24,
): Promise<BusSnapshot> {
  const byType = await query.aggregate(owner, hours);
  const events = await query.recent(owner, { limit: 5000 });

  const bySource: Record<string, number> = {};
  for (const event of events) {
    const key = event.source.kind;
    bySource[key] = (bySource[key] ?? 0) + 1;
  }

  const sorted = [...events].sort((a, b) => a.emittedAt.localeCompare(b.emittedAt));
  const oldest: SystemEvent | undefined = sorted[0];
  const newest: SystemEvent | undefined = sorted[sorted.length - 1];

  return {
    owner,
    total: events.length,
    byType,
    bySource,
    oldestEventAt: oldest?.emittedAt ?? null,
    lastEventAt: newest?.emittedAt ?? null,
  };
}
