import type { TenantScopedStore } from "../../db-tenant.ts";
import { currentTenantScope } from "../../tenant-scope.ts";

interface OperationalPeriod {
  from: Date;
  until: Date;
  timeZone: string;
}

/**
 * Counts persisted events in [from, until) for the authenticated tenant.
 * The caller must authorize access to tenant-wide metrics before invoking this.
 */
export async function readOperationalFacts(db: TenantScopedStore, range: OperationalPeriod) {
  const scope = currentTenantScope();
  if (!scope?.tenantId || scope.tenantId.includes(":")) {
    throw new Error("An authenticated tenant scope is required");
  }
  if (!(range.from.getTime() < range.until.getTime())) {
    throw new RangeError("Expected a valid, increasing operational period");
  }
  if (!range.timeZone.trim()) throw new RangeError("An explicit time zone is required");

  const period = {
    from: range.from.toISOString(),
    until: range.until.toISOString(),
    timeZone: new Intl.DateTimeFormat("en", { timeZone: range.timeZone }).resolvedOptions().timeZone,
  };
  // EventBus persists emittedAt as UTC ISO strings. Filter the physical key
  // and timestamps in the database, before grouping or returning any data.
  const counts = await db.select<{ type: string; count: number }>(
    `SELECT data->>'type' AS type, count(*)::int AS count
       FROM records
      WHERE kind = $1 AND starts_with(owner, $2)
        AND data->>'emittedAt' >= $3 AND data->>'emittedAt' < $4
        AND data->>'type' IS NOT NULL
      GROUP BY data->>'type'
      ORDER BY type`,
    ["system-events", scope.tenantId + ":", period.from, period.until],
  );

  return {
    tenantId: scope.tenantId,
    source: "system-events" as const,
    period,
    // Denominator is the number of retained events in this period.
    denominator: counts.reduce((total, row) => total + row.count, 0),
    counts,
  };
}

// EXECUTION_FACTS_V1 (campana 13) - que ejecuciones hay detras de una pregunta
// ("por que se paro la reactivacion ayer"). Igual que los hechos operativos,
// se agrega en la base y con el prefijo del tenant, y el filtro por entidad
// excluye las ejecuciones de otros trabajos de la misma empresa.
export interface ExecutionFactQuery {
  executionId?: string;
  sopId?: string;
}

export interface ExecutionFactRow {
  executionId: string;
  sopId: string | null;
  type: string;
  count: number;
  firstAt: string;
  lastAt: string;
}

export async function readExecutionFacts(
  db: TenantScopedStore,
  range: OperationalPeriod,
  options: ExecutionFactQuery = {},
) {
  const scope = currentTenantScope();
  if (!scope?.tenantId || scope.tenantId.includes(":")) {
    throw new Error("An authenticated tenant scope is required");
  }
  if (!(range.from.getTime() < range.until.getTime())) {
    throw new RangeError("Expected a valid, increasing operational period");
  }
  if (!range.timeZone.trim()) throw new RangeError("An explicit time zone is required");

  const period = {
    from: range.from.toISOString(),
    until: range.until.toISOString(),
    timeZone: new Intl.DateTimeFormat("en", { timeZone: range.timeZone }).resolvedOptions().timeZone,
  };
  const rows = await db.select<ExecutionFactRow>(
    `SELECT coalesce(data->'payload'->>'taskId', data->'payload'->>'executionId', data->>'correlationId') AS "executionId",
            data->'payload'->>'sopId' AS "sopId",
            data->>'type' AS "type",
            count(*)::int AS count,
            min(data->>'emittedAt') AS "firstAt",
            max(data->>'emittedAt') AS "lastAt"
       FROM records
      WHERE kind = $1 AND starts_with(owner, $2)
        AND data->>'emittedAt' >= $3 AND data->>'emittedAt' < $4
        AND coalesce(data->'payload'->>'taskId', data->'payload'->>'executionId', data->>'correlationId') IS NOT NULL
        AND ($5::text IS NULL OR coalesce(data->'payload'->>'taskId', data->'payload'->>'executionId', data->>'correlationId') = $5)
        AND ($6::text IS NULL OR data->'payload'->>'sopId' = $6)
      GROUP BY 1, 2, 3
      ORDER BY "lastAt" DESC`,
    [
      "system-events",
      scope.tenantId + ":",
      period.from,
      period.until,
      options.executionId ?? null,
      options.sopId ?? null,
    ],
  );
  return {
    tenantId: scope.tenantId,
    source: "system-events" as const,
    period,
    executions: rows,
  };
}
