// KERNEL_INMEMORY_AUDIT_STORE_V1 — implementacion en memoria.
//
// Hoy: un array por tenant en memoria. Suficiente para que el kernel
// escriba audit desde el primer dia.
//
// TODO(KERNEL_AUDIT_DB_V1): cuando el audit trail tenga que sobrevivir
// reinicios o compartirse entre pods, implementar StoreAuditStore sobre
// records con kind "audit-entries". La interfaz no cambia.

import { createHash, randomUUID } from "node:crypto";
import { auditEntrySchema, type AuditEntry } from "./entry.ts";
import type { AuditAppendInput, AuditStore } from "./store.ts";

function computeHash(input: {
  id: string;
  tenantId: string;
  owner: string;
  action: string;
  actor: { kind: string; id: string };
  payload: Record<string, unknown>;
  timestamp: string;
  previousHash?: string;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: input.id,
        tenantId: input.tenantId,
        owner: input.owner,
        action: input.action,
        actor: input.actor,
        payload: input.payload,
        timestamp: input.timestamp,
        previousHash: input.previousHash ?? null,
      }),
    )
    .digest("hex");
}

export class InMemoryAuditStore implements AuditStore {
  private readonly entries = new Map<string, AuditEntry[]>();

  async append(input: AuditAppendInput): Promise<AuditEntry> {
    const timestamp = new Date().toISOString();
    const list = this.entries.get(input.tenantId) ?? [];
    const previousHash = list.length > 0 ? list[list.length - 1].hash : undefined;
    const id = randomUUID();
    const hash = computeHash({
      id,
      tenantId: input.tenantId,
      owner: input.owner,
      action: input.action,
      actor: input.actor,
      payload: input.payload,
      timestamp,
      ...(previousHash !== undefined ? { previousHash } : {}),
    });
    const entry = auditEntrySchema.parse({
      id,
      tenantId: input.tenantId,
      owner: input.owner,
      action: input.action,
      actor: input.actor,
      payload: input.payload,
      ...(previousHash !== undefined ? { previousHash } : {}),
      hash,
      timestamp,
    });
    list.push(entry);
    this.entries.set(input.tenantId, list);
    return entry;
  }

  async lastHash(tenantId: string): Promise<string | undefined> {
    const list = this.entries.get(tenantId);
    return list && list.length > 0 ? list[list.length - 1].hash : undefined;
  }

  async list(tenantId: string, limit: number): Promise<AuditEntry[]> {
    const list = this.entries.get(tenantId) ?? [];
    return list.slice(-limit);
  }

  async verify(tenantId: string): Promise<boolean> {
    const list = this.entries.get(tenantId) ?? [];
    let previous: string | undefined;
    for (const entry of list) {
      if (previous !== undefined && entry.previousHash !== previous) return false;
      const expected = computeHash({
        id: entry.id,
        tenantId: entry.tenantId,
        owner: entry.owner,
        action: entry.action,
        actor: entry.actor,
        payload: entry.payload,
        timestamp: entry.timestamp,
        ...(entry.previousHash !== undefined ? { previousHash: entry.previousHash } : {}),
      });
      if (expected !== entry.hash) return false;
      previous = entry.hash;
    }
    return true;
  }
}