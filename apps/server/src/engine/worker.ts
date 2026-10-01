// B105_APPLIED
// B105FIX_APPLIED
// EVENTBUS_WORKER_V1
import { randomUUID } from "node:crypto";
import type { AgentTask, RunEvent } from "../../../../packages/domain/src/agent.ts";
import type { Store } from "../db.ts";
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
    private readonly db: Store,
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
      const records = await this.db.scan<AgentTask>("tasks");
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
    const guard = async () => {
      const latest = await this.db.get<AgentTask>(owner, "tasks", taskId);
      if (controller.signal.aborted || latest?.leaseId !== leaseId || latest.status !== "running")
        throw new LostLeaseError();
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
      return next;
    };
    // Dedupe temporal: si el mismo titulo se repite en menos de 60s para esta tarea,
    // no se escribe otro run-event; se incrementa el contador del ultimo. Evita
    // ruido cuando un bucle de reintentos emite el mismo "step" varias veces.
    const recentEvents = new Map<string, { id: string; date: number; count: number }>();
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
        await event("error", "Task needs attention", detail).catch((error) =>
          backgroundFailure("record task error", error),
        );
        await this.db.compareAndSwap(
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
    const settled = await this.db.get<AgentTask>(owner, "tasks", taskId);
    if (settled && this.options.settled) await this.options.settled(owner, settled);
  }
}


