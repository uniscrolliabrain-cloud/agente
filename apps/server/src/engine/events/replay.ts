// EVENTS_REPLAY_V1 — reproduce eventos desde un timestamp o desde un id.
//
// Útil para:
//   - debug de un bug en producción (reproducir la secuencia)
//   - migrar consumidores nuevos (alimentarlos con el histórico)
//   - reproducir en tests sin tocar la DB
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md.

import type { SystemEvent } from "./types.ts";
import type { EventQuery } from "./types.ts";

export interface ReplayOptions {
  /** Reproduce desde este timestamp. */
  from?: string;
  /** Reproduce hasta este timestamp. */
  to?: string;
  /** Filtro por tipo. */
  types?: string[];
  /** Tope de eventos a devolver. Default 1000. */
  limit?: number;
}

export interface ReplayResult {
  events: SystemEvent[];
  truncated: boolean;
}

export async function replayEvents(
  query: EventQuery,
  owner: string,
  options: ReplayOptions = {},
): Promise<ReplayResult> {
  const limit = Math.min(options.limit ?? 1000, 10_000);
  const events = await query.recent(owner, {
    ...(options.from ? { since: options.from } : {}),
    ...(options.to ? { until: options.to } : {}),
    ...(options.types && options.types.length === 1 ? { type: options.types[0] as never } : {}),
    limit,
  });
  let filtered = events;
  if (options.types && options.types.length > 1) {
    const set = new Set(options.types);
    filtered = events.filter((e) => set.has(e.type));
  }
  return {
    events: filtered,
    truncated: events.length >= limit,
  };
}
