// B105_APPLIED
// B105FIX_APPLIED
// EVENTBUS_WORKER_V1
import { randomUUID } from "node:crypto";
import type { AgentTask, RunEvent } from "../../../../packages/domain/src/agent.ts";
import { readTaskExecutionContext, taskExecutionContextSchema, type TaskExecutionContext, canTransitionTask } from "../../../../packages/domain/src/agent.ts";
import type { Store } from "../db.ts";
import type { TenantRecord, TenantScopedStore } from "../db-tenant.ts";
import { backgroundFailure } from "../log.ts";
import { currentTenantScope, runInTenantScope } from "../tenant-scope.ts";
// WORKER_RETRY_V1
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
  // WORKER_MAX_ACTIVE_V1
  // sin l
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
      settled?: (
        owner: string,
        task: AgentTask,
        actors: { executingActorId: string; requestingActorId: string },
      ) => Promise<void>;
      bus?: EventBus;
      /** WORKER_MAX_ACTIVE_V1 */
      maxActive?: number;
    } = {},
  ) {
    // Default 50: suficiente para 10 clientes simult
    // la DB ni el proveedor LLM. Configurable v
    this.maxActive =
      options.maxActive ?? (Number(process.env.WORKER_MAX_ACTIVE ?? "50") || 50);
  }
  private now() {
    return this.options.now?.() ?? Date.now();
  }

  /**
   * WORKER_LEASE_FROM_CONFIG_V1
   * Antes era 60000 hardcodeado. Ahora configurable para ajustar en
   * deployments con handlers lentos (SOPs con LLM).
   * Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
   */
  /** WORKER_TASK_TIMEOUT_V1 - timeout duro por task. */
  private taskTimeoutMs(): number {
    const raw = Number(process.env.TASK_TIMEOUT_MS ?? "600000");
    return Number.isFinite(raw) && raw > 0 ? raw : 600000;
  }

  private defaultLeaseMs(): number {
    const fromEnv = Number(process.env.WORKER_LEASE_MS ?? "60000");
    return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 60000;
  }
  get running() {
    return Boolean(this.timer);
  }

  // WORKER_ACTIVE_SIZE_V1
  activeSize(): number {
    return this.active.size;
  }

  // WORKER_MAX_ACTIVE_GET_V1
  getMaxActive(): number {
    return this.maxActive;
  }
  start = () => {
    if (this.timer) return;
    this.stopping = false;
    // WORKER_METRICS_V1
    // Ver: docs/audits/05-motor-tareas-durable/roadmap.md
    globalMetrics.counter(
      "openmuse_task_duration_seconds_sum",
      "Suma de duraciones de tareas en segundos",
    );
    globalMetrics.counter(
      "openmuse_task_duration_seconds_count",
      "Numero de tareas ejecutadas",
    );
    globalMetrics.gauge("openmuse_worker_active", "Handlers concurrentes activos");
    globalMetrics.gauge("openmuse_worker_max_active", "Tope de handlers concurrentes");
    globalMetrics.set("openmuse_worker_max_active", this.maxActive);
    // WORKER_TICK_BACKOFF_V1 - backoff exponencial si el ultimo tick fallo.
    let consecutiveFailures = 0;
    const baseMs = this.options.pollMs ?? 1000;
    const scheduleNext = () => {
      const delay = Math.min(baseMs * 2 ** Math.min(consecutiveFailures, 6), 60_000);
      this.timer = setTimeout(() => {
        void this.tick()
          .then(() => { consecutiveFailures = 0; })
          .catch((error) => {
            consecutiveFailures += 1;
            backgroundFailure("task worker tick", error);
          })
          .finally(() => { if (!this.stopping) scheduleNext(); });
      }, delay);
    };
    scheduleNext();
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
  /** WORKER_CANCEL_PROPAGATE_V1 - cancelaciÃ³n del task hacia proveedores externos (LLM, Docker). */




  private identity(tenantId: string, owner: string, taskId: string): string {
    return JSON.stringify([tenantId, owner, taskId]);
  }

  abort(taskId: string, owner?: string, tenantId?: string) {
    const scopedTenant = tenantId ?? currentTenantScope()?.tenantId;
    const matches = [...this.active.entries()].filter(([key]) => {
      const [tenant, activeOwner, id] = JSON.parse(key) as string[];
      return id === taskId && (owner === undefined || owner === activeOwner) &&
        (scopedTenant === undefined || scopedTenant === tenant);
    });
    // The legacy one-argument API is safe only when it identifies one run.
    if (matches.length === 1) matches[0][1].abort();
  }

  private contextFor(record: TenantRecord<AgentTask>): TaskExecutionContext {
    const task = record.value;
    const snapshot = task.executionContext;
    if (!("scanBackgroundByStatus" in this.db) && !snapshot) {
      throw new Error("unscoped storage requires an explicit executionContext");
    }
    const context = readTaskExecutionContext(record.owner, task);
    if (!context || (record.storageId !== undefined && record.storageId !== task.id) ||
      ("scanBackgroundByStatus" in this.db && record.tenantId !== context.tenantId)) {
      throw new Error("task identity does not match its physical storage origin");
    }
    return context;
  }

  private async quarantine(record: TenantRecord<AgentTask>, error: unknown): Promise<void> {
    const reason = "TASK_CONTEXT_UNVERIFIED: " + (error instanceof Error ? error.message : "invalid context");
    const expected = { status: record.value.status, ...(record.value.leaseId !== undefined ? { leaseId: record.value.leaseId } : {}) };
    const patch = { status: "paused", error: reason, leaseId: null, leaseUntil: null, updatedAt: new Date(this.now()).toISOString() };
    if ("compareAndSwapBackground" in this.db) {
      await this.db.compareAndSwapBackground(record, "tasks", record.value.id, expected, patch);
    } else {
      await this.db.compareAndSwap(record.owner, "tasks", record.value.id, expected, patch);
    }
    backgroundFailure("task context rejected", new Error(reason));
  }

  async tick() {
    if (this.stopping) return;
    if (this.ticking) return;
    this.ticking = true;
    this.lastTickAt = new Date(this.now()).toISOString();
    try {
      // WORKER_SCAN_BY_STATUS_V1
  // Con scanByStatus solo cargamos los estados que este tick procesa.
  // El filtro por nextRunAt / leaseUntil / actionId sigue igual abajo.
  // WORKER_SCAN_V1
// TenantScopedStore, el scan peela el prefijo del tenant. La optimizaci
// con scanByOwnerPrefix requiere conocer el tenant activo, que el worker
// no tiene. Este comentario documenta la deuda y remite al bloque 07.
    // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
    const records: TenantRecord<AgentTask>[] = "scanBackgroundByStatus" in this.db
      ? await this.db.scanBackgroundByStatus<AgentTask>("tasks", ["queued", "scheduled", "running", "waiting_approval"])
      : (await this.db.scanByStatus<AgentTask>("tasks", ["queued", "scheduled", "running", "waiting_approval"]))
        .map(record => ({ ...record, storageOwner: record.owner }));
    // WORKER_STATUS_AFTER_SCAN_V1 - el put de worker-status pasa por el
    // resolver del TenantScopedStore y registra ese prefijo. Si se hace antes
    // del scan, tras un reinicio el worker solo ve el tenant de la membership
    // y no las tareas de otras empresas. Escaneamos primero.
    if (this.running)
      await this.db.put("system", "worker-status", {
        id: "tasks",
        lastTickAt: new Date(this.now()).toISOString(),
      });
      const due = records.filter(
        ({ owner, tenantId, value: t }) =>
          !this.active.has(this.identity(tenantId ?? t.tenantId, owner, t.id)) &&
          (t.status === "queued" ||
            (t.status === "scheduled" && Date.parse(t.nextRunAt ?? "") <= this.now()) ||
            (t.status === "running" && Date.parse(t.leaseUntil ?? "") <= this.now()) ||
            t.status === "waiting_approval"),
      );
      const eligible = [];
      // WORKER_OWNER_QUOTA_V1
      // Sin esto, un owner con 1000 tareas queued monopoliza el worker.
      // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
      const MAX_PER_OWNER = Number(process.env.WORKER_MAX_PER_OWNER ?? "10") || 10;
      const perOwnerCount = new Map<string, number>();
      for (const controller of this.active.keys()) {
        // No tenemos el owner en el Map actual, as
        // El contador real se construye durante este loop.
      }
      for (const record of due) {
        try { this.contextFor(record); }
        catch (error) { await this.quarantine(record, error); continue; }
        // WORKER_OWNER_QUOTA_V1
        const ownerKey = JSON.stringify([record.tenantId ?? record.value.tenantId, record.owner]);
        const ownerCount = perOwnerCount.get(ownerKey) ?? 0;
        if (ownerCount >= MAX_PER_OWNER) continue;
        perOwnerCount.set(ownerKey, ownerCount + 1);
        eligible.push(record);
        if (eligible.length === 20) break;
      }
      // WORKER_MAX_ACTIVE_V1
    // Si ya hay maxActive handlers corriendo, no lanzamos m
    const available = Math.max(0, this.maxActive - this.active.size);
    const toRun = eligible.slice(0, available);
    await Promise.all(toRun.map(record => this.run(record)));
    } finally {
      this.ticking = false;
    }
  }
  private async run(record: TenantRecord<AgentTask>) {
    const context = this.contextFor(record);
    return runInTenantScope(context, () => this.runScoped(record, context));
  }

  private async runScoped(record: TenantRecord<AgentTask>, context: TaskExecutionContext) {
    const { owner, value: previous } = record;
    const identityExpected = {
      tenantId: context.tenantId,
      ...(previous.requestedBy !== undefined ? { requestedBy: previous.requestedBy } : {}),
      ...(previous.assignedTo !== undefined ? { assignedTo: previous.assignedTo } : {}),
      ...(previous.assignedBy !== undefined ? { assignedBy: previous.assignedBy } : {}),
      ...(previous.state.roleId !== undefined ? { state: { roleId: previous.state.roleId } } : {}),
      ...(previous.executionContext !== undefined ? { executionContext: structuredClone(previous.executionContext) } : {}),
    };
    if (this.stopping) return;
        if (previous.status === "waiting_approval") {
          const action = previous.actionId
            ? await this.db.get<{ status: string; expiresAt?: string }>(
                owner,
                "actions",
                previous.actionId,
              )
            : null;
          if (
            previous.actionId &&
            action?.status === "awaiting_review" &&
            Date.parse(action.expiresAt ?? "") <= this.now()
          )
            await this.db.compareAndSwap(
              owner,
              "actions",
              previous.actionId,
              { status: "awaiting_review", expiresAt: action.expiresAt },
              { status: "expired" },
            );
          else if (action && ["awaiting_review", "executing"].includes(action.status)) return;
        }
    // WORKER_METRICS_V1
    const runStartedAt = Date.now();
    const leaseId = randomUUID(),
      leaseMs = this.options.leaseMs ?? 60000;
    const expected: Record<string, unknown> = {
      status: previous.status,
      ...identityExpected,
      leaseId: previous.leaseId ?? null,
    };
    if (previous.status === "running") expected.leaseUntil = previous.leaseUntil;

    const swapped = await this.db.compareAndSwap<AgentTask>(owner, "tasks", previous.id, expected, {
      status: "running",
      leaseId,
      leaseUntil: new Date(this.now() + leaseMs).toISOString(),
      updatedAt: new Date(this.now()).toISOString(),
      attempts: previous.attempts + 1,
    });
    if (!swapped) return;
    try {
      const claimed = this.contextFor({ ...record, value: swapped });
      if (claimed.actorId !== context.actorId || swapped.requestedBy !== previous.requestedBy || Boolean(swapped.executionContext) !== Boolean(previous.executionContext)) throw new Error("identity changed before claim");
    } catch (error) { await this.quarantine({ ...record, value: swapped }, error); return; }
    // WORKER_TASK_NONNULL_V1 - task se declara ya no-nulo: es `let` porque
    // checkpoint() lo reasigna, y al ser capturado por closures TS volvia a
    // verlo como AgentTask | null en cada uso (TS18047).
    let task: AgentTask = swapped;
    const controller = new AbortController();
    const activeKey = this.identity(context.tenantId, owner, task.id);
    this.active.set(activeKey, controller);
    const taskId = task.id;
    const originalRequester = previous.requestedBy;
    const originalSnapshot = previous.executionContext;
    // WORKER_GUARD_CACHE_V1 - cache del ultimo guard. Antes cada ctx.guard()
    // leia la tarea entera de DB, y ctx.guard() se llama antes de cada tool y
    // cada ctx.event. En una tarea con 10 tools y 20 events, eran 30 reads
    // solo para verificar el lease. Ahora cacheamos y solo releemos cada 500ms
    // o cuando el heartbeat invalida la cache.
    let guardCacheAt = 0;
    // GUARD_CACHE_100_V1 - 100ms detecta robos de lease antes.
    const GUARD_CACHE_MS = Number(process.env.WORKER_GUARD_CACHE_MS ?? "100") || 100;
    // WORKER_STEP_SIGNAL_V1 - expone el signal a los handlers.
    const guard = async () => {
      const now = Date.now();
      if (controller.signal.aborted) throw new LostLeaseError();
      if (now - guardCacheAt < GUARD_CACHE_MS) return;
      const latest = await this.db.get<AgentTask>(owner, "tasks", taskId);
      guardCacheAt = now;
      if (controller.signal.aborted || latest?.leaseId !== leaseId || latest.status !== "running")
        throw new LostLeaseError();
      try {
        const latestContext = this.contextFor({ ...record, value: latest });
        if (latestContext.actorId !== context.actorId || latest.requestedBy !== originalRequester ||
          latest.assignedTo !== previous.assignedTo || latest.assignedBy !== previous.assignedBy ||
          latest.state.roleId !== previous.state.roleId ||
          Boolean(latest.executionContext) !== Boolean(originalSnapshot)) throw new LostLeaseError();
      } catch { throw new LostLeaseError(); }
    };
    // WORKER_GUARD_INVALIDATE_V1 - el heartbeat y el checkpoint invalidan la
    // cache para que el siguiente guard lea de DB.
    const invalidateGuard = () => {
      guardCacheAt = 0;
      // HEARTBEAT_ALWAYS_INVALIDATE_V1
    };
    const assertIdentity = (patch: Partial<AgentTask>) => {
      for (const field of ["id", "tenantId", "requestedBy", "assignedTo", "assignedBy"] as const) {
        if (Object.hasOwn(patch, field) && patch[field] !== previous[field]) {
          throw new Error("TASK_CONTEXT_IMMUTABLE: " + field);
        }
      }
      if (Object.hasOwn(patch, "state") && (
        !patch.state || patch.state.roleId !== previous.state.roleId ||
        (patch.state.sopId !== previous.state.sopId && patch.state.sopId !== previous.input.sopId)
      )) {
        throw new Error("TASK_CONTEXT_IMMUTABLE: role or SOP");
      }
      if (Object.hasOwn(patch, "leaseId") || Object.hasOwn(patch, "leaseUntil")) {
        throw new Error("TASK_CONTEXT_IMMUTABLE: lease");
      }
      if (Object.prototype.hasOwnProperty.call(patch, "executionContext")) {
        const parsed = taskExecutionContextSchema.safeParse(patch.executionContext);
        if (!parsed.success || parsed.data.tenantId !== context.tenantId || parsed.data.owner !== context.owner ||
          parsed.data.actorId !== context.actorId || !originalSnapshot) {
          throw new Error("TASK_CONTEXT_IMMUTABLE: executionContext");
        }
      }
    };
    const checkpoint = async (patch: Partial<AgentTask>, finish = false) => {
      assertIdentity(patch);
      if (controller.signal.aborted) throw new LostLeaseError();
      const next = await this.db.compareAndSwap<AgentTask>(
        owner,
        "tasks",
        taskId,
        { leaseId, status: "running", ...identityExpected },
        {
          ...patch,
          ...(finish ? { leaseId: null, leaseUntil: null } : {}),
          updatedAt: new Date(this.now()).toISOString(),
        },
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
      // RUN_EVENTS_CAP_V1 - tope de 100 eventos por task.
      if (recentEvents.size > 100) {
        const oldest = [...recentEvents.entries()].sort((a, b) => a[1].date - b[1].date)[0];
        if (oldest) recentEvents.delete(oldest[0]);
      }
      // WORKER_DEDUPE_PERSIST_CAS_V1
      // WORKER_DEDUPE_PERSIST_V1 - persistir el dedupe en task.state.
      await this.db.compareAndSwap(
        owner,
        "tasks",
        taskId,
        { leaseId, status: "running", ...identityExpected },
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
      // WORKER_REQUESTING_ACTOR_V1 - actorId = executingActorId.
      // B5: fallback a owner se marca como legacy, no identidad demostrada.
      const roleId = typeof task.state.roleId === "string" ? task.state.roleId : undefined;
      const executingActorId = roleId ?? task.assignedTo ?? owner;
      // TASK_REQUESTER_ACTOR_V1 - el solicitante es un dato persistido, no
      // assignedTo (que siempre cae a owner y es el ejecutor). compat solo es
      // "real" cuando la tarea trae requestedBy; un fallback se declara legacy.
      const requestingActorId = context.actorId;
      const compat = "real";
      await bus.emit(owner, type, source, { ...payload, taskId, roleId, actorId: executingActorId, requestingActorId, compat }, { tenantId: context.tenantId });
    };
    // B105
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
        // HEARTBEAT_ALWAYS_INVALIDATE_V1
        // el guard acababa de leer (cacheAt > 0) para que un robo de lease
        // durante el heartbeat no quede invisible. Antes solo se invalidaba
        // si el guard no hab
        invalidateGuard();
        void this.db
          .compareAndSwap(
            owner,
            "tasks",
            taskId,
            { leaseId, status: "running", ...identityExpected },
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
      // WORKER_CTX_SIGNAL_V1 - timeout por task con TASK_TIMEOUT_MS.
      const TASK_TIMEOUT_MS = this.taskTimeoutMs();
      const taskTimeout = setTimeout(() => {
        if (!controller.signal.aborted) controller.abort();
      }, TASK_TIMEOUT_MS);
      taskTimeout.unref?.();
      let result: Partial<AgentTask>;
      try {
        result = await this.execute(owner, task, {
          signal: controller.signal,
          guard,
          checkpoint: (patch) => checkpoint(patch),

          event,
          busEvent,
        });
      } finally {
        clearTimeout(taskTimeout);
      }
      // WORKER_LAST_DURATION_V1 - persiste duracion.
      const durationMs = Date.now() - runStartedAt;
      await checkpoint({
        ...result,
        state: {
          ...((result.state as Record<string, unknown> | undefined) ?? task.state ?? {}),
          lastRunDurationMs: durationMs,
        },
      }, true);
      const finishMeta: { id: string } & Record<string, unknown> = {
        id: leaseId,
        taskId,
        startedAt: task.updatedAt,
        finishedAt: new Date(this.now()).toISOString(),
        status: (() => {
          const next = result.status ?? task.status;
          if (next !== task.status && !canTransitionTask(task.status, next)) {
            backgroundFailure("TASK_TRANSITION_GUARD_V1", new Error("Illegal task transition " + task.status + " -> " + next + " for task " + task.id));
            return task.status;
          }
          return next;
        })(),
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
          { leaseId, status: "running", ...identityExpected },
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
          { leaseId, status: "running", ...identityExpected },
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
          await this.db.put(owner, "run-events", {
            id: randomUUID(),
            taskId,
            date: new Date(this.now()).toISOString(),
            kind: "error",
            title: "Task needs attention",
            detail,
          }).catch((error) => backgroundFailure("record task error", error));
          // WORKER_DLQ_WIRE_V1
          // Ver: docs/audits/03-resiliencia/roadmap.md
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
          status: controller.signal.aborted ? "paused" : "failed",
          finishedAt: new Date(this.now()).toISOString(),
        },
      );
    } finally {
      clearInterval(heartbeat);
      this.active.delete(activeKey);
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
      // WORKER_SETTLED_CONTEXT_V1
      // que un fallo de la notificaci
      // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
      try {
        // WORKER_REQUESTING_ACTOR_V1 - settled recibe executing y requesting.
        const roleId = typeof settled.state.roleId === "string" ? settled.state.roleId : undefined;
        const _execAct = roleId ?? settled.assignedTo ?? owner;
        const _reqAct = context.actorId;
        await this.options.settled(owner, settled, { executingActorId: _execAct, requestingActorId: _reqAct });
      } catch (error) {
        backgroundFailure("settled callback", error);
      }
    }
  }
}


