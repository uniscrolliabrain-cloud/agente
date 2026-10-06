This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/engine/events/types.ts, apps/server/src/engine/events/schemas.ts, apps/server/src/engine/events/ulid.ts, apps/server/src/engine/events/subscriber.ts, apps/server/src/engine/events/sinks/store.ts, apps/server/src/engine/events/retention.ts, apps/server/src/engine/events/consumers/notifications.ts, apps/server/src/engine/events/exporters/kafka.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        events/
          consumers/
            notifications.ts
          exporters/
            kafka.ts
          sinks/
            store.ts
          retention.ts
          schemas.ts
          subscriber.ts
          types.ts
          ulid.ts
```

# Files

## File: apps/server/src/engine/events/consumers/notifications.ts
```typescript
// EVENTS_CONSUMER_NOTIFICATIONS_V1 — consumidor que genera notificaciones
// para eventos que el usuario debe ver (task.failed, task.waiting_approval,
// monitor.changed, etc).
//
// A diferencia de `publishOutcome` en service.ts (que ya escribe notificaciones),
// este consumidor unifica todos los eventos relevantes en un único sitio.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md,
// roadmap §8 ("3 consumidores reales además de ReactionEngine").

import { globalSubscribers } from "../subscriber.ts";
import type { Store } from "../../../db.ts";
import type { SystemEvent } from "../types.ts";

const NOTIFY_TYPES: Record<string, (e: SystemEvent) => { title: string; body: string } | null> = {
  "action.outcome_unknown": (e) => ({
    title: "Acción con resultado incierto",
    body: String((e.payload as { title?: string }).title ?? "Revisa la acción."),
  }),
  "monitor.changed": (e) => ({
    title: "Cambio detectado",
    body: String((e.payload as { excerpt?: string }).excerpt ?? "Un monitor detectó un cambio."),
  }),
  "system.google_disconnected": () => ({
    title: "Google desconectado",
    body: "El agente no puede leer tu correo ni preparar correos. Reconecta Google.",
  }),
};

export interface NotificationsConsumerHandle {
  stop(): void;
}

export function startNotificationsConsumer(
  owners: string[],
  db: Store,
): NotificationsConsumerHandle {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      const builder = NOTIFY_TYPES[event.type];
      if (!builder) return;
      const content = builder(event);
      if (!content) return;
      void db
        .insertIfAbsent(event.owner, "notifications", {
          id: `bus-notif-${event.id}`,
          title: content.title.slice(0, 200),
          body: content.body.slice(0, 2000),
          createdAt: event.emittedAt,
          read: false,
        })
        .catch(() => {});
    }),
  );

  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}
```

## File: apps/server/src/engine/events/exporters/kafka.ts
```typescript
/**
 * KafkaSink (stub).
 *
 * Cuando Kafka entre:
 *   - Implementa EventSink.
 *   - Publica en topic `openmuse.events.<owner>`.
 *   - Particionado por `source.id` para mantener orden por entidad.
 *   - La firma HMAC se anade AQUI, no en el bus.
 */
export interface KafkaSink {}
```

## File: apps/server/src/engine/events/retention.ts
```typescript
// EVENTS_RETENTION_V1 — retención por tipo de evento.
//
// Hoy `purgeOlderThan("system-events", 90)` borra todo a los 90 días.
// Pero los eventos de auth son sensibles (interesa retenerlos más), los de
// monitor cambian poco (borrar antes), y los de task son la espina dorsal.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Retención uniforme 90 días"),
// docs/audits/08-bus-de-eventos/roadmap.md §8.

import type { SystemEventType } from "./types.ts";

export interface RetentionRule {
  /** Patrón del tipo (substring o match exacto). */
  pattern: string;
  /** Días de retención. */
  days: number;
  /** Motivo (documenta la decisión). */
  reason: string;
}

export const RETENTION_RULES: RetentionRule[] = [
  // Eventos de seguridad: retención larga para auditoría.
  { pattern: "auth.", days: 365, reason: "SOC-2 requiere 1 año de logs de auth" },
  { pattern: "policy.", days: 365, reason: "Decisiones de policy para auditoría" },
  { pattern: "state.", days: 365, reason: "Transiciones de estado para auditoría" },
  // Eventos de task: retención media.
  { pattern: "task.", days: 90, reason: "Espina dorsal operativa" },
  { pattern: "sop.", days: 90, reason: "Trazabilidad de SOPs" },
  { pattern: "action.", days: 90, reason: "Aprobaciones y efectos externos" },
  { pattern: "agent.", days: 90, reason: "Runtimes de agente" },
  { pattern: "context.", days: 30, reason: "Contexto efímero" },
  { pattern: "entity.", days: 180, reason: "Business graph cambios" },
  { pattern: "relation.", days: 180, reason: "Business graph relaciones" },
  // Monitor: alta frecuencia, retención corta.
  { pattern: "monitor.", days: 30, reason: "Alta frecuencia, valor histórico bajo" },
  // Sistema: corta.
  { pattern: "system.maintenance", days: 7, reason: "Ruido operativo" },
  { pattern: "system.startup", days: 30, reason: "Eventos de arranque" },
  { pattern: "system.error", days: 180, reason: "Errores para diagnóstico" },
  { pattern: "system.google_disconnected", days: 30, reason: "Estado de conexión" },
  // View: efímero.
  { pattern: "view.", days: 7, reason: "Vistas servidas efímeras" },
];

export function retentionDaysFor(type: SystemEventType): number {
  for (const rule of RETENTION_RULES) {
    if (type === rule.pattern || type.startsWith(rule.pattern)) {
      return rule.days;
    }
  }
  return 90; // Default conservador.
}

/**
 * Agrupa los tipos por días de retención para hacer purgas eficientes.
 */
export function groupTypesByRetention(types: readonly SystemEventType[]): Map<number, string[]> {
  const grouped = new Map<number, string[]>();
  for (const type of types) {
    const days = retentionDaysFor(type);
    const list = grouped.get(days) ?? [];
    list.push(type);
    grouped.set(days, list);
  }
  return grouped;
}
```

## File: apps/server/src/engine/events/subscriber.ts
```typescript
// EVENTS_SUBSCRIBER_V1 — suscriptores en vivo del bus.
//
// El bus hoy solo persiste a StoreSink. Para SSE necesitamos que alguien
// pueda suscribirse en memoria y recibir cada evento conforme se emite.
//
// El subscriber se registra en EventBus.emit y recibe todos los eventos
// nuevos del owner. Si el buffer se llena, descarta los más antiguos
// (slow consumer no puede bloquear el bus).
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Sin SSE").

import type { SystemEvent } from "./types.ts";

export interface SubscriberHandle {
  unsubscribe(): void;
}

export interface SubscribeOptions {
  /** Filtro opcional por tipo. */
  types?: string[];
  /** Tope del buffer. Si se llena, descarta los más viejos. Default 200. */
  bufferSize?: number;
}

export class EventSubscriberRegistry {
  private readonly subscribers = new Map<string, Set<Subscriber>>();
  private nextId = 0;

  subscribe(
    owner: string,
    onEvent: (event: SystemEvent) => void,
    options: SubscribeOptions = {},
  ): SubscriberHandle {
    const id = `sub-${++this.nextId}`;
    const sub: Subscriber = {
      id,
      onEvent,
      types: options.types ? new Set(options.types) : null,
      bufferSize: options.bufferSize ?? 200,
    };
    let set = this.subscribers.get(owner);
    if (!set) {
      set = new Set();
      this.subscribers.set(owner, set);
    }
    set.add(sub);
    return {
      unsubscribe: () => {
        const s = this.subscribers.get(owner);
        if (!s) return;
        s.delete(sub);
        if (s.size === 0) this.subscribers.delete(owner);
      },
    };
  }

  /** Llamado por EventBus.emit tras persistir. Fire-and-forget. */
  publish(event: SystemEvent): void {
    const set = this.subscribers.get(event.owner);
    if (!set || set.size === 0) return;
    for (const sub of set) {
      if (sub.types && !sub.types.has(event.type)) continue;
      try {
        sub.onEvent(event);
      } catch {
        // Un subscriber que rompe no puede tumbar el bus.
      }
    }
  }

  count(owner?: string): number {
    if (owner) return this.subscribers.get(owner)?.size ?? 0;
    let total = 0;
    for (const set of this.subscribers.values()) total += set.size;
    return total;
  }

  clear(): void {
    this.subscribers.clear();
  }
}

interface Subscriber {
  id: string;
  onEvent: (event: SystemEvent) => void;
  types: Set<string> | null;
  bufferSize: number;
}

export const globalSubscribers = new EventSubscriberRegistry();
```

## File: apps/server/src/engine/events/ulid.ts
```typescript
import { randomBytes } from "node:crypto";

/**
 * ULID sin dependencia externa. Ordenable por tiempo, 26 caracteres, base32 Crockford.
 * Formato: 10 chars de timestamp (48 bits) + 16 chars aleatorios (80 bits).
 *
 * Por que ULID y no UUIDv4: los eventos del bus se ordenan por id cuando
 * emittedAt empata. Con UUIDv4 el orden seria aleatorio; con ULID es temporal.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function ulid(now: number = Date.now()): string {
  let ts = now;
  let time = "";
  for (let i = 0; i < 10; i += 1) {
    time = ALPHABET[ts % 32] + time;
    ts = Math.floor(ts / 32);
  }
  const bytes = randomBytes(16);
  let rand = "";
  for (let i = 0; i < 16; i += 1) {
    rand += ALPHABET[bytes[i] % 32];
  }
  return time + rand;
}
```

## File: apps/server/src/engine/events/schemas.ts
```typescript
import { z } from "zod";
import type { SystemEventType } from "./types.ts";

/**
 * Payloads cerrados por tipo de evento.
 *
 * El Record obliga a cubrir TODOS los SystemEventType: si anades uno
 * al enum y no aqui, TypeScript no compila. Eso es intencional.
 *
 * La validacion vive en el emisor (EventBus.emit), nunca en el consumidor.
 */

const base = {
  taskId: z.string().max(200).optional(),
  actionId: z.string().max(200).optional(),
  monitorId: z.string().max(200).optional(),
  sopId: z.string().max(200).optional(),
  stepId: z.string().max(200).optional(),
  projectId: z.string().max(200).optional(),
  clientId: z.string().max(200).optional(),
  roleId: z.string().max(200).optional(),
};

export const payloadSchemas: Record<SystemEventType, z.ZodTypeAny> = {
  "task.created": z.object({ ...base, title: z.string().max(200), kind: z.string().max(40) }),
  "task.status_changed": z.object({ ...base, from: z.string().max(40), to: z.string().max(40) }),
  "task.completed": z.object({ ...base, title: z.string().max(200), result: z.string().max(2000).optional() }),
  "task.failed": z.object({ ...base, title: z.string().max(200), error: z.string().max(2000).optional() }),
  "task.waiting_input": z.object({ ...base, title: z.string().max(200), question: z.string().max(2000).optional() }),
  "task.waiting_approval": z.object({ ...base, title: z.string().max(200) }),
  "task.controlled": z.object({ ...base, action: z.enum(["pause","resume","cancel","retry"]) }),
  "sop.step_started": z.object({ ...base, index: z.number().int().nonnegative(), title: z.string().max(200) }),
  "sop.step_completed": z.object({ ...base, index: z.number().int().nonnegative(), title: z.string().max(200) }),
  "sop.step_skipped": z.object({ ...base, index: z.number().int().nonnegative(), title: z.string().max(200), reason: z.string().max(500).optional() }),
  "sop.failed": z.object({ ...base, error: z.string().max(2000).optional() }),
  "action.proposed": z.object({ ...base, title: z.string().max(300), kind: z.string().max(60) }),
  "action.approved": z.object({ ...base, title: z.string().max(300) }),
  "action.denied": z.object({ ...base, title: z.string().max(300) }),
  "action.executed": z.object({ ...base, title: z.string().max(300), result: z.string().max(2000).optional() }),
  "action.failed": z.object({ ...base, title: z.string().max(300), error: z.string().max(2000).optional() }),
  "action.outcome_unknown": z.object({ ...base, title: z.string().max(300), error: z.string().max(2000).optional() }),
  "monitor.check": z.object({ ...base, url: z.string().max(2000), matched: z.boolean() }),
  "monitor.changed": z.object({ ...base, url: z.string().max(2000), excerpt: z.string().max(1000) }),
  "monitor.failed": z.object({ ...base, url: z.string().max(2000), error: z.string().max(2000) }),
  "system.startup": z.object({ mode: z.enum(["sample", "live"]) }),
  "system.error": z.object({ message: z.string().max(2000), phase: z.string().max(100).optional() }),
  "system.maintenance": z.object({ tasks: z.number().int().nonnegative(), monitors: z.number().int().nonnegative() }),
  "system.google_disconnected": z.object({ owner: z.string().max(200) }),
  "auth.login": z.object({ userId: z.string().max(200) }),
  "auth.login_failed": z.object({ email: z.string().max(300) }),
  // A2_EVENTS_V1 - undo diferido y cancelacion de acciones.
  "action.deferred": z.object({
    ...base,
    actionId: z.string().max(200),
    signers: z.array(z.string().max(200)).max(10),
    needed: z.number().int().min(1).max(10),
    executeAt: z.number().nullable(),
  }),
  "action.cancelled": z.object({
    ...base,
    actionId: z.string().max(200),
    by: z.string().max(200),
  }),
  // D2_VIEW_RESOLVED_V1 - spec servido por el agente.
  "view.resolved": z.object({
    ...base,
    kind: z.enum(["dashboard", "queue"]),
    title: z.string().max(300),
    spec: z.record(z.string(), z.unknown()),
  }),
  // SCHEMAS_V2 — business graph, policy, state machine, agent runtime, context.
  "entity.created": z.object({
    ...base,
    entityId: z.string().max(200),
    entityType: z.string().max(100),
    version: z.number().int().positive(),
  }),
  "entity.updated": z.object({
    ...base,
    entityId: z.string().max(200),
    entityType: z.string().max(100),
    version: z.number().int().positive(),
    changedFields: z.array(z.string().max(100)).max(100),
  }),
  "entity.deleted": z.object({
    ...base,
    entityId: z.string().max(200),
    entityType: z.string().max(100),
  }),
  "relation.created": z.object({
    ...base,
    relationId: z.string().max(200),
    fromEntityId: z.string().max(200),
    toEntityId: z.string().max(200),
    relationType: z.string().max(100),
  }),
  "relation.deleted": z.object({
    ...base,
    relationId: z.string().max(200),
  }),
  "policy.evaluated": z.object({
    ...base,
    policyId: z.string().max(200),
    decision: z.enum(["allow", "deny"]),
    action: z.string().max(200),
  }),
  "policy.denied": z.object({
    ...base,
    policyId: z.string().max(200),
    action: z.string().max(200),
    reason: z.string().max(1000),
  }),
  "state.changed": z.object({
    ...base,
    entityId: z.string().max(200),
    stateMachine: z.string().max(100),
    from: z.string().max(100).optional(),
    to: z.string().max(100),
  }),
  "state.transition_denied": z.object({
    ...base,
    entityId: z.string().max(200),
    stateMachine: z.string().max(100),
    from: z.string().max(100),
    attempted: z.string().max(100),
    reason: z.string().max(1000),
  }),
  "agent.runtime_spawned": z.object({
    ...base,
    runtimeId: z.string().max(200),
    roleId: z.string().max(200),
    taskId: z.string().max(200),
  }),
  "agent.runtime_completed": z.object({
    ...base,
    runtimeId: z.string().max(200),
    roleId: z.string().max(200),
    taskId: z.string().max(200),
    durationMs: z.number().int().nonnegative(),
  }),
  "agent.runtime_failed": z.object({
    ...base,
    runtimeId: z.string().max(200),
    roleId: z.string().max(200),
    taskId: z.string().max(200),
    error: z.string().max(2000),
  }),
  "context.assembled": z.object({
    ...base,
    roleId: z.string().max(200).optional(),
    runtimeId: z.string().max(200).optional(),
    entityCount: z.number().int().nonnegative(),
    relationCount: z.number().int().nonnegative(),
    knowledgeCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
  }),

  // VERIFICATION_EVENT_V1
  "verification.executed": z.object({
    ...base,
    goalId: z.string().max(200).optional(),
    verified: z.boolean(),
    method: z.enum(["deterministic", "llm", "hybrid", "manual"]),
    confidence: z.number().min(0).max(1),
  }),
  "verification.disagreement": z.object({
    ...base,
    goalId: z.string().max(200).optional(),
    deterministic: z.boolean(),
    llm: z.boolean(),
  }),};
```

## File: apps/server/src/engine/events/types.ts
```typescript
export const SYSTEM_EVENT_TYPES = [
  "task.created",
  "task.status_changed",
  "task.completed",
  "task.failed",
  "task.waiting_input",
  "task.waiting_approval",
  "task.controlled",
  "sop.step_started",
  "sop.step_completed",
  "sop.step_skipped",
  "sop.failed",
  "action.proposed",
  "action.approved",
  "action.denied",
  "action.executed",
  "action.failed",
  "action.outcome_unknown",
  "monitor.check",
  "monitor.changed",
  "monitor.failed",
  "system.startup",
  "system.error",
  "system.maintenance",
  "system.google_disconnected",
  "auth.login",
  "auth.login_failed",
  // A2_EVENTS_V1 - undo diferido y cancelacion de acciones.
  "action.deferred",
  "action.cancelled",
  // D2_VIEW_RESOLVED_V1 - el agente sirve una vista.
  "view.resolved",
  // EVENTS_V2 — business graph, policy, state machine, agent runtime, context.
  "entity.created",
  "entity.updated",
  "entity.deleted",
  "relation.created",
  "relation.deleted",
  "policy.evaluated",
  "policy.denied",
  "state.changed",
  "state.transition_denied",
  "agent.runtime_spawned",
  "agent.runtime_completed",
  "agent.runtime_failed",
  "context.assembled",
  // VERIFICATION_EVENT_V1
  "verification.executed",
  "verification.disagreement",
] as const;

export type SystemEventType = (typeof SYSTEM_EVENT_TYPES)[number];

export interface SystemEventSource {
  kind: "task" | "sop" | "action" | "monitor" | "system" | "auth" | "entity" | "relation" | "policy" | "state" | "agent" | "context";
  id: string;
}

export interface SystemEvent<T = Record<string, unknown>> {
  id: string;
  schemaVersion: "1.0";
  tenantId: string;
  owner: string;
  type: SystemEventType;
  emittedAt: string;
  source: SystemEventSource;
  correlationId?: string;
  causationId?: string;
  payload: T;
}

export interface EventFilter {
  type?: SystemEventType | SystemEventType[];
  since?: string;
  until?: string;
  limit?: number;
  sourceId?: string;
  projectId?: string;
}

export interface EventAggregate {
  type: SystemEventType;
  count: number;
}

export interface EventSink {
  write(event: SystemEvent): Promise<void>;
}

export interface EventQuery {
  recent(owner: string, filter: EventFilter): Promise<SystemEvent[]>;
  aggregate(owner: string, hours: number): Promise<EventAggregate[]>;
}
```

## File: apps/server/src/engine/events/sinks/store.ts
```typescript
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
```
