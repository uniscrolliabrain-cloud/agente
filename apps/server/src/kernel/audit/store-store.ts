// KERNEL_STORE_AUDIT_STORE_V1 — audit persistente sobre records.
//
// Hoy el kernel usa InMemoryAuditStore: el audit trail vive en el proceso
// y se pierde al reiniciar. Este bloque anade la implementacion persistente
// sobre Store, con kind "audit-entries", reutilizando put/list/compareAndSwap
// que ya tiene el repo.
//
// No se activa todavia: app.ts sigue inyectando InMemoryAuditStore. Activar
// este store es cambiar una linea en app.ts cuando se quiera persistencia
// real (SOC-2 lo exige en produccion).
//
// Hash chain igual que el in-memory: cada entrada lleva previousHash y hash
// calculados con SHA-256 sobre el contenido canonico. verify() recorre la
// cadena del tenant y comprueba que no ha sido alterada.
//
// Aislamiento: cada entrada se escribe con owner = `tenantId` para que la
// lista por tenant sea una query directa, sin filtrar en memoria.

import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../../db.ts";
import { auditEntrySchema, type AuditEntry } from "./entry.ts";
import type { AuditAppendInput, AuditStore } from "./store.ts";

const KIND = "audit-entries";

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

export class StoreAuditStore implements AuditStore {
  constructor(private readonly db: Store) {}

  async append(input: AuditAppendInput): Promise<AuditEntry> {
    const timestamp = new Date().toISOString();
    const previousHash = await this.lastHash(input.tenantId);
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
    // El owner del record es el tenantId: asi la lista por tenant es una
    // query directa y no un filtro en memoria.
    await this.db.put(input.tenantId, KIND, entry);
    return entry;
  }

  async lastHash(tenantId: string): Promise<string | undefined> {
    const list = await this.db.list<AuditEntry>(tenantId, KIND, { limit: 1 });
    return list[0]?.hash;
  }

  async list(tenantId: string, limit: number): Promise<AuditEntry[]> {
    const list = await this.db.list<AuditEntry>(tenantId, KIND, { limit });
    // list ordena por updated_at DESC; el audit trail quiere orden ascendente
    // por cadena, asi que invertimos.
    return list.slice().reverse();
  }

  async verify(tenantId: string): Promise<boolean> {
    const list = await this.list(tenantId, 10_000);
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