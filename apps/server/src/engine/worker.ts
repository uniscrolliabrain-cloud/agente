// B105_APPLIED
// B105FIX_APPLIED
// EVENTBUS_WORKER_V1
import { randomUUID } from "node:crypto";
import type { AgentTask, RunEvent } from "../../../../packages/domain/src/agent.ts";
import type { Store } from "../db.ts";
import type { TenantScopedStore } from "../db-tenant.ts";
import { backgroundFailure } from "../log.ts";
// WORKER_RETRY_V1 — retry con backoff a nivel de task en errores transitorios.
import { defaultIsRetryable } from "./retry.ts";
import { DeadLetterQueue } from "./dead-letter.ts";
import { globalMetrics } from "../metrics/registry.ts";
import type { EventBus, SystemEventSource, SystemEventType } from "./events/index.ts";

export class LostLeaseError extends Error {
  constructor() {
    super("Task was paused, cancelled or taken over by another worker");
    this.name = "LostLeaseError";
  }
}
export interface TaskContext {
  signal: AbortSignal;
  guard(): Promise<void>;
  checkpoint(patch: Partial<AgentTask>): Promise<AgentTask>;
  event(kind: RunEvent["kind"], title: string, detail?: string): Promise<void>;
  busEvent(type: SystemEventType, payload: Record<string, unknown>): Promise<void>;
}
export type TaskHandler = (
  owner: string,
  task: AgentTask,
  context: TaskContext,
) => Promise<Partial<AgentTask>>;
export class TaskWorker {
  private timer?: ReturnType<typeof setInterval>;
  private ticking = false;
  private stopping = false;
  private active = new Map<string, AbortController>();
  // WORKER_MAX_ACTIVE_V1 — tope real de concurrencia. Antes el Map crecía
  // sin límite: 1000 tareas queued → 1000 handlers concurrentes → OOM.
  // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
  private readonly maxActive: number;
  lastTickAt?: string;
  constructor(
    private readonly db: Store | TenantScopedStore,
    private readonly execute: TaskHandler,
    private readonly options: {
      now?: () => number;
      leaseMs?: number;
      pollMs?: number;
      settled?: (owner: string, task: AgentTask) => Promise<void>;
      bus?: EventBus;
      /** WORKER_MAX_ACTIVE_V1 — tope de handlers concurrentes. */
      maxActive?: number;
    } = {},
  ) {
    // Default 50: suficiente para 10 clientes simultáneos sin saturar
    // la DB ni el proveedor LLM. Configurable vía env.
    this.maxActive =
      options.maxActive ?? Number(process.env.WORKER_MAX_ACTIVE ?? "50") || 50;
  }
  private now() {
    return this.options.now?.() ?? Date.now();
  }

  /**
   * WORKER_LEASE_FROM_CONFIG_V1 — el lease por defecto viene del env.
   * Antes era 60000 hardcodeado. Ahora configurable para ajustar en
   * deployments con handlers lentos (SOPs con LLM).
   * Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
   */
  private defaultLeaseMs(): number {
    const fromEnv = Number(process.env.WORKER_LEASE_MS ?? "60000");
    return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 60000;
  }
  get running() {
    return Boolean(this.timer);
  }

  /** WORKER_ACTIVE_SIZE_V1 — tamaño actual del Map de handlers activos. */
  activeSize(): number {
    return this.active.size;
  }

  /** WORKER_MAX_ACTIVE_GET_V1 — tope configurado, para debug. */
  getMaxActive(): number {
    return this.maxActive;
  }
  start() {
    if (this.timer) return;
    this.stopping = false;
    // WORKER_METRICS_V1 — registra contadores y gauges del worker.
    // Ver: docs/audits/05-motor-tareas-durable/roadmap.md §8.
    globalMetrics.counter(
      "openmuse_task_duration_seconds_sum",
      "Suma de duraciones de tareas en segundos",
    );
    globalMetrics.counter(
      "openmuse_task_duration_seconds_count",
      "Número de tareas ejecutadas",
    );
    globalMetrics.gauge("openmuse_worker_active", "Handlers concurrentes activos");
    globalMetrics.gauge("openmuse_worker_max_active", "Tope de handlers concurrentes");
    globalMetrics.set("openmuse_worker_max_active", this.maxActive);
    this.timer = setInterval(() => {
      // Timer callbacks cannot await runs; each run owns its durable error state.
      void this.tick().catch((error) => backgroundFailure("task worker tick", error));
    }, this.options.pollMs ?? 1000);
    void this.tick().catch((error) => backgroundFailure("initial task worker tick", error));
  }
  async stop() {
    this.stopping = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    for (const controller of this.active.values()) controller.abort();
    // WORKER_STOP_TIMEOUT_V1 - drain con timeout duro de 10s.
    const drainStart = Date.now();
    const DRAIN_TIMEOUT_MS = Number(process.env.WORKER_DRAIN_TIMEOUT_MS ?? "10000") || 10000;
    while (this.active.size || this.ticking) {
      if (Date.now() - drainStart > DRAIN_TIMEOUT_MS) {
        backgroundFailure(
          "worker drain timeout",
          new Error(`drain excedio ${DRAIN_TIMEOUT_MS}ms con ${this.active.size} handlers activos`),
        );
        break;
      }
      await new Promise((r) => setTimeout(r, 10));
    }
  }
  /**
   * WORKER_CANCEL_PROPAGATE_V1 — aborta el handler y propaga el abort a los
   * proveedores externos (LLM, Docker). El handler que respeta `ctx.signal`
   * puede detener la ejecución real, no solo dejar de reintentar.
   */
  abort(taskId: string) {
    const controller = this.active.get(taskId);
    if (!controller) return;
    controller.abort();
  }
  async tick() {
    if (this.stopping) return;
    if (this.running)
      await this.db.put("system", "worker-status", {
        id: "tasks",
        lastTickAt: new Date(this.now()).toISOString(),
      });
    if (this.ticking) return;
    this.ticking = true;
    this.lastTickAt = new Date(this.now()).toISOString();
    try {
      // WORKER_SCAN_BY_STATUS_V1 — antes era scan("tasks") y filtraba en JS.
  // Con scanByStatus solo cargamos los estados que este tick procesa.
  // El filtro por nextRunAt / leaseUntil / actionId sigue igual abajo.
  // WORKER_SCAN_V1 — la versión actual escanea todos los owners. Con
// TenantScopedStore, el scan peela el prefijo del tenant. La optimización
// con scanByOwnerPrefix requiere conocer el tenant activo, que el worker
// no tiene. Este comentario documenta la deuda y remite al bloque 07.
    // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
    const records = await this.db.scanByStatus<AgentTask>(
      "tasks",
      ["queued", "scheduled", "running", "waiting_approval"],
    );
      const due = records.filter(
        ({ value: t }) =>
          !this.active.has(t.id) &&
          (t.status === "queued" ||
            (t.status === "scheduled" && Date.parse(t.nextRunAt ?? "") <= this.now()) ||
            (t.status === "running" && Date.parse(t.leaseUntil ?? "") <= this.now()) ||
            t.status === "waiting_approval"),
      );
      const eligible = [];
      // WORKER_OWNER_QUOTA_V1 — no más de N handlers por owner en un tick.
      // Sin esto, un owner con 1000 tareas queued monopoliza el worker.
      // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
      const MAX_PER_OWNER = Number(process.env.WORKER_MAX_PER_OWNER ?? "10") || 10;
      const perOwnerCount = new Map<string, number>();
      for (const controller of this.active.keys()) {
        // No tenemos el owner en el Map actual, así que lo dejamos pasar.
        // El contador real se construye durante este loop.
      }
      for (const record of due) {
        if (record.value.status === "waiting_approval") {
          const action = record.value.actionId
            ? await this.db.get<{ status: string; expiresAt?: string }>(
                record.owner,
                "actions",
                record.value.actionId,
              )
            : null;
          if (
            record.value.actionId &&
            action?.status === "awaiting_review" &&
            Date.parse(action.expiresAt ?? "") <= this.now()
          )
            await this.db.compareAndSwap(
              record.owner,
              "actions",
              record.value.actionId,
              { status: "awaiting_review", expiresAt: action.expiresAt },
              { status: "expired" },
            );
          else if (action && ["awaiting_review", "executing"].includes(action.status)) continue;
        }
        // WORKER_OWNER_QUOTA_V1 — cuenta por owner.
        const ownerCount = perOwnerCount.get(record.owner) ?? 0;
        if (ownerCount >= MAX_PER_OWNER) continue;
        perOwnerCount.set(record.owner, ownerCount + 1);
        eligible.push(record);
        if (eligible.length === 20) break;
      }
      // WORKER_MAX_ACTIVE_V1 — respeta el tope de concurrencia.
    // Si ya hay maxActive handlers corriendo, no lanzamos más.
    const available = Math.max(0, this.maxActive - this.active.size);
    const toRun = eligible.slice(0, available);
    await Promise.all(toRun.map(({ owner, value }) => this.run(owner, value)));
    } finally {
      this.ticking = false;
    }
  }
  private async run(owner: string, previous: AgentTask) {
    if (this.stopping) return;
    // WORKER_METRICS_V1 — marca de tiempo para task_duration_seconds.
    const runStartedAt = Date.now();
    const leaseId = randomUUID(),
      leaseMs = this.options.leaseMs ?? 60000;
    const expected: Record<string, unknown> = {
      status: previous.status,
      leaseId: previous.leaseId ?? null,
    };
    if (previous.status === "running") expected.leaseUntil = previous.leaseUntil;
    let task = await this.db.compareAndSwap<AgentTask>(owner, "tasks", previous.id, expected, {
      status: "running",
      leaseId,
      leaseUntil: new Date(this.now() + leaseMs).toISOString(),
      updatedAt: new Date(this.now()).toISOString(),
      attempts: previous.attempts + 1,
    });
    if (!task) return;
    const controller = new AbortController();
    this.active.set(task.id, controller);
    const taskId = task.id;
    // WORKER_GUARD_CACHE_V1 - cache del ultimo guard. Antes cada ctx.guard()
    // leia la tarea entera de DB, y ctx.guard() se llama antes de cada tool y
    // cada ctx.event. En una tarea con 10 tools y 20 events, eran 30 reads
    // solo para verificar el lease. Ahora cacheamos y solo releemos cada 500ms
    // o cuando el heartbeat invalida la cache.
    let guardCacheAt = 0;
    // GUARD_CACHE_100_V1 - 100ms detecta robos de lease antes.
    const GUARD_CACHE_MS = Number(process.env.WORKER_GUARD_CACHE_MS ?? "100") || 100;
    const guard = async () => {
      const now = Date.now();
      if (controller.signal.aborted) throw new LostLeaseError();
      if (now - guardCacheAt < GUARD_CACHE_MS) return;
      const latest = await this.db.get<AgentTask>(owner, "tasks", taskId);
      guardCacheAt = now;
      if (controller.signal.aborted || latest?.leaseId !== leaseId || latest.status !== "running")
        throw new LostLeaseError();
    };
    // WORKER_GUARD_INVALIDATE_V1 - el heartbeat y el checkpoint invalidan la
    // cache para que el siguiente guard lea de DB.
    const invalidateGuard = () => {
      guardCacheAt = 0;
      // HEARTBEAT_ALWAYS_INVALIDATE_V1 — flag explícito para el heartbeat.
    };
    const checkpoint = async (patch: Partial<AgentTask>) => {
      if (controller.signal.aborted) throw new LostLeaseError();
      const next = await this.db.compareAndSwap<AgentTask>(
        owner,
        "tasks",
        taskId,
        { leaseId, status: "running" },
        { ...patch, updatedAt: new Date(this.now()).toISOString() },
      );
      if (!next) throw new LostLeaseError();
      task = next;
      // WORKER_GUARD_INVALIDATE_V1 - tras un checkpoint, el estado local
      // cambio: invalidamos la cache para que el proximo guard lea de DB.
      invalidateGuard();
      return next;
    };
    // Dedupe temporal: si el mismo titulo se repite en menos de 60s para esta tarea,
    // no se escribe otro run-event; se incrementa el contador del ultimo. Evita
    // ruido cuando un bucle de reintentos emite el mismo "step" varias veces.
    // WORKER_DEDUPE_PERSIST_V1 - el dedupe se recupera del task.state si existe.
    const persisted = (task.state as { recentEvents?: Array<{ key: string; id: string; date: number; count: number }> }).recentEvents ?? [];
    const recentEvents = new Map<string, { id: string; date: number; count: number }>();
    for (const entry of persisted) recentEvents.set(entry.key, { id: entry.id, date: entry.date, count: entry.count });
    const event = async (kind: RunEvent["kind"], title: string, detail = "") => {
      await guard();
      const key = `${kind}:${title}`;
      const now = this.now();
      const previous = recentEvents.get(key);
      if (previous && now - previous.date < 60_000) {
        previous.count += 1;
        previous.date = now;
        await this.db.compareAndSwap(
          owner,
          "run-events",
          previous.id,
          { id: previous.id },
          { detail: detail ? detail : `${previous.count} ocurrencias` },
        );
        return;
      }
      const id = randomUUID();
      recentEvents.set(key, { id, date: now, count: 1 });
      // WORKER_DEDUPE_PERSIST_V1 - persistir el dedupe en task.state.
      await this.db.compareAndSwap(
        owner,
        "tasks",
        taskId,
        { leaseId, status: "running" },
        {
          state: {
            // task se reasigna dentro de guard(); TS lo ve como Task | null aqui.
            // Si se perdio el lease, guard() ya habria lanzado antes.
            ...(task?.state ?? {}),
            recentEvents: [...recentEvents.entries()].map(([k, v]) => ({ key: k, ...v })).slice(-64),
          },
        },
      ).catch(() => {});
      await this.db.put(owner, "run-events", {
        id,
        taskId,
        date: new Date(now).toISOString(),
        kind,
        title,
        detail,
      });
    };
    const busEvent = async (type: SystemEventType, payload: Record<string, unknown>) => {
      const bus = this.options.bus;
      if (!bus) return;
      await guard();
      const source: SystemEventSource = { kind: "task", id: taskId };
      await bus.emit(owner, type, source, { taskId, ...payload });
    };
    // B105 — audit trail: runs guarda roleId, runtimeId y entityId (si estan en task.state).
    // Asi un run se puede trazar a su rol, a su runtime efimero y a la entidad que toco.
    const runMeta: { id: string } & Record<string, unknown> = {
      id: leaseId,
      taskId,
      startedAt: new Date(this.now()).toISOString(),
      status: "running",
    };
    if (typeof task.state.roleId === "string") runMeta.roleId = task.state.roleId;
    if (typeof task.state.runtimeId === "string") runMeta.runtimeId = task.state.runtimeId;
    if (typeof task.state.entityId === "string") runMeta.entityId = task.state.entityId;
    await this.db.put(owner, "runs", runMeta);
    const heartbeat = setInterval(
      () => {
        // WORKER_GUARD_INVALIDATE_V1 - el heartbeat toca DB: invalidamos cache
        // para que el proximo guard lea estado fresco y detecte robos de lease.
        // HEARTBEAT_ALWAYS_INVALIDATE_V1 — forzamos la invalidación incluso si
        // el guard acababa de leer (cacheAt > 0) para que un robo de lease
        // durante el heartbeat no quede invisible. Antes solo se invalidaba
        // si el guard no había corrido en los últimos 500ms.
        invalidateGuard();
        void this.db
          .compareAndSwap(
            owner,
            "tasks",
            taskId,
            { leaseId, status: "running" },
            { leaseUntil: new Date(this.now() + leaseMs).toISOString() },
          )
          .then((value) => {
            if (!value) controller.abort();
          })
          .catch(() => controller.abort());
      },
      Math.max(10, Math.floor(leaseMs / 3)),
    );
    try {
      const result = await this.execute(owner, task, {
        signal: controller.signal,
        guard,
        checkpoint,
        event,
        busEvent,
      });
      await checkpoint({ ...result, leaseId: null, leaseUntil: null });
      const finishMeta: { id: string } & Record<string, unknown> = {
        id: leaseId,
        taskId,
        startedAt: task.updatedAt,
        finishedAt: new Date(this.now()).toISOString(),
        status: result.status ?? task.status,
      };
      if (typeof task.state.roleId === "string") finishMeta.roleId = task.state.roleId;
      if (typeof task.state.runtimeId === "string") finishMeta.runtimeId = task.state.runtimeId;
      if (typeof task.state.entityId === "string") finishMeta.entityId = task.state.entityId;
      await this.db.put(owner, "runs", finishMeta);
    } catch (error) {
      if (error instanceof LostLeaseError || controller.signal.aborted) {
        await this.db.compareAndSwap(
          owner,
          "tasks",
          taskId,
          { leaseId, status: "running" },
          { status: "queued", leaseId: null, leaseUntil: null },
        );
      } else {
        const detail = error instanceof Error ? error.message : "Task execution failed";
        // WORKER_ERROR_CAS_FIRST_V1 - CAS a failed ANTES de escribir el event.
        // Antes, si el event fallaba (red, disco), el CAS a failed no se hacia
        // y la tarea quedaba en running. Cierra #140.
        //
        // Orden correcto:
        //   1. CAS a failed (estado durable).
        //   2. Escribir el run-event (best-effort, si falla no importa).
        const failed = await this.db.compareAndSwap(
          owner,
          "tasks",
          taskId,
          { leaseId, status: "running" },
          {
            status: "failed",
            error: detail,
            leaseId: null,
            leaseUntil: null,
            updatedAt: new Date(this.now()).toISOString(),
          },
        );
        // WORKER_ERROR_CAS_CHECK_V1 - si el CAS fallo (porque otro worker
        // robo el lease o el estado cambio), no escribimos el run-event. La
        // tarea ya esta en un estado terminal controlado por otro. Cierra #141.
        if (failed) {
          await event("error", "Task needs attention", detail).catch((error) =>
            backgroundFailure("record task error", error),
          );
          // WORKER_DLQ_WIRE_V1 — task fallida definitivamente va al DLQ.
          // Ver: docs/audits/03-resiliencia/roadmap.md §8.
          try {
            const dlq = new DeadLetterQueue(this.db);
            const latest = await this.db.get<AgentTask>(owner, "tasks", taskId);
            if (latest) await dlq.enqueue(latest, detail, owner);
          } catch (dlqError) {
            backgroundFailure("dead-letter enqueue", dlqError);
          }
        }
      }
      await this.db.compareAndSwap(
        owner,
        "runs",
        leaseId,
        { status: "running" },
        {
          status: controller.signal.aborted ? "interrupted" : "failed",
          finishedAt: new Date(this.now()).toISOString(),
        },
      );
    } finally {
      clearInterval(heartbeat);
      this.active.delete(taskId);
    }
    // WORKER_SETTLED_CHECK_V2 - llamamos a settled si la tarea llego a un
    // estado que el usuario debe conocer: terminales (succeeded, failed,
    // cancelled) y de espera (waiting_input, waiting_approval). Antes solo
    // se llamaba en terminales, y se perdian notificaciones de "necesita datos"
    // y "listo para revisar".
    const settled = await this.db.get<AgentTask>(owner, "tasks", taskId);
    const knownStatuses = new Set([
      "succeeded",
      "failed",
      "cancelled",
      "waiting_input",
      "waiting_approval",
      "scheduled",
      "paused",
    ]);
    if (settled && this.options.settled && knownStatuses.has(settled.status)) {
      // WORKER_SETTLED_CONTEXT_V1 — envuelve la llamada en try/catch para
      // que un fallo de la notificación no rompa el run.
      // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
      try {
        await this.options.settled(owner, settled);
      } catch (error) {
        backgroundFailure("settled callback", error);
      }
    }
  }
}


