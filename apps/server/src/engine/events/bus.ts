import { createHash } from "node:crypto";
import type { Store } from "../../db.ts";
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
    private readonly db: Store,
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
      // EVENTBUS_DEDUPE_KEY_V1 - solo registramos la clave si se paso explicitamente.
      if (options.dedupeKey !== undefined) {
        await this.recordDedupe(owner, options.dedupeKey);
      }
      if (options.notify) {
        await this.db.insertIfAbsent(owner, "notifications", {
          id: createHash("sha256").update(options.notify.key).digest("hex"),
          taskId: source.kind === "task" ? source.id : undefined,
          title: options.notify.title.slice(0, 200),
          body: options.notify.body.slice(0, 2000),
          createdAt: event.emittedAt,
          read: false,
        });
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
    const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
    const seen = state?.seen ?? [];
    const filtered = seen.filter((entry) => now - entry.at < DEDUPE_TTL_MS);
    filtered.push({ key, at: now });
    const trimmed = filtered.slice(-DEDUPE_MAX_ENTRIES);
    await this.db.put(owner, DEDUPE_KIND, { id: "lru", seen: trimmed });
  }
}