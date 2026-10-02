import { randomUUID } from "node:crypto";
import type { EventBus } from "../events/index.ts";

// AGENT_RUNTIME_V1 — runtime efimero por ejecucion. No se persiste.
// El historial durable vive en el event bus. El runtime solo da identidad
// a cada ejecucion de agente (spawn + complete/fail + destroy).

export interface EphemeralRuntime {
  runtimeId: string;
  owner: string;
  roleId: string;
  taskId?: string;
  correlationId: string;
  createdAt: string;
}

export class AgentRuntimeManager {
  private readonly active = new Map<string, EphemeralRuntime>();

  constructor(private readonly bus?: EventBus) {}

  async spawn(input: {
    owner: string;
    roleId: string;
    taskId?: string;
    correlationId?: string;
  }): Promise<EphemeralRuntime> {
    const runtime: EphemeralRuntime = {
      runtimeId: randomUUID(),
      owner: input.owner,
      roleId: input.roleId,
      ...(input.taskId ? { taskId: input.taskId } : {}),
      correlationId: input.correlationId ?? randomUUID(),
      createdAt: new Date().toISOString(),
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

  activeCount(owner: string): number {
    let count = 0;
    for (const runtime of this.active.values()) if (runtime.owner === owner) count += 1;
    return count;
  }

  /** RUNTIME_LIST_V1 - lista runtimes activos por tenant (para admin). */
  listForTenant(tenantId: string): EphemeralRuntime[] {
    const out: EphemeralRuntime[] = [];
    for (const runtime of this.active.values()) {
      if ((runtime as unknown as { tenantId?: string }).tenantId === tenantId) out.push(runtime);
    }
    return out;
  }
}
