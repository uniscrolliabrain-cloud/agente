// DEAD_LETTER_V1 â€” cola de tareas que han fallado persistentemente.
//
// Cuando una tarea agota sus reintentos (o falla con un error determinista
// grave), va aquÃ­. Operador humano puede:
//   - re-encolarla manualmente (con reset de attempts)
//   - ver el error original
//   - borrarla
//
// Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin dead letter queue"),
// docs/audits/03-resiliencia/roadmap.md Â§8.

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

  /** Mueve una tarea al dead-letter. Idempotente: si ya estÃ¡, no duplica. */
  // DEAD_LETTER_ENQUEUE_V1
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

  // DEAD_LETTER_RESOLVE_V1
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
  // DEAD_LETTER_RESET_REQUEUE_V1
export function resetForRequeue(task: AgentTask): AgentTask {
  // DEAD_LETTER_REQUEUE_CLEAN_V1 - limpia actionId tambien, no solo lease.
  return {
    ...task,
    id: randomUUID(),
    status: "queued",
    attempts: 0,
    error: null,
    leaseId: null,
    leaseUntil: null,
    actionId: null,
    updatedAt: new Date().toISOString(),
  };
}
