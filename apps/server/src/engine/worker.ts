// B105_APPLIED
// B105FIX_APPLIED
// EVENTBUS_WORKER_V1
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { AgentTask, RunEvent } from "../../../../packages/domain/src/agent.ts";
import { canTransitionTask } from "../../../../packages/domain/src/agent.ts";
import type { AgentService } from "./service.ts";
import {
  LeadsService,
  MAX_FOLLOW_UP_STEPS,
  type LeadFicha,
  type LeadFollowUp,
} from "./leads.ts";
import type { GoogleMapsClient } from "../../../../packages/integrations/src/google-maps.ts";
import type { Store } from "../db.ts";
import type { TenantScopedStore } from "../db-tenant.ts";
import { currentTenantScope, runInTenantScope } from "../tenant-scope.ts";
import { backgroundFailure } from "../log.ts";
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
      "agente_task_duration_seconds_sum",
      "Suma de duraciones de tareas en segundos",
    );
    globalMetrics.counter(
      "agente_task_duration_seconds_count",
      "Numero de tareas ejecutadas",
    );
    globalMetrics.gauge("agente_worker_active", "Handlers concurrentes activos");
    globalMetrics.gauge("agente_worker_max_active", "Tope de handlers concurrentes");
    globalMetrics.set("agente_worker_max_active", this.maxActive);
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
      // WORKER_SCAN_BY_STATUS_V1
  // Con scanByStatus solo cargamos los estados que este tick procesa.
  // El filtro por nextRunAt / leaseUntil / actionId sigue igual abajo.
  // WORKER_SCAN_V1
// TenantScopedStore, el scan peela el prefijo del tenant. La optimizaci
// con scanByOwnerPrefix requiere conocer el tenant activo, que el worker
// no tiene. Este comentario documenta la deuda y remite al bloque 07.
    // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
    const records = await this.dueTasks();
      const due = records.filter(
        ({ value: t }) =>
          !this.active.has(t.id) &&
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
        if (record.value.status === "waiting_approval") {
          const actionId = record.value.actionId;
          // WORKER_TENANT_ACTION_READ_V1 - la accion vive en el MISMO tenant que la
          // tarea; sin el scope de la fila esta lectura resolvia la membership primaria.
          const action = actionId
            ? await this.inRowTenant(record, () =>
                this.db.get<{ status: string; expiresAt?: string }>(record.owner, "actions", actionId),
              )
            : null;
          if (
            actionId &&
            action?.status === "awaiting_review" &&
            Date.parse(action.expiresAt ?? "") <= this.now()
          )
            await this.inRowTenant(record, () =>
              this.db.compareAndSwap(
                record.owner,
                "actions",
                actionId,
                { status: "awaiting_review", expiresAt: action.expiresAt },
                { status: "expired" },
              ),
            );
          else if (action && ["awaiting_review", "executing"].includes(action.status)) continue;
        }
        // WORKER_OWNER_QUOTA_V1
        const ownerCount = perOwnerCount.get(record.owner) ?? 0;
        if (ownerCount >= MAX_PER_OWNER) continue;
        perOwnerCount.set(record.owner, ownerCount + 1);
        eligible.push(record);
        if (eligible.length === 20) break;
      }
      // WORKER_MAX_ACTIVE_V1
    // Si ya hay maxActive handlers corriendo, no lanzamos m
    const available = Math.max(0, this.maxActive - this.active.size);
    const toRun = eligible.slice(0, available);
    await Promise.all(
      toRun.map((row) => this.inRowTenant(row, () => this.run(row.owner, row.value))),
    );
    } finally {
      this.ticking = false;
    }
  }

  /**
   * WORKER_TENANT_CLAIM_V1 - tareas con el tenant de cada fila.
   *
   * El worker corre fuera de una peticion, asi que no hay claim que diga en que
   * empresa esta. Antes el scan devolvia solo el owner pelado y la reclamacion
   * (compareAndSwap) resolvia la membership *primaria* del usuario: la tarea de
   * su segunda empresa se buscaba en la primera, no aparecia y no se ejecutaba
   * nunca. Ahora el tenant viaja con la fila y el tick fija el scope antes de
   * reclamar.
   */
  private async dueTasks(): Promise<{ tenantId: string | null; owner: string; value: AgentTask }[]> {
    const scoped = this.db as TenantScopedStore & {
      scanByStatusWithTenant?: <U>(
        kind: string,
        statuses: string[],
        limit?: number,
      ) => Promise<{ tenantId: string | null; owner: string; value: U }[]>;
    };
    const statuses = ["queued", "scheduled", "running", "waiting_approval"];
    if (typeof scoped.scanByStatusWithTenant === "function") {
      return await scoped.scanByStatusWithTenant<AgentTask>("tasks", statuses);
    }
    const rows = await this.db.scanByStatus<AgentTask>("tasks", statuses);
    return rows.map((row) => ({ tenantId: null, owner: row.owner, value: row.value }));
  }

  /**
   * Ejecuta `fn` con el tenant de la fila fijado. Las filas sin tenant
   * declarado (store crudo en tests, datos anteriores al scoping) conservan el
   * comportamiento previo.
   */
  private async inRowTenant<T>(
    row: { tenantId?: string | null; owner: string; value: AgentTask },
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!row.tenantId) return fn();
    // assignedBy is the durable requesting actor used in task events.
    const actorId = row.value.assignedBy ?? row.owner;
    return runInTenantScope({ tenantId: row.tenantId, actorId }, fn);
  }

  private async run(owner: string, previous: AgentTask) {
    if (this.stopping) return;
    // WORKER_METRICS_V1
    const runStartedAt = Date.now();
    const leaseId = randomUUID(),
      leaseMs = this.options.leaseMs ?? 60000;
    const expected: Record<string, unknown> = {
      status: previous.status,
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
    // WORKER_TASK_NONNULL_V1 - task se declara ya no-nulo: es `let` porque
    // checkpoint() lo reasigna, y al ser capturado por closures TS volvia a
    // verlo como AgentTask | null en cada uso (TS18047).
    let task: AgentTask = swapped;
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
    // WORKER_STEP_SIGNAL_V1 - expone el signal a los handlers.
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
      // HEARTBEAT_ALWAYS_INVALIDATE_V1
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
      // WORKER_REQUESTING_ACTOR_V1 - actorId = executingActorId.
      // B5: fallback a owner se marca como legacy, no identidad demostrada.
      const executingActorId = (task.assignedTo ?? (task.state as { roleId?: string } | undefined)?.roleId ?? owner);
      const requestingActorId = (task.assignedBy ?? owner);
      const compat = task.assignedTo || task.assignedBy ? "real" : "legacy";
      await bus.emit(owner, type, source, { taskId, actorId: executingActorId, requestingActorId, compat, ...payload });
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
          checkpoint,
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
        leaseId: null,
        leaseUntil: null,
        state: {
          ...((result.state as Record<string, unknown> | undefined) ?? task.state ?? {}),
          lastRunDurationMs: durationMs,
        },
      });
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
      // WORKER_SETTLED_CONTEXT_V1
      // que un fallo de la notificaci
      // Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.
      try {
        // WORKER_REQUESTING_ACTOR_V1 - settled recibe executing y requesting.
        const _execAct = (settled.assignedTo ?? (settled.state as { roleId?: string } | undefined)?.roleId ?? owner);
        const _reqAct = (settled.assignedBy ?? owner);
        await this.options.settled(owner, settled, { executingActorId: _execAct, requestingActorId: _reqAct });
      } catch (error) {
        backgroundFailure("settled callback", error);
      }
    }
  }
}



// LEAD_INVESTIGATION_V1 (campana 18) - delegacion tipada de Laia a Marcos.
//
// El trabajo `investigar-leads` declara entrada validada, version de SOP,
// agente autorizado y salida tipada: una ficha revisable por campo. Places no
// devuelve contacto, asi que el contacto ausente se declara como ausente; el
// trabajo nunca lo inventa.

export const LEAD_INVESTIGATION_SOP = "investigar-leads";
export const LEAD_INVESTIGATION_VERSION = 1;
export const LEAD_INVESTIGATION_AGENT = "marcos";

export const leadInvestigationCriteriaSchema = z.object({
  sector: z.string().trim().max(120).default(""),
  city: z.string().trim().max(120).default(""),
  keywords: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  minRating: z.number().min(0).max(5).default(4),
  minReviews: z.number().int().nonnegative().default(10),
});
export type LeadInvestigationCriteria = z.infer<typeof leadInvestigationCriteriaSchema>;

export const leadInvestigationInputSchema = z.object({
  // Referencias del pipeline. Vacio = todas las fichas aceptadas de la empresa.
  leadRefs: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
  criteria: leadInvestigationCriteriaSchema.default({
    sector: "",
    city: "",
    keywords: [],
    minRating: 4,
    minReviews: 10,
  }),
});
export type LeadInvestigationInput = z.infer<typeof leadInvestigationInputSchema>;

const leadFieldSchema = z.object({
  value: z.union([z.string(), z.number()]).nullable(),
  verified: z.boolean(),
  source: z.enum(["google_places", "derived"]).nullable(),
});
export type LeadField = z.infer<typeof leadFieldSchema>;

const leadReviewSchema = z.object({
  ref: z.string(),
  placeId: z.string(),
  name: z.string(),
  score: z.number().int().min(0).max(100),
  fit: z.enum(["alto", "medio", "bajo"]),
  criteriaMatched: z.array(z.string()),
  criteriaMissed: z.array(z.string()),
  fields: z.object({
    name: leadFieldSchema,
    address: leadFieldSchema,
    phone: leadFieldSchema,
    website: leadFieldSchema,
    domain: leadFieldSchema,
    rating: leadFieldSchema,
    reviews: leadFieldSchema,
    businessStatus: leadFieldSchema,
    contactName: leadFieldSchema,
    contactEmail: leadFieldSchema,
  }),
  missing: z.array(z.string()),
  nextStep: z.string(),
  source: z.object({
    provider: z.literal("google_places"),
    placeId: z.string(),
    query: z.string(),
    discoveredAt: z.string(),
  }),
});
export type LeadReview = z.infer<typeof leadReviewSchema>;

export const leadInvestigationOutputSchema = z.object({
  schema: z.literal("LEAD_FICHA_V1"),
  work: z.literal(LEAD_INVESTIGATION_SOP),
  sop: z.object({
    id: z.literal(LEAD_INVESTIGATION_SOP),
    version: z.number().int().positive(),
  }),
  // El resultado conserva quien delego y quien ejecuto: no se deduce del owner.
  requestedBy: z.string(),
  agent: z.string(),
  leads: z.array(leadReviewSchema),
  missingContact: z.array(z.string()),
});
export type LeadInvestigationOutput = z.infer<typeof leadInvestigationOutputSchema>;

const fieldOf = (
  value: string | number | undefined,
  source: "google_places" | "derived" = "google_places",
): LeadField =>
  value === undefined || value === ""
    ? { value: null, verified: false, source: null }
    : { value, verified: true, source };

function scoreLead(ficha: LeadFicha, criteria: LeadInvestigationCriteria) {
  const matched: string[] = [];
  const missed: string[] = [];
  let score = 0;
  if (ficha.rating === undefined) missed.push("rating");
  else if (ficha.rating >= criteria.minRating) {
    score += 25;
    matched.push(`rating>=${criteria.minRating}`);
  } else missed.push(`rating>=${criteria.minRating}`);
  if (ficha.reviews === undefined) missed.push("resenas");
  else if (ficha.reviews >= criteria.minReviews) {
    score += 20;
    matched.push(`resenas>=${criteria.minReviews}`);
  } else missed.push(`resenas>=${criteria.minReviews}`);
  if (ficha.website) {
    score += 15;
    matched.push("web");
  } else missed.push("web");
  if (ficha.phone) {
    score += 15;
    matched.push("telefono");
  } else missed.push("telefono");
  const tokens = [criteria.sector, criteria.city, ...criteria.keywords]
    .flatMap((value) => value.toLowerCase().split(/[^\p{L}\p{N}]+/u))
    .filter((token) => token.length > 1);
  const text = `${ficha.name} ${ficha.address} ${ficha.notes} ${ficha.domain ?? ""}`.toLowerCase();
  if (tokens.length === 0) {
    score += 25;
    matched.push("sin criterios de texto");
  } else {
    const hits = tokens.filter((token) => text.includes(token));
    score += Math.round((hits.length / tokens.length) * 25);
    matched.push(...hits.map((token) => `texto:${token}`));
    missed.push(
      ...tokens.filter((token) => !hits.includes(token)).map((token) => `texto:${token}`),
    );
  }
  const total = Math.max(0, Math.min(100, score));
  const fit: "alto" | "medio" | "bajo" = total >= 70 ? "alto" : total >= 40 ? "medio" : "bajo";
  return { score: total, fit, criteriaMatched: matched, criteriaMissed: missed };
}

function buildReview(ficha: LeadFicha, criteria: LeadInvestigationCriteria): LeadReview {
  const { score, fit, criteriaMatched, criteriaMissed } = scoreLead(ficha, criteria);
  const fields = {
    name: fieldOf(ficha.name),
    address: fieldOf(ficha.address),
    phone: fieldOf(ficha.phone),
    website: fieldOf(ficha.website),
    domain: fieldOf(ficha.domain, "derived"),
    rating: fieldOf(ficha.rating),
    reviews: fieldOf(ficha.reviews),
    businessStatus: fieldOf(ficha.businessStatus),
    // Places no devuelve persona ni correo de contacto: se declaran ausentes.
    contactName: fieldOf(undefined),
    contactEmail: fieldOf(undefined),
  };
  const missing = [
    ...(fields.phone.value === null ? ["telefono"] : []),
    ...(fields.website.value === null ? ["web"] : []),
    ...(fields.address.value === null ? ["direccion"] : []),
    ...(fields.rating.value === null ? ["rating"] : []),
    ...(fields.businessStatus.value === null ? ["estado del negocio"] : []),
    "contacto",
  ];
  const nextStep =
    fields.businessStatus.value !== null && fields.businessStatus.value !== "OPERATIONAL"
      ? "Comprobar si el negocio sigue abierto antes de contactar."
      : fit === "bajo"
        ? "Revisar el encaje antes de invertir tiempo: faltan criterios de la empresa."
        : "Pedir el contacto antes de escribir: Places no lo trae.";
  return {
    ref: ficha.ref,
    placeId: ficha.placeId,
    name: ficha.name,
    score,
    fit,
    criteriaMatched,
    criteriaMissed,
    fields,
    missing,
    nextStep,
    source: { ...ficha.source },
  };
}

// El trabajo nunca consulta Places: opera sobre fichas ya aceptadas en el
// pipeline. El stub deja el contrato del constructor explicito.
const UNAVAILABLE_MAPS = {
  searchLeads: async () => {
    throw new Error("investigar-leads no busca en Places: trabaja sobre fichas aceptadas");
  },
} as unknown as GoogleMapsClient;

export function isLeadInvestigation(task: AgentTask): boolean {
  return task.kind === "sop" && task.input.sopId === LEAD_INVESTIGATION_SOP;
}

export async function executeLeadInvestigation(
  service: AgentService,
  owner: string,
  task: AgentTask,
  ctx: TaskContext,
): Promise<Partial<AgentTask>> {
  const input = leadInvestigationInputSchema.parse(task.input);
  // Sin empresa resuelta no se cualifica: nada de caer a un tenant por defecto.
  const tenantId =
    currentTenantScope()?.tenantId ??
    (await service.tenantService?.tenantIdFor(owner).catch(() => undefined));
  if (!tenantId) {
    throw new Error("investigar-leads necesita una empresa resuelta para leer su pipeline");
  }
  const pipeline = new LeadsService(service.db as TenantScopedStore, UNAVAILABLE_MAPS);
  const accepted = await pipeline.list(tenantId);
  const fichas = accepted.filter(
    (ficha) => input.leadRefs.length === 0 || input.leadRefs.includes(ficha.ref),
  );
  const agent =
    task.assignedTo ??
    (typeof task.state.roleId === "string" ? task.state.roleId : LEAD_INVESTIGATION_AGENT);
  const requestedBy = task.assignedBy ?? owner;
  if (fichas.length === 0) {
    await ctx.event("status", "Sin fichas aceptadas que cualificar");
    return {
      status: "waiting_input",
      question:
        "No hay fichas aceptadas en el pipeline de esta empresa con esas referencias. Acepta una ficha en Places y vuelve a delegar el trabajo.",
    };
  }
  const leads = fichas.map((ficha) => buildReview(ficha, input.criteria));
  const output = leadInvestigationOutputSchema.parse({
    schema: "LEAD_FICHA_V1",
    work: LEAD_INVESTIGATION_SOP,
    sop: { id: LEAD_INVESTIGATION_SOP, version: LEAD_INVESTIGATION_VERSION },
    requestedBy,
    agent,
    leads,
    missingContact: leads
      .filter((lead) => lead.fields.contactEmail.value === null)
      .map((lead) => lead.ref),
  });
  await ctx.event("step", `Cualificando ${leads.length} ficha(s) aceptada(s)`);
  const summary = `${leads.length} ficha(s) cualificada(s); ${output.missingContact.length} sin contacto que pedir antes de escribir`;
  const artifact = await service.artifactFromSource(
    owner,
    `task:${task.id}`,
    "report",
    `Cualificacion de ${agent}`,
    summary,
    output as unknown as Record<string, unknown>,
    "lead-ficha",
  );
  await ctx.event("result", "Ficha revisable lista", summary);
  return {
    status: "succeeded",
    result: summary,
    artifactIds: [artifact.id],
    evidence: fichas.map((ficha) => ({
      id: ficha.ref,
      kind: "web" as const,
      title: `Places: ${ficha.source.query || ficha.placeId}`,
      excerpt: `${ficha.source.provider} · ${ficha.source.discoveredAt}`,
      ...(ficha.website ? { url: ficha.website } : {}),
    })),
    state: {
      ...task.state,
      work: { id: LEAD_INVESTIGATION_SOP, version: LEAD_INVESTIGATION_VERSION },
      workOutput: output,
      workArtifactId: artifact.id,
    },
  };
}


// LEAD_FOLLOW_UP_V1 (campana 19) - preparacion durable del seguimiento.
//
// El paso se programa por lead y por hilo antes de redactar: reintentar la
// preparacion usa la misma clave y no duplica ni reinicia la cuenta. El
// borrador se revisa como cualquier correo; la aprobacion revalida el hilo.

export const FOLLOW_UP_WORK = "seguimiento-leads";
export const FOLLOW_UP_DRAFT_VERSION = 1;

export const followUpDraftInputSchema = z.object({
  ref: z.string().trim().min(1).max(120),
  step: z.number().int().min(1).max(MAX_FOLLOW_UP_STEPS),
  threadId: z.string().trim().min(1).max(500),
  replyToMessageId: z.string().trim().min(1).max(500),
  to: z.email(),
  subject: z.string().trim().min(1).max(200).optional(),
  scheduledFor: z.iso.datetime({ offset: true }),
});
export type FollowUpDraftInput = z.infer<typeof followUpDraftInputSchema>;

export function followUpIdempotencyKey(ref: string, step: number): string {
  return `lead-follow-up:${ref}:${step}`;
}

export function followUpEmail(ficha: LeadFicha, input: FollowUpDraftInput) {
  const subject = input.subject ?? `Seguimiento: ${ficha.name}`;
  const lines = ["Hola,", "", `Te escribo de nuevo sobre ${ficha.name}.`];
  if (ficha.notes) lines.push(`Contexto: ${ficha.notes}`);
  lines.push(
    "",
    "Si no quieres recibir mas mensajes, responde BAJA y no volveremos a escribirte.",
  );
  return {
    kind: "email.send" as const,
    data: {
      to: [input.to],
      cc: [],
      bcc: [],
      subject: /^re:\s*/i.test(subject) ? subject : `Re: ${subject}`,
      threadId: input.threadId,
      replyToMessageId: input.replyToMessageId,
      attachmentIds: [],
      body: lines.join("\n"),
    },
  };
}

export async function prepareFollowUpDraft(
  service: AgentService,
  owner: string,
  raw: unknown,
): Promise<{
  followUp: LeadFollowUp;
  draft: ReturnType<typeof followUpEmail>;
  idempotencyKey: string;
}> {
  const input = followUpDraftInputSchema.parse(raw);
  const tenantId =
    currentTenantScope()?.tenantId ??
    (await service.tenantService?.tenantIdFor(owner).catch(() => undefined));
  if (!tenantId) throw new Error("seguimiento-leads necesita una empresa resuelta");
  const pipeline = new LeadsService(service.db as TenantScopedStore, UNAVAILABLE_MAPS);
  const ficha = (await pipeline.list(tenantId)).find((item) => item.ref === input.ref);
  if (!ficha) throw new Error("La ficha no esta aceptada en esta empresa");
  const { followUp } = await pipeline.scheduleFollowUp(tenantId, {
    ...input,
    subject: input.subject ?? `Seguimiento: ${ficha.name}`,
  });
  return {
    followUp,
    draft: followUpEmail(ficha, input),
    idempotencyKey: followUpIdempotencyKey(input.ref, input.step),
  };
}
