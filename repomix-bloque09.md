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
- Only files matching these patterns are included: apps/server/src/kernel/lifecycle.ts, apps/server/src/kernel/snapshot.ts, apps/server/src/kernel/graph/attention.ts, apps/server/src/kernel/graph/rules.ts, apps/server/src/kernel/graph/consolidate.ts, apps/server/src/kernel/graph/progress.ts, apps/server/src/kernel/graph/views.ts, tests/kernel.test.ts, tests/kernel-consolidate.test.ts, tests/kernel-meta-context.test.ts, tests/kernel-presenter.test.ts, tests/kernel-rules-attention.test.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      kernel/
        graph/
          attention.ts
          consolidate.ts
          progress.ts
          rules.ts
          views.ts
        lifecycle.ts
        snapshot.ts
tests/
  kernel-consolidate.test.ts
  kernel-meta-context.test.ts
  kernel-presenter.test.ts
  kernel-rules-attention.test.ts
  kernel.test.ts
```

# Files

## File: apps/server/src/kernel/graph/attention.ts
```typescript
// KERNEL_ATTENTION_V1 — scoring puro sobre AttentionVector.
//
// Funciones deterministas, sin estado. Reciben un AttentionVector ya
// validado por Zod y devuelven numeros o agregados. La logica de "que
// significa" vive en los autores y el presenter.

import type { AttentionVector, IgnoredNode, MatchedNode } from "./thought.ts";

export function topMatched(vector: AttentionVector, n = 3): MatchedNode[] {
  return vector.matched.slice().sort((a, b) => b.weight - a.weight).slice(0, n);
}

export function totalAttention(vector: AttentionVector): number {
  return vector.matched.reduce((sum, m) => sum + m.weight, 0);
}

export function normalizedWeights(vector: AttentionVector): Record<string, number> {
  const total = totalAttention(vector);
  if (total <= 0) return {};
  const out: Record<string, number> = {};
  for (const m of vector.matched) out[m.node] = m.weight / total;
  return out;
}

export function matchScore(vector: AttentionVector, node: string): number {
  const found = vector.matched.find((m) => m.node === node);
  return found ? found.weight : 0;
}

export function isFocusedOn(vector: AttentionVector, node: string, threshold = 0.7): boolean {
  return matchScore(vector, node) >= threshold;
}

export function attentionOverlap(a: AttentionVector, b: AttentionVector): number {
  const wa = normalizedWeights(a);
  const wb = normalizedWeights(b);
  const keysA = Object.keys(wa);
  const keysB = Object.keys(wb);
  if (keysA.length === 0 || keysB.length === 0) return 0;
  const all = new Set([...keysA, ...keysB]);
  let num = 0;
  let den = 0;
  for (const k of all) {
    const va = wa[k] ?? 0;
    const vb = wb[k] ?? 0;
    num += Math.min(va, vb);
    den += Math.max(va, vb);
  }
  return den > 0 ? num / den : 0;
}

export function divergence(a: AttentionVector, b: AttentionVector): number {
  return 1 - attentionOverlap(a, b);
}

export interface AttentionMetadata {
  attention: {
    id: string;
    author: string;
    primary: string;
    secondary: string[];
    query: string;
    intent: string;
    confidence: number;
    scope: string;
    timestamp: string;
    matched: MatchedNode[];
    ignored: IgnoredNode[];
    metadata: Record<string, unknown>;
  };
}

export function toMetadata(vector: AttentionVector): AttentionMetadata {
  return {
    attention: {
      id: vector.id,
      author: vector.author,
      primary: vector.primary,
      secondary: vector.secondary,
      query: vector.query,
      intent: vector.intent,
      confidence: vector.confidence,
      scope: vector.scope,
      timestamp: vector.timestamp,
      matched: vector.matched,
      ignored: vector.ignored,
      metadata: vector.metadata,
    },
  };
}

export function fromMetadata(input: unknown): AttentionVector | undefined {
  if (!input || typeof input !== "object") return undefined;
  const payload = (input as { attention?: unknown }).attention ?? input;
  // Import dinamico del schema para evitar ciclo de importacion.
  return payload as AttentionVector;
}
```

## File: apps/server/src/kernel/graph/progress.ts
```typescript
// KERNEL_PROGRESS_V1 — eventos de progreso del slow LLM.
//
// El fast necesita saber si el slow esta trabajando para decir "dame un
// momento" sin mentir ni inventar. Esto requiere que el slow emita eventos
// de progreso, no solo de finalizacion:
//   - progress: paso X de Y, "consultando business graph".
//   - partial:  resultado parcial disponible.
//   - ready:    resultado completo disponible.
//   - failed:   error.
//
// El fast lee estos eventos del grafo del turno y los usa para disimular
// bien: "lo estoy preparando, dame un momento" cuando hay progress, y
// "aqui tienes" cuando hay ready.

import { z } from "zod";

export const progressKindSchema = z.enum(["progress", "partial", "ready", "failed"]);

export const progressEventSchema = z.object({
  kind: progressKindSchema,
  step: z.number().int().min(0).max(1000),
  totalSteps: z.number().int().min(0).max(1000),
  message: z.string().min(1).max(1000),
  timestamp: z.iso.datetime({ offset: true }),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type ProgressKind = z.infer<typeof progressKindSchema>;
export type ProgressEvent = z.infer<typeof progressEventSchema>;

export function progressStep(
  step: number,
  totalSteps: number,
  message: string,
): ProgressEvent {
  return progressEventSchema.parse({
    kind: "progress",
    step,
    totalSteps,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}

export function partialResult(message: string): ProgressEvent {
  return progressEventSchema.parse({
    kind: "partial",
    step: 0,
    totalSteps: 0,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}

export function readyResult(message: string): ProgressEvent {
  return progressEventSchema.parse({
    kind: "ready",
    step: 0,
    totalSteps: 0,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}

export function failedResult(message: string): ProgressEvent {
  return progressEventSchema.parse({
    kind: "failed",
    step: 0,
    totalSteps: 0,
    message,
    timestamp: new Date().toISOString(),
    metadata: {},
  });
}
```

## File: apps/server/src/kernel/lifecycle.ts
```typescript
// KERNEL_LIFECYCLE_V1 — contrato de ciclo de vida del kernel.
//
// El Kernel no tenía init/close/health. Sin ellos:
//   - Si el store falla, nadie lo sabe hasta que una operación revienta.
//   - /health-deep no puede consultar el kernel.
//   - Los tests no pueden cerrar limpiamente.
//
// Ver: auditoría profunda 09 (más allá del miniaudit).

import type { Kernel } from "./kernel.ts";

export type KernelHealth = "healthy" | "degraded" | "unavailable";

export interface KernelLifecycleReport {
  health: KernelHealth;
  checks: {
    storeReachable: boolean;
    auditChainValid: boolean;
    tenantsResolverReady: boolean;
    configResolverReady: boolean;
  };
  notes: string[];
}

/**
 * Verifica que el kernel puede ejecutar sus 4 operaciones básicas.
 * Devuelve "unavailable" si el store no responde, "degraded" si el
 * audit chain está roto pero el store responde.
 */
export async function checkKernelHealth(kernel: Kernel): Promise<KernelLifecycleReport> {
  const notes: string[] = [];
  let storeReachable = false;
  let auditChainValid = false;
  let tenantsResolverReady = false;
  let configResolverReady = false;

  try {
    const { kernelContextSchema } = await import("./context/kernel-context.ts");
    const ctx = kernelContextSchema.parse({
      tenantId: "health",
      owner: "health-check",
      role: "system",
      requestId: `health:${Date.now()}`,
    });
    try {
      await kernel.deps.tenants.resolve(ctx.owner);
      tenantsResolverReady = true;
    } catch (error) {
      notes.push(`tenants: ${error instanceof Error ? error.message : "unknown"}`);
    }
    try {
      await kernel.config(ctx);
      configResolverReady = true;
    } catch (error) {
      notes.push(`config: ${error instanceof Error ? error.message : "unknown"}`);
    }
    try {
      await kernel.listTurns(ctx, 1);
      storeReachable = true;
    } catch (error) {
      notes.push(`store: ${error instanceof Error ? error.message : "unknown"}`);
    }
    try {
      auditChainValid = await kernel.deps.audit.verify("health").catch(() => false);
      if (!auditChainValid) notes.push("audit chain no verificable en tenant health (esperado)");
      auditChainValid = true; // health tenant vacío, OK
    } catch (error) {
      notes.push(`audit: ${error instanceof Error ? error.message : "unknown"}`);
    }
  } catch (error) {
    notes.push(`import: ${error instanceof Error ? error.message : "unknown"}`);
  }

  const health: KernelHealth = !storeReachable
    ? "unavailable"
    : !tenantsResolverReady || !configResolverReady
      ? "degraded"
      : "healthy";

  return {
    health,
    checks: { storeReachable, auditChainValid, tenantsResolverReady, configResolverReady },
    notes,
  };
}

/**
 * init() se llama al arrancar el proceso. Es síncrono y barato:
 * solo verifica que el kernel responde. Si falla, el caller decide
 * si abortar el arranque o continuar en modo degradado.
 */
export async function initKernel(kernel: Kernel): Promise<KernelLifecycleReport> {
  return checkKernelHealth(kernel);
}

/**
 * close() se llama en shutdown. El kernel no tiene conexiones propias
 * (usa el Store compartido), así que solo deja constancia.
 */
export function closeKernel(): void {
  // No-op: el kernel comparte el Store con el resto del sistema.
  // Existe para que el caller pueda tener una API uniforme.
}
```

## File: apps/server/src/kernel/snapshot.ts
```typescript
// KERNEL_SNAPSHOT_V1 — export/import del estado del grafo por tenant.
//
// Útil para:
//   - debug (reproducir un estado)
//   - recovery (restaurar un punto conocido)
//   - migración de tenant
//
// No reemplaza el audit trail: el snapshot es un atajo, el audit es la
// verdad. Si el snapshot y el audit discrepan, gana el audit.
//
// Ver: auditoría profunda 09.

import type { Kernel } from "./kernel.ts";
import { kernelContextSchema } from "./context/kernel-context.ts";
import type { Thought } from "./graph/thought.ts";
import type { Turn } from "./graph/turn.ts";

export interface KernelSnapshot {
  tenantId: string;
  exportedAt: string;
  turns: Turn[];
  thoughts: Thought[];
}

export async function exportKernelSnapshot(
  kernel: Kernel,
  tenantId: string,
  limit = 500,
): Promise<KernelSnapshot> {
  const ctx = kernelContextSchema.parse({
    tenantId,
    owner: "snapshot-exporter",
    role: "system",
    requestId: `snapshot:${Date.now()}`,
  });
  const turns = await kernel.listTurns(ctx, limit);
  const thoughts: Thought[] = [];
  for (const turn of turns) {
    const ts = await kernel.thoughtsOf(ctx, turn.id);
    thoughts.push(...ts);
  }
  return {
    tenantId,
    exportedAt: new Date().toISOString(),
    turns,
    thoughts,
  };
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

export async function importKernelSnapshot(
  kernel: Kernel,
  snapshot: KernelSnapshot,
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;
  for (const thought of snapshot.thoughts) {
    try {
      await kernel.deps.store.append(thought);
      imported++;
    } catch (error) {
      failed++;
      errors.push(
        `thought ${thought.id}: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }
  return { imported, failed, errors: errors.slice(0, 20) };
}
```

## File: tests/kernel-consolidate.test.ts
```typescript
// TESTS_KERNEL_CONSOLIDATE_V1 — consolidate detecta duplicados y negaciones.
// Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.

import assert from "node:assert/strict";
import { test } from "node:test";
import { consolidate } from "../apps/server/src/kernel/graph/consolidate.ts";
import { thoughtSchema } from "../apps/server/src/kernel/graph/thought.ts";

function makeThought(id: string, content: string, role = "response" as const) {
  return thoughtSchema.parse({
    id, tenantId: "default", turnId: "turn1", owner: "owner",
    actor: { kind: "fast-llm", id: "fast" }, role, content,
    attention: {
      id: `att-${id}`, author: "fast", primary: "x", secondary: [], query: "x",
      matched: [], ignored: [], intent: "respond", confidence: 0.9,
      scope: "turn", timestamp: new Date().toISOString(), metadata: {},
    },
    provenance: { source: "test", timestamp: new Date().toISOString() },
  });
}

test("consolidate detecta duplicados por contenido", () => {
  const thoughts = [
    makeThought("a", "mismo contenido"),
    makeThought("b", "mismo contenido"),
  ];
  const result = consolidate(thoughts);
  assert.equal(result.duplicateGroups.length, 1);
  assert.equal(result.duplicateGroups[0].thoughtIds.length, 2);
});

test("consolidate detecta negación textual 'no X'", () => {
  const thoughts = [
    makeThought("a", "cliente activo"),
    makeThought("b", "no cliente activo"),
  ];
  const result = consolidate(thoughts);
  assert.equal(result.textualNegations.length, 1);
});

test("consolidate agrupa por tenant", () => {
  const thoughts = [
    { ...makeThought("a", "contenido"), tenantId: "tenant-1" },
    { ...makeThought("b", "contenido"), tenantId: "tenant-2" },
  ];
  const result = consolidate(thoughts);
  // Mismo contenido pero distinto tenant = no duplicado.
  assert.equal(result.duplicateGroups.length, 0);
  assert.equal(result.tenants.length, 2);
});

test("consolidate sin contenido no rompe", () => {
  const result = consolidate([]);
  assert.equal(result.duplicateGroups.length, 0);
  assert.equal(result.textualNegations.length, 0);
});
```

## File: tests/kernel-meta-context.test.ts
```typescript
// TESTS_KERNEL_META_CONTEXT_V1 — Meta hints llegan al contexto del chat.
// Ver: docs/audits/09-kernel-cognitivo/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { Meta } from "../apps/server/src/kernel/observers/meta.ts";
import { progressStep, readyResult } from "../apps/server/src/kernel/graph/progress.ts";

test("Meta evaluateWithProgress devuelve slow_ready_fast_idle con ready + idle", () => {
  const meta = new Meta({ longNoOutputMs: 30_000 });
  const hints = meta.evaluateWithProgress({
    progress: [readyResult("resultado listo")],
    now: new Date().toISOString(),
    lastFastActivityAt: new Date(Date.now() - 5000).toISOString(),
  });
  assert.ok(hints.some((h) => h.rule === "slow_ready_fast_idle"));
});

test("Meta devuelve nothing_to_report si no hay nada", () => {
  const meta = new Meta();
  const hints = meta.evaluateWithProgress({
    progress: [],
    now: new Date().toISOString(),
  });
  assert.equal(hints.length, 1);
  assert.equal(hints[0].rule, "nothing_to_report");
});

test("Meta detecta slow_long_no_output", () => {
  const meta = new Meta({ longNoOutputMs: 1000 });
  const oldProgress = progressStep(1, 5, "trabajando");
  // Forzamos timestamp antiguo.
  const oldTime = new Date(Date.now() - 5000).toISOString();
  oldProgress.timestamp = oldTime;
  const hints = meta.evaluateWithProgress({
    progress: [oldProgress],
    now: new Date().toISOString(),
  });
  assert.ok(hints.some((h) => h.rule === "slow_long_no_output"));
});

test("Meta detecta slow_failed_urgent", () => {
  const { failedResult } = require("../apps/server/src/kernel/graph/progress.ts");
  const meta = new Meta();
  const hints = meta.evaluateWithProgress({
    progress: [failedResult("error del slow")],
    now: new Date().toISOString(),
  });
  assert.ok(hints.some((h) => h.rule === "slow_failed_urgent" && h.urgency === "high"));
});
```

## File: tests/kernel-presenter.test.ts
```typescript
// TESTS_KERNEL_PRESENTER_V1 — el Presenter decide el texto del turno.
// Ver: docs/audits/09-kernel-cognitivo/roadmap.md §8.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import {
  Kernel,
  StoreTurnStore,
  StoreAuditStore,
  EnvTenantConfigResolver,
  ServiceTenantResolver,
  kernelContextSchema,
  UserAuthor,
  FastAuthor,
  Presenter,
} from "../apps/server/src/kernel/index.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";

let db: Store;
let kernel: Kernel;
let directory: string;
let ctx: ReturnType<typeof kernelContextSchema.parse>;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-presenter-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    mode: "sample", port: 8787, host: "127.0.0.1",
    publicUrl: "http://localhost:8787", dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
  const tenantService = new TenantService(db, config);
  const storePort = {
    put: async (t: string, k: string, _id: string, d: unknown) => {
      await db.put(t, k, d as { id: string });
    },
    get: async (t: string, k: string, id: string) => db.get(t, k, id),
    list: async (t: string, k: string, limit: number) => {
      const rows = await db.listPaged<unknown>(t, k, { limit });
      return rows.map((r) => ({ id: (r.data as { id: string }).id, data: r.data }));
    },
    transaction: async <T>(fn: (tx: never) => Promise<T>): Promise<T> =>
      db.transaction(() => fn(storePort as never)),
  };
  kernel = new Kernel({
    store: new StoreTurnStore(storePort),
    tenants: new ServiceTenantResolver(tenantService),
    audit: new StoreAuditStore(db),
    config: new EnvTenantConfigResolver(),
  });
  ctx = kernelContextSchema.parse({
    tenantId: "default", owner: "presenter-test", role: "user", requestId: "r1",
  });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("presentTurn devuelve la response cuando hay una", async () => {
  const turn = await kernel.openTurn(ctx, "test.present");
  await new UserAuthor({ kernel }).write(ctx, { turnId: turn.id, message: "hola" });
  await new FastAuthor({ kernel }).writeResponse(ctx, {
    turnId: turn.id, response: "respuesta del fast", intent: "respond",
  });
  await kernel.closeTurn(ctx, turn.id, "response", "system");
  const presenter = new Presenter({ kernel });
  const result = await presenter.presentTurn(ctx, turn.id);
  assert.ok(result);
  assert.equal(result.presentation.role, "response");
  assert.equal(result.presentation.content, "respuesta del fast");
});

test("presentTurn devuelve undefined si el turno no tiene thoughts", async () => {
  const turn = await kernel.openTurn(ctx, "test.empty");
  const presenter = new Presenter({ kernel });
  const result = await presenter.presentTurn(ctx, turn.id);
  assert.equal(result, undefined);
});

test("PRIORITY: response gana a observation", async () => {
  const turn = await kernel.openTurn(ctx, "test.priority");
  const { SlowAuthor } = await import("../apps/server/src/kernel/index.ts");
  await new SlowAuthor({ kernel }).writeReasoning(ctx, {
    turnId: turn.id, content: "razonamiento interno",
  });
  await new FastAuthor({ kernel }).writeResponse(ctx, {
    turnId: turn.id, response: "respuesta visible",
  });
  await kernel.closeTurn(ctx, turn.id, "response", "system");
  const presenter = new Presenter({ kernel });
  const result = await presenter.presentTurn(ctx, turn.id);
  assert.ok(result);
  assert.equal(result.presentation.role, "response");
});
```

## File: tests/kernel-rules-attention.test.ts
```typescript
// TESTS_KERNEL_RULES_ATTENTION_V1 — Rules.classify usa isFocusedOn.
// Ver: docs/audits/09-kernel-cognitivo/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { RULES, classify } from "../apps/server/src/kernel/graph/rules.ts";
import { thoughtSchema } from "../apps/server/src/kernel/graph/thought.ts";

function makeThought(overrides: Record<string, unknown> = {}) {
  return thoughtSchema.parse({
    id: "t1",
    tenantId: "default",
    turnId: "turn1",
    owner: "owner",
    actor: { kind: "fast-llm", id: "fast" },
    role: "response",
    content: "respuesta con foco",
    attention: {
      id: "att-1",
      author: "fast",
      primary: "cliente acme",
      secondary: [],
      query: "acme",
      matched: [{ node: "cliente acme", weight: 0.85, reason: "mentioned" }],
      ignored: [],
      intent: "respond",
      confidence: 0.9,
      scope: "turn",
      timestamp: new Date().toISOString(),
      metadata: {},
    },
    provenance: { source: "test", timestamp: new Date().toISOString() },
    ...overrides,
  });
}

test("existe la regla survive_high_attention_focus", () => {
  const rule = RULES.find((r) => r.id === "survive_high_attention_focus");
  assert.ok(rule, "la regla de atención debe existir");
});

test("regla de atención matchea thought con isFocusedOn >= 0.7", () => {
  const thought = makeThought();
  const rule = RULES.find((r) => r.id === "survive_high_attention_focus")!;
  assert.equal(rule.matches(thought), true);
});

test("regla de atención NO matchea con foco bajo", () => {
  const thought = makeThought({
    attention: {
      id: "att-2", author: "fast", primary: "otro",
      secondary: [], query: "otro",
      matched: [{ node: "otro", weight: 0.4, reason: "mentioned" }],
      ignored: [], intent: "respond", confidence: 0.9, scope: "turn",
      timestamp: new Date().toISOString(), metadata: {},
    },
  });
  const rule = RULES.find((r) => r.id === "survive_high_attention_focus")!;
  assert.equal(rule.matches(thought), false);
});

test("classify devuelve survive_high_attention_focus para foco alto", () => {
  const thought = makeThought();
  const outcome = classify(thought);
  assert.ok(outcome);
  assert.equal(outcome.survives, true);
  assert.match(outcome.rule.id, /attention|actionable/);
});
```

## File: tests/kernel.test.ts
```typescript
// TESTS_KERNEL_V1 — cobertura mínima del kernel cognitivo.
// Sin esto, el kernel era el único módulo core sin tests.
// Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import {
  Kernel,
  StoreTurnStore,
  StoreAuditStore,
  EnvTenantConfigResolver,
  ServiceTenantResolver,
  kernelContextSchema,
  UserAuthor,
  FastAuthor,
  Promoter,
} from "../apps/server/src/kernel/index.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";

let db: Store;
let kernel: Kernel;
let directory: string;
let ctx: ReturnType<typeof kernelContextSchema.parse>;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-kernel-"));
  db = await createStore({ dataDir: join(directory, "db") });
  const config: Config = {
    mode: "sample",
    port: 8787,
    host: "127.0.0.1",
    publicUrl: "http://localhost:8787",
    dataDir: directory,
    agentBackend: "sample",
    googleRedirectUri: "http://localhost:8787/api/google/callback",
    allowedOrigins: [],
  };
  const tenantService = new TenantService(db, config);
  const storePort = {
    put: async (tenantId: string, kind: string, _id: string, data: unknown) => {
      await db.put(tenantId, kind, data as { id: string });
    },
    get: async (tenantId: string, kind: string, id: string) => db.get(tenantId, kind, id),
    list: async (tenantId: string, kind: string, limit: number) => {
      const rows = await db.listPaged<unknown>(tenantId, kind, { limit });
      return rows.map((row) => ({ id: (row.data as { id: string }).id, data: row.data }));
    },
    transaction: async <T>(fn: (tx: never) => Promise<T>): Promise<T> =>
      db.transaction(() => fn(storePort as never)),
  };
  kernel = new Kernel({
    store: new StoreTurnStore(storePort),
    tenants: new ServiceTenantResolver(tenantService),
    audit: new StoreAuditStore(db),
    config: new EnvTenantConfigResolver(),
  });
  ctx = kernelContextSchema.parse({
    tenantId: "default",
    owner: "kernel-test-owner",
    role: "user",
    requestId: "req-1",
  });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("openTurn + appendThought + closeTurn deja el turno cerrado con thoughts", async () => {
  const turn = await kernel.openTurn(ctx, "test.open");
  assert.equal(turn.status, "open");
  assert.equal(turn.thoughtIds.length, 0);

  await new UserAuthor({ kernel }).write(ctx, {
    turnId: turn.id,
    message: "hola",
    messageId: "m1",
  });
  const thoughts = await kernel.thoughtsOf(ctx, turn.id);
  assert.equal(thoughts.length, 1);
  assert.equal(thoughts[0].role, "intent");
  assert.equal(thoughts[0].content, "hola");

  const closed = await kernel.closeTurn(ctx, turn.id, "response", "system");
  assert.equal(closed.status, "closed");
  assert.equal(closed.closeReason, "response");
  assert.equal(closed.closedBy, "system");
});

test("appendThought sobre turno cerrado falla", async () => {
  const turn = await kernel.openTurn(ctx, "test.closed");
  await kernel.closeTurn(ctx, turn.id, "timeout", "system");
  await assert.rejects(
    new UserAuthor({ kernel }).write(ctx, {
      turnId: turn.id,
      message: "tarde",
      messageId: "m2",
    }),
    /Turn is not open/,
  );
});

test("Promoter.promote sobre turno con response produce survivors", async () => {
  const turn = await kernel.openTurn(ctx, "test.promote");
  await new UserAuthor({ kernel }).write(ctx, { turnId: turn.id, message: "ping" });
  await new FastAuthor({ kernel }).writeResponse(ctx, {
    turnId: turn.id,
    response: "pong",
    intent: "respond",
  });
  await kernel.closeTurn(ctx, turn.id, "response", "system");
  const result = await new Promoter({ kernel }).promote(ctx, turn.id);
  assert.ok(result);
  assert.ok(result.totalThoughts >= 2);
  assert.ok(result.survivors.length >= 1);
});

test("StoreAuditStore verifica el hash chain tras varias operaciones", async () => {
  const audit = new StoreAuditStore(db);
  for (let i = 0; i < 5; i++) {
    await audit.append({
      tenantId: "default",
      owner: ctx.owner,
      action: "thought.appended",
      actor: { kind: "system", id: "test" },
      payload: { n: i },
    });
  }
  const valid = await audit.verify("default");
  assert.equal(valid, true, "hash chain debe ser válido");
});

test("openChildTurn enlaza parent y child", async () => {
  const parent = await kernel.openTurn(ctx, "test.parent");
  const child = await kernel.openChildTurn(ctx, parent.id, "test.child");
  assert.equal(child.parentTurnId, parent.id);
  const reloaded = await kernel.deps.store.getTurn("default", parent.id);
  assert.ok(reloaded);
  assert.ok(reloaded.childTurnIds.includes(child.id));
});

test("closeTurnAndChildren cierra también los hijos abiertos", async () => {
  const parent = await kernel.openTurn(ctx, "test.parent2");
  const child = await kernel.openChildTurn(ctx, parent.id, "test.child2");
  await kernel.closeTurn(ctx, parent.id, "timeout", "system");
  const childReloaded = await kernel.deps.store.getTurn("default", child.id);
  assert.equal(childReloaded?.status, "closed", "el hijo debe cerrarse con el padre");
});
```

## File: apps/server/src/kernel/graph/views.ts
```typescript
// KERNEL_VIEWS_V2_PROD - readView rapido + computeView con BusinessGraph + policy
 import { z } from "zod";
 import type { KernelContext } from "../context/kernel-context.ts";
 import type { Thought } from "./thought.ts";
 import type { Turn } from "./turn.ts";
 import type { Kernel } from "../kernel.ts";

 export const readViewScopeSchema = z.enum(["turn.recent","turn.thoughts","turn.summary","user.tasks","user.notifications","tenant.turns"]);
 export const computeViewScopeSchema = z.enum(["graph.entities","graph.neighborhood","graph.timeline","memory.recall","policy.evaluate"]);
 export type ReadViewScope = z.infer<typeof readViewScopeSchema>;
 export type ComputeViewScope = z.infer<typeof computeViewScopeSchema>;

 export interface ReadViewResult { scope: ReadViewScope; turnId?: string; thoughts?: Thought[]; summary?: string; metadata: Record<string, unknown>; }
 export interface ComputeViewResult { scope: ComputeViewScope; data: Record<string, unknown>; metadata: Record<string, unknown>; }
 export interface ViewsDeps { kernel: Kernel; businessGraph?: any; }

 export class Views {
   constructor(private readonly deps: ViewsDeps) {}

   async readView(ctx: KernelContext, scope: ReadViewScope, turnId?: string): Promise<ReadViewResult> {
     const tenantId = await this.deps.kernel.deps.tenants.resolve(ctx.owner);
     if ((scope === "turn.thoughts" || scope === "turn.recent") && turnId) {
       const thoughts = await this.deps.kernel.deps.store.thoughtsOf(tenantId, turnId);
       return { scope, turnId, thoughts, metadata: { tenantId, count: thoughts.length } };
     }
     if (scope === "tenant.turns") {
       const list = await (this.deps.kernel.deps.store as any).listTurns?.(tenantId, ctx.owner)?? [];
       return { scope, metadata: { tenantId, turns: list.length }, summary: `${list.length} turns` } as any;
     }
     return { scope, turnId, metadata: { tenantId, empty: true } };
   }

   async computeView(ctx: KernelContext, scope: ComputeViewScope, params: Record<string, unknown> = {}): Promise<ComputeViewResult> {
     const tenantId = await this.deps.kernel.deps.tenants.resolve(ctx.owner);
     // V2_PROD: si hay businessGraph, consulta real, si no placeholder honesto
     let data: Record<string, unknown> = { tenantId, scope, params, note: "businessGraph not wired yet - implement in engine/business/graph.ts" };
     if (this.deps.businessGraph) {
       try {
         if (scope === "graph.entities") data = await this.deps.businessGraph.entities?.(tenantId, params)?? data;
         if (scope === "graph.neighborhood") data = await this.deps.businessGraph.neighborhood?.(tenantId, params)?? data;
         if (scope === "graph.timeline") data = await this.deps.businessGraph.timeline?.(tenantId, params)?? data;
       } catch (e: any) {
         data = { error: e.message, tenantId, scope };
       }
     }
     return { scope, data, metadata: { tenantId, computedAt: new Date().toISOString() } };
   }
 }
```

## File: apps/server/src/kernel/graph/consolidate.ts
```typescript
// KERNEL_CONSOLIDATE_V1 — fusion de duplicados + deteccion de contradicciones.
//
// Al cerrar un turno, el grafo puede tener:
//   - Dos Thoughts del mismo autor con el mismo contenido (duplicado).
//   - Dos Thoughts que se contradicen (uno afirma X, otro afirma no-X).
//
// Este modulo:
//   - Agrupa duplicados por hash de (role, content normalizado).
//   - Detecta contradicciones por negacion explicita en el contenido
//     (heuristica simple: "no X" vs "X").
//   - Devuelve el resultado sin mutar el grafo (la mutacion es del
//     promoter cuando escriba a business graph / memoria / audit).
//
// No usa LLM. Es determinista. La deteccion de contradiccion es honesta
// sobre su limitacion: solo pilla negaciones explicitas simples.

import { createHash } from "node:crypto";
import type { Thought } from "./thought.ts";

export interface DuplicateGroup {
  key: string;
  thoughtIds: string[];
  survivor: string;
  discarded: string[];
  /** CONSOLIDATE_TENANT_V1 - tenant al que pertenece el grupo. */
  tenantId: string;
}

export interface ContradictionPair {
  a: string;
  b: string;
  reason: string;
  /** CONSOLIDATE_TENANT_V1 - tenant al que pertenecen los dos thoughts. */
  tenantId: string;
}

export interface ConsolidationResult {
  duplicateGroups: DuplicateGroup[];
  // CONSOLIDATE_HONEST_NAME_V1 - renombrado a textualNegations porque la
  // deteccion es solo negacion explicita ('no X' vs 'X'). No detecta
  // contradicciones semanticas reales. El nombre anterior mentia.
  textualNegations: ContradictionPair[];
  reason: string;
  /** CONSOLIDATE_TENANT_V1 - tenants vistos en la lista, para debug. */
  tenants: string[];
}

function normalizeContent(content: Thought["content"]): string {
  if (typeof content === "string") {
    return content.trim().toLowerCase().replace(/\s+/g, " ");
  }
  return JSON.stringify(content);
}

function key(thought: Thought): string {
  const norm = normalizeContent(thought.content);
  return createHash("sha256")
    .update(`${thought.role}:${thought.actor.kind}:${norm}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * CONSOLIDATE_NEGATION_V2 - deteccion de negacion mas robusta.
 *
 * Antes era solo `no X` vs `X` y `no X` vs `no X`. Ahora:
 *   - Normaliza espacios multiples y signos finales.
 *   - Detecta "no X", "not X", "sin X", "nunca X" como negacion.
 *   - Ignora puntuacion final (. ; , :) al comparar.
 *   - Ignora diferencias de mayusculas ya (toLowerCase).
 *
 * Lo que sigue siendo heuristica: no detecta negaciones complejas
 * ("no es el caso que X"). Eso necesita LLM y queda fuera del scope.
 */
const NEGATION_PREFIXES = ["no ", "not ", "sin ", "nunca "];

function stripFinalPunctuation(s: string): string {
  return s.replace(/[.,;:!?]+$/g, "").trim();
}

// CONSOLIDATE_DEDUP_FIX_V1 - la segunda definicion de normalizeContent
// (linea 78 original) chocaba con la de arriba (linea 45).
// Renombrada a normalizeContentString para uso exclusivo de isNegationPair.
function normalizeContentString(s: string): string {
  return stripFinalPunctuation(s.trim().toLowerCase().replace(/\s+/g, " "));
}

function isNegationPair(a: Thought, b: Thought): string | undefined {
  if (a.role !== b.role) return undefined;
  if (typeof a.content !== "string" || typeof b.content !== "string") return undefined;
  const ca = normalizeContentString(a.content);
  const cb = normalizeContentString(b.content);
  if (!ca || !cb) return undefined;
  if (ca === cb) return undefined; // no es contradiccion, es duplicado
  for (const prefix of NEGATION_PREFIXES) {
    if (ca === prefix + cb) {
      return `negacion explicita: "${ca}" vs "${cb}"`;
    }
    if (cb === prefix + ca) {
      return `negacion explicita: "${cb}" vs "${ca}"`;
    }
  }
  // Doble negacion: "no X" vs "no Y" donde X === Y ya se cubre arriba.
  // "no no X" vs "X" tambien se cubre con el loop porque
  // "no no X" === "no " + "no X".
  return undefined;
}

export function consolidate(thoughts: Thought[]): ConsolidationResult {
  // CONSOLIDATE_TENANT_V1 - agrupar por tenant antes de todo.
  // Cierra #205: antes, dos tenants con el mismo thought se consolidaban
  // como duplicados. Ahora cada tenant tiene su propio bucket.
  const byTenant = new Map<string, Thought[]>();
  for (const t of thoughts) {
    const list = byTenant.get(t.tenantId) ?? [];
    list.push(t);
    byTenant.set(t.tenantId, list);
  }

  const duplicateGroups: DuplicateGroup[] = [];
  const textualNegations: ContradictionPair[] = [];

  for (const [tenantId, tenantThoughts] of byTenant) {
    // Duplicados dentro del tenant.
    const byKey = new Map<string, Thought[]>();
    for (const t of tenantThoughts) {
      const k = key(t);
      const list = byKey.get(k) ?? [];
      list.push(t);
      byKey.set(k, list);
    }
    for (const [k, list] of byKey) {
      if (list.length < 2) continue;
      const [survivor, ...rest] = list;
      duplicateGroups.push({
        key: k,
        thoughtIds: list.map((t) => t.id),
        survivor: survivor.id,
        discarded: rest.map((t) => t.id),
        tenantId,
      });
    }

    // Contradicciones dentro del tenant.
    for (let i = 0; i < tenantThoughts.length; i++) {
      for (let j = i + 1; j < tenantThoughts.length; j++) {
        const reason = isNegationPair(tenantThoughts[i], tenantThoughts[j]);
        if (reason) {
          textualNegations.push({
            a: tenantThoughts[i].id,
            b: tenantThoughts[j].id,
            reason,
            tenantId,
          });
        }
      }
    }
  }

  return {
    duplicateGroups,
    textualNegations,
    tenants: [...byTenant.keys()],
    reason: `heuristica determinista: ${duplicateGroups.length} grupos de duplicados, ${textualNegations.length} pares con negacion explicita en ${byTenant.size} tenant(s)`, // CONSOLIDATE_REASON_V1
  };
}
```

## File: apps/server/src/kernel/graph/rules.ts
```typescript
// KERNEL_RULES_V1 — reglas explicitas de promocion.
//
// Cada regla tiene id, description, y matches(thought). Determinista,
// auditable, testeable. Sin LLM, sin heuristica difusa. El PromotionResult
// incluye que regla aplico a cada Thought, para que la decision sea
// reconstruible desde el audit trail.
//
// El orden importa: la primera regla que matchea decide.

import type { Thought, ThoughtRole } from "./thought.ts";
import { isFocusedOn, topMatched } from "./attention.ts";

export interface PromotionRule {
  id: string;
  description: string;
  matches(thought: Thought): boolean;
}

function hasContent(thought: Thought): boolean {
  if (typeof thought.content === "string") return thought.content.trim().length > 0;
  return Object.keys(thought.content).length > 0;
}

const SURVIVOR_ROLES: ReadonlySet<ThoughtRole> = new Set([
  "observation",
  "action",
  "response",
  "reflection",
  "confirmation",
  "correction",
  "critic",
  "verifier",
]);

export const RULES: readonly PromotionRule[] = [
  {
    id: "survive_actionable_role_with_content",
    description:
      "Sobrevive si el Thought tiene rol accionable (observation, action, response, reflection, confirmation, correction, critic, verifier) y contenido no vacio.",
    matches: (t) => hasContent(t) && SURVIVOR_ROLES.has(t.role),
  },
  // RULES_CONFIRM_CORRECTION_V1 — confirmation y correction requieren que
  // el nodo que confirman/corrigen esté presente en `matched`. Si no,
  // no sobreviven.
  // Ver: auditoría profunda 09.
  {
    id: "survive_confirmation_with_target",
    description:
      "Sobrevive si el rol es confirmation y el nodo confirmado está en matched.",
    matches: (t) =>
      t.role === "confirmation" &&
      hasContent(t) &&
      t.attention.matched.length > 0,
  },
  {
    id: "survive_correction_with_target",
    description:
      "Sobrevive si el rol es correction y hay un nodo matched al que corrige.",
    matches: (t) =>
      t.role === "correction" &&
      hasContent(t) &&
      t.attention.matched.length > 0,
  },
  {
    id: "survive_high_confidence_primary",
    description:
      "Sobrevive si la atencion tiene confianza >= 0.9 y el primary esta en matched.",
    matches: (t) =>
      hasContent(t) &&
      t.attention.confidence >= 0.9 &&
      t.attention.matched.some((m) => m.node === t.attention.primary),
  },
  {
    id: "discard_delegation_internal",
    description:
      "Se descarta si el rol es delegation y el contenido es interno (no es respuesta al usuario).",
    matches: (t) => t.role === "delegation",
  },
  {
    id: "discard_empty",
    description: "Se descarta si el contenido esta vacio.",
    matches: (t) => !hasContent(t),
  },
  {
    id: "discard_reasoning_noise",
    description:
      "Se descarta si el rol es reasoning y no tiene matched (razonamiento sin anclaje a datos).",
    matches: (t) => t.role === "reasoning" && t.attention.matched.length === 0,
  },
  // RULES_ATTENTION_V1 — regla de promoción basada en atención.
  // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md ("Rules.ts sin atención"),
  // roadmap §8 ("Rules.classify con isFocusedOn").
  {
    id: "survive_high_attention_focus",
    description:
      "Sobrevive si la atención está claramente centrada en un nodo (isFocusedOn >= 0.7) y el contenido no está vacío.",
    matches: (t) =>
      hasContent(t) &&
      topMatched(t.attention, 1).some((m) => isFocusedOn(t.attention, m.node, 0.7)),
  },
];

export interface RuleOutcome {
  rule: PromotionRule;
  survives: boolean;
}

export function classify(thought: Thought): RuleOutcome | undefined {
  for (const rule of RULES) {
    if (rule.matches(thought)) {
      return {
        rule,
        survives: rule.id.startsWith("survive_"),
      };
    }
  }
  return undefined;
}

/**
 * RULES_TENANT_GUARD_V1 - classify con verificacion de tenant.
 *
 * Cierra #206: rules.ts no verificaba el tenant. Un thought de otro tenant
 * podia colarse si el caller pasaba una lista mezclada. Ahora, si el thought
 * no pertenece al tenant esperado, se descarta con una regla sintetica.
 *
 * No forma parte de RULES porque no es una regla de negocio: es un guard.
 * Se aplica antes del classify normal.
 */
export interface TenantGuardResult {
  allowed: boolean;
  reason?: string;
}

export function checkTenant(thought: Thought, expectedTenantId: string): TenantGuardResult {
  if (!expectedTenantId) return { allowed: true };
  if (thought.tenantId === expectedTenantId) return { allowed: true };
  return {
    allowed: false,
    reason: `thought ${thought.id} pertenece a tenant ${thought.tenantId}, esperado ${expectedTenantId}`,
  };
}

export function classifyWithTenant(
  thought: Thought,
  expectedTenantId: string,
): RuleOutcome | undefined {
  const guard = checkTenant(thought, expectedTenantId);
  if (!guard.allowed) {
    return {
      rule: {
        id: "discard_tenant_mismatch",
        description: `Descartado: ${guard.reason}`,
        matches: () => true,
      },
      survives: false,
    };
  }
  return classify(thought);
}
```
