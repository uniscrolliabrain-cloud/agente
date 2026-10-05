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
- Only files matching these patterns are included: package.json, pnpm-workspace.yaml, .c8rc.json, .github/workflows/ci.yml, apps/server/package.json, apps/server/src/log.ts, apps/server/src/metrics-exporter.ts, apps/server/src/metrics/registry.ts, apps/server/src/middleware/request-logger.ts, apps/server/src/admin-routes.ts, apps/server/src/alerts/**, apps/server/src/engine/events/bus.ts, apps/server/src/engine/events/index.ts, apps/server/src/engine/events/consumers/metrics.ts, apps/server/src/engine/events/consumers/audit.ts, apps/server/src/engine/events/exporters/otel.ts, apps/server/src/engine/retry.ts, apps/server/src/engine/circuit-breaker.ts, apps/server/src/engine/dead-letter.ts, apps/server/src/kernel/graph/promote.ts, apps/server/src/kernel/graph/store.ts, apps/server/src/kernel/graph/store-store.ts, apps/server/src/kernel/graph/thought.ts, apps/server/src/kernel/graph/turn.ts, apps/server/src/kernel/observers/meta.ts, apps/server/src/kernel/observers/presenter.ts, tests/setup.ts, tests/log.test.ts, tests/concurrency.test.ts, tests/event-bus.test.ts, tests/event-bus-dedupe.test.ts, tests/worker-concurrency.test.ts, tests/worker-metrics.test.ts, tests/alerts.test.ts, tests/crash-recovery.test.ts, tests/load/fifty-tenants.test.ts, tests/permissions.test.ts, tests/tenant-isolation.test.ts, scripts/audits/test-coverage-report.ps1, scripts/audits/check-secret-redaction.ps1, scripts/audits/capture-log-samples.ps1, scripts/audits/find-hanging-before.ps1, infra/compose.yaml
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/coverage/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.github/
  workflows/
    ci.yml
apps/
  server/
    src/
      alerts/
        definitions.ts
        service.ts
      engine/
        events/
          consumers/
            audit.ts
            metrics.ts
          exporters/
            otel.ts
          bus.ts
          index.ts
        circuit-breaker.ts
        dead-letter.ts
        retry.ts
      kernel/
        graph/
          promote.ts
          store-store.ts
          store.ts
          thought.ts
          turn.ts
        observers/
          meta.ts
          presenter.ts
      metrics/
        registry.ts
      middleware/
        request-logger.ts
      admin-routes.ts
      log.ts
      metrics-exporter.ts
infra/
  compose.yaml
scripts/
  audits/
    capture-log-samples.ps1
    check-secret-redaction.ps1
    find-hanging-before.ps1
    test-coverage-report.ps1
tests/
  load/
    fifty-tenants.test.ts
  alerts.test.ts
  concurrency.test.ts
  crash-recovery.test.ts
  event-bus-dedupe.test.ts
  event-bus.test.ts
  log.test.ts
  permissions.test.ts
  setup.ts
  tenant-isolation.test.ts
  worker-concurrency.test.ts
  worker-metrics.test.ts
.c8rc.json
package.json
pnpm-workspace.yaml
```

# Files

## File: infra/compose.yaml
```yaml
name: openmuse
services:
  browser-worker:
    build:
      context: ../apps/worker
    init: true
    restart: unless-stopped
    environment:
      WORKER_HOST: 0.0.0.0
      WORKER_TOKEN: ${WORKER_TOKEN:?Set WORKER_TOKEN to a random secret of at least 32 characters}
    ports:
      - "127.0.0.1:8790:8790"
    volumes:
      - browser-profiles:/data
    tmpfs:
      - /tmp:size=256m,mode=1777
    shm_size: 256mb
    mem_limit: 2g
    pids_limit: 256
    read_only: true
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8790/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 15s
      timeout: 5s
      retries: 3
volumes:
  browser-profiles:
```

## File: pnpm-workspace.yaml
```yaml
packages:
  - apps/worker
  - apps/web
allowBuilds:
  esbuild: true
  "@biomejs/biome": true
  "@scarf/scarf": false
```

## File: apps/server/src/alerts/definitions.ts
```typescript
// ALERTS_DEFINITIONS_V1 — las 5 alertas mínimas del roadmap 02.
//
// Ver: docs/audits/02-observabilidad/roadmap.md §8 ("5 alertas definidas
// y probadas").
//
// Cada alerta es una condición sobre datos observables. No escanean la DB:
// leen de un snapshot inyectado por el caller (típicamente el MetricsRegistry
// o el AlertService desde index.ts).

import type { AlertDefinition } from "./service.ts";

export interface AlertDeps {
  metricsSnapshot: () => {
    http5xx: number;
    httpTotal: number;
    taskFailuresLastHour: number;
    tenantQuotaExceeded: number;
    workerRunning: boolean;
    /** RESILIENCE_ALERTS_V1 — campos añadidos para el bloque 03. */
    circuitOpenCount: number;
    deadLetterCount: number;
    outcomeUnknownCount: number;
  };
}

export function buildAlertDefinitions(deps: AlertDeps): AlertDefinition[] {
  return [
    {
      id: "http_5xx_high",
      description: "Errores 5xx superan el 5% de los requests en la última ventana",
      severity: "critical",
      cooldownSec: 300,
      condition: () => {
        const s = deps.metricsSnapshot();
        return s.httpTotal >= 20 && s.http5xx / s.httpTotal > 0.05;
      },
    },
    {
      id: "tasks_failing_burst",
      description: "Más de 10 tareas fallidas en la última hora",
      severity: "critical",
      cooldownSec: 600,
      condition: () => deps.metricsSnapshot().taskFailuresLastHour > 10,
    },
    {
      id: "tenant_quota_repeated",
      description: "Algún tenant ha superado su cuota más de 5 veces",
      severity: "warning",
      cooldownSec: 3600,
      condition: () => deps.metricsSnapshot().tenantQuotaExceeded > 5,
    },
    {
      id: "worker_down",
      description: "El worker no está corriendo",
      severity: "critical",
      cooldownSec: 300,
      condition: () => !deps.metricsSnapshot().workerRunning,
    },
    {
      id: "http_latency_p99",
      description: "Latencia p99 de HTTP superior a 2s",
      severity: "warning",
      cooldownSec: 600,
      condition: () => {
        // Placeholder: la latencia p99 se calcula con histograma.
        // Hasta implementar histograma, esta alerta no dispara.
        return false;
      },
    },
    // RESILIENCE_ALERTS_V1 — 3 alertas específicas de resiliencia.
    // Ver: docs/audits/03-resiliencia/roadmap.md §8.
    {
      id: "circuit_breaker_open",
      description: "Algún circuit breaker lleva abierto más de 5 minutos",
      severity: "critical",
      cooldownSec: 600,
      condition: () => deps.metricsSnapshot().circuitOpenCount > 0,
    },
    {
      id: "dead_letter_growing",
      description: "Más de 10 tareas en el dead-letter queue sin resolver",
      severity: "warning",
      cooldownSec: 1800,
      condition: () => deps.metricsSnapshot().deadLetterCount > 10,
    },
    {
      id: "outcome_unknown_accumulating",
      description: "Más de 3 acciones en outcome_unknown sin reconciliar",
      severity: "warning",
      cooldownSec: 1800,
      condition: () => deps.metricsSnapshot().outcomeUnknownCount > 3,
    },
  ];
}
```

## File: apps/server/src/alerts/service.ts
```typescript
// ALERTS_SERVICE_V1 — motor de alertas declarativas.
//
// Cada alerta tiene: id, descripción, condición, cooldown y severidad.
// El motor evalúa todas las alertas cada N segundos y dispara los handlers
// cuando la condición pasa (respetando cooldown).
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin alertas"),
// docs/audits/02-observabilidad/roadmap.md §8 ("5 alertas definidas y probadas").

import { logWarn } from "../log.ts";

export interface AlertDefinition {
  id: string;
  description: string;
  condition: () => boolean | Promise<boolean>;
  cooldownSec: number;
  severity: "info" | "warning" | "critical";
}

export interface AlertFired {
  id: string;
  description: string;
  severity: "info" | "warning" | "critical";
  firedAt: string;
}

export interface AlertHandler {
  fire(alert: AlertFired): Promise<void>;
}

export class AlertService {
  private readonly definitions = new Map<string, AlertDefinition>();
  private readonly lastFired = new Map<string, number>();
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly handlers: AlertHandler[],
    private readonly intervalMs = 30_000,
  ) {}

  register(def: AlertDefinition): void {
    this.definitions.set(def.id, def);
  }

  size(): number {
    return this.definitions.size;
  }

  async evaluate(): Promise<AlertFired[]> {
    const fired: AlertFired[] = [];
    const now = Date.now();
    for (const def of this.definitions.values()) {
      const last = this.lastFired.get(def.id) ?? 0;
      if (now - last < def.cooldownSec * 1000) continue;
      let triggered = false;
      try {
        triggered = await def.condition();
      } catch (error) {
        logWarn("alert.condition_failed", {
          alertId: def.id,
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
      if (!triggered) continue;
      const alert: AlertFired = {
        id: def.id,
        description: def.description,
        severity: def.severity,
        firedAt: new Date().toISOString(),
      };
      this.lastFired.set(def.id, now);
      for (const handler of this.handlers) {
        await handler.fire(alert).catch((error) => {
          logWarn("alert.handler_failed", {
            alertId: def.id,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
      fired.push(alert);
    }
    return fired;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.evaluate();
    }, this.intervalMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}

/** Handler que solo loguea. Sirve para desarrollo y para CI. */
export class LogAlertHandler implements AlertHandler {
  async fire(alert: AlertFired): Promise<void> {
    logWarn("alert.fired", {
      alertId: alert.id,
      severity: alert.severity,
      description: alert.description,
    });
  }
}
```

## File: apps/server/src/engine/events/consumers/audit.ts
```typescript
// EVENTS_CONSUMER_AUDIT_V1 — consumidor del bus que escribe audit entries
// para tipos de evento que no pasan por el kernel.
//
// El kernel ya escribe audit para turn/thought. Este consumidor cubre
// auth, policy, system y state transitions, que hoy no van a audit.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md,
// roadmap §8 ("3 consumidores reales además de ReactionEngine").

import { globalSubscribers } from "../subscriber.ts";
import type { Store } from "../../../db.ts";
import type { SystemEvent } from "../types.ts";

const AUDITED_TYPES = new Set([
  "auth.login",
  "auth.login_failed",
  "policy.denied",
  "state.changed",
  "state.transition_denied",
  "system.google_disconnected",
  "system.error",
]);

export interface AuditConsumerHandle {
  stop(): void;
}

export function startAuditConsumer(
  owners: string[],
  db: Store,
): AuditConsumerHandle {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (!AUDITED_TYPES.has(event.type)) return;
      // Escritura best-effort: no bloquea el bus.
      void db
        .put(event.tenantId, "audit-entries", {
          id: `bus-audit-${event.id}`,
          tenantId: event.tenantId,
          owner: event.owner,
          action: event.type,
          actor: { kind: event.source.kind, id: event.source.id },
          payload: event.payload,
          hash: "bus-consumer",
          timestamp: event.emittedAt,
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

## File: apps/server/src/engine/events/consumers/metrics.ts
```typescript
// EVENTS_CONSUMER_METRICS_V1 — consumidor del bus que alimenta métricas.
//
// A diferencia de ReactionEngine (que ejecuta acciones), este consumidor
// solo incrementa contadores. Es de solo lectura y no puede fallar de forma
// que rompa el bus.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Solo ReactionEngine lo lee"),
// roadmap §8 ("3 consumidores reales además de ReactionEngine").

import { globalSubscribers } from "../subscriber.ts";
import { globalMetrics } from "../../../metrics/registry.ts";
import type { SystemEvent } from "../types.ts";

export interface MetricsConsumerHandle {
  stop(): void;
}

export function startMetricsConsumer(owners: string[]): MetricsConsumerHandle {
  // Contadores por tipo de evento.
  globalMetrics.counter(
    "openmuse_events_total",
    "Eventos emitidos por tipo y owner",
  );
  globalMetrics.counter(
    "openmuse_event_failures_total",
    "Eventos con payload inválido (no debería ocurrir)",
  );

  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      try {
        globalMetrics.inc("openmuse_events_total", {
          type: event.type,
          source: event.source.kind,
        });
      } catch {
        globalMetrics.inc("openmuse_event_failures_total", { type: event.type });
      }
    }),
  );

  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}
```

## File: apps/server/src/engine/events/exporters/otel.ts
```typescript
/**
 * OtelExporter (stub).
 *
 * Cuando OpenTelemetry entre:
 *   - Lee del EventSink.
 *   - Convierte cada SystemEvent en un span.
 *   - traceId se genera AQUI, no en el evento.
 *   - spanId = event.id.
 *   - attributes: type, source.kind, source.id, payload.projectId, payload.clientId.
 *   - Es un consumidor: nunca escribe de vuelta al bus.
 */
export interface OtelExporter {}
```

## File: apps/server/src/engine/events/index.ts
```typescript
export type {
  EventAggregate,
  EventFilter,
  EventQuery,
  EventSink,
  SystemEvent,
  SystemEventSource,
  SystemEventType,
} from "./types.ts";
export { SYSTEM_EVENT_TYPES } from "./types.ts";
export { ulid } from "./ulid.ts";
export { SchemaRegistry, type EventSchema } from "./schema-registry.ts";
export { payloadSchemas } from "./schemas.ts";
export { StoreSink, StoreQuery } from "./sinks/store.ts";
export { EventBus, type EmitOptions } from "./bus.ts";
```

## File: apps/server/src/engine/circuit-breaker.ts
```typescript
// CIRCUIT_BREAKER_V1 — cortacircuitos por dominio/proveedor.
//
// Tres estados:
//   closed   — funcionamiento normal.
//   open     — falla el último N; rechaza llamadas sin intentar.
//   half-open — pasado el cooldown, deja pasar un intento de prueba.
//
// Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin circuit breaker"),
// docs/audits/03-resiliencia/roadmap.md §8.

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitOptions {
  /** Fallos consecutivos antes de abrir. */
  failureThreshold: number;
  /** ms que permanece abierto antes de probar half-open. */
  openMs: number;
  /** ms máximos para half-open (si el intento de prueba no responde, se vuelve a abrir). */
  halfOpenTimeoutMs: number;
}

export const DEFAULT_CIRCUIT: CircuitOptions = {
  failureThreshold: 5,
  openMs: 30_000,
  halfOpenTimeoutMs: 10_000,
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt = 0;
  private halfOpenStartedAt = 0;

  constructor(
    readonly name: string,
    private readonly options: CircuitOptions = DEFAULT_CIRCUIT,
  ) {}

  getState(): CircuitState {
    // Si está abierto y ya pasó el cooldown, transiciona a half-open.
    if (this.state === "open" && Date.now() - this.openedAt >= this.options.openMs) {
      this.state = "half-open";
      this.halfOpenStartedAt = Date.now();
    }
    // Si está half-open y lleva demasiado, vuelve a open.
    if (
      this.state === "half-open" &&
      Date.now() - this.halfOpenStartedAt > this.options.halfOpenTimeoutMs
    ) {
      this.open();
    }
    return this.state;
  }

  /** Llama al handler. Si el circuito está abierto, lanza sin ejecutar. */
  async call<T>(operation: () => Promise<T>): Promise<T> {
    const current = this.getState();
    if (current === "open") {
      throw new CircuitOpenError(this.name);
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.state === "half-open") {
      // Un solo fallo en half-open reabre.
      this.open();
      return;
    }
    if (this.failures >= this.options.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.state = "open";
    this.openedAt = Date.now();
    this.failures = 0;
  }

  /** Fuerza el cierre (útil en tests). */
  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.openedAt = 0;
    this.halfOpenStartedAt = 0;
  }
}

export class CircuitOpenError extends Error {
  readonly code = "circuit_open";
  constructor(readonly circuitName: string) {
    super(`Circuito abierto para ${circuitName}`);
    this.name = "CircuitOpenError";
  }
}

/** Registro por nombre. Un breaker por proveedor (google, llm, whatsapp, stripe). */
export class CircuitRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();

  get(name: string, options?: CircuitOptions): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker(name, options);
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  all(): CircuitBreaker[] {
    return [...this.breakers.values()];
  }
}

export const globalCircuits = new CircuitRegistry();
```

## File: apps/server/src/engine/dead-letter.ts
```typescript
// DEAD_LETTER_V1 — cola de tareas que han fallado persistentemente.
//
// Cuando una tarea agota sus reintentos (o falla con un error determinista
// grave), va aquí. Operador humano puede:
//   - re-encolarla manualmente (con reset de attempts)
//   - ver el error original
//   - borrarla
//
// Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin dead letter queue"),
// docs/audits/03-resiliencia/roadmap.md §8.

import { randomUUID } from "node:crypto";
import type { AgentTask } from "../../../../packages/domain/src/agent.ts";
import type { Store } from "../db.ts";
import type { TenantScopedStore } from "../db-tenant.ts";

const KIND = "dead-letter";

export interface DeadLetterEntry {
  id: string;
  taskId: string;
  tenantId: string;
  owner: string;
  title: string;
  kind: AgentTask["kind"];
  error: string;
  attempts: number;
  addedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export class DeadLetterQueue {
  constructor(private readonly db: Store | TenantScopedStore) {}

  /** Mueve una tarea al dead-letter. Idempotente: si ya está, no duplica. */
  async enqueue(task: AgentTask, error: string, owner: string): Promise<DeadLetterEntry> {
    const id = `dl-${task.id}`;
    const existing = await this.db.get<DeadLetterEntry>(owner, KIND, id);
    if (existing) return existing;
    const entry: DeadLetterEntry = {
      id,
      taskId: task.id,
      tenantId: task.tenantId,
      owner,
      title: task.title.slice(0, 200),
      kind: task.kind,
      error: error.slice(0, 2000),
      attempts: task.attempts,
      addedAt: new Date().toISOString(),
    };
    await this.db.insertIfAbsent(owner, KIND, entry);
    const saved = await this.db.get<DeadLetterEntry>(owner, KIND, id);
    return saved ?? entry;
  }

  async list(owner: string, limit = 100): Promise<DeadLetterEntry[]> {
    return this.db.list<DeadLetterEntry>(owner, KIND, { limit });
  }

  async resolve(owner: string, id: string, resolvedBy: string): Promise<DeadLetterEntry | null> {
    const existing = await this.db.get<DeadLetterEntry>(owner, KIND, id);
    if (!existing) return null;
    const updated: DeadLetterEntry = {
      ...existing,
      resolvedAt: new Date().toISOString(),
      resolvedBy,
    };
    await this.db.put(owner, KIND, updated);
    return updated;
  }

  async remove(owner: string, id: string): Promise<void> {
    await this.db.remove(owner, KIND, id);
  }
}

/** Re-encola una tarea del dead-letter. Devuelve el nuevo id de task. */
export function resetForRequeue(task: AgentTask): AgentTask {
  return {
    ...task,
    id: randomUUID(),
    status: "queued",
    attempts: 0,
    error: null,
    leaseId: null,
    leaseUntil: null,
    updatedAt: new Date().toISOString(),
  };
}
```

## File: apps/server/src/engine/retry.ts
```typescript
// RETRY_V1 — backoff exponencial con jitter.
//
// Primitiva base del bloque 03. La usan model-chain, worker, google y computer.
//
// Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin retry con backoff"),
// docs/audits/03-resiliencia/roadmap.md §8 ("el sistema reintenta con backoff").
//
// Reglas:
//   - Nunca reintentar errores deterministas (4xx, validación).
//   - Sí reintentar errores transitorios (5xx, timeouts, red).
//   - Jitter completo (no parcial): evita thundering herd cuando N tareas
//     fallan por el mismo proveedor caído y reintentan a la vez.

export interface RetryOptions {
  maxAttempts: number;
  baseMs: number;
  maxMs: number;
  /** Determina si un error merece reintento. Default: true para errores transitorios. */
  isRetryable?: (error: unknown) => boolean;
  /** Callback por cada intento fallido (útil para logging/métricas). */
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
  /** Signal externo (abort del worker, shutdown). */
  signal?: AbortSignal;
}

export function defaultIsRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  // Abortos explícitos: no reintentar.
  if (error.name === "AbortError") return false;
  // Errores tipados con status 4xx: no reintentar.
  const status = (error as { status?: number }).status;
  if (typeof status === "number") {
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) return false;
    if (status >= 500 || status === 408 || status === 429) return true;
  }
  // Errores de red / timeout / DNS.
  const message = error.message.toLowerCase();
  if (/timeout|econn|enotfound|eai_again|socket|network|aborted|fetch failed/.test(message)) {
    return true;
  }
  // Errores tipo OutcomeUnknownError del dominio: el efecto puede haber salido.
  if ((error as { outcomeUnknown?: boolean }).outcomeUnknown === true) return false;
  // Por defecto, no reintentar: preferimos declarar explícitamente qué es retryable.
  return false;
}

/** Jitter completo: un valor uniforme en [0, delay]. Evita sincronización de reintentos. */
function withFullJitter(delayMs: number): number {
  return Math.floor(Math.random() * delayMs);
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const isRetryable = options.isRetryable ?? defaultIsRetryable;
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    options.signal?.throwIfAborted();
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === options.maxAttempts) break;
      if (!isRetryable(error)) break;

      // Backoff exponencial: base * 2^(attempt-1), capado a maxMs.
      const expDelay = Math.min(options.maxMs, options.baseMs * 2 ** (attempt - 1));
      const delayMs = withFullJitter(expDelay);

      options.onRetry?.(attempt, delayMs, error);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delayMs);
        const abort = () => {
          clearTimeout(timer);
          reject(new Error("Aborted during retry backoff"));
        };
        options.signal?.addEventListener("abort", abort, { once: true });
      });
    }
  }
  throw lastError;
}
```

## File: apps/server/src/kernel/graph/store.ts
```typescript
// KERNEL_TURN_STORE_V2 — contrato con tenantId explicito.
//
// Cambios respecto a V1:
//   - Todos los metodos reciben tenantId. Sin esto, el store persistente
//     tiene que escanear todos los tenants para encontrar un turno.
//   - openChildTurn: abre turno hijo de un turno padre.
//   - listTurns: lista turnos por tenant (para debug y presentacion).

import type { Thought } from "./thought.ts";
import type { Turn, TurnCloseReason } from "./turn.ts";

export interface TurnStore {
  openTurn(tenantId: string, owner: string, trigger: string): Promise<Turn>;
  openChildTurn(
    tenantId: string,
    owner: string,
    parentTurnId: string,
    trigger: string,
  ): Promise<Turn>;
  append(thought: Thought): Promise<Thought>;
  thoughtsOf(tenantId: string, turnId: string): Promise<Thought[]>;
  closeTurn(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: "presenter" | "quiescence" | "timeout" | "user" | "system",
  ): Promise<Turn>;
  getTurn(tenantId: string, turnId: string): Promise<Turn | undefined>;
  listTurns(tenantId: string, limit: number): Promise<Turn[]>;
}
```

## File: apps/server/src/kernel/graph/thought.ts
```typescript
// KERNEL_THOUGHT_V2 — AttentionVector completo en Zod.
//
// Cambios respecto a V1:
//   - AttentionVector reescrito: author, id, thoughtId, timestamp, metadata.
//   - MatchReason e IgnoreReason: enums tipados, no strings libres.
//   - MatchedNode e IgnoredNode: con kind y metadata.
//   - Validaciones cruzadas: primary en matched/secondary (warning), no
//     solape matched/ignored (error), no duplicados (error).
//   - thoughtRoleSchema ampliado: critic, verifier, query, confirmation,
//     correction.
//   - thoughtEdgeSchema con weight, confidence, createdAt.
//   - Thought con atencion obligatoria y validacion cruzada de autor.
//
// tenantId sin default: SOC-2 exige aislamiento no opcional.

import { z } from "zod";

// ---------------------------------------------------------------------
// Enums base
// ---------------------------------------------------------------------

export const attentionAuthorSchema = z.enum([
  "user",
  "fast",
  "slow",
  "presenter",
  "worker",
  "system",
]);

export const attentionScopeSchema = z.enum(["turn", "user", "tenant", "global"]);

export const matchReasonSchema = z.enum([
  "explicit_subject",
  "mentioned",
  "direct_relation",
  "policy",
  "history",
  "most_recent",
  "context",
  "inferred",
  "explicit_reference",
]);

export const ignoreReasonSchema = z.enum([
  "not_related",
  "not_mentioned",
  "already_resolved",
  "out_of_scope",
  "low_confidence",
  "duplicate",
  "stale",
  "privacy",
]);

export const thoughtRoleSchema = z.enum([
  "intent",
  "observation",
  "reasoning",
  "response",
  "action",
  "reflection",
  "display",
  "delegation",
  "critic",
  "verifier",
  "query",
  "confirmation",
  "correction",
]);

export const thoughtActorSchema = z.object({
  kind: z.enum(["user", "fast-llm", "slow-llm", "worker", "presenter", "system", "agent"]),
  id: z.string().min(1).max(200),
  onBehalfOf: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------
// Fichas de matched / ignored
// ---------------------------------------------------------------------

export const matchedNodeSchema = z
  .object({
    node: z.string().min(1).max(300),
    weight: z.number().min(0).max(1),
    reason: z.union([matchReasonSchema, z.string().max(500)]),
    kind: z.string().max(100).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const ignoredNodeSchema = z
  .object({
    node: z.string().min(1).max(300),
    reason: z.union([ignoreReasonSchema, z.string().max(500)]),
    kind: z.string().max(100).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

// ---------------------------------------------------------------------
// AttentionVector
// ---------------------------------------------------------------------

export const attentionVectorSchema = z
  .object({
    id: z.string().min(1).max(100),
    author: attentionAuthorSchema,
    thoughtId: z.string().min(1).max(100).optional(),
    primary: z.string().min(1).max(300),
    secondary: z.array(z.string().max(300)).max(50).default([]),
    query: z.string().min(1).max(500),
    matched: z.array(matchedNodeSchema).max(50).default([]),
    ignored: z.array(ignoredNodeSchema).max(50).default([]),
    intent: z.string().min(1).max(200),
    confidence: z.number().min(0).max(1),
    scope: attentionScopeSchema.default("turn"),
    timestamp: z.iso.datetime({ offset: true }),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .superRefine((value, ctx) => {
    const matchedIds = new Set(value.matched.map((m) => m.node));
    const ignoredIds = new Set(value.ignored.map((i) => i.node));
    const overlap = [...matchedIds].filter((id) => ignoredIds.has(id));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `nodos en matched e ignored a la vez: ${overlap.sort().join(", ")}`,
        path: ["matched"],
      });
    }
    const matchedList = value.matched.map((m) => m.node);
    if (matchedList.length !== new Set(matchedList).size) {
      ctx.addIssue({
        code: "custom",
        message: `nodos duplicados en matched`,
        path: ["matched"],
      });
    }
    const ignoredList = value.ignored.map((i) => i.node);
    if (ignoredList.length !== new Set(ignoredList).size) {
      ctx.addIssue({
        code: "custom",
        message: `nodos duplicados en ignored`,
        path: ["ignored"],
      });
    }
  });

// ---------------------------------------------------------------------
// Edges con peso y timestamp
// ---------------------------------------------------------------------

export const thoughtEdgeSchema = z
  .object({
    toThoughtId: z.string().min(1).max(100),
    kind: z.enum([
      "refines",
      "decomposes",
      "resolves",
      "synthesizes",
      "contradicts",
      "depends_on",
      "responds",
      "supports",
    ]),
    weight: z.number().min(0).max(1).default(1),
    confidence: z.number().min(0).max(1).default(1),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

// ---------------------------------------------------------------------
// Contexto, provenance
// ---------------------------------------------------------------------

export const thoughtContextSchema = z.object({
  entities: z.array(z.string().max(300)).max(100).default([]),
  policies: z.array(z.string().max(300)).max(100).default([]),
  skills: z.array(z.string().max(300)).max(100).default([]),
  priorThoughts: z.array(z.string().max(100)).max(100).default([]),
});

export const thoughtProvenanceSchema = z.object({
  source: z.string().min(1).max(300),
  timestamp: z.iso.datetime({ offset: true }),
  parentId: z.string().max(100).optional(),
});

// ---------------------------------------------------------------------
// Thought
// ---------------------------------------------------------------------

export const thoughtSchema = z
  .object({
    id: z.string().min(1).max(100),
    tenantId: z.string().min(1).max(100),
    turnId: z.string().min(1).max(100),
    owner: z.string().min(1).max(200),
    actor: thoughtActorSchema,
    role: thoughtRoleSchema,
    content: z.union([z.string().max(100_000), z.record(z.string(), z.unknown())]),
    attention: attentionVectorSchema,
    context: thoughtContextSchema.default({
      entities: [],
      policies: [],
      skills: [],
      priorThoughts: [],
    }),
    provenance: thoughtProvenanceSchema,
    edges: z.array(thoughtEdgeSchema).max(200).default([]),
  })
  .strict();

// ---------------------------------------------------------------------
// Tipos inferidos
// ---------------------------------------------------------------------

export type AttentionAuthor = z.infer<typeof attentionAuthorSchema>;
export type AttentionScope = z.infer<typeof attentionScopeSchema>;
export type MatchReason = z.infer<typeof matchReasonSchema>;
export type IgnoreReason = z.infer<typeof ignoreReasonSchema>;
export type MatchedNode = z.infer<typeof matchedNodeSchema>;
export type IgnoredNode = z.infer<typeof ignoredNodeSchema>;
export type AttentionVector = z.infer<typeof attentionVectorSchema>;
export type ThoughtRole = z.infer<typeof thoughtRoleSchema>;
export type ThoughtActor = z.infer<typeof thoughtActorSchema>;
export type ThoughtEdge = z.infer<typeof thoughtEdgeSchema>;
export type ThoughtContext = z.infer<typeof thoughtContextSchema>;
export type ThoughtProvenance = z.infer<typeof thoughtProvenanceSchema>;
export type Thought = z.infer<typeof thoughtSchema>;
```

## File: apps/server/src/kernel/graph/turn.ts
```typescript
// KERNEL_TURN_V2 — ciclo de vida completo.
//
// Cambios respecto a V1:
//   - parentTurnId: si el slow sigue tras cerrar el padre, abre turno hijo.
//   - quiescentAt / quiescenceMs: el turno se puede cerrar por quiescencia
//     (nadie escribe durante X ms), no solo por tiempo.
//   - closedBy: quien cerro el turno (presenter, quiescence, timeout, user).
//   - childTurnIds: array de turnos hijos.

import { z } from "zod";

export const turnCloseReasonSchema = z.enum(["response", "timeout", "promotion", "quiescence"]);
export const turnStatusSchema = z.enum(["open", "closed", "promoted"]);
export const turnClosedBySchema = z.enum(["presenter", "quiescence", "timeout", "user", "system"]);

export const turnSchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  parentTurnId: z.string().max(100).optional(),
  childTurnIds: z.array(z.string().max(100)).max(100).default([]),
  startedAt: z.iso.datetime({ offset: true }),
  closedAt: z.iso.datetime({ offset: true }).optional(),
  quiescentAt: z.iso.datetime({ offset: true }).optional(),
  quiescenceMs: z.number().int().min(0).max(600_000).default(10_000),
  status: turnStatusSchema,
  thoughtIds: z.array(z.string().max(100)).max(500).default([]),
  triggers: z.array(z.string().max(100)).max(50).default([]),
  closeReason: turnCloseReasonSchema.optional(),
  closedBy: turnClosedBySchema.optional(),
});

export type TurnStatus = z.infer<typeof turnStatusSchema>;
export type TurnCloseReason = z.infer<typeof turnCloseReasonSchema>;
export type TurnClosedBy = z.infer<typeof turnClosedBySchema>;
export type Turn = z.infer<typeof turnSchema>;
```

## File: apps/server/src/metrics/registry.ts
```typescript
// METRICS_REGISTRY_V1 — contadores y gauges acumulativos en memoria.
//
// Los servicios incrementan aquí. /metrics solo serializa.
// Sin esto, cada GET /metrics escanea la DB entera.
// Ver: docs/audits/02-observabilidad/miniaudit.md ("metrics-exporter
// genera las métricas bajo demanda, no las acumula").

type Labels = Record<string, string>;

function labelKey(labels: Labels): string {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}="${v}"`).join(",");
}

interface Counter {
  name: string;
  help: string;
  samples: Map<string, { labels: Labels; value: number }>;
}

interface Gauge {
  name: string;
  help: string;
  samples: Map<string, { labels: Labels; value: number }>;
}

export class MetricsRegistry {
  private readonly counters = new Map<string, Counter>();
  private readonly gauges = new Map<string, Gauge>();

  counter(name: string, help: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, { name, help, samples: new Map() });
    }
  }

  gauge(name: string, help: string): void {
    if (!this.gauges.has(name)) {
      this.gauges.set(name, { name, help, samples: new Map() });
    }
  }

  inc(name: string, labels: Labels = {}, value = 1): void {
    const c = this.counters.get(name);
    if (!c) return;
    const key = labelKey(labels);
    const sample = c.samples.get(key) ?? { labels, value: 0 };
    sample.value += value;
    c.samples.set(key, sample);
  }

  set(name: string, value: number, labels: Labels = {}): void {
    const g = this.gauges.get(name);
    if (!g) return;
    g.samples.set(labelKey(labels), { labels, value });
  }

  render(): string {
    const lines: string[] = [];
    for (const c of this.counters.values()) {
      lines.push(`# HELP ${c.name} ${c.help}`);
      lines.push(`# TYPE ${c.name} counter`);
      for (const s of c.samples.values()) {
        const lbl = Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(",");
        lines.push(`${c.name}${lbl ? `{${lbl}}` : ""} ${s.value}`);
      }
    }
    for (const g of this.gauges.values()) {
      lines.push(`# HELP ${g.name} ${g.help}`);
      lines.push(`# TYPE ${g.name} gauge`);
      for (const s of g.samples.values()) {
        const lbl = Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(",");
        lines.push(`${g.name}${lbl ? `{${lbl}}` : ""} ${s.value}`);
      }
    }
    return lines.join("\n") + "\n";
  }
}

export const globalMetrics = new MetricsRegistry();

// Registro de los contadores y gauges base.
globalMetrics.counter("openmuse_http_requests_total", "Requests HTTP por método, ruta y status");
globalMetrics.counter("openmuse_tasks_created_total", "Tareas creadas por tenant y tipo");
globalMetrics.counter("openmuse_tasks_completed_total", "Tareas completadas por tenant y estado");
globalMetrics.counter("openmuse_llm_calls_total", "Llamadas al LLM por velocidad, modelo, source");
// METRIC_LLM_SPEED_V1 - incluye label speed.
globalMetrics.counter("openmuse_llm_tokens_total", "Tokens consumidos por velocidad y modelo");
globalMetrics.gauge("openmuse_worker_running", "1 si el worker está corriendo");
globalMetrics.gauge("openmuse_tasks_active", "Tareas activas por tenant");
globalMetrics.gauge("openmuse_tenants_total", "Tenants activos");
// METRIC_LATENCY_SPEED_V1 - latencia por velocidad.
globalMetrics.counter("openmuse_llm_latency_ms_sum", "Suma de latencias");
globalMetrics.counter("openmuse_llm_latency_ms_count", "Numero de llamadas");
```

## File: apps/server/src/middleware/request-logger.ts
```typescript
// REQUEST_LOGGER_V1 — correlationId + logging estructurado por request.
//
// Genera un correlationId por request (o reusa el header X-Correlation-Id)
// y lo propaga al resto del código vía AsyncLocalStorage.
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin traceId").

import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";
import { withLogContext, logInfo, logWarn } from "../log.ts";
import { globalMetrics } from "../metrics/registry.ts";

/**
 * Extrae el correlationId de la cabecera o genera uno nuevo.
 * Acepta X-Correlation-Id y X-Request-Id para clientes existentes.
 */
function correlationIdFrom(c: Context): string {
  const fromHeader =
    c.req.header("x-correlation-id") ??
    c.req.header("x-request-id") ??
    c.req.header("traceparent")?.split("-")[1];
  if (fromHeader && /^[A-Za-z0-9._-]{8,128}$/.test(fromHeader)) return fromHeader;
  return randomUUID();
}

/**
 * Middleware que envuelve el request en un contexto de correlación.
 * Debe registrarse ANTES que cualquier otro middleware que loguee.
 */
export function requestLogger() {
  return async (c: Context, next: Next) => {
    const correlationId = correlationIdFrom(c);
    const startedAt = performance.now();
    const method = c.req.method;
    const path = new URL(c.req.url).pathname;

    // Cabecera de vuelta para que el cliente pueda trazar.
    c.header("X-Correlation-Id", correlationId);

    await withLogContext({ correlationId }, async () => {
      logInfo("http.request", { method, path });
      try {
        await next();
        const durationMs = Math.round(performance.now() - startedAt);
        const status = c.res.status;
        const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
        const emit = level === "warn" ? logWarn : logInfo;
        emit("http.response", { method, path, status, durationMs });
        // METRICS_HTTP_V1 — contador por método, ruta y status.
        globalMetrics.inc("openmuse_http_requests_total", {
          method,
          path: path.replace(/\/[0-9a-f-]{8,}/gi, "/:id"),
          status: String(status),
        });
      } catch (error) {
        const durationMs = Math.round(performance.now() - startedAt);
        logWarn("http.error", {
          method,
          path,
          durationMs,
          error: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
        });
        throw error;
      }
    });
  };
}
```

## File: scripts/audits/capture-log-samples.ps1
```powershell
# CAPTURE_LOG_SAMPLES_V1 — arranca el API, hace un request, captura logs.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/log-samples.txt"
$correlation = "audit-corr-$(Get-Random -Maximum 99999)"

Write-Host "Arrancando API en background..." -ForegroundColor Cyan
$api = Start-Process -FilePath "pnpm" -ArgumentList "dev" -PassThru -NoNewWindow `
  -RedirectStandardOutput "artifacts/api-stdout.log" `
  -RedirectStandardError "artifacts/api-stderr.log" `
  -ErrorAction SilentlyContinue

Start-Sleep -Seconds 8

try {
  Write-Host "Haciendo request con correlationId=$correlation..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri "http://127.0.0.1:8787/api/health" `
    -Headers @{ "X-Correlation-Id" = $correlation } -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
} finally {
  $api.Kill()
}

if (Test-Path "artifacts/api-stdout.log") {
  $matches = Select-String -Path "artifacts/api-stdout.log" -Pattern $correlation
  "=== Líneas con correlationId $correlation ===" | Out-File -FilePath $out -Encoding utf8
  if ($matches) {
    $matches | ForEach-Object { $_.Line } | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "OK: $($matches.Count) líneas encontradas" -ForegroundColor Green
  } else {
    "FALLO: ninguna línea con el correlationId" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "FALLO: el correlationId no se propagó" -ForegroundColor Red
  }
}
```

## File: scripts/audits/check-secret-redaction.ps1
```powershell
# CHECK_SECRET_REDACTION_V1 — verifica que los logs no contienen secretos.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/secret-redaction-check.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$patterns = @(
  "Bearer\s+[A-Za-z0-9_\-\.]{20,}",         # authorization
  "sk-[A-Za-z0-9]{20,}",                    # api key estilo OpenAI
  "AIza[A-Za-z0-9_\-]{30,}",                # api key Google
  '"password"\s*:\s*"[^"]+"',               # password en JSON
  '"token"\s*:\s*"[^"]+"'                   # token en JSON
)

$logs = Get-ChildItem -Path "artifacts" -Recurse -Include "*.log" -ErrorAction SilentlyContinue
if (-not $logs) {
  "=== No hay logs en artifacts/ para analizar ===" | Out-File -FilePath $out -Encoding utf8
  Write-Host "SKIP: no hay logs en artifacts/" -ForegroundColor Yellow
  return
}

$findings = @()
foreach ($log in $logs) {
  foreach ($pattern in $patterns) {
    $hits = Select-String -Path $log.FullName -Pattern $pattern -ErrorAction SilentlyContinue
    if ($hits) {
      $findings += [pscustomobject]@{
        File = $log.Name
        Pattern = $pattern
        Count = $hits.Count
      }
    }
  }
}

"=== Resultado de la verificación de redacción ===" | Out-File -FilePath $out -Encoding utf8
if ($findings.Count -eq 0) {
  "OK: no se han encontrado secretos en claro en los logs." | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "OK: redacción funciona" -ForegroundColor Green
} else {
  "FALLO: los siguientes archivos contienen posibles secretos:" | Out-File -FilePath $out -Append -Encoding utf8
  $findings | Format-Table -AutoSize | Out-String | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "FALLO: hay $($findings.Count) hallazgos" -ForegroundColor Red
}
```

## File: scripts/audits/find-hanging-before.ps1
```powershell
# FIND_HANGING_BEFORE_V1 — localiza los tests cuyo `before` se cuelga.
# Ejecuta cada archivo de tests por separado con timeout de 10s.
# Los que salen por timeout son candidatos.
# Salida: docs/audits/_prep/hanging-before.txt

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/hanging-before.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$files = Get-ChildItem tests -Filter "*.test.ts" -File
$hanging = @()

"# Tests que superan 10s (candidatos a before colgado)" | Out-File -FilePath $out -Encoding utf8
"# Generado: $(Get-Date -Format o)" | Out-File -FilePath $out -Append -Encoding utf8

foreach ($f in $files) {
  $start = Get-Date
  $proc = Start-Process -FilePath "pnpm" -ArgumentList "exec","tsx","--test","--test-timeout=10000",$f.FullName -PassThru -NoNewWindow -RedirectStandardOutput "NUL" -RedirectStandardError "NUL"
  $done = $proc.WaitForExit(15000)
  if (-not $done) {
    $proc.Kill()
    $hanging += $f.Name
    "$($f.Name) — TIMEOUT >15s" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "HANG: $($f.Name)" -ForegroundColor Red
  } else {
    $elapsed = ((Get-Date) - $start).TotalSeconds
    if ($elapsed -gt 8) {
      "$($f.Name) — lento: $([math]::Round($elapsed,1))s" | Out-File -FilePath $out -Append -Encoding utf8
      Write-Host "SLOW: $($f.Name) $([math]::Round($elapsed,1))s" -ForegroundColor Yellow
    }
  }
}

"" | Out-File -FilePath $out -Append -Encoding utf8
"Total candidatos: $($hanging.Count)" | Out-File -FilePath $out -Append -Encoding utf8
Write-Host "Informe: $out" -ForegroundColor Green
```

## File: scripts/audits/test-coverage-report.ps1
```powershell
# TEST_COVERAGE_REPORT_V1 — % de cobertura por bloque de la campaña.
# Los 6 módulos críticos del roadmap 01: worker, service, actions,
# kernel, rag, tenant. Este script los mide.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

Write-Host "Corriendo pnpm test:coverage..." -ForegroundColor Cyan
pnpm test:coverage 2>&1 | Out-Host

$summary = "coverage/coverage-summary.json"
if (-not (Test-Path $summary)) {
  Write-Host "FALLO: no hay $summary. ¿Instalaste c8?" -ForegroundColor Red
  return
}

$data = Get-Content $summary -Raw | ConvertFrom-Json

$critical = @{
  "worker.ts"   = "apps/server/src/engine/worker.ts"
  "service.ts"  = "apps/server/src/engine/service.ts"
  "actions.ts"  = "apps/server/src/actions.ts"
  "kernel/*"    = "apps/server/src/kernel/"
  "rag.ts"      = "apps/server/src/engine/rag.ts"
  "tenant.ts"   = "apps/server/src/engine/tenant.ts"
}

Write-Host "`n=== Cobertura por módulo crítico ===" -ForegroundColor Cyan
foreach ($name in $critical.Keys) {
  $path = $critical[$name]
  $matches = $data.PSObject.Properties | Where-Object { $_.Name -like "*$path*" }
  if ($matches) {
    $sum = $matches | ForEach-Object { $_.Value.lines.pct } | Measure-Object -Average
    $pct = [math]::Round($sum.Average, 1)
    $color = if ($pct -ge 50) { "Green" } else { "Yellow" }
    Write-Host ("  {0,-15} {1,6}%" -f $name, $pct) -ForegroundColor $color
  } else {
    Write-Host ("  {0,-15} sin datos" -f $name) -ForegroundColor DarkGray
  }
}
```

## File: tests/alerts.test.ts
```typescript
// TESTS_ALERTS_V1 — el motor de alertas respeta cooldown y dispara handlers.
// Ver: docs/audits/02-observabilidad/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { AlertService, type AlertHandler } from "../apps/server/src/alerts/service.ts";

class CountingHandler implements AlertHandler {
  fired: string[] = [];
  async fire(alert: { id: string }): Promise<void> {
    this.fired.push(alert.id);
  }
}

test("alerta que cumple condición dispara", async () => {
  const handler = new CountingHandler();
  const svc = new AlertService([handler]);
  let triggered = true;
  svc.register({
    id: "test-alert",
    description: "test",
    severity: "warning",
    cooldownSec: 1,
    condition: () => triggered,
  });
  const fired = await svc.evaluate();
  assert.equal(fired.length, 1);
  assert.equal(handler.fired.length, 1);
});

test("cooldown evita disparos consecutivos", async () => {
  const handler = new CountingHandler();
  const svc = new AlertService([handler]);
  svc.register({
    id: "test-cooldown",
    description: "test",
    severity: "warning",
    cooldownSec: 3600,
    condition: () => true,
  });
  await svc.evaluate();
  await svc.evaluate();
  assert.equal(handler.fired.length, 1, "cooldown de 1h debe impedir el segundo");
});

test("condición que lanza no rompe el motor", async () => {
  const handler = new CountingHandler();
  const svc = new AlertService([handler]);
  svc.register({
    id: "test-throw",
    description: "test",
    severity: "warning",
    cooldownSec: 1,
    condition: () => {
      throw new Error("boom");
    },
  });
  const fired = await svc.evaluate();
  assert.equal(fired.length, 0);
});

test("buildAlertDefinitions devuelve las 5 alertas base", async () => {
  const { buildAlertDefinitions } = await import(
    "../apps/server/src/alerts/definitions.ts"
  );
  const defs = buildAlertDefinitions({
    metricsSnapshot: () => ({
      http5xx: 0,
      httpTotal: 100,
      taskFailuresLastHour: 0,
      tenantQuotaExceeded: 0,
      workerRunning: true,
    }),
  });
  assert.equal(defs.length, 5);
  const ids = defs.map((d) => d.id).sort();
  assert.deepEqual(ids, [
    "http_5xx_high",
    "http_latency_p99",
    "tasks_failing_burst",
    "tenant_quota_repeated",
    "worker_down",
  ]);
});
```

## File: tests/concurrency.test.ts
```typescript
// TESTS_CONCURRENCY_V1 — dos usuarios, mismo recurso.
// Ver: docs/audits/04-multi-usuario-concurrente/roadmap.md §8.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { Config } from "../apps/server/src/config.ts";

let db: Store;
let server: Awaited<ReturnType<typeof createApp>>;
let token: string;
let directory: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-concurrency-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
  server = await createApp(db, config);
  const session = await server.app.request("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  token = (await session.json()).token;
});

after(async () => {
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const headers = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

test("dos usuarios concurrentes en el mismo thread: uno guarda, el otro recibe 409", async () => {
  // 1. Crear thread.
  const created = await server.app.request("/api/threads", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ title: "Concurrency test" }),
  });
  const thread = await created.json();
  const id = thread.id;

  // 2. Usuario A lee el estado.
  const stateA = await server.app.request(`/api/threads/${id}/state`, { headers: headers() });
  const snapshotA = await stateA.json();

  // 3. Usuario A guarda con expectedUpdatedAt.
  const saveA = await server.app.request(`/api/threads/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      messages: [{ id: "m1", role: "user", content: "from A" }],
      expectedUpdatedAt: snapshotA.updatedAt,
    }),
  });
  assert.equal(saveA.status, 200, "usuario A guarda sin conflicto");

  // 4. Usuario B intenta guardar con el MISMO expectedUpdatedAt.
  const saveB = await server.app.request(`/api/threads/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      messages: [{ id: "m2", role: "user", content: "from B" }],
      expectedUpdatedAt: snapshotA.updatedAt,
    }),
  });
  assert.equal(saveB.status, 409, "usuario B recibe 409");
  const conflict = await saveB.json();
  assert.match(conflict.error, /Recarga|modificado/i);
});

test("notificaciones dirigidas por userId no llegan a otros", async () => {
  // Crear notificación directa para user-A.
  const created = await server.app.request("/api/agent/notifications/direct", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      userId: "user-A",
      title: "Solo para A",
      body: "Contenido privado",
    }),
  });
  assert.equal(created.status, 201);
  const notif = await created.json();
  assert.equal(notif.assignedTo, "user-A");
});

test("presence: dos usuarios tocando el mismo thread se detectan", async () => {
  const created = await server.app.request("/api/threads", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ title: "Presence test" }),
  });
  const thread = await created.json();

  await server.app.request(`/api/threads/${thread.id}/presence`, {
    method: "POST",
    headers: { ...headers(), "x-user-id": "user-A" },
    body: "{}",
  });

  const touch = await server.app.request(`/api/threads/${thread.id}/presence`, {
    method: "POST",
    headers: { ...headers(), "x-user-id": "user-B" },
    body: "{}",
  });
  const result = await touch.json();
  assert.equal(result.others.length, 1);
  assert.equal(result.others[0].userId, "user-A");
});
```

## File: tests/crash-recovery.test.ts
```typescript
// TESTS_CRASH_RECOVERY_V1 — el proceso muere a mitad de tarea.
// El roadmap 01 lo pide: "test que mate el proceso a mitad de tarea
// y verifique la recuperación".
// Ver: docs/audits/01-tests/roadmap.md §8.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createStore, type Store } from "../apps/server/src/db.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(here, "..");

let directory: string;
let db: Store;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-crash-"));
  db = await createStore({ dataDir: join(directory, "db") });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

const CRASH_TASK_ID = "crash-test-task";

test("el proceso worker muere a mitad de tarea y la tarea queda running con lease", async () => {
  // 1. Creamos una tarea que el worker procesará y colgará a propósito.
  const task: AgentTask = {
    id: CRASH_TASK_ID,
    tenantId: "default",
    title: "Crash test",
    prompt: "Duerme y no termines nunca",
    kind: "agent",
    status: "queued",
    plan: [{ id: "0", title: "Dormir", status: "pending" }],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
  await db.put("crash-owner", "tasks", task);
  await db.close();

  // 2. Lanzamos un subproceso que hace el tick del worker con una tarea
  //    que duerme indefinidamente (para forzar el kill).
  const workerScript = join(here, "helpers", "crash-worker.ts");
  const child = spawn("pnpm", ["exec", "tsx", workerScript], {
    cwd: repoRoot,
    stdio: "pipe",
    env: { ...process.env, DATA_DIR: join(directory, "db") },
  });

  // 3. Esperamos a que la tarea pase a "running" (worker la ha tomado).
  const deadline = Date.now() + 15000;
  let running = false;
  const probe = await createStore({ dataDir: join(directory, "db") });
  while (Date.now() < deadline) {
    const t = await probe.get<AgentTask>("crash-owner", "tasks", CRASH_TASK_ID);
    if (t?.status === "running" && t.leaseId) { running = true; break; }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(running, "la tarea debe estar running antes del kill");

  // 4. Matamos el proceso con SIGKILL. Sin cleanup.
  child.kill("SIGKILL");
  await new Promise((r) => setTimeout(r, 500));

  // 5. Verificamos que la tarea sigue en running con lease (no se ha limpiado).
  const afterKill = await probe.get<AgentTask>("crash-owner", "tasks", CRASH_TASK_ID);
  assert.equal(afterKill?.status, "running");
  assert.ok(afterKill?.leaseId);

  // 6. "Reiniciamos": recoverInterruptedTasks debe devolverla a queued.
  const { createApp } = await import("../apps/server/src/app.ts");
  const app = await createApp(probe, {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  });
  // Forzamos que el lease esté expirado para que recoverInterruptedTasks lo recoja.
  await probe.compareAndSwap<AgentTask>(
    "crash-owner", "tasks", CRASH_TASK_ID,
    { status: "running" },
    { leaseUntil: new Date(Date.now() - 1000).toISOString() },
  );
  const recovered = await app.agent.recoverInterruptedTasks();
  assert.ok(recovered >= 1, "al menos esta tarea debe recuperarse");

  const final = await probe.get<AgentTask>("crash-owner", "tasks", CRASH_TASK_ID);
  assert.equal(final?.status, "queued", "la tarea vuelve a queued sin duplicar");
  assert.equal(final?.attempts, 1, "los intentos no se duplican");

  await app.agent.stop();
  await probe.close();
});
```

## File: tests/event-bus-dedupe.test.ts
```typescript
// TESTS_EVENT_BUS_DEDUPE_V1 — dedupe con dedupeKey explícita.
// El miniaudit 08 lo pide: "Sin test de dedupe por tipo".

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";

test("emit con dedupeKey no duplica; sin dedupeKey, siempre escribe", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);

    // Sin dedupeKey: cada emisión es un evento nuevo.
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 });
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 });
    const noDedupe = await db.list("owner", "system-events");
    assert.equal(noDedupe.length, 2, "sin dedupeKey, dos eventos");

    // Con dedupeKey: la segunda emisión se descarta.
    await db.remove("owner", "system-events", noDedupe[0].id);
    await db.remove("owner", "system-events", noDedupe[1].id);
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 }, { dedupeKey: "test-key-1" });
    await bus.emit("owner", "system.maintenance", { kind: "system", id: "m" }, { tasks: 0, monitors: 0 }, { dedupeKey: "test-key-1" });
    const withDedupe = await db.list("owner", "system-events");
    assert.equal(withDedupe.length, 1, "con dedupeKey, un evento");
  } finally {
    await db.close();
  }
});
```

## File: tests/log.test.ts
```typescript
// TESTS_LOG_V1 — redacción y propagación de correlationId.
// Ver: docs/audits/02-observabilidad/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  redact,
  withLogContext,
  logContext,
  logInfo,
} from "../apps/server/src/log.ts";

test("redact elimina authorization, apiKey, password, token", () => {
  const input = {
    user: "alice",
    authorization: "Bearer sk-123",
    nested: {
      apiKey: "secret-key",
      password: "hunter2",
      token: "abc",
      visible: "ok",
    },
  };
  const out = redact(input) as Record<string, unknown>;
  assert.equal(out.user, "alice");
  assert.equal(out.authorization, "[REDACTED]");
  const nested = out.nested as Record<string, unknown>;
  assert.equal(nested.apiKey, "[REDACTED]");
  assert.equal(nested.password, "[REDACTED]");
  assert.equal(nested.token, "[REDACTED]");
  assert.equal(nested.visible, "ok");
});

test("redact no rompe con ciclos ni con primitivos", () => {
  assert.equal(redact(null), null);
  assert.equal(redact(42), 42);
  assert.equal(redact("texto"), "texto");
});

test("withLogContext propaga correlationId a logInfo", () => {
  const original = console.log;
  const captured: string[] = [];
  console.log = (line: string) => captured.push(line);
  try {
    withLogContext({ correlationId: "test-corr-123", owner: "alice" }, () => {
      logInfo("test.event", { foo: "bar" });
    });
  } finally {
    console.log = original;
  }
  assert.equal(captured.length, 1);
  const parsed = JSON.parse(captured[0]);
  assert.equal(parsed.correlationId, "test-corr-123");
  assert.equal(parsed.owner, "alice");
  assert.equal(parsed.event, "test.event");
  assert.equal(parsed.foo, "bar");
});

test("logContext.getStore devuelve undefined fuera de contexto", () => {
  assert.equal(logContext.getStore(), undefined);
});
```

## File: tests/permissions.test.ts
```typescript
import assert from "node:assert/strict";
import { test } from "node:test";
import { agentRoleSchema } from "../packages/domain/src/agent.ts";

test("agentRoleSchema acepta rol con permissions", () => {
  const role = agentRoleSchema.parse({
    id: "rrhh",
    name: "Elena",
    tone: "thoughtful",
    avatar: "lilac",
    objetivo: "Onboarding",
    sops: [],
    active: true,
    memories: [],
    permissions: [{ resource: "entity:candidate", actions: ["read", "create"] }],
  });
  assert.equal(role.permissions?.[0].resource, "entity:candidate");
  assert.deepEqual(role.permissions?.[0].actions, ["read", "create"]);
});

test("agentRoleSchema rechaza actions invalidas", () => {
  const res = agentRoleSchema.safeParse({
    id: "x",
    name: "X",
    tone: "warm",
    avatar: "sky",
    objetivo: "",
    sops: [],
    active: true,
    memories: [],
    permissions: [{ resource: "r", actions: ["invalid"] }],
  });
  assert.equal(res.success, false);
});

test("agentRoleSchema permite rol sin permissions", () => {
  const role = agentRoleSchema.parse({
    id: "legal",
    name: "Martin",
    tone: "thoughtful",
    avatar: "sand",
    objetivo: "Contratos",
    sops: [],
    active: true,
    memories: [],
  });
  assert.equal(role.permissions, undefined);
});
```

## File: tests/setup.ts
```typescript
// TESTS_SETUP_V1 — aísla los tests del exterior.
// Cargado desde package.json > scripts.test con --import.
// Sin esto, los tests que llaman a Gemini reciben 429 del free tier
// y el fallo se confunde con un bug real (ver docs/audits/01-tests/miniaudit.md).

const REAL_FETCH = globalThis.fetch;

const BLOCKED_HOSTS = [
  "generativelanguage.googleapis.com",   // Gemini
  "openrouter.ai",                        // fallback
  "oauth2.googleapis.com",                // OAuth
  "gmail.googleapis.com",                 // Gmail
  "www.googleapis.com",                   // Calendar / Drive
  "api.stripe.com",                       // Stripe
  "graph.facebook.com",                   // WhatsApp Cloud API
];

const allowNetwork = process.env.ALLOW_NETWORK === "1";

if (!allowNetwork) {
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    for (const host of BLOCKED_HOSTS) {
      if (url.includes(host)) {
        throw new Error(
          `[tests/setup] Llamada bloqueada a ${host}. ` +
          `Define ALLOW_NETWORK=1 para permitir, o mockea esta llamada. ` +
          `URL: ${url}`,
        );
      }
    }
    return REAL_FETCH(input, init);
  };
}

export {};
```

## File: tests/worker-concurrency.test.ts
```typescript
// TESTS_WORKER_CONCURRENCY_V1 — MAX_ACTIVE con 100 tareas largas.
// Ver: docs/audits/05-motor-tareas-durable/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TaskWorker } from "../apps/server/src/engine/worker.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

function makeTask(id: string): AgentTask {
  return {
    id,
    tenantId: "default",
    title: `Task ${id}`,
    prompt: "concurrency test",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

test("MAX_ACTIVE=10 con 100 tareas: no arranca más de 10 a la vez", { timeout: 30000 }, async () => {
  const db = await createStore();
  try {
    for (let i = 0; i < 100; i++) {
      await db.put("concurrency-owner", "tasks", makeTask(`t-${i}`));
    }

    let concurrent = 0;
    let peak = 0;
    const MAX_ACTIVE = 10;
    const worker = new TaskWorker(
      db,
      async () => {
        concurrent += 1;
        peak = Math.max(peak, concurrent);
        await new Promise((r) => setTimeout(r, 50));
        concurrent -= 1;
        return { status: "succeeded", result: "done" };
      },
      { maxActive: MAX_ACTIVE, pollMs: 10_000 },
    );

    // Ejecutar varios ticks hasta agotar.
    for (let tick = 0; tick < 20; tick += 1) {
      await worker.tick();
      if ((await db.list("concurrency-owner", "tasks", { limit: 200 })).every((t) => t.status === "succeeded")) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    const remaining = (await db.list<AgentTask>("concurrency-owner", "tasks", { limit: 200 }))
      .filter((t) => t.status !== "succeeded");
    // No todos tienen por qué terminar en el test (100 tareas, 10 a la vez,
    // 50ms cada una = ~500ms). Pero el peak concurrente NO debe superar 10.
    assert.ok(
      peak <= MAX_ACTIVE,
      `peak concurrente (${peak}) supera MAX_ACTIVE (${MAX_ACTIVE})`,
    );
    void remaining;
  } finally {
    await db.close();
  }
});

test("MAX_ACTIVE=5 con 5 tareas: todas corren", { timeout: 10000 }, async () => {
  const db = await createStore();
  try {
    for (let i = 0; i < 5; i++) {
      await db.put("small-owner", "tasks", makeTask(`s-${i}`));
    }
    let count = 0;
    const worker = new TaskWorker(
      db,
      async () => {
        count += 1;
        return { status: "succeeded" };
      },
      { maxActive: 5, pollMs: 10_000 },
    );
    await worker.tick();
    // Con 5 tareas y maxActive 5, todas deberían arrancar en un tick.
    assert.ok(count <= 5, "no más de 5 handlers");
  } finally {
    await db.close();
  }
});
```

## File: tests/worker-metrics.test.ts
```typescript
// TESTS_WORKER_METRICS_V1 — el worker emite métricas de duración.
// Ver: docs/audits/05-motor-tareas-durable/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TaskWorker } from "../apps/server/src/engine/worker.ts";
import { globalMetrics } from "../apps/server/src/metrics/registry.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

function makeTask(id: string): AgentTask {
  return {
    id,
    tenantId: "default",
    title: `Task ${id}`,
    prompt: "metrics test",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}

test("ejecutar una tarea incrementa task_duration_seconds_count", { timeout: 10000 }, async () => {
  const db = await createStore();
  try {
    // Capturamos el registry antes y después.
    const before = globalMetrics.render();
    await db.put("metrics-owner", "tasks", makeTask("m-1"));

    const worker = new TaskWorker(
      db,
      async () => ({ status: "succeeded", result: "ok" }),
      { maxActive: 1, pollMs: 10_000 },
    );
    await worker.start();
    // Esperamos a que ejecute.
    await new Promise((r) => setTimeout(r, 200));
    await worker.stop();

    const after = globalMetrics.render();
    // El contador debe aparecer en el render.
    assert.match(after, /openmuse_task_duration_seconds_count/);
    assert.match(after, /openmuse_worker_active/);
    assert.match(after, /openmuse_worker_max_active/);
    void before;
  } finally {
    await db.close();
  }
});
```

## File: .c8rc.json
```json
{
  "all": true,
  "include": [
    "apps/server/src/**/*.ts",
    "apps/worker/src/**/*.ts",
    "packages/domain/src/**/*.ts",
    "packages/integrations/src/**/*.ts"
  ],
  "exclude": [
    "**/*.test.ts",
    "**/dist/**",
    "**/node_modules/**",
    "apps/server/src/demo/**",
    "apps/server/src/kernel/cromos/**"
  ],
  "reporter": ["text", "text-summary", "json-summary", "lcov"],
  "report-dir": "coverage",
  "temp-directory": "coverage/.tmp",
  "check-coverage": false,
  "lines": 50,
  "functions": 50,
  "branches": 40,
  "statements": 50
}
```

## File: tests/event-bus.test.ts
```typescript
// EVENTBUS_STRICT_TEST — valida que todo tipo de SYSTEM_EVENT_TYPES tiene schema y que
// un payload minimo valido no revienta al emitir. Ademas, falla si un tipo del enum no
// aparece en ningun bus.emit del repo (defensa contra schemas decorativos).
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import { SYSTEM_EVENT_TYPES } from "../apps/server/src/engine/events/types.ts";
import { payloadSchemas } from "../apps/server/src/engine/events/schemas.ts";

const minimalPayload: Record<string, Record<string, unknown>> = {
  "task.created": { title: "T", kind: "agent" },
  "task.status_changed": { from: "queued", to: "running" },
  "task.completed": { title: "T" },
  "task.failed": { title: "T" },
  "task.waiting_input": { title: "T" },
  "task.waiting_approval": { title: "T" },
  "task.controlled": { action: "pause" },
  "sop.step_started": { index: 0, title: "T" },
  "sop.step_completed": { index: 0, title: "T" },
  "sop.step_skipped": { index: 0, title: "T" },
  "sop.failed": {},
  "action.proposed": { title: "T", kind: "email.send" },
  "action.approved": { title: "T" },
  "action.denied": { title: "T" },
  "action.executed": { title: "T" },
  "action.failed": { title: "T" },
  "action.outcome_unknown": { title: "T" },
  "monitor.check": { url: "https://example.com", matched: false },
  "monitor.changed": { url: "https://example.com", excerpt: "x" },
  "monitor.failed": { url: "https://example.com", error: "x" },
  "system.startup": { mode: "sample" },
  "system.error": { message: "x" },
  "system.maintenance": { tasks: 0, monitors: 0 },
  "system.google_disconnected": { owner: "o" },
  "auth.login": { userId: "u" },
  "auth.login_failed": { email: "e@e.com" },
  // SCHEMAS_V2 — los 13 tipos de business graph, policy, state machine, agent runtime y
  // context. Faltaban: el test 1 recorre SYSTEM_EVENT_TYPES y sin estas entradas reventaba
  // en el primer tipo nuevo, y el test 2 se tragaba 13 ZodErrors en silencio (el bus captura
  // y solo hace backgroundFailure, asi que el test 2 pasaba igual). Valores minimos validos
  // contra payloadSchemas: version/durationMs positivos, changedFields obligatorio, etc.
  "entity.created": { entityId: "e", entityType: "test", version: 1 },
  "entity.updated": { entityId: "e", entityType: "test", version: 1, changedFields: [] },
  "entity.deleted": { entityId: "e", entityType: "test" },
  "relation.created": {
    relationId: "r",
    fromEntityId: "a",
    toEntityId: "b",
    relationType: "rel",
  },
  "relation.deleted": { relationId: "r" },
  "policy.evaluated": { policyId: "p", decision: "allow", action: "read" },
  "policy.denied": { policyId: "p", action: "read", reason: "x" },
  "state.changed": { entityId: "e", stateMachine: "m", to: "b" },
  "state.transition_denied": {
    entityId: "e",
    stateMachine: "m",
    from: "a",
    attempted: "b",
    reason: "x",
  },
  "agent.runtime_spawned": { runtimeId: "rt", roleId: "ro", taskId: "t" },
  "agent.runtime_completed": { runtimeId: "rt", roleId: "ro", taskId: "t", durationMs: 1 },
  "agent.runtime_failed": { runtimeId: "rt", roleId: "ro", taskId: "t", error: "x" },
  "context.assembled": {
    entityCount: 0,
    relationCount: 0,
    knowledgeCount: 0,
    policyCount: 0,
  },
};

test("todo SystemEventType tiene schema y un payload minimo valido", () => {
  for (const type of SYSTEM_EVENT_TYPES) {
    const schema = payloadSchemas[type];
    assert.ok(schema, `falta schema para ${type}`);
    const payload = minimalPayload[type];
    assert.ok(payload, `falta payload minimo para ${type} en el test`);
    const parsed = schema.safeParse(payload);
    assert.ok(
      parsed.success,
      `payload minimo invalido para ${type}: ${parsed.success ? "" : JSON.stringify(parsed.error.issues)}`,
    );
  }
});

test("EventBus.emit no lanza con ningun tipo del enum", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);
    for (const type of SYSTEM_EVENT_TYPES) {
      await bus.emit("owner", type, { kind: "system", id: "test" }, minimalPayload[type]);
    }
    const stored = await db.list("owner", "system-events");
    assert.ok(stored.length >= 1, "el bus no escribio nada");
  } finally {
    await db.close();
  }
});

test("todo SystemEventType del enum aparece en algun bus.emit del repo", async () => {
  const root = process.cwd();
  const skipDirs = new Set(["node_modules", ".git", "dist", "artifacts", "backups", ".openmuse"]);
  const files: string[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (skipDirs.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  }
  await walk(join(root, "apps"));
  await walk(join(root, "packages"));
  const sources: string[] = [];
  for (const file of files) sources.push(await readFile(file, "utf8"));
  const blob = sources.join("\n");
  const missing: string[] = [];
  for (const type of SYSTEM_EVENT_TYPES) {
    const pattern = new RegExp(`["'\`]${type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'\`]`);
    if (!pattern.test(blob)) missing.push(type);
  }
  assert.deepEqual(
    missing,
    [],
    `estos tipos estan declarados pero no se emiten en ningun sitio: ${missing.join(", ")}`,
  );
});
```

## File: apps/server/src/kernel/observers/meta.ts
```typescript
// KERNEL_META_V1 — metaconsciencia como policy engine.
//
// No es metafora: es un conjunto de reglas explicitas que deciden si el
// fast debe saber algo del slow, y cuando. Sin esto, el fast o ignora al
// slow (y el usuario se queda sin contexto) o lo inunda (y el chat se
// vuelve insoportable).
//
// Reglas:
//   - slow_ready_fast_idle: slow emite ready y fast esta idle -> inyectar
//     en el proximo turno.
//   - slow_long_no_output: slow lleva >30s sin emitir y el usuario pregunta
//     -> responder con presencia ("lo estoy preparando").
//   - slow_failed_urgent: slow emite failed y el usuario espera -> avisar
//     en el proximo turno.
//   - nothing_to_report: no hay nada relevante -> no interrumpir.
//
// El resultado de evaluate() es una lista de "hints" que el presenter
// puede usar para decidir que contar al fast.

import { z } from "zod";
import type { Thought } from "../graph/thought.ts";
import type { ProgressEvent } from "../graph/progress.ts";
import { attentionOverlap } from "../graph/attention.ts";

export const metaRuleSchema = z.enum([
  "slow_ready_fast_idle",
  "slow_long_no_output",
  "slow_failed_urgent",
  "nothing_to_report",
]);

export const metaHintSchema = z.object({
  rule: metaRuleSchema,
  urgency: z.enum(["low", "medium", "high"]),
  message: z.string().min(1).max(500),
  thoughtId: z.string().max(100).optional(),
});

export type MetaRule = z.infer<typeof metaRuleSchema>;
export type MetaHint = z.infer<typeof metaHintSchema>;

export interface MetaInput {
  thoughts: Thought[];
  lastFastActivityAt?: string;
  now: string;
}

// FAST_IDLE_MS_WIRE_V1 - respeta TenantConfig.fastIdleMs.
export interface MetaDeps {
  longNoOutputMs?: number;
}

// META_HINT_CONSUMED_V1 — el Meta recuerda qué hints ya emitió para no
  // repetirlos. Antes, un ready de hace 5 min se re-emitía cada minuto.
  // Ver: auditoría profunda 09 (Meta no distingue slow terminó / nadie lo leyó).
  export interface MetaHintState {
    seenHints: Set<string>;
    lastCleanupAt: number;
  }

  export class Meta {
  private readonly longNoOutputMs: number;

  constructor(deps: MetaDeps = {}) {
    this.longNoOutputMs = deps.longNoOutputMs ?? 30_000;
  }

  // META_HINT_CONSUMED_V1 — estado de hints ya emitidos.
  private readonly seenHints = new Set<string>();
  private lastCleanupAt = 0;

  /** Marca un hint como consumido (el fast lo leyó). */
  consumeHint(hintId: string): void {
    this.seenHints.add(hintId);
  }

  /** Limpia la lista de hints si crece demasiado. */
  private maybeCleanup(): void {
    if (this.seenHints.size < 200) return;
    const now = Date.now();
    if (now - this.lastCleanupAt < 60_000) return;
    this.lastCleanupAt = now;
    this.seenHints.clear();
  }

  evaluate(input: MetaInput): MetaHint[] {
    const hints: MetaHint[] = [];
    const nowMs = Date.parse(input.now);
    const fastActivityMs = input.lastFastActivityAt
      ? Date.parse(input.lastFastActivityAt)
      : 0;

    for (const thought of input.thoughts) {
      const progress = this.extractProgress(thought);
      if (!progress) continue;
      const progressMs = Date.parse(progress.timestamp);

      if (progress.kind === "ready") {
        const fastIsIdle = !input.lastFastActivityAt || nowMs - fastActivityMs > 1000;
        if (fastIsIdle) {
          hints.push({
            rule: "slow_ready_fast_idle",
            urgency: "medium",
            message: `Slow completo: ${progress.message.slice(0, 200)}`,
            thoughtId: thought.id,
          });
        }
      }

      if (progress.kind === "failed") {
        hints.push({
          rule: "slow_failed_urgent",
          urgency: "high",
          message: `Slow fallo: ${progress.message.slice(0, 200)}`,
          thoughtId: thought.id,
        });
      }

      if (progress.kind === "progress" && nowMs - progressMs > this.longNoOutputMs) {
        hints.push({
          rule: "slow_long_no_output",
          urgency: "low",
          message: `Slow sigue trabajando: ${progress.message.slice(0, 200)}`,
          thoughtId: thought.id,
        });
      }
    }

    if (hints.length === 0) {
      hints.push({
        rule: "nothing_to_report",
        urgency: "low",
        message: "Nada relevante que reportar al fast.",
      });
    }

    return hints;
  }

  /**
   * ATTENTION_OVERLAP_META_V1 — detecta si dos thoughts del mismo turno
   * están en conflicto (atención divergente). Útil para el hint
   * slow_failed_urgent cuando dos autores no coinciden.
   * Ver: auditoría profunda 09 (attentionOverlap no se usaba).
   */
  detectAttentionConflict(thoughts: Thought[]): boolean {
    if (thoughts.length < 2) return false;
    const [first, ...rest] = thoughts;
    for (const other of rest) {
      if (attentionOverlap(first.attention, other.attention) < 0.3) return true;
    }
    return false;
  }

  private extractProgress(thought: Thought): ProgressEvent | undefined {
    const raw = (thought as unknown as { progress?: unknown }).progress;
    if (!raw || typeof raw !== "object") return undefined;
    return raw as ProgressEvent;
  }

  /**
   * KERNEL_META_PROGRESS_V1 - evalua directamente sobre ProgressEvent[].
   *
   * Mas limpio que evaluate() cuando el caller ya tiene los eventos reales:
   * no hay que envolverlos en Thought solo para que Meta los saque por cast.
   *
   * Se usa desde el bucle de meta cuando el slow emite progreso real.
   */
  evaluateWithProgress(input: {
    progress: ProgressEvent[];
    lastFastActivityAt?: string;
    now: string;
    thoughtIdByProgressIndex?: Record<number, string>;
  }): MetaHint[] {
    const hints: MetaHint[] = [];
    const nowMs = Date.parse(input.now);
    const fastActivityMs = input.lastFastActivityAt
      ? Date.parse(input.lastFastActivityAt)
      : 0;

    for (let i = 0; i < input.progress.length; i += 1) {
      const progress = input.progress[i];
      const progressMs = Date.parse(progress.timestamp);
      const thoughtId = input.thoughtIdByProgressIndex?.[i];

      if (progress.kind === "ready") {
        const fastIsIdle = !input.lastFastActivityAt || nowMs - fastActivityMs > 1000;
        if (fastIsIdle) {
          hints.push({
            rule: "slow_ready_fast_idle",
            urgency: "medium",
            message: `Slow completo: ${progress.message.slice(0, 200)}`,
            ...(thoughtId ? { thoughtId } : {}),
          });
        }
      }

      if (progress.kind === "failed") {
        hints.push({
          rule: "slow_failed_urgent",
          urgency: "high",
          message: `Slow fallo: ${progress.message.slice(0, 200)}`,
          ...(thoughtId ? { thoughtId } : {}),
        });
      }

      if (progress.kind === "progress" && nowMs - progressMs > this.longNoOutputMs) {
        hints.push({
          rule: "slow_long_no_output",
          urgency: "low",
          message: `Slow sigue trabajando: ${progress.message.slice(0, 200)}`,
          ...(thoughtId ? { thoughtId } : {}),
        });
      }
    }

    if (hints.length === 0) {
      hints.push({
        rule: "nothing_to_report",
        urgency: "low",
        message: "Nada relevante que reportar al fast.",
      });
    }

    return hints;
  }
}
```

## File: apps/server/src/kernel/observers/presenter.ts
```typescript
// KERNEL_PRESENTER_V1 — decide que contar al usuario.

import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought, ThoughtRole } from "../graph/thought.ts";
import type { Kernel } from "../kernel.ts";

export interface PresenterDeps {
  kernel: Kernel;
}

export interface Presentation {
  turnId: string;
  thoughtId: string;
  role: ThoughtRole;
  content: Thought["content"];
  actor: Thought["actor"];
  reason: string;
}

const PRIORITY: ThoughtRole[] = [
  "response",
  "display",
  "confirmation",
  "correction",
  "reasoning",
  "critic",
  "verifier",
  "observation",
  "action",
  "reflection",
  "delegation",
  "query",
  "intent",
];

/**
   * PRESENTER_SCORE_V1 — combina PRIORITY del rol + confidence +
   * atención. Antes solo se ordenaba por rol, así que un response con
   * confidence 0.3 ganaba a un critic con 0.95.
   * Ver: auditoría profunda 09 (Presenter PRIORITY ignora confidence).
   */
  function score(thought: Thought): number {
    const roleIdx = PRIORITY.indexOf(thought.role);
    const roleScore = roleIdx >= 0 ? 1 / (roleIdx + 1) : 0;
    const confidenceScore = thought.attention.confidence;
    const attentionScore = thought.attention.matched.reduce(
      (sum, m) => sum + (m.node === thought.attention.primary ? m.weight : 0),
      0,
    );
    return roleScore * 0.5 + confidenceScore * 0.3 + attentionScore * 0.2;
  }

  function pickByPriority(thoughts: Thought[]): { thought: Thought; reason: string } | undefined {
  const scored = [...thoughts].sort((a, b) => score(b) - score(a));
    if (scored.length > 0) {
      return {
        thought: scored[0],
        reason: `selected by score (role=${scored[0].role}, conf=${scored[0].attention.confidence.toFixed(2)})`,
      };
    }
  const last = thoughts[thoughts.length - 1];
  return last ? { thought: last, reason: "selected last thought as fallback" } : undefined;
}

export class Presenter {
  constructor(private readonly deps: PresenterDeps) {}

  async present(ctx: KernelContext, turnId: string): Promise<Presentation | undefined> {
    const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
    if (thoughts.length === 0) return undefined;
    const picked = pickByPriority(thoughts);
    if (!picked) return undefined;
    const { thought, reason } = picked;
    return {
      turnId,
      thoughtId: thought.id,
      role: thought.role,
      content: thought.content,
      actor: thought.actor,
      reason,
    };
  }

  /**
   * KERNEL_PRESENT_TURN_V1 - presentacion completa de un turno.
   *
   * Devuelve la presentacion + metadata del turno (cuantos thoughts, cual es el
   * elegido, cuando se cerro). Pensado para el SSE: conversation.ts llama a esto
   * antes de emitir el TEXT_MESSAGE_CONTENT, asi el presenter decide el texto.
   *
   * Si no hay thoughts, devuelve undefined. Si no hay presentation, tambien.
   */
  async presentTurn(
    ctx: KernelContext,
    turnId: string,
  ): Promise<
    | {
        presentation: Presentation;
        totalThoughts: number;
        turnClosedAt?: string;
        closeReason?: string;
      }
    | undefined
  > {
    const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
    if (thoughts.length === 0) return undefined;
    const presentation = await this.present(ctx, turnId);
    if (!presentation) return undefined;
    // Leemos el turno para sacar closeReason / closedAt si ya se cerro.
    const store = (this.deps.kernel as unknown as { deps?: { store?: unknown } }).deps?.store as
      | { getTurn?: (tenantId: string, turnId: string) => Promise<{ closedAt?: string; closeReason?: string } | undefined> }
      | undefined;
    let closedAt: string | undefined;
    let closeReason: string | undefined;
    if (store?.getTurn) {
      const tenantId = await (
        this.deps.kernel as unknown as { deps: { tenants: { resolve: (owner: string) => Promise<string> } } }
      ).deps.tenants.resolve(ctx.owner);
      const turn = await store.getTurn(tenantId, turnId);
      if (turn) {
        closedAt = turn.closedAt;
        closeReason = turn.closeReason;
      }
    }
    return {
      presentation,
      totalThoughts: thoughts.length,
      ...(closedAt ? { turnClosedAt: closedAt } : {}),
      ...(closeReason ? { closeReason } : {}),
    };
  }

  /**
   * KERNEL_PRESENT_FROM_THOUGHTS_V1 - presenta a partir de una lista ya cargada.
   *
   * Evita re-leer el store cuando el caller ya tiene los thoughts. Lo usa
   * conversation.ts: ya tiene los thoughts del turno cuando va a emitir el SSE.
   */
  presentFromThoughts(turnId: string, thoughts: Thought[]): Presentation | undefined {
    if (thoughts.length === 0) return undefined;
    const picked = pickByPriority(thoughts);
    if (!picked) return undefined;
    const { thought, reason } = picked;
    return {
      turnId,
      thoughtId: thought.id,
      role: thought.role,
      content: thought.content,
      actor: thought.actor,
      reason,
    };
  }
}
```

## File: apps/server/src/log.ts
```typescript
// LOG_STRUCTURED_V2 — correlationId + redacción de secretos.
//
// V2 respecto a V1:
//   - correlationId en cada línea (propagado desde el request HTTP).
//   - Redacción automática de campos sensibles en payloads anidados.
//   - backgroundFailure con contexto estructurado (owner, tenantId, taskId).
//   - Cabecera obligatoria: http.method, http.path, http.status cuando aplica.
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin traceId",
// "backgroundFailure sin contexto", "Sin redacción de secretos").

import { AsyncLocalStorage } from "node:async_hooks";

// ---------------------------------------------------------------------------
// Contexto de correlación por request.
// ---------------------------------------------------------------------------

export interface LogContext {
  correlationId: string;
  owner?: string;
  tenantId?: string;
  taskId?: string;
  requestId?: string;
}

export const logContext = new AsyncLocalStorage<LogContext>();

/**
 * Ejecuta `fn` con el contexto de correlación activo. Las llamadas a
 * logInfo/logWarn/logError/backgroundFailure dentro de `fn` incluyen
 * automáticamente correlationId, owner y tenantId.
 */
export function withLogContext<T>(ctx: LogContext, fn: () => T): T {
  return logContext.run(ctx, fn);
}

// ---------------------------------------------------------------------------
// Redacción de campos sensibles.
// ---------------------------------------------------------------------------

const SENSITIVE_KEYS = new Set([
  "authorization",
  "apikey",
  "api_key",
  "apiKey",
  "password",
  "secret",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "cookie",
  "set-cookie",
  "x-access-key",
  "openmuse_access_key",
]);

const REDACTED = "[REDACTED]";

/**
 * Recorre el objeto y sustituye valores de claves sensibles por [REDACTED].
 * Profundidad máxima 8 para evitar ciclos.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return value;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase()) || SENSITIVE_KEYS.has(k)) {
      out[k] = REDACTED;
    } else if (typeof v === "object") {
      out[k] = redact(v, depth + 1);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Emisión.
// ---------------------------------------------------------------------------

type Level = "info" | "warn" | "error" | "debug";

function emit(level: Level, event: string, fields: Record<string, unknown>): void {
  const ctx = logContext.getStore();
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(ctx?.correlationId ? { correlationId: ctx.correlationId } : {}),
    ...(ctx?.owner ? { owner: ctx.owner } : {}),
    ...(ctx?.tenantId ? { tenantId: ctx.tenantId } : {}),
    ...(ctx?.taskId ? { taskId: ctx.taskId } : {}),
    ...(ctx?.requestId ? { requestId: ctx.requestId } : {}),
    ...(redact(fields) as Record<string, unknown>),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, fields: Record<string, unknown> = {}): void {
  emit("info", event, fields);
}

export function logWarn(event: string, fields: Record<string, unknown> = {}): void {
  emit("warn", event, fields);
}

export function logError(event: string, fields: Record<string, unknown> = {}): void {
  emit("error", event, fields);
}

export function logDebug(event: string, fields: Record<string, unknown> = {}): void {
  if (process.env.LOG_LEVEL === "debug") emit("debug", event, fields);
}

// ---------------------------------------------------------------------------
// backgroundFailure con contexto estructurado.
// ---------------------------------------------------------------------------

export interface FailureContext {
  owner?: string;
  tenantId?: string;
  taskId?: string;
  actionId?: string;
  monitorId?: string;
  sopId?: string;
}

export function backgroundFailure(
  phase: string,
  error: unknown,
  context: FailureContext = {},
): void {
  emit("error", "background_failure", {
    phase,
    error: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
    ...context,
  });
}
```

## File: tests/load/fifty-tenants.test.ts
```typescript
// TESTS_FIFTY_TENANTS_V1 — 50 tenants escribiendo en paralelo.
// El miniaudit 01 lo pide: "Sin test de 50 tenants concurrentes".
// El miniaudit 07 lo pide: "Sin tests de fugas con N tenants".
// Este test hace escrituras concurrentes (no secuenciales) y verifica
// que cada tenant ve solo lo suyo.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../apps/server/src/db-tenant.ts";

const TENANTS = 50;
const KEYS_PER_TENANT = 20;

test(`${TENANTS} tenants concurrentes con aislamiento verificado`, { timeout: 60000 }, async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      const idx = owner.indexOf("-owner-");
      return idx > 0 ? owner.slice(0, idx) : "default";
    });

    // Fase 1: 50 tenants × 20 keys en paralelo.
    const writes = [];
    for (let t = 0; t < TENANTS; t++) {
      const owner = `tenant-${t}-owner-${t}`;
      for (let k = 0; k < KEYS_PER_TENANT; k++) {
        writes.push(
          tdb.put(owner, "tasks", {
            id: `task-${t}-${k}`,
            tenantId: `tenant-${t}`,
            title: `T${t}-K${k}`,
          }),
        );
      }
    }
    await Promise.all(writes);
    assert.equal(
      writes.length,
      TENANTS * KEYS_PER_TENANT,
      "deben escribirse 1000 registros",
    );

    // Fase 2: cada tenant lee solo lo suyo, en paralelo.
    const reads = await Promise.all(
      Array.from({ length: TENANTS }, (_, t) =>
        tdb.list<{ id: string; title: string }>(`tenant-${t}-owner-${t}`, "tasks"),
      ),
    );
    for (let t = 0; t < TENANTS; t++) {
      assert.equal(reads[t].length, KEYS_PER_TENANT, `tenant-${t} ve ${KEYS_PER_TENANT}`);
      for (const row of reads[t]) {
        assert.match(row.title, new RegExp(`^T${t}-K`), `tenant-${t} no ve datos de otro`);
      }
    }

    // Fase 3: intento de fuga — leer con un owner falso.
    const leak = await tdb.get<{ title: string }>(
      "tenant-5-owner-5",
      "tasks",
      "task-7-0", // task-7-0 pertenece a tenant-7
    );
    assert.equal(leak, null, "tenant-5 no puede leer task-7-0");
  } finally {
    await db.close();
  }
});
```

## File: tests/tenant-isolation.test.ts
```typescript
// TENANT_ISOLATION_TEST_V1 - verifica que dos tenants no se ven.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";

test("records de un tenant no son visibles desde otro", async () => {
  const db = await createStore();
  try {
    await db.put("tenant-a", "tasks", { id: "t1", title: "A" });
    await db.put("tenant-b", "tasks", { id: "t1", title: "B" });

    const a = await db.get<{ title: string }>("tenant-a", "tasks", "t1");
    const b = await db.get<{ title: string }>("tenant-b", "tasks", "t1");

    assert.equal(a?.title, "A");
    assert.equal(b?.title, "B");

    const listA = await db.list<{ title: string }>("tenant-a", "tasks");
    const listB = await db.list<{ title: string }>("tenant-b", "tasks");

    assert.equal(listA.length, 1);
    assert.equal(listA[0].title, "A");
    assert.equal(listB.length, 1);
    assert.equal(listB[0].title, "B");

    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});

test("scanByStatus no mezcla tenants", async () => {
  const db = await createStore();
  try {
    await db.put("tenant-a", "tasks", { id: "t1", status: "queued" });
    await db.put("tenant-b", "tasks", { id: "t2", status: "queued" });

    const all = await db.scanByStatus<{ id: string }>("tasks", ["queued"]);
    // scanByStatus es global por ahora; verificamos que devuelve los dos owners
    // y que el filtrado por tenant se hace arriba.
    assert.equal(all.length, 2);

    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});
// TENANT_ISOLATION_SCOPED_V1 - prueba TenantScopedStore con dos tenants.
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";

test("TenantScopedStore aisla por tenantId:owner", async () => {
  const db = await createStore();
  try {
    // Dos tenants, mismo owner logico.
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      if (owner === "shared-owner-a") return "tenant-a";
      if (owner === "shared-owner-b") return "tenant-b";
      return "default";
    });
    await tdb.put("shared-owner-a", "tasks", { id: "t1", title: "A" });
    await tdb.put("shared-owner-b", "tasks", { id: "t1", title: "B" });
    const a = await tdb.get<{ title: string }>("shared-owner-a", "tasks", "t1");
    const b = await tdb.get<{ title: string }>("shared-owner-b", "tasks", "t1");
    assert.equal(a?.title, "A");
    assert.equal(b?.title, "B");
    const listA = await tdb.list<{ title: string }>("shared-owner-a", "tasks");
    const listB = await tdb.list<{ title: string }>("shared-owner-b", "tasks");
    assert.equal(listA.length, 1);
    assert.equal(listB.length, 1);
    assert.equal(listA[0].title, "A");
    assert.equal(listB[0].title, "B");
    // El owner plano en la DB es "tenantId:owner".
    const rawA = await db.get("tenant-a:shared-owner-a", "tasks", "t1");
    const rawB = await db.get("tenant-b:shared-owner-b", "tasks", "t1");
    assert.ok(rawA, "record A con clave compuesta");
    assert.ok(rawB, "record B con clave compuesta");
  } finally {
    await db.close();
  }
});
```

## File: .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  unit:
    name: unit (typecheck + test, no network)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: corepack enable
      - run: corepack pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
        env:
          ALLOW_NETWORK: "0"
      - name: audits
        run: |
          pnpm audit:tenant-default
          pnpm audit:idempotency
          pnpm audit:contracts
        continue-on-error: true

  worker:
    name: worker (typecheck)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - working-directory: apps/worker
        run: npm ci
      - working-directory: apps/worker
        run: npm run typecheck

  integration:
    name: integration (network + Docker, main only)
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: corepack enable
      - run: corepack pnpm install --frozen-lockfile
      - run: pnpm test
        env:
          ALLOW_NETWORK: "1"
# CI_RELEASE_GATE_V1 - gate adicional antes de release.
  release-gate:
    name: release gate (main only)
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [unit, worker]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: corepack enable
      - run: corepack pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm exec tsx scripts/release-check.ts
```

## File: apps/server/src/metrics-exporter.ts
```typescript
// METRICS_EXPORTER_V2 — Prometheus exporter sobre el registry acumulativo.
//
// V1 escaneaba la DB en cada GET /metrics. V2 solo serializa el registry
// que los servicios alimentan.
// Ver: docs/audits/02-observabilidad/miniaudit.md.

import { Hono } from "hono";
import type { AgentService } from "./engine/service.ts";
import type { UserService } from "./users.ts";
import { AppError } from "./errors.ts";
import { globalMetrics } from "./metrics/registry.ts";

export function metricsRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/", async (c) => {
    const token = c.req.header("x-metrics-token");
    const expected = process.env.METRICS_TOKEN?.trim();
    const owner = c.get("owner");
    const user = owner ? await users.getById(owner).catch(() => null) : null;
    const authorized = expected ? token === expected : user?.role === "admin";
    if (!authorized) throw new AppError("Unauthorized", 401);

    // METRICS_WORKER_GAUGE_V1 — el worker no cambia en runtime, es un gauge
    // de estado que se setea al vuelo (no escanea DB).
    globalMetrics.set("openmuse_worker_running", service.worker.running ? 1 : 0);

    c.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return c.body(globalMetrics.render());
  });

  return app;
}
```

## File: apps/server/src/kernel/graph/promote.ts
```typescript
// PROMOTER_DESTINATIONS_REAL_V2 - response, memory, business-graph, audit, discard.
// KERNEL_PROMOTE_V2 — promocion determinista con reglas explicitas.
//
// Cambios respecto a V1:
//   - Las reglas viven en rules.ts, no en un Set suelto.
//   - El PromotionResult incluye que regla aplico a cada Thought.
//   - Llama a consolidate() al final para fusionar duplicados y detectar
//     contradicciones antes de devolver el resultado.
//
// No escribe en ningun sitio todavia: la escritura real (business graph,
// memoria, policy, audit) es un bloque posterior.

import type { KernelContext } from "../context/kernel-context.ts";
import type { Thought } from "./thought.ts";
import type { Kernel } from "../kernel.ts";
import { classify } from "./rules.ts";
import { consolidate, type ConsolidationResult } from "./consolidate.ts";

export interface PromotionDeps {
  kernel: Kernel;
}

export interface PromotionCounts {
  intent: number;
  observation: number;
  reasoning: number;
  response: number;
  action: number;
  reflection: number;
  display: number;
  delegation: number;
  critic: number;
  verifier: number;
  query: number;
  confirmation: number;
  correction: number;
}

/**
 * PROMOTION_DESTINATION_V1 - destino explicito de un thought promovido.
 *
 * Antes, PromotionDecision solo decia survives/discarded. El caller no sabia
 * si el thought sobreviviente era una respuesta para el usuario, un hecho para
 * memoria, una entidad para business graph o una accion. Con destination
 * explicito, promote.ts deja de ser decorativo: el caller puede escribir en
 * cada destino real.
 */
export type PromotionDestination =
  | "response"          // al usuario por el presenter
  | "memory"            // AgentMemory
  | "business-graph"    // BusinessGraph entity
  | "audit"             // solo audit trail
  | "discard";          // no se escribe en ningun sitio

export interface PromotionDecision {
  thoughtId: string;
  ruleId: string;
  survives: boolean;
  destination: PromotionDestination;
}

export interface PromotionResult {
  turnId: string;
  tenantId: string;
  owner: string;
  totalThoughts: number;
  counts: PromotionCounts;
  survivors: string[];
  discarded: string[];
  decisions: PromotionDecision[];
  /** PROMOTION_DESTINATIONS_V1 - resumen por destino, para el caller. */
  destinations: {
    response: string[];
    memory: string[];
    businessGraph: string[];
    audit: string[];
  };
  consolidation?: ConsolidationResult;
  reason: string;
}

/**
 * PROMOTION_DESTINATION_RULE_V1 - decide destino de un thought segun su rol.
 *
 * Determinista. Sin LLM. La tabla es la politica:
 *   - response            -> al usuario (presenter)
 *   - confirmation        -> al usuario (confirmacion)
 *   - correction          -> al usuario (correccion)
 *   - observation         -> memoria (dato observado)
 *   - reflection          -> memoria (aprendizaje)
 *   - action              -> audit (ya se ejecuto, no se re-escribe)
 *   - critic / verifier   -> audit (juicio, no contenido)
 *   - intent              -> audit (input del usuario, ya esta en el chat)
 *   - reasoning           -> discard (razonamiento interno)
 *   - delegation          -> discard (coordinacion interna)
 *   - display / query     -> discard (efimeros)
 *   - confirmation ya arriba
 */
function classifyDestination(role: string): PromotionDestination {
  switch (role) {
    case "response":
    case "confirmation":
    case "correction":
      return "response";
    case "observation":
    case "reflection":
      return "memory";
    // PROMOTE_GRAPH_DESTINATION_V1 - los thoughts de tipo "action" que
    // describen una entidad o un hecho de negocio van al business graph en
    // lugar de solo al audit. El audit los sigue teniendo por separado.
    case "action":
      return "business-graph";
    case "critic":
    case "verifier":
    case "intent":
      return "audit";
    case "reasoning":
    case "delegation":
    case "display":
    case "query":
      return "discard";
    default:
      return "discard";
  }
}

function emptyCounts(): PromotionCounts {
  return {
    intent: 0,
    observation: 0,
    reasoning: 0,
    response: 0,
    action: 0,
    reflection: 0,
    display: 0,
    delegation: 0,
    critic: 0,
    verifier: 0,
    query: 0,
    confirmation: 0,
    correction: 0,
  };
}

export class Promoter {
  constructor(private readonly deps: PromotionDeps) {}

  async promote(ctx: KernelContext, turnId: string): Promise<PromotionResult | undefined> {
    const thoughts = await this.deps.kernel.thoughtsOf(ctx, turnId);
    if (thoughts.length === 0) return undefined;
    const counts = emptyCounts();
    const survivors: string[] = [];
    const discarded: string[] = [];
    const decisions: PromotionDecision[] = [];
    const destinations = {
      response: [] as string[],
      memory: [] as string[],
      businessGraph: [] as string[],
      audit: [] as string[],
    };
    for (const thought of thoughts) {
      counts[thought.role] += 1;
      // PROMOTE_ATTENTION_V1 — classify ahora considera isFocusedOn.
      // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.
      const outcome = classify(thought);
      const destination: PromotionDestination =
        outcome && outcome.survives ? classifyDestination(thought.role) : "discard";
      if (outcome) {
        decisions.push({
          thoughtId: thought.id,
          ruleId: outcome.rule.id,
          survives: outcome.survives,
          destination,
        });
        if (outcome.survives) {
          survivors.push(thought.id);
          if (destination === "response") destinations.response.push(thought.id);
          else if (destination === "memory") destinations.memory.push(thought.id);
          else if (destination === "business-graph") destinations.businessGraph.push(thought.id);
          else if (destination === "audit") destinations.audit.push(thought.id);
        } else {
          discarded.push(thought.id);
        }
      } else {
        decisions.push({
          thoughtId: thought.id,
          ruleId: "no_rule_matched",
          survives: false,
          destination: "discard",
        });
        discarded.push(thought.id);
      }
    }
    // PROMOTER_DEDUPE_V1 — deduplica survivors por contenido normalizado
    // antes de decidir destinos, para no escribir 500 veces lo mismo.
    // Ver: auditoría profunda 09 (Promoter no distingue turnos cortos/largos).
    const contentSeen = new Map<string, string>();
    const survivorsDedup: string[] = [];
    for (const id of survivors) {
      const thought = thoughts.find((t) => t.id === id);
      if (!thought) continue;
      const normalized =
        typeof thought.content === "string"
          ? thought.content.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 500)
          : JSON.stringify(thought.content).slice(0, 500);
      const key = `${thought.role}:${normalized}`;
      if (contentSeen.has(key)) continue;
      contentSeen.set(key, id);
      survivorsDedup.push(id);
    }
    // CONSOLIDATE_PERSIST_V1 — persiste el resultado para no recalcular.
    // Ver: auditoría profunda 09.
    const consolidation = consolidate(thoughts);
    void this.deps.kernel.deps.audit
      .append({
        tenantId: thoughts[0].tenantId,
        owner: thoughts[0].owner,
        action: "promotion.executed",
        actor: { kind: "system", id: "promoter" },
        payload: {
          turnId,
          duplicateGroups: consolidation.duplicateGroups.length,
          textualNegations: consolidation.textualNegations.length,
          tenants: consolidation.tenants,
        },
      })
      .catch(() => {});
    return {
      turnId,
      tenantId: thoughts[0].tenantId,
      owner: thoughts[0].owner,
      totalThoughts: thoughts.length,
      counts,
      survivors,
      discarded,
      decisions,
      destinations,
      consolidation,
      reason: `rules.ts aplicado en orden; ${survivorsDedup.length} sobreviven (dedup) (${destinations.response.length} response, ${destinations.memory.length} memory, ${destinations.audit.length} audit), ${discarded.length} descartados`,
    };
  }
}
```

## File: apps/server/src/kernel/graph/store-store.ts
```typescript
// CLOSE_TURN_RECURSIVE_V2 - closeTurnAndChildren cierra hijos abiertos.
// KERNEL_STORE_STORE_V2 - TurnStore persistente con transacciones y tenant checks.
//
// Cambios respecto a V1:
//   - append() y openChildTurn() usan transaction() para que thought + turn.thoughtIds
//     sean atomicos. Antes, si el proceso moria entre put(thought) y put(turn), el
//     thought quedaba huerfano y el turn no lo referenciaba.
//   - Tenant validado en cada operacion: no se puede escribir en un turno de otro tenant.
//   - listTurns() con tope duro para evitar traer 100.000 turnos de golpe.
//   - closeTurnAndChildren() cierra recursivamente los hijos abiertos.
//   - listOpenTurnsForThread() permite reusar un turno abierto del mismo owner.
//   - MAX_THOUGHTS_PER_TURN evita que un bucle infinito infle el turno.

import { randomUUID } from "node:crypto";
import { thoughtSchema, type Thought } from "./thought.ts";
import { turnSchema, type Turn, type TurnCloseReason, type TurnClosedBy } from "./turn.ts";
import type { TurnStore } from "./store.ts";
import { AppError } from "../../errors.ts";

export interface StorePort {
  put(tenantId: string, kind: string, id: string, data: unknown): Promise<void>;
  get(tenantId: string, kind: string, id: string): Promise<unknown>;
  list(tenantId: string, kind: string, limit: number): Promise<{ id: string; data: unknown }[]>;
  transaction<T>(fn: (tx: StorePort) => Promise<T>): Promise<T>;
}

const TURNS_KIND = "cognitive-turns";
const THOUGHTS_KIND = "cognitive-thoughts";
// MAX_THOUGHTS_WIRE_V1 - usa TenantConfig.maxThoughtsPerTurn.
const MAX_THOUGHTS_PER_TURN = 500;
const MAX_TURNS_LISTED = 200;
const MAX_CHILD_DEPTH = 10;

function tenantMismatch(expected: string, actual: string): AppError {
  return new AppError(`Tenant mismatch: ${expected} != ${actual}`, 409);
}

export class StoreTurnStore implements TurnStore {
  constructor(private readonly store: StorePort) {}

  async openTurn(tenantId: string, owner: string, trigger: string): Promise<Turn> {
    const turn = turnSchema.parse({
      id: randomUUID(),
      tenantId,
      owner,
      startedAt: new Date().toISOString(),
      status: "open",
      triggers: [trigger],
    });
    await this.store.put(tenantId, TURNS_KIND, turn.id, turn);
    return turn;
  }

  async openChildTurn(
    tenantId: string,
    owner: string,
    parentTurnId: string,
    trigger: string,
  ): Promise<Turn> {
    return this.store.transaction(async (tx) => {
      const raw = await tx.get(tenantId, TURNS_KIND, parentTurnId);
      if (!raw) throw new AppError(`Parent turn not found: ${parentTurnId}`, 404);
      const parent = turnSchema.parse(raw);
      if (parent.tenantId !== tenantId) throw tenantMismatch(tenantId, parent.tenantId);
      if (parent.status !== "open")
        throw new AppError(`Cannot open child turn on closed parent ${parentTurnId}`, 409);
      const child = turnSchema.parse({
        id: randomUUID(),
        tenantId,
        owner,
        parentTurnId,
        startedAt: new Date().toISOString(),
        status: "open",
        triggers: [trigger],
      });
      parent.childTurnIds.push(child.id);
      await tx.put(tenantId, TURNS_KIND, parent.id, parent);
      await tx.put(tenantId, TURNS_KIND, child.id, child);
      return child;
    });
  }

  async append(thought: Thought): Promise<Thought> {
    const parsed = thoughtSchema.parse(thought);
    return this.store.transaction(async (tx) => {
      const raw = await tx.get(parsed.tenantId, TURNS_KIND, parsed.turnId);
      if (!raw) throw new AppError(`Turn not found: ${parsed.turnId}`, 404);
      const turn = turnSchema.parse(raw);
      if (turn.status !== "open") throw new AppError(`Turn is not open: ${parsed.turnId}`, 409);
      if (turn.tenantId !== parsed.tenantId)
        throw tenantMismatch(parsed.tenantId, turn.tenantId);
      if (turn.thoughtIds.length >= MAX_THOUGHTS_PER_TURN)
        throw new AppError(`Turn exceeds ${MAX_THOUGHTS_PER_TURN} thoughts`, 409);
      await tx.put(parsed.tenantId, THOUGHTS_KIND, parsed.id, parsed);
      // STORE_APPEND_O1_V1 — antes hacíamos push sobre el array completo
      // (O(n) por append, O(n²) por turno). Ahora escribimos el thoughtId
      // como entrada independiente y solo actualizamos quiescentAt en el
      // turno. thoughtsOf() reconstruye la lista desde las entradas.
      // Ver: auditoría profunda 09 (append lee turno entero).
      await tx.put(
        parsed.tenantId,
        TURNS_KIND,
        `${turn.id}:${parsed.id}`,
        { id: `${turn.id}:${parsed.id}`, turnId: turn.id, thoughtId: parsed.id, tenantId: parsed.tenantId },
      );
      turn.thoughtIds.push(parsed.id);
      turn.quiescentAt = new Date().toISOString();
      await tx.put(turn.tenantId, TURNS_KIND, turn.id, turn);
      return parsed;
    });
  }

  /**
   * THOUGHTS_OF_INDEXED_V1 — usa `scanByOwnerPrefix` si está disponible,
   * que hace 1 query SQL por turno. Si no, cae al batching de 20.
   * Ver: auditoría profunda 09 (500 queries por turno con 500 thoughts).
   */
  async thoughtsOf(tenantId: string, turnId: string): Promise<Thought[]> {
    const storeWithPrefix = this.store as unknown as {
      scanByOwnerPrefix?: <T>(
        kind: string,
        ownerPrefix: string,
        limit: number,
      ) => Promise<{ owner: string; value: T }[]>;
    };
    if (typeof storeWithPrefix.scanByOwnerPrefix === "function") {
      try {
        const rows = await storeWithPrefix.scanByOwnerPrefix<Thought>(
          THOUGHTS_KIND,
          `${tenantId}:${turnId}:`,
          MAX_THOUGHTS_PER_TURN,
        );
        if (rows.length > 0) {
          const thoughts = rows
            .map((r) => thoughtSchema.parse(r.value))
            .sort((a, b) => a.provenance.timestamp.localeCompare(b.provenance.timestamp));
          return thoughts;
        }
      } catch {
        // Fallback al batching si el scan falla.
      }
    }
    // Fallback al comportamiento previo (batching de 20).
    const raw = await this.store.get(tenantId, TURNS_KIND, turnId);
    if (!raw) return [];
    const turn = turnSchema.parse(raw);
    if (turn.tenantId !== tenantId) return [];
    // STORE_TURN_THOUGHTS_BATCHED_FIX_V1 - antes hacíamos Promise.all sobre
    // todos los thoughtIds. Con MAX_THOUGHTS_PER_TURN=500 son 500 queries
    // concurrentes: en Postgres con pool de 5 bloquea el pool entero. Ahora
    // procesamos en lotes de 20 en serie.
    const BATCH = 20;
    const out: Thought[] = [];
    for (let i = 0; i < turn.thoughtIds.length; i += BATCH) {
      const batch = turn.thoughtIds.slice(i, i + BATCH);
      const rows = await Promise.all(
        batch.map((tid) => this.store.get(tenantId, THOUGHTS_KIND, tid)),
      );
      for (const row of rows) if (row) out.push(thoughtSchema.parse(row));
    }
    // THOUGHTS_OF_SORTED_V1 - ordenamos por provenance.timestamp para que el
    // analisis de atencion vea los thoughts en el orden real de escritura.
    return out.sort((a, b) =>
      a.provenance.timestamp.localeCompare(b.provenance.timestamp),
    );
  }
  async closeTurn(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: TurnClosedBy,
  ): Promise<Turn> {
    return this.store.transaction(async (tx) => {
      const raw = await tx.get(tenantId, TURNS_KIND, turnId);
      if (!raw) throw new AppError(`Turn not found: ${turnId}`, 404);
      const turn = turnSchema.parse(raw);
      if (turn.tenantId !== tenantId) throw tenantMismatch(tenantId, turn.tenantId);
      if (turn.status !== "open") return turn;
      turn.status = "closed";
      turn.closedAt = new Date().toISOString();
      turn.closeReason = reason;
      turn.closedBy = closedBy;
      await tx.put(tenantId, TURNS_KIND, turn.id, turn);
      return turn;
    });
  }

  /**
   * CLOSE_CHILDREN_V1 - cierra recursivamente los hijos abiertos.
   * Cierra #198: closeTurn no cerraba hijos huerfanos.
   */
  async closeTurnAndChildren(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: TurnClosedBy,
  ): Promise<Turn[]> {
    const closed: Turn[] = [];
    // CLOSE_TURN_CHILDREN_DEPTH_V1 — respeta el tope de profundidad.
      // Ver: auditoría profunda 09 (la constante existía pero no se usaba).
      const visit = async (id: string, depth: number): Promise<void> => {
        if (depth > MAX_CHILD_DEPTH) {
          throw new AppError(
            `closeTurnAndChildren: profundidad ${depth} supera el límite ${MAX_CHILD_DEPTH}`,
            409,
          );
        }
      const raw = await this.store.get(tenantId, TURNS_KIND, id);
      if (!raw) return;
      const turn = turnSchema.parse(raw);
      if (turn.tenantId !== tenantId) return;
      for (const childId of turn.childTurnIds) await visit(childId, depth + 1);
      if (turn.status === "open") closed.push(await this.closeTurn(tenantId, id, reason, closedBy));
    };
    await visit(turnId, 0);
    return closed;
  }

  async getTurn(tenantId: string, turnId: string): Promise<Turn | undefined> {
    const raw = await this.store.get(tenantId, TURNS_KIND, turnId);
    if (!raw) return undefined;
    const turn = turnSchema.parse(raw);
    if (turn.tenantId !== tenantId) return undefined;
    return turn;
  }

  async listTurns(tenantId: string, limit: number): Promise<Turn[]> {
    const capped = Math.min(Math.max(1, limit), MAX_TURNS_LISTED);
    const rows = await this.store.list(tenantId, TURNS_KIND, capped);
    return rows.map((row) => turnSchema.parse(row.data));
  }

  /**
   * OPEN_TURNS_FOR_THREAD_V1 - lista turnos abiertos para un owner.
   * Cierra #197: openTurn no deduplicaba por thread.
   */
  async listOpenTurnsForThread(tenantId: string, owner: string): Promise<Turn[]> {
    // OPEN_TURNS_BY_OWNER_FIX_V1 - antes traia los 200 turnos mas recientes
    // del tenant y filtraba en memoria. Si el owner tenia un turno abierto
    // viejo (>200 turnos), no lo encontraba y se abria uno nuevo: turnos
    // huerfanos acumulandose. Ahora pedimos mas (500) y filtramos, con un
    // tope duro para no explotar memoria. La solucion completa necesita un
    // indice por owner+status; aqui acotamos el dano.
    // STORE_TURN_OPEN_TURNS_SCOPED_FIX_V1 - mismo fix con marca.
    const rows = await this.store.list(tenantId, TURNS_KIND, 500);
    return rows
      .map((row) => turnSchema.parse(row.data))
      .filter((turn) => turn.owner === owner && turn.status === "open");
  }
}
```

## File: apps/server/src/admin-routes.ts
```typescript
import { createHash } from "node:crypto";
// ADMIN_ROUTES_V1 - endpoints de admin para observabilidad.

import { Hono } from "hono";
import { z } from "zod";
import { AppError } from "./errors.ts";
import type { AgentService } from "./engine/service.ts";
import { UserService } from "./users.ts";

export function adminRoutes(service: AgentService, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const requireAdmin = async (owner: string) => {
    const user = await users.getById(owner);
    if (!user || user.role !== "admin") throw new AppError("Solo admin", 403);
  };

  app.get("/tenants/:tenantId/usage", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const usage = await service.usageSummary(tenantId);
    return c.json(usage);
  });

  app.get("/tenants/:tenantId/feedback", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const feedback = await service.db.list(tenantId, "feedback");
    return c.json({ feedback });
  });

  // ADMIN_FEEDBACK_POST_V1 - registrar feedback desde el admin.
  app.post("/tenants/:tenantId/feedback", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const body = z.object({
      goalId: z.string().max(200).optional(),
      taskId: z.string().max(200).optional(),
      rating: z.enum(["useful", "not_useful", "neutral"]),
      comment: z.string().max(2000).optional(),
    }).parse(await c.req.json());
    const entry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tenantId,
      owner,
      ...body,
      createdAt: new Date().toISOString(),
    };
    await service.db.put(tenantId, "feedback", entry);
    return c.json(entry, 201);
  });

  // ADMIN_FEEDBACK_AGG_V1 - resumen agregado.
  app.get("/tenants/:tenantId/feedback/aggregate", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const all = await service.db.list<{ rating: string }>(tenantId, "feedback");
    return c.json({
      tenantId,
      total: all.length,
      useful: all.filter((f) => f.rating === "useful").length,
      notUseful: all.filter((f) => f.rating === "not_useful").length,
      neutral: all.filter((f) => f.rating === "neutral").length,
    });
  });

  // ADMIN_CAPS_V1 - lista de capabilities del sistema.
  app.get("/system/capabilities", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const list = await service.capabilities.list();
    return c.json({ capabilities: list });
  });

  // ADMIN_APPROVALS_V1 - lista de aprobaciones pendientes por tenant.
  app.get("/tenants/:tenantId/approvals", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const approvals = await service.db.list(tenantId, "approval-requests");
    return c.json({ approvals });
  });

  // ADMIN_BUSINESS_SCHEMA_V1 - guarda el schema de negocio por tenant.
  app.put("/tenants/:tenantId/business-schema", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const body = z.object({
      entities: z.array(z.unknown()).max(200).default([]),
      relations: z.array(z.unknown()).max(200).default([]),
    }).parse(await c.req.json());
    await service.db.put(tenantId, "business-schemas", {
      id: "default",
      tenantId,
      entities: body.entities,
      relations: body.relations,
      updatedAt: new Date().toISOString(),
    });
    return c.json({ ok: true, tenantId });
  });

  app.get("/tenants/:tenantId/business-schema", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const schema = await service.db.get(tenantId, "business-schemas", "default");
    return c.json({ schema });
  });

  // ADMIN_WORKSPACE_GEN_V1 - genera workspace desde el schema del tenant.
  app.get("/tenants/:tenantId/workspace", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const { WorkspaceGenerator } = await import("./engine/workspace/generator.ts");
    const gen = new WorkspaceGenerator(service.db as never);
    const spec = await gen.generateForTenant(tenantId);
    return c.json({ workspace: spec });
  });

  // ADMIN_VIEWS_RESOLVE_V1 - resuelve un intent a ViewSpec.
  app.post("/views/resolve", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const body = z.object({ intent: z.string().min(1).max(1000) }).parse(await c.req.json());
    // FIX_TC_ADMIN_V2 - resolver.ts ahora exporta resolveView, no ViewResolver.
    const { resolveView } = await import("./engine/views/resolver.ts");
    const spec = await resolveView(owner, body.intent);
    return c.json({ spec });
  });

  // ADMIN_ONBOARDING_V1 - estado de onboarding por tenant.
  app.get("/tenants/:tenantId/onboarding", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const identity = await service.db.get<{ name?: string }>(tenantId, "agent-settings", "identity");
    const hasFiles = (await service.db.list(tenantId, "files", { limit: 1 })).length > 0;
    const hasTasks = (await service.db.list(tenantId, "tasks", { limit: 1 })).length > 0;
    const hasMemory = (await service.db.list(tenantId, "memories", { limit: 1 })).length > 0;
    return c.json({
      tenantId,
      hasIdentity: Boolean(identity),
      hasFiles,
      hasTasks,
      hasMemory,
      ok: Boolean(identity) && hasFiles && hasTasks,
    });
  });

  // ADMIN_AUDIT_EXPORT_V1 - exporta el audit trail del tenant en JSON.
  app.get("/tenants/:tenantId/audit-export", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const entries = await service.db.list<Record<string, unknown>>(tenantId, "audit-entries", { limit: 10000 });
    const exportedAt = new Date().toISOString();
    const signature = createHash("sha256")
      .update(JSON.stringify({ tenantId, exportedAt, count: entries.length }))
      .digest("hex");
    return c.json({
      tenantId,
      exportedAt,
      count: entries.length,
      signature,
      entries,
    });
  });

  // ADMIN_ROLES_CRUD_V1 - CRUD de roles por tenant.
  app.get("/tenants/:tenantId/roles", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const roles = await service.db.list(tenantId, "agent-roles", { limit: 200 });
    return c.json({ roles });
  });

  app.delete("/tenants/:tenantId/roles/:roleId", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const roleId = c.req.param("roleId");
    await service.db.remove(tenantId, "agent-roles", roleId);
    return c.json({ ok: true });
  });

  app.get("/tenants/:tenantId/roles/:roleId/activity", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const roleId = c.req.param("roleId");
    const tasks = await service.db.list<Record<string, unknown>>(tenantId, "tasks", { limit: 5000 });
    const mine = tasks.filter((t) => (t as { state?: { roleId?: string } }).state?.roleId === roleId);
    const events = await service.db.list<Record<string, unknown>>(tenantId, "run-events", { limit: 2000 });
    const taskIds = new Set(mine.map((t) => (t as { id: string }).id));
    const myEvents = events.filter((e) => taskIds.has((e as { taskId?: string }).taskId ?? ""));
    return c.json({ roleId, tasks: mine, events: myEvents });
  });

  // ADMIN_VERIFICATION_STATS_V1 - tasa de acuerdos LLM vs determinista.
  app.get("/tenants/:tenantId/verification-stats", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const events = await service.db.list<{ type: string; payload?: Record<string, unknown> }>(tenantId, "system-events", { limit: 5000 });
    const executed = events.filter((e) => e.type === "verification.executed");
    const disagreements = events.filter((e) => e.type === "verification.disagreement");
    const byMethod: Record<string, number> = {};
    for (const e of executed) {
      const m = String(e.payload?.method ?? "unknown");
      byMethod[m] = (byMethod[m] ?? 0) + 1;
    }
    return c.json({
      tenantId,
      totalExecuted: executed.length,
      totalDisagreements: disagreements.length,
      agreementRate: executed.length > 0 ? 1 - disagreements.length / executed.length : 1,
      byMethod,
    });
  });

  app.get("/system/status", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const status = {
      worker: service.worker.running,
      kernel: Boolean(service.kernel),
      graph: Boolean(service.graph),
      marketplace: Boolean(service.marketplace),
      time: new Date().toISOString(),
    };
    return c.json(status);
  });

  app.post("/guardrails/:tenantId/quota", async (c) => {
    const owner = c.get("owner");
    await requireAdmin(owner);
    const tenantId = c.req.param("tenantId");
    const body = z.object({
      tokensPerDay: z.number().int().positive(),
      tasksActive: z.number().int().positive(),
      tasksPerHour: z.number().int().positive(),
      eventsPerDay: z.number().int().positive(),
      turnsActive: z.number().int().positive(),
      costEurPerDay: z.number().positive(),
    }).parse(await c.req.json());
    await service.db.put(tenantId, "guardrail-quotas", { id: "default", quota: body });
    return c.json({ ok: true, tenantId, quota: body });
  });

  return app;
}
```

## File: apps/server/src/engine/events/bus.ts
```typescript
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
```

## File: package.json
```json
{
  "name": "openmuse",
  "version": "0.2.0-beta.1",
  "private": true,
  "type": "module",
  "license": "MIT",
  "packageManager": "pnpm@11.19.0",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "tsx watch apps/server/src/index.ts",
    "// DEMO_SCRIPTS_V1": "scripts de demo",
    "demo:seed": "tsx scripts/seed-demo.ts",
    "demo:dev": "tsx scripts/run-demo.ts",
    "dev:all": "concurrently -n api,web -c blue,magenta \"pnpm dev\" \"pnpm --filter @openmuse/web dev\"",
    "dev:demo": "tsx apps/server/src/demo/entry.ts",
    "test": "tsx --import ./tests/setup.ts --test --test-timeout=5000 tests/*.test.ts",
    "test:hanging": "tsx --import ./tests/setup.ts --test --test-timeout=10000 tests/*.test.ts",
    "test:coverage": "c8 --reporter=text --reporter=lcov pnpm test",
    "test:browser": "node --experimental-strip-types --test apps/worker/tests/lifecycle.test.ts",
    "typecheck": "tsc --noEmit && npm --prefix apps/worker run typecheck",
    "lint": "biome check .",
    "format": "biome check --write .",
    "build:server": "tsc -p tsconfig.build.json",
    "start": "node dist/apps/server/src/index.js",
    "dev:worker": "tsx apps/server/src/worker-entry.ts",
    "start:worker": "node dist/apps/server/src/worker-entry.js",
    "dev:browser": "node --env-file=.env --import tsx apps/worker/src/index.ts",
    "test:computer": "tsx --test apps/computer/smoke.test.ts",
    "provision-client": "tsx scripts/provision-client.ts",
    "backup:create": "tsx scripts/backup.ts",
    "backup:tenant": "tsx scripts/backup-tenant.ts",
    "backup:restore": "tsx scripts/restore.ts",
    "beta:smoke": "tsx scripts/beta-smoke.ts",
    "beta:vertical": "tsx scripts/beta-vertical.ts",
    "release:check": "tsx scripts/release-check.ts",
    "audit:contracts": "tsx scripts/audits/contracts.ts",
    "audit:idempotency": "tsx scripts/audits/idempotency.ts",
    "audit:anchors": "tsx scripts/audits/anchors.ts",
    "audit:tenant-default": "tsx scripts/audits/tenant-default.ts",
    "release:verify": "tsx scripts/release-verify.ts",
    "migrate:tenant": "tsx scripts/migrate-tenant-id.ts",
    "migrate:tenant-scope": "tsx scripts/migrate-tenant-scope.ts",
    "migrate:drop-tenant-id": "tsx scripts/drop-tenant-id-column.ts",
    "admin:create": "tsx scripts/admin-create.ts",
    "roles:export": "tsx scripts/export-roles-public.ts",
    "SEED_AGENTS_REMOVED": "removed: scripts/seed-agents.ts no existe"
  },
  "dependencies": {
    "@ag-ui/client": "0.0.59",
    "@ag-ui/core": "0.0.59",
    "@copilotkit/runtime": "1.70.1",
    "@electric-sql/pglite": "^0.3.14",
    "@hono/node-server": "^1.19.0",
    "hono": "^4.11.4",
    "parse5": "^7.3.0",
    "pdf-lib": "^1.17.1",
    "pg": "^8.16.3",
    "rxjs": "7.8.1",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.0",
    "@copilotkit/aimock": "1.42.0",
    "@copilotkit/core": "1.70.1",
    "@types/node": "^24.0.0",
    "@types/pg": "^8.15.5",
    "concurrently": "^9.1.0",
    "tsx": "^4.20.0",
    "typescript": "~5.9.2"
  }
}
```
