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

// AUDIT_CANONICAL_HASH_FIX_V1 - JSON.stringify no garantiza orden de claves
// en objetos anidados (payload, actor). Si el orden cambia entre append y
// verify, el hash no coincide y la cadena "falla" sin motivo real. Aqui
// ordenamos recursivamente las claves antes de serializar.
function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) out[key] = canonicalize(obj[key]);
  return out;
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
      JSON.stringify(
        canonicalize({
          id: input.id,
          tenantId: input.tenantId,
          owner: input.owner,
          action: input.action,
          actor: input.actor,
          payload: input.payload,
          timestamp: input.timestamp,
          previousHash: input.previousHash ?? null,
        }),
      ),
    )
    .digest("hex");
}

export class StoreAuditStore implements AuditStore {
  constructor(private readonly db: Store) {}

  // AUDIT_APPEND_CAS_FIX_V1 - el `db.transaction()` original era decorativo:
  // lastHash usaba una conexion distinta del pool, asi que dos appends
  // concurrentes podian leer el mismo previousHash y romper la cadena.
  // Ahora usamos CAS sobre un anchor con id fijo que guarda el hash actual.
  // Si dos procesos van a la vez, uno gana; el otro reintenta con el nuevo
  // previousHash.
  async append(input: AuditAppendInput): Promise<AuditEntry> {
    const MAX_ATTEMPTS = 5;
    let lastError: Error | undefined;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
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
      // Anchor con id fijo. Guarda el hash actual de la cadena.
      const anchorId = "__audit_anchor__";
      const anchor = await this.db
        .get<{ hash: string }>(input.tenantId, KIND, anchorId)
        .catch(() => null);
      const anchorHash = anchor?.hash;
      if (anchorHash !== previousHash) {
        lastError = new Error(`Audit chain advanced during append (attempt ${attempt + 1})`);
        continue;
      }
      // CAS sobre el anchor. Si el anchor no existia, insertIfAbsent.
      if (anchor === null) {
        const inserted = await this.db.insertIfAbsent(input.tenantId, KIND, {
          id: anchorId,
          hash,
        } as { id: string } & Record<string, unknown>);
        if (!inserted) {
          lastError = new Error(`Audit anchor insert lost (attempt ${attempt + 1})`);
          continue;
        }
      } else {
        const updated = await this.db.compareAndSwap<{ hash: string }>(
          input.tenantId,
          KIND,
          anchorId,
          { hash: anchorHash },
          { hash },
        );
        if (!updated) {
          lastError = new Error(`Audit anchor CAS failed (attempt ${attempt + 1})`);
          continue;
        }
      }
      await this.db.put(input.tenantId, KIND, entry);
      return entry;
    }
    throw lastError ?? new Error("Audit append failed after retries");
  }

  // AUDIT_LASTHASH_ANCHOR_FIX_V1 - tras el fix del append, existe una entrada
  // con id "__audit_anchor__" que guarda el hash actual de la cadena. Se lee
  // primero. Si no existe (cadena pre-fix), cae a la ultima entrada real.
  async lastHash(tenantId: string): Promise<string | undefined> {
    const anchor = await this.db
      .get<{ hash: string }>(tenantId, KIND, "__audit_anchor__")
      .catch(() => null);
    if (anchor?.hash) return anchor.hash;
    const list = await this.db.list<AuditEntry>(tenantId, KIND, { limit: 1 });
    return list[0]?.hash;
  }

  // AUDIT_LIST_EXCLUDE_ANCHOR_FIX_V1 - tras introducir el anchor con id
  // "__audit_anchor__", el list debe excluirlo porque no es una entrada real
  // (es el puntero al hash actual). Filtramos en memoria; el anchor es 1 fila.
  async list(tenantId: string, limit: number): Promise<AuditEntry[]> {
    const capped = Math.min(Math.max(1, limit), maxList());
    // Pedimos capped + 1 por si el anchor entra en la pagina.
    const rows = await this.db.listPaged<AuditEntry>(tenantId, KIND, { limit: capped + 1 });
    const entries = rows
      .map((row) => row.data)
      .filter((entry) => entry.id !== "__audit_anchor__")
      .slice(0, capped);
    // listPaged ordena por updated_at DESC, id DESC. El audit trail quiere
    // orden ascendente para verificar la cadena, asi que invertimos.
    return entries.reverse();
  }

  // AUDIT_VERIFY_INCOMPLETE_FIX_V1 - antes verify() topaba a maxList() (10.000
  // por defecto) y devolvia true aunque no hubiera verificado las entradas
  // antiguas. Ahora devuelve false si el list llego al tope, porque no puede
  // garantizar que la cadena entera este intacta.
  async verify(tenantId: string): Promise<boolean> {
    const cap = maxList();
    const list = await this.list(tenantId, cap);
    // Si el list devolvio exactamente cap entradas, no hemos verificado todo.
    // Un audit trail con mas entradas que el tope no se puede verificar de una
    // pasada con esta implementacion. Fallar honestamente es mejor que mentir.
    if (list.length >= cap) {
      console.warn(
        `[audit] verify(${tenantId}) incompleto: ${list.length} >= ${cap}. Sube KERNEL_AUDIT_MAX_LIST o pagina.`,
      );
      return false;
    }
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
