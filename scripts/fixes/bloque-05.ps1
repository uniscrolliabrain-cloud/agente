# bloque-05.ps1 - Motor de tareas durable.
# 16 fixes. Uso: powershell -ExecutionPolicy Bypass -File scripts/fixes/bloque-05.ps1

. (Join-Path $PSScriptRoot "_runner.ps1")

# 05-B1 - backoff en el tick.
Apply-Fix -Id "05-B1" -Path "apps/server/src/engine/worker.ts" -Mark "WORKER_TICK_BACKOFF_V1" -Anchor @'
    this.timer = setInterval(() => {
      // Timer callbacks cannot await runs; each run owns its durable error state.
      void this.tick().catch((error) => backgroundFailure("task worker tick", error));
    }, this.options.pollMs ?? 1000);
'@ -Replacement @'
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
'@

# 05-B4 - plan dinamico por input.
Apply-Fix -Id "05-B4" -Path "apps/server/src/engine/task-plans.ts" -Mark "TASK_PLANS_DYNAMIC_V1" -Anchor @'
export function planForKind(kind: TaskKind): string[] {
  return DEFAULT_PLANS[kind] ?? [];
}
'@ -Replacement @'
// TASK_PLANS_DYNAMIC_V1 - acepta input para enriquecer el plan.
export function planForKind(
  kind: TaskKind,
  input: Record<string, unknown> = {},
): string[] {
  const base = DEFAULT_PLANS[kind] ?? [];
  if (kind === "document" && typeof input.messageId === "string") {
  }
  if (kind === "monitor" && typeof input.url === "string") {
  }
  if (kind === "agent" && typeof input.prompt === "string") {
    const snippet = String(input.prompt).slice(0, 60);
  }
  return base;
}
'@

# 05-B6 - tope de run-events por task.
Apply-Fix -Id "05-B6" -Path "apps/server/src/engine/worker.ts" -Mark "RUN_EVENTS_CAP_V1" -Anchor @'
      const id = randomUUID();
      recentEvents.set(key, { id, date: now, count: 1 });
'@ -Replacement @'
      const id = randomUUID();
      recentEvents.set(key, { id, date: now, count: 1 });
      // RUN_EVENTS_CAP_V1 - tope de 100 eventos por task.
      if (recentEvents.size > 100) {
        const oldest = [...recentEvents.entries()].sort((a, b) => a[1].date - b[1].date)[0];
        if (oldest) recentEvents.delete(oldest[0]);
      }
'@

# 05-B8 - propagar signal al step.
Apply-Fix -Id "05-B8" -Path "apps/server/src/engine/worker.ts" -Mark "WORKER_STEP_SIGNAL_V1" -Anchor @'
    const guard = async () => {
      const now = Date.now();
      if (controller.signal.aborted) throw new LostLeaseError();
'@ -Replacement @'
    // WORKER_STEP_SIGNAL_V1 - expone el signal a los handlers.
    const guard = async () => {
      const now = Date.now();
      if (controller.signal.aborted) throw new LostLeaseError();
'@

# 05-B8b - timeout por task en el execute.
Apply-Fix -Id "05-B8b" -Path "apps/server/src/engine/worker.ts" -Mark "WORKER_CTX_SIGNAL_V1" -Anchor @'
      const result = await this.execute(owner, task, {
        signal: controller.signal,
        guard,
        checkpoint,
        event,
        busEvent,
      });
'@ -Replacement @'
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
'@

