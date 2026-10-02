// R4a-db_APPLIED
import { mkdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { backgroundFailure } from "./log.ts";

type Row = { data: Record<string, unknown>; updated_at?: unknown };
interface Database {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Row[] }>;
  close: () => Promise<void>;
}

export interface ListOptions {
  limit?: number;
  cursorUpdatedAt?: string;
  cursorId?: string;
}

export class Store {
  /** Que motor hay debajo: PGlite embebido o Postgres real via pg. Decide rutas de codigo. */
  readonly backend: "pglite" | "postgres";
  constructor(private readonly db: Database, backend: "pglite" | "postgres" = "pglite") {
    this.backend = backend;
  }

  /** true cuando el motor soporta pgvector (Postgres real, no PGlite). */
  get pgvectorReady(): boolean {
    return this.backend === "postgres" && Boolean((this.db as { pgvectorReady?: boolean }).pgvectorReady);
  }

  /**
   * SELECT arbitrario de solo lectura. Existe para lo que no cabe en get/list: detectar
   * extensiones de Postgres (pgvector) y ejecutar la busqueda vectorial en SQL. No usar
   * para escribir: el motor durable (leases, CAS, claim) sigue pasando por
   * put/compareAndSwap/take/claim para no saltarse sus invariantes.
   */
  async select<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.db.query(sql, params);
    return result.rows as unknown as T[];
  }

  /** Query cruda para casos donde el RAG necesita columnas fuera de data (embedding). */
  async rawQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.db.query(sql, params);
    return result.rows as unknown as T[];
  }

  async get<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    id: string,
  ): Promise<T | null> {
    const result = await this.db.query(
      "SELECT data FROM records WHERE owner=$1 AND kind=$2 AND id=$3",
      [owner, kind, id],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  /**
   * Backward compatible: without options, returns every record for the owner/kind.
   * With options.limit, caps results. With cursorUpdatedAt + cursorId, pages by
   * keyset (updated_at, id) descending. Callers can request a next page by passing
   * the last record updated_at / id pair. `updated_at` is not returned to the
   * caller here to keep the existing shape; page callers must read it themselves
   * if they need a cursor.
   */
  async list<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    options: ListOptions = {},
  ): Promise<T[]> {
    const params: unknown[] = [owner, kind];
    let sql = "SELECT data FROM records WHERE owner=$1 AND kind=$2";
    if (options.cursorUpdatedAt !== undefined && options.cursorId !== undefined) {
      params.push(options.cursorUpdatedAt, options.cursorId);
      sql += ` AND (updated_at, id) < ($3::timestamptz, $4)`;
    }
    sql += " ORDER BY updated_at DESC, id";
    // LIST_HARD_LIMIT — sin options.limit, aplicamos 1000 filas como techo de seguridad.
    // Los callers que necesiten mas deben usar listPaged con cursor.
    const effectiveLimit = options.limit ?? 1000;
    params.push(effectiveLimit);
    sql += ` LIMIT $${params.length}`;
    const result = await this.db.query(sql, params);
    return result.rows.map((row) => row.data as T);
  }
  /**
   * Paged list that returns data plus its `updated_at`. Callers that need to build
   * a cursor for the next page should use this: pass the last row `updatedAt` as
   * `cursorUpdatedAt` and its data id as `cursorId` on the next call.
   */
  async listPaged<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    options: ListOptions = {},
  ): Promise<{ data: T; updatedAt: string }[]> {
    const params: unknown[] = [owner, kind];
    let sql = "SELECT data, updated_at FROM records WHERE owner=$1 AND kind=$2";
    if (options.cursorUpdatedAt !== undefined && options.cursorId !== undefined) {
      params.push(options.cursorUpdatedAt, options.cursorId);
      sql += ` AND (updated_at, id) < ($3::timestamptz, $4)`;
    }
    sql += " ORDER BY updated_at DESC, id";
    if (options.limit !== undefined) {
      params.push(options.limit);
      sql += ` LIMIT $${params.length}`;
    }
    const result = await this.db.query(sql, params);
    return result.rows.map((row) => ({
      data: row.data as T,
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : typeof row.updated_at === "string"
            ? row.updated_at
            : "",
    }));
  }
  /** Cuenta las filas de un owner/kind sin traerlas a memoria. */
  async count(owner: string, kind: string): Promise<number> {
    const result = await this.db.query(
      "SELECT count(*)::int AS total FROM records WHERE owner=$1 AND kind=$2",
      [owner, kind],
    );
    const total = (result.rows[0] as unknown as { total?: unknown } | undefined)?.total;
    if (typeof total === "number") return total;
    const parsed = Number(total);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
    await this.db.query(
      "INSERT INTO records(owner,kind,id,data) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT(owner,kind,id) DO UPDATE SET data=excluded.data,updated_at=now()",
      [owner, kind, value.id, JSON.stringify(value)],
    );
    return value;
  }
  async remove(owner: string, kind: string, id: string): Promise<void> {
    await this.db.query("DELETE FROM records WHERE owner=$1 AND kind=$2 AND id=$3", [
      owner,
      kind,
      id,
    ]);
  }
  async compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    const result = await this.db.query(
      "UPDATE records SET data=data || $5::jsonb,updated_at=now() WHERE owner=$1 AND kind=$2 AND id=$3 AND data @> $4::jsonb RETURNING data",
      [owner, kind, id, JSON.stringify(expected), JSON.stringify(patch)],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  async insertIfAbsent<T extends { id: string }>(
    owner: string,
    kind: string,
    value: T,
  ): Promise<T | null> {
    const result = await this.db.query(
      "INSERT INTO records(owner,kind,id,data) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT DO NOTHING RETURNING data",
      [owner, kind, value.id, JSON.stringify(value)],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  /**
   * Scan de records por kind. `limit` opcional (default 1000, hard cap 50000):
   * antes no habia tope y un scan en maintain cargaba toda la tabla en memoria.
   */
  async scan<T>(kind: string, limit = 1000): Promise<{ owner: string; value: T }[]> {
    const effective = Math.min(Math.max(1, Math.floor(limit)), 50000);
    const result = await this.db.query(
      "SELECT jsonb_build_object('owner',owner,'value',data) AS data FROM records WHERE kind=$1 ORDER BY updated_at ASC LIMIT $2",
      [kind, effective],
    );
    return result.rows.map((row) => row.data as { owner: string; value: T });
  }
  /**
   * Filter scan by one or more statuses. Backed by an index-friendly query.
   * Intended for maintenance loops that must not scan the whole table.
   */
  async scanByStatus<T>(
    kind: string,
    statuses: string[],
    limit = 1000,
  ): Promise<{ owner: string; value: T }[]> {
    if (!statuses.length) return [];
    // SCAN_STATUS_IN — IN con lista literal usa el indice de expresion mejor que ANY.
    const placeholders = statuses.map((_, i) => `$${i + 2}`).join(",");
    const result = await this.db.query(
      `SELECT jsonb_build_object('owner',owner,'value',data) AS data FROM records WHERE kind=$1 AND data->>'status' IN (${placeholders}) ORDER BY updated_at ASC LIMIT $${statuses.length + 2}`,
      [kind, ...statuses, limit],
    );
    return result.rows.map((row) => row.data as { owner: string; value: T });
  }

  /**
   * SCAN_BY_STATUS_CURSOR_V1 - variante con cursor keyset (updated_at, id).
   * Devuelve hasta `limit` filas cuya updated_at es > cursorUpdatedAt.
   */
  async scanByStatusWithCursor<T>(
    kind: string,
    statuses: string[],
    limit: number,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ): Promise<{ owner: string; value: T; updatedAt: string; id: string }[]> {
    if (!statuses.length) return [];
    const params: unknown[] = [kind, ...statuses];
    const placeholders = statuses.map((_, i) => `$${i + 2}`).join(",");
    let sql = `SELECT jsonb_build_object('owner',owner,'value',data) AS data, updated_at, id FROM records WHERE kind=$1 AND data->>'status' IN (${placeholders})`;
    if (cursorUpdatedAt && cursorId) {
      params.push(cursorUpdatedAt, cursorId);
      sql += ` AND (updated_at, id) > ($${params.length - 1}::timestamptz, $${params.length})`;
    }
    sql += ` ORDER BY updated_at ASC, id ASC LIMIT $${params.length + 1}`;
    params.push(limit);
    const result = await this.db.query(sql, params);
    return result.rows.map((row) => {
      const value = row.data as { owner: string; value: T };
      const updatedAtRaw = (row as unknown as { updated_at: unknown }).updated_at;
      const idRaw = (row as unknown as { id: unknown }).id;
      return {
        owner: value.owner,
        value: value.value,
        updatedAt:
          updatedAtRaw instanceof Date
            ? updatedAtRaw.toISOString()
            : typeof updatedAtRaw === "string"
              ? updatedAtRaw
              : "",
        id: typeof idRaw === "string" ? idRaw : "",
      };
    });
  }
  /**
   * Delete records of the given kind whose updated_at is older than `days`.
   * Returns the number of deleted rows.
   */
  async purgeOlderThan(kind: string, days: number): Promise<number> {
    const result = await this.db.query(
      "DELETE FROM records WHERE kind=$1 AND updated_at < now() - ($2 || ' days')::interval RETURNING id",
      [kind, String(days)],
    );
    return result.rows.length;
  }
  /**
   * TRANSACTION_V1 - ejecuta varias operaciones dentro de una transaccion.
   *
   * PGlite y pg soportan BEGIN/COMMIT/ROLLBACK. El callback recibe this para
   * que pueda usar put/get/cas sin cambiar de API. No se anida: si necesitas
   * dos transacciones, secuencialas.
   *
   * Uso:
   *   await db.transaction(async (tx) => {
   *     await tx.put(owner, "goals", goal);
   *     await tx.put(owner, "tasks", task);
   *   });
   *
   * Si el callback lanza, se hace ROLLBACK y el error se propaga.
   */
  async transaction<T>(fn: (tx: Store) => Promise<T>): Promise<T> {
    const raw = this.db as { query: (sql: string, params?: unknown[]) => Promise<unknown> };
    await raw.query("BEGIN");
    try {
      const result = await fn(this);
      await raw.query("COMMIT");
      return result;
    } catch (error) {
      try { await raw.query("ROLLBACK"); } catch { /* rollback best-effort */ }
      throw error;
    }
  }

  async claim<T>(owner: string, id: string, status: string, now: string): Promise<T | null> {
    const result = await this.db.query(
      `UPDATE records AS action SET data=jsonb_set(data,'\{status\}',$4::jsonb),updated_at=now()
       WHERE owner=$1 AND kind='actions' AND id=$2 AND data->>'status'='awaiting_review'
       AND (data->>'expiresAt')::timestamptz>$3::timestamptz
       AND ($4::jsonb <> '"executing"'::jsonb OR data->>'taskId' IS NULL OR EXISTS (
         SELECT 1 FROM records task WHERE task.owner=action.owner AND task.kind='tasks'
         AND task.id=action.data->>'taskId' AND task.data->>'status' IN ('running','waiting_approval')
       )) RETURNING data`,
      [owner, id, now, JSON.stringify(status)],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  async recoverInterruptedActions(): Promise<void> {
    await this.db.query(
      `UPDATE records SET data=data || '{"status":"outcome_unknown","error":"Server restarted during execution. Check the provider before creating another action."}'::jsonb WHERE kind='actions' AND data->>'status'='executing'`,
    );
  }
  async take<T>(owner: string, kind: string, id: string): Promise<T | null> {
    const result = await this.db.query(
      "DELETE FROM records WHERE owner=$1 AND kind=$2 AND id=$3 RETURNING data",
      [owner, kind, id],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  close(): Promise<void> {
    return this.db.close();
  }
  async updateCredential(owner: string, connectionId: string, secret: string): Promise<boolean> {
    const result = await this.db.query(
      "UPDATE records SET data=jsonb_set(data,'\{secret\}',$3::jsonb),updated_at=now() WHERE owner=$1 AND kind='credentials' AND id='google' AND data->>'connectionId'=$2 RETURNING data",
      [owner, connectionId, JSON.stringify(secret)],
    );
    return result.rows.length === 1;
  }
}

/** Idle clients can be disconnected by a database restart; without a listener pg `error` event crashes the process. */
export function createPool(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 5 });
  pool.on("error", (error) => backgroundFailure("postgres pool", error));
  return pool;
}

export async function createStore(
  options: { dataDir?: string; databaseUrl?: string } = {},
): Promise<Store> {
  let database: Database;
  if (options.databaseUrl) {
    const pool = createPool(options.databaseUrl);
    database = { query: async (sql, params) => pool.query(sql, params), close: () => pool.end() };
  } else {
    // El directorio que guarda los datos es options.dataDir, no su padre: con
    // dataDir=".openmuse/postgres" un dirname() creaba ".openmuse" y dejaba el
    // PGDATA sin restringir. Ahi viven los hashes de contrasena.
    if (options.dataDir) await mkdir(options.dataDir, { recursive: true, mode: 0o700 });
    const embedded = new PGlite(options.dataDir);
    await embedded.waitReady;
    database = {
      query: (sql, params) => embedded.query<Row>(sql, params),
      close: () => embedded.close(),
    };
  }
  await database.query(
    "CREATE TABLE IF NOT EXISTS records(owner text NOT NULL,kind text NOT NULL,id text NOT NULL,data jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(owner,kind,id))",
  );
  // STORE_TENANT_CLEANUP_V1 - el aislamiento por tenant se hace en
  // TenantScopedStore con clave compuesta `tenantId:owner`. La columna
  // tenant_id en records queda sin uso.

  await database.query(
    "CREATE INDEX IF NOT EXISTS records_owner_kind_updated_idx ON records(owner, kind, updated_at DESC, id DESC)"
  );
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_kind_status_idx ON records(kind, (data->>'status'))"
  );
  // INDEX_CONCURRENTLY — Postgres real: fuera de transaccion para no bloquear escrituras.
  // PGlite ignora CONCURRENTLY pero no se queja porque no hay transaccion envolvente.
  if (options.databaseUrl) {
    try {
      await database.query(
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS records_kind_updated_idx ON records(kind, updated_at)"
      );
      await database.query("ANALYZE records");
    } catch { /* el indice puede existir ya, o el rol no tiene permiso */ }
  } else {
    await database.query(
      "CREATE INDEX IF NOT EXISTS records_kind_updated_idx ON records(kind, updated_at)"
    );
  }
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_system_events_idx ON records(owner, kind, ((data->>'type')), updated_at DESC)"
  );

  let pgvectorReady = false;
  if (options.databaseUrl) {
    try {
      await database.query("CREATE EXTENSION IF NOT EXISTS vector");
      await database.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS embedding vector(768)");
      await database.query(
        "CREATE INDEX IF NOT EXISTS records_embedding_idx ON records USING hnsw (embedding vector_cosine_ops)"
      );
      pgvectorReady = true;
    } catch {
      pgvectorReady = false;
    }
  }
  (database as { pgvectorReady?: boolean }).pgvectorReady = pgvectorReady;
  return new Store(database, options.databaseUrl ? "postgres" : "pglite");
}
