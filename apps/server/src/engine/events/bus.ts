import { createHash } from "node:crypto";
import { transactionOutcome, type Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import { backgroundFailure } from "../../log.ts";
// BUS_TENANT_SCOPE_V1 - tenant de la petición para owner/storage del sink.
import { currentTenantScope, runInTenantScope } from "../../tenant-scope.ts";
import { payloadSchemas } from "./schemas.ts";
// EVENTBUS_SCHEMA_REGISTRY_V1 - registry consultable.
import { SchemaRegistry } from "./schema-registry.ts";
export const globalSchemaRegistry = new SchemaRegistry();
for (const [t, s] of Object.entries(payloadSchemas)) {
  try { globalSchemaRegistry.register({ type: t as SystemEventType, version: "1.0", schema: s }); } catch { /* ya registrado */ }
}
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
// EVENTBUS_DEDUPE_TTL_V1 - TTL configurable.
const DEDUPE_TTL_MS = Number(process.env.EVENTBUS_DEDUPE_TTL_MS ?? "60000") || 60_000;
// EVENTBUS_DEDUPE_LRU_V1 - LRU configurable.
const DEDUPE_MAX_ENTRIES = Number(process.env.EVENTBUS_DEDUPE_LRU ?? "64") || 64;

/** EVENTS_CAUSAL_ENVELOPE_V1 - vinculo causal explicito del productor gobernado. */
export type CausalLink = { kind: "root" } | { kind: "derived"; causationId: string };

export interface EmitOptions {
  correlationId?: string;
  causationId?: string;
  /** EVENTS_CAUSAL_ENVELOPE_V1 - actor autenticado o principal de servicio. */
  actorId?: string;
  /** EVENTS_CAUSAL_ENVELOPE_V1 - exige actor, tenant y correlacion explicitos. */
  causal?: CausalLink;
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

/** Resultado de una emision: persistido y cuantos subscribers lo recibieron. */
export interface EmitResult {
  id: string;
  tenantId: string;
  persisted: boolean;
  delivered: number;
  pendingCommit?: boolean;
  commitOutcome?: "unknown";
  duplicate?: boolean;
  error?: string;
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
    private readonly options: {
      /** Resuelve el tenant real de un owner cuando no hay scope de peticion. */
      tenantForOwner?: (owner: string) => Promise<string>;
    } = {},
  ) {}

  async emit<T extends Record<string, unknown>>(
    owner: string,
    type: SystemEventType,
    source: SystemEventSource,
    payload: T,
    options: EmitOptions = {},
  ): Promise<EmitResult> {
    let proposedEvent: { id: string; tenantId: string } | undefined;
    let committed: EmitResult | undefined;
    try {
      // EVENTS_BUS_EMIT_VALIDATES_TENANT_V1
      // EVENTBUS_METRIC_ERRORS_V1
      const schema = payloadSchemas[type];
      const parsed = schema.parse(payload) as T;
      // EVENTBUS_TENANT_RESOLVE_V1 - owner es el usuario; tenantId es la
      // empresa. Antes se hacia `tenantId: options.tenantId ?? owner`, asi que
      // todo evento sin tenant explicito quedaba atribuido al usuario y el
      // subscriber del kernel abria turnos en un tenant fantasma.
      const requestTenant = currentTenantScope()?.tenantId;
      if (requestTenant && options.tenantId && requestTenant !== options.tenantId) {
        throw new Error(`TENANT_MISMATCH: request scope ${requestTenant} != event tenant ${options.tenantId}`);
      }
      const tenantId = await this.resolveTenant(owner, options.tenantId);
      // El evento y el StoreSink deben usar la misma partición. TenantScopedStore
      // resuelve por owner; fijamos el tenant ya validado durante las escrituras.
      const emitInTenant = <T>(operation: () => T): T =>
        runInTenantScope({ tenantId, actorId: requestTenant ? currentTenantScope()?.actorId ?? owner : owner }, operation);
      // EVENTS_CAUSAL_ENVELOPE_V1 - admision del perfil causal-1. No se deduce
      // root de la ausencia de causationId y no se admite un derivado cuyo
      // antecedente no exista en el mismo tenant y correlacion.
      const causal = options.causal;
      if (causal) {
        if (!options.actorId) throw new Error("CAUSAL_ACTOR_REQUIRED");
        if (!options.tenantId) throw new Error("CAUSAL_TENANT_REQUIRED");
        if (!options.correlationId) throw new Error("CAUSAL_CORRELATION_REQUIRED");
        if (causal.kind === "root" && options.causationId)
          throw new Error("CAUSAL_ROOT_WITH_CAUSATION");
        if (causal.kind === "derived") {
          if (options.causationId && options.causationId !== causal.causationId)
            throw new Error("CAUSAL_CAUSATION_MISMATCH");
          const antecedent = await emitInTenant(() =>
            this.db.get<SystemEvent>(owner, KIND, causal.causationId),
          );
          if (!antecedent)
            throw new Error(`CAUSAL_ANTECEDENT_NOT_FOUND: ${causal.causationId}`);
          if (antecedent.tenantId !== tenantId)
            throw new Error("CAUSAL_ANTECEDENT_TENANT_MISMATCH");
          if (antecedent.correlationId !== options.correlationId)
            throw new Error("CAUSAL_ANTECEDENT_CORRELATION_MISMATCH");
        }
      }
      // EVENTBUS_DEDUPE_KEY_V1 - solo deduplicamos si el emisor lo pide.
      // Sin dedupeKey explicita, cada emision es un hecho nuevo.
      // EVENTBUS_DEDUPE_OWNER_FIX_V1 - antes pasabamos `${owner}:${dedupeKey}`
      // como owner a isDuplicate, lo cual creaba una fila por cada dedupeKey
      // distinta y rompia el LRU compartido entre procesos. Ahora pasamos
      // el owner real y la key por separado.
      if (options.dedupeKey !== undefined) {
        // EVENTBUS_DEDUPE_METRIC_V1
        if (await emitInTenant(() => this.isDuplicate(tenantId, owner, options.dedupeKey!))) {
          return { id: "", tenantId, persisted: false, delivered: 0, duplicate: true };
        }
      }
      // EVENTBUS_CTX_FALLBACK_V1 - hereda correlationId/causationId si no vienen.
      const logCtx = (await import("../../log.ts")).logContext.getStore();
      const finalCorrelationId = options.correlationId ?? logCtx?.correlationId;
      const finalCausationId =
        options.causationId ?? (causal?.kind === "derived" ? causal.causationId : undefined);
      const event: SystemEvent<T> = {
        id: ulid(),
        schemaVersion: "1.0",
        // EVENTS_BUS_TENANT_SCOPED_FALLBACK_V1
        tenantId,
        owner,
        type,
        emittedAt: new Date().toISOString(),
        source,
        ...(finalCorrelationId ? { correlationId: finalCorrelationId } : {}),
        ...(finalCausationId ? { causationId: finalCausationId } : {}),
        ...(options.actorId ? { actorId: options.actorId } : {}),
        ...(causal ? { causalKind: causal.kind } : {}),
        payload: parsed,
      };
      proposedEvent = { id: event.id, tenantId };
      await emitInTenant(() => this.sink.write(event));
      const result: EmitResult = { id: event.id, tenantId, persisted: !this.db.inTransaction, delivered: 0,
        ...(this.db.inTransaction ? { pendingCommit: true } : {}) };
      committed = result;
      const notifyCommitted = async () => {
        result.persisted = true; result.pendingCommit = false;
        try {
      // EVENTS_BUS_PUBLISH_V1 Ã¢â‚¬â€ publicar a subscribers en vivo (SSE, mÃƒÂ©tricas).
      // Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Sin SSE").
      // EVENTBUS_PUBLISH_SUBSCRIBERS_V1
      const delivered = globalSubscribers.publish(event);
      result.delivered = delivered;
      // EVENTBUS_DEDUPE_KEY_V1 - solo registramos la clave si se paso explicitamente.
      if (options.dedupeKey !== undefined) {
        // EVENTBUS_DEDUPE_OWNER_FIX_V1 - mismo fix: owner real, key separada.
        await emitInTenant(() => this.recordDedupe(tenantId, owner, options.dedupeKey!));
      }
      if (options.notify) {
        // BUS_NOTIFY_PREFS_V1 - antes el bus escribia siempre en
        // notifications, ignorando las preferencias del usuario en
        // notification-prefs. Ahora consultamos prefs y, si el tipo esta
        // deshabilitado, no escribimos la notificacion. El evento sigue
        // emitiendose al bus por si otros consumidores lo quieren.
        const prefs = await emitInTenant(() => this.db
          .get<{ disabled: string[] }>(owner, "notification-prefs", "default")
          .catch(() => null));
        // EVENTBUS_NOTIFY_PREF_FILTER_V1
        const disabled = prefs?.disabled ?? [];
        if (!disabled.includes(type)) {
          const notify = options.notify;
          await emitInTenant(() => this.db.insertIfAbsent(owner, "notifications", {
            id: createHash("sha256").update(notify.key).digest("hex"),
            taskId: source.kind === "task" ? source.id : undefined,
            title: notify.title.slice(0, 200),
            body: notify.body.slice(0, 2000),
            createdAt: event.emittedAt,
            read: false,
          }));
        }
      }

        } catch (error) {
          result.error = "POST_COMMIT_NOTIFICATION_FAILED";
          backgroundFailure(`event notification ${type}`, error);
        }
      };
      if (typeof this.db.afterCommit === "function" && this.db.afterCommit(notifyCommitted, (error) => {
        result.persisted = false; result.pendingCommit = false;
        if (transactionOutcome(error) === "unknown") {
          result.commitOutcome = "unknown"; result.error = "OUTER_TRANSACTION_OUTCOME_UNKNOWN";
        } else result.error = "OUTER_TRANSACTION_ROLLED_BACK";
      })) return result;
      await notifyCommitted();
      return result;
    } catch (error) {
      // EVENTBUS_ERROR_METRIC_V1 - contador de errores.
      import("../../metrics/registry.ts")
        .then(({ globalMetrics }) => { globalMetrics.inc("event_bus_errors_total", { type }); })
        .catch(() => {});
      backgroundFailure(`event emit ${type}`, error);
      if (committed) return { ...committed, error: "POST_COMMIT_NOTIFICATION_FAILED" };
      if (transactionOutcome(error) === "unknown") return {
        id: proposedEvent?.id ?? "", tenantId: proposedEvent?.tenantId ?? options.tenantId ?? "",
        persisted: false, delivered: 0, commitOutcome: "unknown", error: "TRANSACTION_COMMIT_OUTCOME_UNKNOWN",
      };
      return {
        id: "",
        tenantId: options.tenantId ?? currentTenantScope()?.tenantId ?? owner,
        persisted: false,
        delivered: 0,
        error: error instanceof Error ? error.message : "unknown",
      };
    }
  }

  /**
   * EVENTBUS_RESOLVE_TENANT_V1 - prioridad: explicito, scope de la peticion,
   * resolver inyectado y, solo como ultimo recurso, owner. El fallback deja
   * metrica para que un evento mal etiquetado no pase desapercibido.
   */
  private async resolveTenant(owner: string, explicit?: string): Promise<string> {
    if (explicit) return explicit;
    const scoped = currentTenantScope()?.tenantId;
    if (scoped) return scoped;
    if (this.options.tenantForOwner && owner !== "system") {
      const resolved = await this.options.tenantForOwner(owner).catch(() => undefined);
      if (resolved) return resolved;
    }
    if (owner !== "system") {
      import("../../metrics/registry.ts")
        .then(({ globalMetrics }) => { globalMetrics.inc("event_bus_missing_tenant_total", {}); })
        .catch(() => {});
    }
    return owner;
  }

  /**
   * EVENTBUS_REPLAY_TENANT_V1 - relee el log persistido de un tenant. Es la
   * base para consumidores con cursor: si el proceso pierde el evento en vivo,
   * puede recuperarlo del store en vez de perderlo para siempre.
   */
  async replayTenant(
    tenantId: string,
    filter: EventFilter,
    handler: (event: SystemEvent) => void | Promise<void>,
  ): Promise<number> {
    const db = this.db as unknown as {
      scanByPrefix?: <U>(
        kind: string,
        tenantId: string,
        limit?: number,
      ) => Promise<{ owner: string; value: U }[]>;
    };
    const limit = Math.min(Math.max(1, filter.limit ?? 200), 200);
    // EVENTS_PAGE_BEFORE_LIMIT_V1 - el cursor y los filtros se aplican en el
    // store ANTES del limite. Antes, `scanByPrefix(...,limit)` podia devolver
    // solo eventos anteriores al cursor y la recuperacion quedaba vacia pese a
    // existir filas posteriores.
    if (typeof this.query.pageTenant === "function") {
      const page = await this.query.pageTenant(tenantId, filter, limit);
      if (page) {
        for (const event of page) await handler(event);
        return page.length;
      }
    }
    if (typeof db.scanByPrefix !== "function") return 0;
    const rows = await db.scanByPrefix<SystemEvent>("system-events", tenantId, limit);
    const events = rows
      .map((row) => row.value)
      .filter((event) => event && event.tenantId === tenantId)
      .filter((event) => !filter.type || (Array.isArray(filter.type) ? filter.type.includes(event.type) : event.type === filter.type))
      .filter((event) => !filter.sinceId || event.id > filter.sinceId)
      .filter((event) => !filter.since || event.emittedAt >= filter.since)
      .filter((event) => !filter.until || event.emittedAt <= filter.until)
      .sort((a, b) => a.emittedAt.localeCompare(b.emittedAt) || a.id.localeCompare(b.id))
      .slice(0, limit);
    for (const event of events) await handler(event);
    return events.length;
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

  // EVENTBUS_DEDUPE_CACHE_V1 - cache negativa en memoria, TTL corto.
  private readonly negativeCache = new Map<string, number>();

  private async isDuplicate(tenantId: string, owner: string, key: string): Promise<boolean> {
    const now = Date.now();
    const scopedKey = `${tenantId}:${owner}:${key}`;
    const negKey = scopedKey;
    const negAt = this.negativeCache.get(negKey);
    if (negAt && now - negAt < 5000) return false;
    // DEDUPE_DB_FIRST Ã¢â‚¬â€ consultamos la DB ANTES que el Map en memoria para que
    // multiples procesos compartan el dedupe. El Map es solo cache de lectura.
    const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
    if (state) {
      const hit = state.seen.find((entry) => entry.key === key && now - entry.at < DEDUPE_TTL_MS);
      if (hit) {
        this.inMemory.set(scopedKey, now);
        return true;
      }
    }
    // EVENTBUS_DEDUPE_TENANT_KEY_V1 - la cache en memoria tambien se indexa
    // por owner: antes solo por key y dos empresas con la misma clave se
    // suprimian entre si.
    const cached = this.inMemory.get(scopedKey);
    return Boolean(cached && now - cached < DEDUPE_TTL_MS);
  }

  private async recordDedupe(tenantId: string, owner: string, key: string): Promise<void> {
    const now = Date.now();
    this.inMemory.set(`${tenantId}:${owner}:${key}`, now);
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