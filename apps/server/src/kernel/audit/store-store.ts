// KERNEL_STORE_AUDIT_STORE_V2 - audit persistente con hash chain atomica.
//
// Cambios respecto a V1:
//   - append() usa transaction() para que lastHash + put sean atomicos.
//     Antes, dos procesos concurrentes podian leer el mismo lastHash y
//     escribir dos entradas con el mismo previousHash, rompiendo la cadena.
//   - verify() lee en orden cronologico real (updated_at ASC via listPaged).
//   - list() con tope duro para no traer 100.000 entradas de golpe.
//   - MAX_LIST ampliable por env var para tenants grandes.
//
// SOC-2: este es el store que se activa en produccion. InMemoryAuditStore
// solo para tests. app.ts cambia en P2.7.

import { createHash, randomUUID } from "node:crypto";
import type { Store } from "../../db.ts";
import { auditEntrySchema, type AuditEntry } from "./entry.ts";
import type { AuditAppendInput, AuditStore } from "./store.ts";

const KIND = "audit-entries";
const DEFAULT_MAX_LIST = 10_000;

function maxList(): number {
  const raw = process.env.KERNEL_AUDIT_MAX_LIST;
  if (!raw) return DEFAULT_MAX_LIST;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_MAX_LIST;
}

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
    return this.db.transaction(async () => {
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
    });
  }

  async lastHash(tenantId: string): Promise<string | undefined> {
    const list = await this.db.list<AuditEntry>(tenantId, KIND, { limit: 1 });
    return list[0]?.hash;
  }

  async list(tenantId: string, limit: number): Promise<AuditEntry[]> {
    const capped = Math.min(Math.max(1, limit), maxList());
    // listPaged ordena por updated_at DESC, id DESC. El audit trail quiere
    // orden ascendente para verificar la cadena, asi que invertimos.
    const rows = await this.db.listPaged<AuditEntry>(tenantId, KIND, { limit: capped });
    return rows.map((row) => row.data).reverse();
  }

  async verify(tenantId: string): Promise<boolean> {
    const list = await this.list(tenantId, maxList());
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
