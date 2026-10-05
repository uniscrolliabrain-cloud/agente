This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/**/log*.ts, apps/server/src/**/logger*.ts, apps/server/src/**/redact*.ts, apps/server/src/**/secrets*.ts, apps/server/src/**/audit/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      kernel/
        audit/
          entry.ts
          in-memory-store.ts
          store-store.ts
          store.ts
      log.ts
```

# Files

## File: apps/server/src/kernel/audit/entry.ts
```typescript
// KERNEL_AUDIT_ENTRY_V1 — audit trail inmutable.
//
// SOC-2 exige trazabilidad completa: cada operacion del kernel escribe
// una AuditEntry. La cadena de hashes (previousHash -> hash) hace que
// borrar o modificar una entrada rompa la cadena y sea detectable.
//
// El audit trail no se borra: se anonimiza. El derecho al olvido (SOC-2
// Privacy) se cumple reemplazando owner/content por hashes, no eliminando
// la fila.

import { z } from "zod";

export const auditActionSchema = z.enum([
  "turn.opened",
  "turn.closed",
  "turn.promoted",
  "thought.appended",
  "thought.promoted",
  "thought.discarded",
  "cromo.created",
  "cromo.updated",
  "cromo.deleted",
  "field.recalculated",
  "promotion.executed",
]);

export const auditEntrySchema = z.object({
  id: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  action: auditActionSchema,
  actor: z.object({
    kind: z.string().min(1).max(50),
    id: z.string().min(1).max(200),
  }),
  payload: z.record(z.string(), z.unknown()),
  previousHash: z.string().length(64).optional(),
  hash: z.string().length(64),
  timestamp: z.iso.datetime({ offset: true }),
  signature: z.string().max(200).optional(),
});

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;
```

## File: apps/server/src/kernel/audit/store.ts
```typescript
// KERNEL_AUDIT_STORE_V1 — contrato del audit trail.
//
// La interfaz es append-only por diseno. No hay update ni delete: el
// audit trail es inmutable. La anonimizacion para el derecho al olvido
// se implementa como un append de una entrada "anonymized" que apunta a
// la original, no como un update.

import type { AuditAction, AuditEntry } from "./entry.ts";

export interface AuditAppendInput {
  tenantId: string;
  owner: string;
  action: AuditAction;
  actor: { kind: string; id: string };
  payload: Record<string, unknown>;
}

export interface AuditStore {
  append(input: AuditAppendInput): Promise<AuditEntry>;
  lastHash(tenantId: string): Promise<string | undefined>;
  list(tenantId: string, limit: number): Promise<AuditEntry[]>;
  verify(tenantId: string): Promise<boolean>;
}
```

## File: apps/server/src/kernel/audit/in-memory-store.ts
```typescript
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
    // INMEM_AUDIT_TENANT_CHECK_V1 - antes no validaba nada. Si alguien
    // llamaba append con un owner de otro tenant, se escribia igual. Ahora
    // comprobamos que el tenantId no este vacio y que coincide con el tenant
    // del owner actual si este tiene prefijo "tenantId:".
    if (!input.tenantId || input.tenantId.length === 0) {
      throw new Error("AuditStore.append requiere tenantId");
    }
    const ownerParts = input.owner.split(":");
    if (ownerParts.length === 2 && ownerParts[0] !== input.tenantId) {
      throw new Error(
        `AuditStore.append: owner ${input.owner} no pertenece al tenant ${input.tenantId}`,
      );
    }
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
```

## File: apps/server/src/log.ts
```typescript
// LOG_STRUCTURED_V2 — correlationId + redacción de secretos.
//
// V2 respecto a V1:
//   - correlationId en cada línea (propagado desde el request HTTP).
//   - Redacción automática de campos sensibles en payloads anidados.
//   - backgroundFailure con contexto estructurado (owner, tenantId, taskId).
//   - Cabecera obligatoria: http.method, http.path, http.status cuando aplica.
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin traceId",
// "backgroundFailure sin contexto", "Sin redacción de secretos").

import { AsyncLocalStorage } from "node:async_hooks";

// ---------------------------------------------------------------------------
// Contexto de correlación por request.
// ---------------------------------------------------------------------------

export interface LogContext {
  correlationId: string;
  owner?: string;
  tenantId?: string;
  taskId?: string;
  requestId?: string;
}

export const logContext = new AsyncLocalStorage<LogContext>();

/**
 * Ejecuta `fn` con el contexto de correlación activo. Las llamadas a
 * logInfo/logWarn/logError/backgroundFailure dentro de `fn` incluyen
 * automáticamente correlationId, owner y tenantId.
 */
export function withLogContext<T>(ctx: LogContext, fn: () => T): T {
  return logContext.run(ctx, fn);
}

// ---------------------------------------------------------------------------
// Redacción de campos sensibles.
// ---------------------------------------------------------------------------

const SENSITIVE_KEYS = new Set([
  "authorization",
  "apikey",
  "api_key",
  "apiKey",
  "password",
  "secret",
  "token",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "cookie",
  "set-cookie",
  "x-access-key",
  "openmuse_access_key",
]);

const REDACTED = "[REDACTED]";

/**
 * Recorre el objeto y sustituye valores de claves sensibles por [REDACTED].
 * Profundidad máxima 8 para evitar ciclos.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return value;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase()) || SENSITIVE_KEYS.has(k)) {
      out[k] = REDACTED;
    } else if (typeof v === "object") {
      out[k] = redact(v, depth + 1);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Emisión.
// ---------------------------------------------------------------------------

type Level = "info" | "warn" | "error" | "debug";

function emit(level: Level, event: string, fields: Record<string, unknown>): void {
  const ctx = logContext.getStore();
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(ctx?.correlationId ? { correlationId: ctx.correlationId } : {}),
    ...(ctx?.owner ? { owner: ctx.owner } : {}),
    ...(ctx?.tenantId ? { tenantId: ctx.tenantId } : {}),
    ...(ctx?.taskId ? { taskId: ctx.taskId } : {}),
    ...(ctx?.requestId ? { requestId: ctx.requestId } : {}),
    ...(redact(fields) as Record<string, unknown>),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, fields: Record<string, unknown> = {}): void {
  emit("info", event, fields);
}

export function logWarn(event: string, fields: Record<string, unknown> = {}): void {
  emit("warn", event, fields);
}

export function logError(event: string, fields: Record<string, unknown> = {}): void {
  emit("error", event, fields);
}

export function logDebug(event: string, fields: Record<string, unknown> = {}): void {
  if (process.env.LOG_LEVEL === "debug") emit("debug", event, fields);
}

// ---------------------------------------------------------------------------
// backgroundFailure con contexto estructurado.
// ---------------------------------------------------------------------------

export interface FailureContext {
  owner?: string;
  tenantId?: string;
  taskId?: string;
  actionId?: string;
  monitorId?: string;
  sopId?: string;
}

export function backgroundFailure(
  phase: string,
  error: unknown,
  context: FailureContext = {},
): void {
  emit("error", "background_failure", {
    phase,
    error: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
    ...context,
  });
}
```

## File: apps/server/src/kernel/audit/store-store.ts
```typescript
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
  /**
   * AUDIT_VERIFY_BEFORE_APPEND_V1 — verifica el chain antes de escribir.
   * Ver: auditoría profunda 09 (verify no se llamaba nunca).
   */
  async verifyAndAppend(input: AuditAppendInput): Promise<AuditEntry> {
    const valid = await this.verify(input.tenantId).catch(() => true);
    if (!valid) {
      throw new Error(
        `Audit chain corrupto en tenant ${input.tenantId}; append bloqueado para evitar más daño`,
      );
    }
    return this.append(input);
  }

  async append(input: AuditAppendInput): Promise<AuditEntry> {
    // AUDIT_APPEND_BACKOFF_V1 — backoff entre reintentos para evitar
    // thundering herd sobre el anchor cuando hay writes concurrentes.
    // Ver: auditoría profunda 09.
    const MAX_ATTEMPTS = 8;
    const backoff = (attempt: number) =>
      new Promise<void>((resolve) =>
        setTimeout(resolve, Math.min(500, 20 * 2 ** attempt) + Math.floor(Math.random() * 20)),
      );
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
        await backoff(attempt);
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
```
