import { createHash } from "node:crypto";
import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import { backgroundFailure } from "../../log.ts";
import { payloadSchemas } from "./schemas.ts";
import { StoreQuery, StoreSink } from "./sinks/store.ts";
import type {
  EventAggregate,
  EventFilter,
  EventQuery,
  EventSink,
  SystemEvent,
  SystemEventSource,
  SystemEventType,
} from "./types.ts";
import { ulid } from "./ulid.ts";
import { globalSubscribers } from "./subscriber.ts";

const KIND = "system-events";
const DEDUPE_KIND = "dedupe-state";
const DEDUPE_TTL_MS = 60_000;
const DEDUPE_MAX_ENTRIES = 64;

export interface EmitOptions {
  correlationId?: string;
  causationId?: string;
  /**
   * EVENTBUS_DEDUPE_KEY_V1 - clave de deduplicacion explicita.
   *
   * Si se pasa, el bus deduplica: dos emisiones con la misma clave en la
   * ventana de 60s solo escriben la primera. Los emisores de RUIDO
   * (reintentos, estados que cambian repetidamente) la pasan.
   *
   * Si NO se pasa, el bus NO deduplica. Los emisores FACTUALES
   * (entity.updated, entity.created, relation.created) no la pasan,
   * porque cada emision es un hecho nuevo y no debe descartarse.
   *
   * Antes de esto, el bus deduplicaba siempre con
   * `${owner}:${type}:${source.kind}:${source.id}`. Eso descartaba el
   * segundo entity.updated del mismo cliente en 60s, corrompiendo el
   * event log factual.
   */
  dedupeKey?: string;
  /** MULTI_TENANT_V1 - tenantId. Si no se pasa, se usa owner. */
  tenantId?: string;
  notify?: { title: string; body: string; key: string };
}

interface DedupeState {
  id: string;
  seen: { key: string; at: number }[];
}

export class EventBus {
  private readonly inMemory = new Map<string, number>();
  constructor(
    private readonly db: Store | TenantScopedStore,
    private readonly sink: EventSink = new StoreSink(db),
    private readonly query: EventQuery = new StoreQuery(db),
  ) {}

  async emit<T extends Record<string, unknown>>(
    owner: string,
    type: SystemEventType,
    source: SystemEventSource,
    payload: T,
    options: EmitOptions = {},
  ): Promise<void> {
    try {
      const schema = payloadSchemas[type];
      const parsed = schema.parse(payload) as T;
      // EVENTBUS_DEDUPE_KEY_V1 - solo deduplicamos si el emisor lo pide.
      // Sin dedupeKey explicita, cada emision es un hecho nuevo.
      // EVENTBUS_DEDUPE_OWNER_FIX_V1 - antes pasabamos `${owner}:${dedupeKey}`
      // como owner a isDuplicate, lo cual creaba una fila por cada dedupeKey
      // distinta y rompia el LRU compartido entre procesos. Ahora pasamos
      // el owner real y la key por separado.
      if (options.dedupeKey !== undefined) {
        if (await this.isDuplicate(owner, options.dedupeKey)) return;
      }
      const event: SystemEvent<T> = {
        id: ulid(),
        schemaVersion: "1.0",
        tenantId: options.tenantId ?? owner,
        owner,
        type,
        emittedAt: new Date().toISOString(),
        source,
        ...(options.correlationId ? { correlationId: options.correlationId } : {}),
        ...(options.causationId ? { causationId: options.causationId } : {}),
        payload: parsed,
      };
      await this.sink.write(event);
      // EVENTS_BUS_PUBLISH_V1 — publicar a subscribers en vivo (SSE, métricas).
      // Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Sin SSE").
      globalSubscribers.publish(event);
      // EVENTBUS_DEDUPE_KEY_V1 - solo registramos la clave si se paso explicitamente.
      if (options.dedupeKey !== undefined) {
        // EVENTBUS_DEDUPE_OWNER_FIX_V1 - mismo fix: owner real, key separada.
        await this.recordDedupe(owner, options.dedupeKey);
      }
      if (options.notify) {
        // BUS_NOTIFY_PREFS_V1 - antes el bus escribia siempre en
        // notifications, ignorando las preferencias del usuario en
        // notification-prefs. Ahora consultamos prefs y, si el tipo esta
        // deshabilitado, no escribimos la notificacion. El evento sigue
        // emitiendose al bus por si otros consumidores lo quieren.
        const prefs = await this.db
          .get<{ disabled: string[] }>(owner, "notification-prefs", "default")
          .catch(() => null);
        const disabled = prefs?.disabled ?? [];
        if (!disabled.includes(type)) {
          await this.db.insertIfAbsent(owner, "notifications", {
            id: createHash("sha256").update(options.notify.key).digest("hex"),
            taskId: source.kind === "task" ? source.id : undefined,
            title: options.notify.title.slice(0, 200),
            body: options.notify.body.slice(0, 2000),
            createdAt: event.emittedAt,
            read: false,
          });
        }
      }
    } catch (error) {
      backgroundFailure(`event emit ${type}`, error);
    }
  }

  async list(owner: string, filter: EventFilter = {}): Promise<SystemEvent[]> {
    return this.query.recent(owner, filter);
  }

  async aggregate(owner: string, hours = 24): Promise<EventAggregate[]> {
    return this.query.aggregate(owner, hours);
  }

  async purge(days = 90): Promise<number> {
    return this.db.purgeOlderThan(KIND, days);
  }

  private async isDuplicate(owner: string, key: string): Promise<boolean> {
    const now = Date.now();
    // DEDUPE_DB_FIRST — consultamos la DB ANTES que el Map en memoria para que
    // multiples procesos compartan el dedupe. El Map es solo cache de lectura.
    const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
    if (state) {
      const hit = state.seen.find((entry) => entry.key === key && now - entry.at < DEDUPE_TTL_MS);
      if (hit) {
        this.inMemory.set(key, now);
        return true;
      }
    }
    const cached = this.inMemory.get(key);
    return Boolean(cached && now - cached < DEDUPE_TTL_MS);
  }

  private async recordDedupe(owner: string, key: string): Promise<void> {
    const now = Date.now();
    this.inMemory.set(key, now);
    if (this.inMemory.size > DEDUPE_MAX_ENTRIES) {
      const oldest = [...this.inMemory.entries()].sort((a, b) => a[1] - b[1])[0];
      if (oldest) this.inMemory.delete(oldest[0]);
    }
    // EVENTBUS_DEDUPE_CAS_FIX_V1 - antes leiamos + modificabamos + escribiamos
    // sin CAS. Dos emisiones concurrentes con la misma key se pisaban. Ahora
    // reintentamos con CAS sobre el `seen` actual hasta 3 veces.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
      const seen = state?.seen ?? [];
      const filtered = seen.filter((entry) => now - entry.at < DEDUPE_TTL_MS);
      if (filtered.some((entry) => entry.key === key)) return;
      filtered.push({ key, at: now });
      const trimmed = filtered.slice(-DEDUPE_MAX_ENTRIES);
      if (!state) {
        const inserted = await this.db.insertIfAbsent(owner, DEDUPE_KIND, {
          id: "lru",
          seen: trimmed,
        } as { id: string } & Record<string, unknown>);
        if (inserted) return;
        continue;
      }
      const updated = await this.db.compareAndSwap<DedupeState>(
        owner,
        DEDUPE_KIND,
        "lru",
        { id: "lru", seen: state.seen },
        { seen: trimmed },
      );
      if (updated) return;
    }
    backgroundFailure(
      `eventbus dedupe ${owner}/${key}`,
      new Error("No se pudo registrar la clave de deduplicacion tras 3 intentos"),
    );
  }
}