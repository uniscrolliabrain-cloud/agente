import { randomUUID } from "node:crypto";
import type { EventBus } from "../events/index.ts";
import type {
  AgentRuntime,
  RuntimeCheckpoint,
  RuntimePhase,
} from "../../../../../packages/domain/src/runtime.ts";
import type { Store } from "../../db.ts";

// AGENT_RUNTIME_V1 Ã¢â‚¬â€ runtime efimero por ejecucion. No se persiste.
// El historial durable vive en el event bus. El runtime solo da identidad
// a cada ejecucion de agente (spawn + complete/fail + destroy).

// RUNTIME_CONTRACT_WIRE_V1 - el runtime efimero declara el contrato del
// dominio (AgentRuntime) y su fase (RuntimePhase). Lo propio del runtime
// efimero es la correlacion y el createdAt que viaja al bus.
export type EphemeralRuntime = Pick<
  AgentRuntime,
  "runtimeId" | "tenantId" | "owner" | "roleId" | "taskId"
> & {
  phase: RuntimePhase;
  startedAt: string;
  correlationId: string;
  createdAt: string;
};

export class AgentRuntimeManager {
  private readonly active = new Map<string, EphemeralRuntime>();

  constructor(
    private readonly bus?: EventBus,
    private readonly db?: Store,
  ) {}

  async spawn(input: {
    // RUNTIME_TENANT_V1
    tenantId: string;
    owner: string;
    roleId: string;
    taskId?: string;
    correlationId?: string;
  }): Promise<EphemeralRuntime> {
    const startedAt = new Date().toISOString();
    const runtime: EphemeralRuntime = {
      runtimeId: randomUUID(),
      tenantId: input.tenantId,
      owner: input.owner,
      roleId: input.roleId,
      ...(input.taskId ? { taskId: input.taskId } : {}),
      correlationId: input.correlationId ?? randomUUID(),
      phase: "created",
      startedAt,
      createdAt: startedAt,
    };
    this.active.set(runtime.runtimeId, runtime);
    await this.bus?.emit(
      input.owner,
      "agent.runtime_spawned",
      { kind: "agent", id: runtime.runtimeId },
      {
        runtimeId: runtime.runtimeId,
        roleId: runtime.roleId,
        taskId: runtime.taskId ?? "",
      },
      { correlationId: runtime.correlationId },
    );
    return runtime;
  }

  get(runtimeId: string): EphemeralRuntime | undefined {
    return this.active.get(runtimeId);
  }

  async complete(runtimeId: string, durationMs: number): Promise<void> {
    const runtime = this.active.get(runtimeId);
    if (!runtime) return;
    await this.persistCheckpoint(runtime, "completed", { durationMs });
    await this.bus?.emit(
      runtime.owner,
      "agent.runtime_completed",
      { kind: "agent", id: runtimeId },
      {
        runtimeId,
        roleId: runtime.roleId,
        taskId: runtime.taskId ?? "",
        durationMs,
      },
      { correlationId: runtime.correlationId },
    );
    this.active.delete(runtimeId);
  }

  async fail(runtimeId: string, error: string): Promise<void> {
    const runtime = this.active.get(runtimeId);
    if (!runtime) return;
    await this.persistCheckpoint(runtime, "failed", { error: error.slice(0, 2000) });
    await this.bus?.emit(
      runtime.owner,
      "agent.runtime_failed",
      { kind: "agent", id: runtimeId },
      {
        runtimeId,
        roleId: runtime.roleId,
        taskId: runtime.taskId ?? "",
        error: error.slice(0, 2000),
      },
      { correlationId: runtime.correlationId },
    );
    this.active.delete(runtimeId);
  }

  // RUNTIME_CHECKPOINT_WIRE_V1 - el cierre de un runtime deja checkpoint
  // persistido; antes solo viajaba el evento y se perdia el estado final.
  private async persistCheckpoint(
    runtime: EphemeralRuntime,
    phase: RuntimePhase,
    state: Record<string, unknown>,
  ): Promise<void> {
    if (!this.db) return;
    const checkpoint: RuntimeCheckpoint = {
      runtimeId: runtime.runtimeId,
      tenantId: runtime.tenantId,
      owner: runtime.owner,
      phase,
      state,
      updatedAt: new Date().toISOString(),
    };
    await this.db
      .put(runtime.tenantId, "runtime-checkpoints", { id: checkpoint.runtimeId, ...checkpoint })
      .catch(() => {});
  }

  activeCount(owner: string): number {
    let count = 0;
    for (const runtime of this.active.values()) if (runtime.owner === owner) count += 1;
    return count;
  }

  /**
   * RUNTIME_SWEEP_V1 - cierra runtimes que llevan mas de ttlMs sin completarse.
   * Los marca como failed con error "runtime timeout".
   */
  async sweep(ttlMs = 5 * 60 * 1000): Promise<number> {
    const now = Date.now();
    const toKill: string[] = [];
    for (const [id, runtime] of this.active) {
      if (now - Date.parse(runtime.createdAt) > ttlMs) toKill.push(id);
    }
    // RUNTIME_SWEEP_PARALLEL_V1 - Promise.all en vez de serie.
    await Promise.all(toKill.map((id) => this.fail(id, `runtime timeout: ${ttlMs}ms`).catch(() => {})));
    return toKill.length;
  }

  /** RUNTIME_LIST_V1 - lista runtimes activos por tenant (para admin). */
  listForTenant(tenantId: string): EphemeralRuntime[] {
    const out: EphemeralRuntime[] = [];
    for (const runtime of this.active.values()) {
      if (runtime.tenantId === tenantId) out.push(runtime);
    }
    return out;
  }
}
