This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

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
- Only files matching these patterns are included: apps/server/src/engine/task-plans.ts, apps/server/src/engine/transaction.ts, apps/server/src/worker-entry.ts, apps/server/src/engine/idempotency.ts, tests/helpers/crash-worker.ts, tests/engine.test.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        idempotency.ts
        task-plans.ts
        transaction.ts
      worker-entry.ts
tests/
  helpers/
    crash-worker.ts
  engine.test.ts
```

# Files

## File: apps/server/src/engine/idempotency.ts
```typescript
// IDEMPOTENCY_KEYS_V1 — evita duplicar efectos externos cuando se reintenta.
//
// Los retries con backoff (03-01) pueden duplicar un efecto si el primer
// intento sí llegó al proveedor pero la respuesta se perdió. El proveedor
// recibe la misma idempotency key en el reintento y responde con el mismo
// resultado.
//
// Proveedores que la soportan: Stripe (nativo), Gmail (vía Message-ID
// determinista), Calendar (vía ETag + If-Match).
//
// Ver: docs/audits/03-resiliencia/roadmap.md §8.

import { createHash, randomUUID } from "node:crypto";

export type IdempotencyScope = "stripe" | "gmail" | "calendar" | "whatsapp" | "computer";

export interface IdempotencyKey {
  scope: IdempotencyScope;
  /** Clave determinista (misma entrada → misma clave). */
  key: string;
  /** Timestamp de creación, informativo. */
  createdAt: string;
}

/**
 * Genera una idempotency key estable a partir de los datos de la operación.
 * Si dos llamadas tienen el mismo payload, obtienen la misma clave.
 */
export function makeIdempotencyKey(
  scope: IdempotencyScope,
  payload: unknown,
): IdempotencyKey {
  const canonical = JSON.stringify(payload, Object.keys(payload as object).sort());
  const key = createHash("sha256")
    .update(`${scope}:${canonical}`)
    .digest("hex")
    .slice(0, 32);
  return { scope, key, createdAt: new Date().toISOString() };
}

/** Variante aleatoria para operaciones sin payload reproducible. */
export function randomIdempotencyKey(scope: IdempotencyScope): IdempotencyKey {
  return { scope, key: randomUUID(), createdAt: new Date().toISOString() };
}
```

## File: apps/server/src/engine/task-plans.ts
```typescript
// TASK_PLANS_V1 — planes por kind, centralizados y configurables.
//
// Antes estaban hardcodeados dentro de createTask en service.ts.
// Centralizarlos permite:
//   - tests unitarios sin montar el AgentService
//   - override por config (env, tenant config)
//   - coherencia entre documentos y UI (mismas etiquetas)
//
// Ver: docs/audits/05-motor-tareas-durable/miniaudit.md.

import type { AgentTask } from "../../../../packages/domain/src/agent.ts";

export type TaskKind = AgentTask["kind"];

export const DEFAULT_PLANS: Record<TaskKind, string[]> = {
  document: [
    "Find the source document",
    "Fill a new copy",
    "Prepare a reply",
    "Wait for your decision",
    "Record the outcome",
  ],
  monitor: [
    "Check the source",
    "Compare with the last observation",
    "Report a meaningful change",
  ],
  finance: ["Validate transactions", "Calculate the summary", "Save your tracker"],
  agent: ["Understand the outcome", "Plan the work", "Use connected tools", "Return a result"],
  plan: ["Understand the outcome", "Plan the work", "Use connected tools", "Return a result"],
  sop: [], // Los SOPs generan su plan desde sop.steps.
};

export function planForKind(kind: TaskKind): string[] {
  return DEFAULT_PLANS[kind] ?? [];
}
```

## File: apps/server/src/worker-entry.ts
```typescript
// R2_APPLIED
import { createApp } from "./app.ts";
import { readConfig } from "./config.ts";
import { createStore } from "./db.ts";

const config = readConfig();
if (!config.databaseUrl)
  throw new Error(
    "A separate task worker requires DATABASE_URL. Embedded PGlite runs inside the API process.",
  );
const db = await createStore({ databaseUrl: config.databaseUrl });
// R2 — igual que en index.ts, antes de arrancar el worker, reconciliar acciones
// que quedaron en "executing" por un crash previo.
await db.recoverInterruptedActions();
const { agent } = await createApp(db, config);
agent.start();
console.log("OpenMuse task worker running");
let stopping = false;
const stop = async () => {
  if (stopping) return;
  stopping = true;
  await agent.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", () => {
  void stop().catch(() => process.exit(1));
});
process.on("SIGTERM", () => {
  void stop().catch(() => process.exit(1));
});
```

## File: tests/helpers/crash-worker.ts
```typescript
// CRASH_WORKER_V1 — subproceso que simula un worker real.
// Arranca, toma la tarea queued, la pone running con lease, y duerme.
// El test padre lo mata con SIGKILL.

import { existsSync } from "node:fs";
import { createStore } from "../../apps/server/src/db.ts";
import { createApp } from "../../apps/server/src/app.ts";

if (existsSync(".env")) process.loadEnvFile(".env");

const dataDir = process.env.DATA_DIR;
if (!dataDir) throw new Error("DATA_DIR requerido");

const db = await createStore({ dataDir });
const config = {
  mode: "sample" as const,
  port: 8787,
  host: "127.0.0.1",
  publicUrl: "http://localhost:8787",
  dataDir,
  agentBackend: "sample" as const,
  googleRedirectUri: "http://localhost:8787/api/google/callback",
  allowedOrigins: [],
};
const app = await createApp(db, config);

// Handler que pone la tarea running y duerme para siempre.
app.agent.worker.start();

// Mantener vivo el proceso.
setInterval(() => {}, 1000);
```

## File: tests/engine.test.ts
```typescript
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { analyzeSpending } from "../apps/server/src/engine/finance.ts";
import { TaskWorker } from "../apps/server/src/engine/worker.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";

function task(id = "task1"): AgentTask {
  return {
    id,
    // TASK_TENANT_REQUIRED_V1 - tenantId paso a ser obligatorio en AgentTask.
    tenantId: "default",
    title: "Check a source",
    prompt: "Check a source",
    kind: "agent",
    status: "queued",
    plan: [],
    evidence: [],
    input: {},
    state: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
  };
}
test("two workers claim one task only once", async () => {
  const db = await createStore();
  try {
    await db.put("owner", "tasks", task());
    let calls = 0;
    const handle = async () => {
      calls++;
      return { status: "succeeded" as const, result: "actual result" };
    };
    await Promise.all([new TaskWorker(db, handle).tick(), new TaskWorker(db, handle).tick()]);
    assert.equal(calls, 1);
    assert.equal((await db.get<AgentTask>("owner", "tasks", "task1"))?.status, "succeeded");
  } finally {
    await db.close();
  }
});
test("cancellation invalidates a stale worker before its next effect", async () => {
  const db = await createStore();
  try {
    await db.put("owner", "tasks", task());
    let effects = 0;
    const worker = new TaskWorker(db, async (owner, value, ctx) => {
      await db.compareAndSwap(
        owner,
        "tasks",
        value.id,
        { status: "running" },
        { status: "cancelled", leaseId: null, leaseUntil: null },
      );
      await ctx.guard();
      effects++;
      return { status: "succeeded" };
    });
    await worker.tick();
    assert.equal(effects, 0);
    assert.equal((await db.get<AgentTask>("owner", "tasks", "task1"))?.status, "cancelled");
  } finally {
    await db.close();
  }
});
test("expired leases recover saved checkpoints after the database restarts", async () => {
  const directory = await mkdtemp(join(tmpdir(), "openmuse-engine-"));
  try {
    let db = await createStore({ dataDir: join(directory, "db") });
    await db.put("owner", "tasks", {
      ...task(),
      status: "running",
      leaseId: "dead-worker",
      leaseUntil: "2020-01-01T00:00:00Z",
      state: { completedStep: "imported", fileId: "persisted-file" },
    });
    await db.close();
    db = await createStore({ dataDir: join(directory, "db") });
    try {
      let observed: unknown;
      const worker = new TaskWorker(db, async (_owner, value, ctx) => {
        observed = value.state;
        await ctx.event("step", "Resumed at the checkpoint");
        return { status: "succeeded", result: "Recovered" };
      });
      await worker.tick();
      assert.deepEqual(observed, { completedStep: "imported", fileId: "persisted-file" });
      assert.equal((await db.get<AgentTask>("owner", "tasks", "task1"))?.status, "succeeded");
    } finally {
      await db.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("scheduled tasks wait for due time and approvals wait for a recorded outcome", async () => {
  const db = await createStore();
  try {
    let now = 1000,
      calls = 0;
    const worker = new TaskWorker(
      db,
      async () => {
        calls++;
        return { status: "succeeded" };
      },
      { now: () => now },
    );
    await db.put("owner", "tasks", {
      ...task("later"),
      status: "scheduled",
      nextRunAt: new Date(2000).toISOString(),
    });
    await worker.tick();
    assert.equal(calls, 0);
    now = 3000;
    await worker.tick();
    assert.equal(calls, 1);
    await db.put("owner", "tasks", {
      ...task("review"),
      status: "waiting_approval",
      actionId: "a",
    });
    await db.put("owner", "actions", { id: "a", status: "awaiting_review" });
    await worker.tick();
    assert.equal(calls, 1);
    await db.put("owner", "actions", { id: "a", status: "succeeded" });
    await worker.tick();
    assert.equal(calls, 2);
  } finally {
    await db.close();
  }
});
test("finance artifacts compute cents exactly and reject ambiguous CSV", () => {
  const report = analyzeSpending(
    'date,description,amount,category\n2026-09-01,Salary,-1000,Income\n2026-09-02,"Coffee, local",10.10,Food\n2026-09-03,Lunch,20.20,Food',
  );
  assert.equal(report.spending, 30.3);
  assert.equal(report.saved, 969.7);
  assert.equal(report.categories[0].amount, 30.3);
  assert.throws(() =>
    analyzeSpending("date,description,amount,category\n2026-02-31,Purchase,10,Food"),
  );
  assert.throws(() =>
    analyzeSpending("date,description,amount,category\n2026-09-01,Purchase,1.234,Food"),
  );
});

test("pending reviews do not starve queued work", async () => {
  const db = await createStore();
  try {
    for (let i = 0; i < 4; i++) {
      await db.put("owner", "tasks", {
        ...task(`review-${i}`),
        status: "waiting_approval",
        actionId: `action-${i}`,
      });
      await db.put("owner", "actions", { id: `action-${i}`, status: "awaiting_review" });
    }
    await db.put("owner", "tasks", task("ready"));
    await new TaskWorker(db, async () => ({ status: "succeeded" })).tick();
    assert.equal((await db.get<AgentTask>("owner", "tasks", "ready"))?.status, "succeeded");
  } finally {
    await db.close();
  }
});
```

## File: apps/server/src/engine/transaction.ts
```typescript
// ENGINE_TRANSACTION_V1 - helpers de transaccion para el engine.
//
// Cierra las carreras get+put que teniamos en createMonitor, seedAgents, createGoal,
// decideIdea. Tambien envuelve operaciones multi-paso en un solo BEGIN/COMMIT.

import type { Store } from "../db.ts";
import type { TenantScopedStore } from "../db-tenant.ts";
import { AppError } from "../errors.ts";

/**
 * withTransaction - envuelve un callback en BEGIN/COMMIT/ROLLBACK.
 * Reexporta db.transaction() para que el engine no importe Store directamente
 * cuando solo necesita esto.
 */
export async function withTransaction<T>(
  db: Store,
  fn: (tx: Store) => Promise<T>,
): Promise<T> {
  return db.transaction(fn);
}

/**
 * upsertIdempotent - inserta si no existe, devuelve la existente si ya estaba.
 *
 * Cierra la carrera get+put: si dos procesos intentan crear el mismo id a la vez,
 * insertIfAbsent hace que solo uno gane y el otro recibe la fila del ganador.
 *
 * Uso:
 *   const goal = await upsertIdempotent(db, owner, "goals", { id, title, ... });
 */
export async function upsertIdempotent<T extends { id: string }>(
  db: Store | TenantScopedStore,
  owner: string,
  kind: string,
  value: T,
): Promise<T> {
  const inserted = await db.insertIfAbsent(owner, kind, value);
  if (inserted) return inserted;
  const existing = await db.get<T>(owner, kind, value.id);
  if (!existing) {
    throw new AppError(
      `Record ${kind}/${value.id} desaparecio despues de un conflicto de insercion`,
      500,
    );
  }
  return existing;
}

/**
 * withIdempotency - envuelve una operacion que puede ejecutarse dos veces.
 *
 * Si key ya existe en records/<kind>-idempotency, devuelve el resultado guardado.
 * Si no, ejecuta el callback, guarda el resultado y lo devuelve.
 *
 * Uso:
 *   const task = await withIdempotency(db, owner, "task-create", key, async () => {
 *     return createTask(...);
 *   });
 */
export async function withIdempotency<T>(
  db: Store,
  owner: string,
  kind: string,
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const id = `${kind}:${key}`;
  const existing = await db.get<{ result: T }>(owner, "idempotency", id);
  if (existing) return existing.result;
  const result = await fn();
  await db.insertIfAbsent(owner, "idempotency", { id, result, createdAt: new Date().toISOString() });
  return result;
}
```
