// B105_APPLIED
// B105FIX_APPLIED
// EVENTBUS_WORKER_V1
import { randomUUID } from "node:crypto";
import type { AgentTask, RunEvent } from "../../../../packages/domain/src/agent.ts";
import type { Store } from "../db.ts";
import type { TenantScopedStore } from "../db-tenant.ts";
import { backgroundFailure } from "../log.ts";
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
    } = {},
  ) {}
  private now() {
    return this.options.now?.() ?? Date.now();
  }
  get running() {
    return Boolean(this.timer);
  }
  start() {
    if (this.timer) return;
    this.stopping = false;
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
    while (this.active.size || this.ticking) await new Promise((r) => setTimeout(r, 10));
  }
  abort(taskId: string) {
    this.active.get(taskId)?.abort();
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
        eligible.push(record);
        if (eligible.length === 3) break;
      }
      await Promise.all(eligible.map(({ owner, value }) => this.run(owner, value)));
    } finally {
      this.ticking = false;
    }
  }
  private async run(owner: string, previous: AgentTask) {
    if (this.stopping) return;
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
    const GUARD_CACHE_MS = 500;
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
      await this.options.settled(owner, settled);
    }
  }
}


