// TENANT_RECORDS_V1 - campaña 04 del vertical slice.
// Ver: docs/vertical-slice-actual/04-datos/CAMPAIGN.md
//
// Problema: el Store guarda todas las filas con una clave `owner` que mezcla
// conceptos. Una fila puede pertenecer a la plataforma (registro de empresas,
// estado del kill switch), a una empresa entera (schema de negocio, SOPs), a un
// actor (memoria privada, credenciales de Google) o a una ejecución (recibos).
// Sin esa distinción, dos owners con el mismo id se pisan o se leen de más.
//
// Este módulo fija el contrato: qué scope tiene cada kind, cómo se compone la
// clave y qué comprobación hace falta para tocarla. La migración de datos vive
// al lado (`planRecordMigration`) y sólo mueve lo que puede atribuir; lo dudoso
// va a revisión.

import { AppError } from "../errors.ts";
import type { Store } from "../db.ts";

export type RecordScope = "platform" | "tenant" | "actor" | "connection" | "execution";

/** Prefijos de clave por scope. No contienen ":" salvo el separador. */
const SCOPE_MARK: Record<Exclude<RecordScope, "platform">, string> = {
  tenant: "t",
  actor: "u",
  connection: "c",
  execution: "e",
};

/**
 * TENANT_RECORD_KINDS_V1 - kinds que el slicer toca. Lo que no está aquí se
 * trata como `tenant` (comportamiento previo) y sale en el inventario como
 * "sin clasificar" para que alguien lo decida; no se migra a ciegas.
 */
export const RECORD_KINDS: Readonly<Record<string, RecordScope>> = {
  // Plataforma: su dueño es el despliegue, no una empresa.
  "tenant-membership": "platform",
  "tenant-state": "platform",
  users: "platform",
  sessions: "platform",
  "signup-tokens": "platform",
  "llm-usage": "platform",
  // Empresa: compartido por todos sus actores.
  sops: "tenant",
  "business-records": "tenant",
  "business-entities": "tenant",
  "business-relations": "tenant",
  "agent-roles": "tenant",
  "build-specs": "tenant",
  "sample-pages": "tenant",
  monitors: "tenant",
  notifications: "tenant",
  // Actor: privado de una persona.
  memories: "actor",
  files: "actor",
  "user-tenants": "actor",
  "meta-hints": "actor",
  "google-credentials": "actor",
  // Conexión: pertenece a la empresa pero se identifica por conexión.
  "rag-chunks": "connection",
  "rag-sources": "connection",
  // Ejecución: recibos y trazas de un trabajo concreto.
  actions: "execution",
  "action-receipts": "execution",
  tasks: "execution",
  threads: "execution",
};

export function scopeOfKind(kind: string): RecordScope {
  return RECORD_KINDS[kind] ?? "tenant";
}

export function isClassified(kind: string): boolean {
  return Object.prototype.hasOwnProperty.call(RECORD_KINDS, kind);
}

export interface RecordOwnerInput {
  scope: RecordScope;
  tenantId?: string;
  actorId?: string;
  connectionId?: string;
  executionId?: string;
}

/**
 * TENANT_RECORD_OWNER_V1 - composición de la clave `owner` del Store.
 * Plataforma: "system". Empresa: `<tenant>:t`. Actor: `<tenant>:u:<actor>`.
 * Así dos empresas con el mismo `userId` no colisionan.
 */
export function recordOwner(input: RecordOwnerInput): string {
  if (input.scope === "platform") return "system";
  const tenantId = input.tenantId;
  if (!tenantId) throw new AppError("recordOwner: falta tenantId", 422);
  const mark = SCOPE_MARK[input.scope as Exclude<RecordScope, "platform">];
  switch (input.scope) {
    case "tenant":
      return `${tenantId}:${mark}`;
    case "actor":
      if (!input.actorId) throw new AppError("recordOwner: falta actorId", 422);
      return `${tenantId}:${mark}:${input.actorId}`;
    case "connection":
      if (!input.connectionId) throw new AppError("recordOwner: falta connectionId", 422);
      return `${tenantId}:${mark}:${input.connectionId}`;
    case "execution":
      if (!input.executionId) throw new AppError("recordOwner: falta executionId", 422);
      return `${tenantId}:${mark}:${input.executionId}`;
  }
}

export interface ParsedOwner {
  scope: RecordScope | "unclassified";
  tenantId?: string;
  actorId?: string;
  connectionId?: string;
  executionId?: string;
}

/**
 * TENANT_RECORD_OWNER_PARSE_V1 - lectura tolerante: entiende la clave nueva y
 * también la legacy (`<tenant>:<userId>`), que es lo que hay que migrar. No
 * adivina un actor: si no puede atribuir la fila, lo dice.
 */
export function parseRecordOwner(owner: string, kind?: string): ParsedOwner {
  if (owner === "system") return { scope: "platform" };
  const parts = owner.split(":");
  const [tenantId, mark, id] = parts;
  if (!tenantId) return { scope: "unclassified" };
  // TENANT_OWNER_MARKER_FIRST_V1 - el marcador manda sobre la heurística legacy:
  // `<tenant>:t` es de empresa, no un owner llamado "t".
  if (parts.length === 2 && mark === "t") return { scope: "tenant", tenantId };
  if (parts.length === 2 && mark) {
    // Legacy `<tenant>:<userId>`: el scope depende del kind.
    const declared = kind ? scopeOfKind(kind) : "actor";
    if (declared === "tenant") return { scope: "tenant", tenantId };
    if (declared === "connection") return { scope: "connection", tenantId, connectionId: mark };
    if (declared === "execution") return { scope: "execution", tenantId, executionId: mark };
    return { scope: "actor", tenantId, actorId: mark };
  }
  if (parts.length === 3 && id) {
    if (mark === "t") return { scope: "tenant", tenantId };
    if (mark === "u") return { scope: "actor", tenantId, actorId: id };
    if (mark === "c") return { scope: "connection", tenantId, connectionId: id };
    if (mark === "e") return { scope: "execution", tenantId, executionId: id };
  }
  return { scope: "unclassified" };
}

export interface RecordAccessInput {
  kind: string;
  owner: string;
  tenantId: string;
  actorId?: string;
  isPlatformAdmin?: boolean;
}

/**
 * TENANT_RECORD_ACCESS_V1 - fail-closed. Plataforma: sólo admin de plataforma.
 * El resto: el tenant de la clave tiene que ser el del principal, y en los
 * scopes ligados a actor/conexión/ejecución también su identificador.
 */
export function assertRecordAccess(input: RecordAccessInput): void {
  const parsed = parseRecordOwner(input.owner, input.kind);
  if (parsed.scope === "platform") {
    if (!input.isPlatformAdmin) {
      throw new AppError("Registro de plataforma", 403, { code: "RECORD_SCOPE_DENIED" });
    }
    return;
  }
  if (parsed.scope === "unclassified") {
    throw new AppError("Registro no atribuible", 403, { code: "RECORD_UNATTRIBUTED" });
  }
  if (parsed.tenantId !== input.tenantId) {
    throw new AppError("tenant mismatch", 403, { code: "TENANT_MISMATCH" });
  }
  if (parsed.scope === "actor" && parsed.actorId && input.actorId && parsed.actorId !== input.actorId) {
    throw new AppError("Registro de otro actor", 403, { code: "RECORD_SCOPE_DENIED" });
  }
}

export interface MigrationRow {
  owner: string;
  kind: string;
  id: string;
  value: Record<string, unknown>;
}

export interface MigrationPlan {
  total: number;
  byScope: Record<RecordScope | "unclassified", number>;
  byKind: Record<string, number>;
  /** Filas con tenantId ausente o distinto del que declara la clave. */
  toUpdate: Array<{ kind: string; id: string; owner: string; tenantId: string }>;
  /** Filas que no se pueden atribuir: no se tocan. */
  review: Array<{ kind: string; id: string; owner: string; reason: string }>;
}

/**
 * TENANT_RECORD_MIGRATION_PLAN_V1 - inventario sin escrituras. Deduplica por
 * (kind, id) para no proponer dos veces la misma fila y manda a revisión lo que
 * no tiene tenant atribuible, en vez de inventarlo.
 */
export function planRecordMigration(rows: MigrationRow[]): MigrationPlan {
  const byScope: MigrationPlan["byScope"] = {
    platform: 0,
    tenant: 0,
    actor: 0,
    connection: 0,
    execution: 0,
    unclassified: 0,
  };
  const byKind: Record<string, number> = {};
  const toUpdate: MigrationPlan["toUpdate"] = [];
  const review: MigrationPlan["review"] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const parsed = parseRecordOwner(row.owner, row.kind);
    byScope[parsed.scope] += 1;
    byKind[row.kind] = (byKind[row.kind] ?? 0) + 1;

    if (parsed.scope === "platform") continue;
    if (parsed.scope === "unclassified" || !parsed.tenantId) {
      review.push({ kind: row.kind, id: row.id, owner: row.owner, reason: "sin tenant atribuible" });
      continue;
    }
    const dedupeKey = `${row.kind}\u0000${row.id}\u0000${parsed.tenantId}`;
    if (seen.has(dedupeKey)) {
      review.push({ kind: row.kind, id: row.id, owner: row.owner, reason: "duplicado en el mismo tenant" });
      continue;
    }
    seen.add(dedupeKey);

    const declared = (row.value as { tenantId?: unknown }).tenantId;
    if (declared !== parsed.tenantId) {
      toUpdate.push({ kind: row.kind, id: row.id, owner: row.owner, tenantId: parsed.tenantId });
    }
  }

  return { total: rows.length, byScope, byKind, toUpdate, review };
}

export interface ApplyOptions {
  /** Diario append-only: sin él no se escribe nada. */
  journal?: (entry: Record<string, unknown>) => Promise<void>;
  limit?: number;
}

/**
 * TENANT_RECORD_MIGRATION_APPLY_V1 - aplica sólo el `tenantId` que la clave ya
 * declara. No reescribe owners ni mueve filas entre tenants: eso exige una
 * decisión humana y queda en `review`.
 */
export async function applyRecordMigration(
  db: Store,
  plan: MigrationPlan,
  options: ApplyOptions = {},
): Promise<{ updated: number; skipped: number }> {
  const pending = options.limit ? plan.toUpdate.slice(0, options.limit) : plan.toUpdate;
  let updated = 0;
  for (const row of pending) {
    const current = await db.get<Record<string, unknown>>(row.owner, row.kind, row.id);
    if (!current) {
      await options.journal?.({ event: "missing", ...row, at: new Date().toISOString() });
      continue;
    }
    // STORE_PUT_ID_V1 - Store.put exige `{ id: string }`; la lectura cruda no
    // garantiza el tipo, así que se comprueba antes de escribir.
    const currentId = (current as { id?: unknown }).id;
    if (typeof currentId !== "string" || currentId.length === 0) {
      await options.journal?.({ event: "sin-id", ...row, at: new Date().toISOString() });
      continue;
    }
    await db.put(row.owner, row.kind, { ...current, id: currentId, tenantId: row.tenantId });
    await options.journal?.({
      event: "tenant-id",
      kind: row.kind,
      id: row.id,
      owner: row.owner,
      tenantId: row.tenantId,
      at: new Date().toISOString(),
    });
    updated += 1;
  }
  return { updated, skipped: plan.toUpdate.length - pending.length };
}
