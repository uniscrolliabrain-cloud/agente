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
- Only files matching these patterns are included: apps/server/src/engine/agents/personas/**/*
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
        agents/
          personas/
            activity.ts
            bootstrap.ts
            index.ts
            loader.ts
            node.ts
            registry.ts
            resolver.ts
            routes.ts
            stats.ts
            types.ts
```

# Files

## File: apps/server/src/engine/agents/personas/activity.ts
```typescript
// PERSONAS_ACTIVITY_V1 - activity log por persona.
//
// Deriva una lista de entradas legibles desde las tareas del owner.

import type { AgentTask } from "../../../../../../packages/domain/src/agent.ts";
import type { Store } from "../../../db.ts";

export type ActivityKind = "success" | "working" | "failed" | "queued" | "scheduled" | "other";

export interface AgentActivityEntry {
  kind: ActivityKind;
  verb: string;
  subject: string;
  at: string;
  taskId?: string;
  detail?: string;
}

function toEntry(task: AgentTask): AgentActivityEntry {
  switch (task.status) {
    case "succeeded":
      return {
        kind: "success",
        verb: "completo",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
        ...(task.result ? { detail: task.result.slice(0, 200) } : {}),
      };
    case "running":
      return {
        kind: "working",
        verb: "esta trabajando en",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
    case "failed":
      return {
        kind: "failed",
        verb: "fallo",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
        ...(task.error ? { detail: task.error.slice(0, 200) } : {}),
      };
    case "queued":
      return {
        kind: "queued",
        verb: "en cola",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
    case "scheduled":
      return {
        kind: "scheduled",
        verb: "programado",
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
    default:
      return {
        kind: "other",
        verb: `en estado ${task.status}`,
        subject: task.title,
        at: task.updatedAt,
        taskId: task.id,
      };
  }
}

export async function activityForPersona(
  db: Store,
  owner: string,
  personaId: string,
  limit = 20,
): Promise<AgentActivityEntry[]> {
  const all = await db.list<AgentTask>(owner, "tasks", { limit: 500 });
  const mine = all.filter(
    (t) => t.assignedTo === personaId || (t.state && t.state.roleId === personaId),
  );
  mine.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return mine.slice(0, limit).map(toEntry);
}
```

## File: apps/server/src/engine/agents/personas/bootstrap.ts
```typescript
// PERSONAS_BOOTSTRAP_V1 - carga personas desde disco al arrancar.
//
// El bootstrap del server llama a bootstrapPersonas() una vez por tenant
// activo. Carga todos los persona.json + stats.json, los valida, y los
// registra en el PersonaRegistry.
//
// Fail-soft por persona: si una no valida, esa se salta y las demas
// cargan.

import { join } from "node:path";
import type { PersonaRegistry } from "./registry.ts";
import { loadTenantPersonas } from "./loader.ts";

export interface BootstrapResult {
  tenantId: string;
  loaded: number;
  failed: number;
  errors: string[];
}

export async function bootstrapPersonas(
  registry: PersonaRegistry,
  tenantId: string,
  clientsDir: string,
): Promise<BootstrapResult> {
  const tenantDir = join(clientsDir, tenantId, "personas");
  const loaded = await loadTenantPersonas(tenantDir);
  for (const persona of loaded.personas) {
    const stats = loaded.stats[persona.id];
    if (!stats) continue;
    registry.register(tenantId, persona, stats);
  }
  return {
    tenantId,
    loaded: loaded.personas.length,
    failed: loaded.errors.length,
    errors: loaded.errors,
  };
}

export async function bootstrapAllPersonas(
  registry: PersonaRegistry,
  tenants: string[],
  clientsDir: string,
): Promise<BootstrapResult[]> {
  const results: BootstrapResult[] = [];
  for (const tenantId of tenants) {
    results.push(await bootstrapPersonas(registry, tenantId, clientsDir));
  }
  return results;
}
```

## File: apps/server/src/engine/agents/personas/index.ts
```typescript
// PERSONAS_INDEX_V1 - contrato publico del modulo de personas.

export type {
  AgentSkin,
  AgentNode,
  AgentState,
  PersonaBundle,
} from "./types.ts";

// PERSONAS_RUNTIME_V1 - runtime: carga, registro y resolucion.
export { PersonaRegistry } from "./registry.ts";
export { bootstrapPersonas, bootstrapAllPersonas, type BootstrapResult } from "./bootstrap.ts";
export { resolveSkin, resolveAllSkins, defaultState, type ResolveSkinOptions } from "./resolver.ts";
export { loadAgentNode } from "./node.ts";
export {
  loadPersonaFile,
  loadStatsFile,
  listPersonaDirs,
  loadTenantPersonas,
  type LoadedTenant,
} from "./loader.ts";

// PERSONAS_STATS_V1 - calculo de stats desde datos reales.
export { computeStats } from "./stats.ts";

// PERSONAS_ACTIVITY_V1 - activity log por persona.
export {
  activityForPersona,
  type AgentActivityEntry,
  type ActivityKind,
} from "./activity.ts";
```

## File: apps/server/src/engine/agents/personas/loader.ts
```typescript
// PERSONAS_LOADER_V1 - carga AgentPersona desde disco.
//
// Cada persona vive en clientes/<tenant>/personas/<personaId>/persona.json.
// Este modulo:
//   - Lee el archivo.
//   - Parsea JSON.
//   - Valida con agentPersonaSchema.
//   - Devuelve AgentPersona o null (con log si falla).
//
// No conoce el registry ni el bootstrap. Solo lee y valida.

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import {
  agentPersonaSchema,
  agentStatsSchema,
  type AgentPersona,
  type AgentStats,
} from "../../../../../../packages/domain/src/agent-persona.ts";

const PERSONA_FILE = "persona.json";
const STATS_FILE = "stats.json";

/**
 * PERSONA_LOAD_FILE_V1 - lee y valida un persona.json.
 * Devuelve null si el archivo no existe, no es JSON valido, o no pasa el schema.
 */
export async function loadPersonaFile(filePath: string): Promise<AgentPersona | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const result = agentPersonaSchema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[personas/loader] ${filePath} no valida: ${result.error.issues[0]?.message ?? "unknown"}`,
      );
      return null;
    }
    return result.data;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    console.warn(
      `[personas/loader] ${filePath} fallo: ${error instanceof Error ? error.message : "unknown"}`,
    );
    return null;
  }
}

/**
 * PERSONA_LOAD_STATS_V1 - lee y valida un stats.json.
 * Si no existe o no valida, devuelve null (el caller decidira defaults).
 */
export async function loadStatsFile(filePath: string): Promise<AgentStats | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const result = agentStatsSchema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[personas/loader] ${filePath} no valida: ${result.error.issues[0]?.message ?? "unknown"}`,
      );
      return null;
    }
    return result.data;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    console.warn(
      `[personas/loader] ${filePath} fallo: ${error instanceof Error ? error.message : "unknown"}`,
    );
    return null;
  }
}

/**
 * PERSONA_LOAD_DIR_V1 - lista los directorios de personas en un tenant.
 * Devuelve paths absolutos a los subdirectorios que contienen persona.json.
 */
export async function listPersonaDirs(tenantDir: string): Promise<string[]> {
  const dirs: string[] = [];
  let entries: string[];
  try {
    entries = await readdir(tenantDir);
  } catch {
    return [];
  }
  for (const entry of entries) {
    const full = join(tenantDir, entry);
    try {
      const info = await stat(full);
      if (!info.isDirectory()) continue;
      const personaFile = join(full, PERSONA_FILE);
      const personaInfo = await stat(personaFile).catch(() => null);
      if (personaInfo?.isFile()) dirs.push(full);
    } catch {
      continue;
    }
  }
  return dirs;
}

/**
 * PERSONA_LOAD_TENANT_V1 - carga todas las personas de un tenant.
 */
export interface LoadedTenant {
  personas: AgentPersona[];
  stats: Record<string, AgentStats>;
  errors: string[];
}

export async function loadTenantPersonas(tenantDir: string): Promise<LoadedTenant> {
  const dirs = await listPersonaDirs(tenantDir);
  const personas: AgentPersona[] = [];
  const stats: Record<string, AgentStats> = {};
  const errors: string[] = [];
  for (const dir of dirs) {
    const personaFile = join(dir, PERSONA_FILE);
    const persona = await loadPersonaFile(personaFile);
    if (!persona) {
      errors.push(personaFile);
      continue;
    }
    personas.push(persona);
    const statsFile = join(dir, STATS_FILE);
    const loaded = await loadStatsFile(statsFile);
    if (loaded) {
      stats[persona.id] = loaded;
    } else {
      stats[persona.id] = agentStatsSchema.parse({
        archetype: "assistant",
        level: 1,
        status: "idle",
      });
    }
  }
  return { personas, stats, errors };
}
```

## File: apps/server/src/engine/agents/personas/node.ts
```typescript
// PERSONAS_NODE_V1 - carga el grafo cognitivo de una persona.
//
// Cada persona tiene su nodo: turns, thoughts, memoria. Aislado por
// personaId. Por ahora:
//   - turns y thoughts: vacios (el kernel aun no soporta personaId,
//     se activa en Macro E).
//   - memory: lee de AgentMemory filtrando por roleId == personaId.

import type { AgentMemory } from "../../../../../../packages/domain/src/agent.ts";
import type { Store } from "../../../db.ts";
import type { AgentNode, AgentSkin } from "./types.ts";

export async function loadAgentNode(
  db: Store,
  tenantId: string,
  owner: string,
  skin: AgentSkin,
  limit = 500,
): Promise<AgentNode> {
  let memory: AgentMemory[] = [];
  try {
    const all = await db.list<AgentMemory>(owner, "memories", { limit });
    memory = all.filter((m) => !m.roleId || m.roleId === skin.personaId);
  } catch {
    memory = [];
  }

  return {
    personaId: skin.personaId,
    tenantId,
    owner,
    turns: [],
    thoughts: [],
    memory,
  };
}
```

## File: apps/server/src/engine/agents/personas/registry.ts
```typescript
// PERSONAS_REGISTRY_V1 - registro en memoria de personas por tenant.
//
// Estructura:
//   Map<tenantId, Map<personaId, { persona, stats }>>
//
// Es un cache de lectura. Se carga al arrancar el server desde disco
// (bootstrap.ts). Si el owner edita una persona, se recarga (endpoint
// en Macro D).

import type {
  AgentPersona,
  AgentStats,
} from "../../../../../../packages/domain/src/agent-persona.ts";

interface RegisteredPersona {
  persona: AgentPersona;
  stats: AgentStats;
}

export class PersonaRegistry {
  private readonly byTenant = new Map<string, Map<string, RegisteredPersona>>();

  register(tenantId: string, persona: AgentPersona, stats: AgentStats): void {
    let tenantMap = this.byTenant.get(tenantId);
    if (!tenantMap) {
      tenantMap = new Map();
      this.byTenant.set(tenantId, tenantMap);
    }
    tenantMap.set(persona.id, { persona, stats });
  }

  get(tenantId: string, personaId: string): RegisteredPersona | undefined {
    return this.byTenant.get(tenantId)?.get(personaId);
  }

  list(tenantId: string): RegisteredPersona[] {
    const tenantMap = this.byTenant.get(tenantId);
    if (!tenantMap) return [];
    return [...tenantMap.values()];
  }

  has(tenantId: string, personaId: string): boolean {
    return this.byTenant.get(tenantId)?.has(personaId) ?? false;
  }

  updateStats(tenantId: string, personaId: string, stats: AgentStats): boolean {
    const entry = this.byTenant.get(tenantId)?.get(personaId);
    if (!entry) return false;
    entry.stats = stats;
    return true;
  }

  clear(): void {
    this.byTenant.clear();
  }

  clearTenant(tenantId: string): void {
    this.byTenant.delete(tenantId);
  }
}
```

## File: apps/server/src/engine/agents/personas/resolver.ts
```typescript
// PERSONAS_RESOLVER_V1 - compone AgentSkin desde el registry.
//
// Una persona registrada es estatica (persona.json + stats.json). Un
// AgentSkin es dinamico: se compone al abrir un turno y se descarta al
// cerrarlo.
//
// PERSONAS_RESOLVER_REFRESH_STATS_V1 - si options.refreshStats es true,
// el resolver recalcula los stats desde las tareas antes de devolver el
// skin. Por defecto false (performance).

import type { PersonaRegistry } from "./registry.ts";
import type { AgentSkin, AgentState } from "./types.ts";
import type { Store } from "../../../db.ts";
import { computeStats } from "./stats.ts";

export function defaultState(): AgentState {
  return {
    mood: "neutral",
    focus: [],
    activeLanes: [],
  };
}

export interface ResolveSkinOptions {
  stateOverride?: Partial<AgentState>;
  /** Si true, recalcula stats desde las tareas. */
  refreshStats?: boolean;
  /** Store para refreshStats. Obligatorio si refreshStats=true. */
  db?: Store;
  /** Owner de las tareas. */
  owner?: string;
}

export async function resolveSkin(
  registry: PersonaRegistry,
  tenantId: string,
  personaId: string,
  options: ResolveSkinOptions = {},
): Promise<AgentSkin | null> {
  const entry = registry.get(tenantId, personaId);
  if (!entry) return null;

  let stats = entry.stats;
  if (options.refreshStats && options.db && options.owner) {
    try {
      stats = await computeStats(
        options.db,
        options.owner,
        personaId,
        entry.stats.archetype,
      );
      registry.updateStats(tenantId, personaId, stats);
    } catch {
      // Si falla el recalculo, usamos la ultima snapshot conocida.
    }
  }

  const state: AgentState = {
    ...defaultState(),
    ...(options.stateOverride ?? {}),
  };

  return {
    personaId: entry.persona.id,
    persona: entry.persona,
    stats,
    state,
    nodeId: entry.persona.id,
  };
}

export function resolveAllSkins(
  registry: PersonaRegistry,
  tenantId: string,
): AgentSkin[] {
  const list = registry.list(tenantId);
  return list.map((entry) => ({
    personaId: entry.persona.id,
    persona: entry.persona,
    stats: entry.stats,
    state: defaultState(),
    nodeId: entry.persona.id,
  }));
}
```

## File: apps/server/src/engine/agents/personas/routes.ts
```typescript
// PERSONAS_ROUTES_V1 - endpoints HTTP de personas.
//
//   GET /api/agent-personas             -> lista de personas del tenant
//   GET /api/agent-personas/:id         -> detalle con stats + activity
//   GET /api/agent-personas/:id/activity -> solo activity
//
// El owner viene del middleware de auth de app.ts (c.set("owner")).
// El tenant se resuelve con el TenantService.

import { Hono } from "hono";
import { AppError } from "../../../errors.ts";
import type { PersonaRegistry } from "./registry.ts";
import { resolveAllSkins, resolveSkin } from "./resolver.ts";
import { activityForPersona } from "./activity.ts";
import type { Store } from "../../../db.ts";
import type { TenantService } from "../../tenant.ts";

export interface PersonaRoutesDeps {
  registry: PersonaRegistry;
  db: Store;
  tenantService?: TenantService;
}

export function personasRoutes(deps: PersonaRoutesDeps) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const tenantIdFor = async (owner: string): Promise<string> => {
    if (!deps.tenantService) return "default";
    try {
      return await deps.tenantService.tenantIdFor(owner);
    } catch {
      return "default";
    }
  };

  // GET /api/agent-personas
  app.get("/", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const skins = resolveAllSkins(deps.registry, tenantId);
    return c.json({
      tenantId,
      total: skins.length,
      personas: skins.map((skin) => ({
        personaId: skin.personaId,
        displayName: skin.persona.displayName,
        role: skin.persona.role,
        archetype: skin.persona.personality.tone,
        stats: skin.stats,
        avatar: skin.persona.avatar ?? null,
        reportsTo: skin.persona.reportsTo ?? null,
        peers: skin.persona.peers,
      })),
    });
  });

  // GET /api/agent-personas/:id
  app.get("/:id", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const personaId = c.req.param("id");
    const skin = await resolveSkin(deps.registry, tenantId, personaId, {
      refreshStats: true,
      db: deps.db,
      owner,
    });
    if (!skin) {
      throw new AppError(`Persona not found: ${personaId}`, 404);
    }
    const activity = await activityForPersona(deps.db, owner, personaId, 20);
    return c.json({
      tenantId,
      persona: {
        id: skin.persona.id,
        displayName: skin.persona.displayName,
        role: skin.persona.role,
        age: skin.persona.age ?? null,
        gender: skin.persona.gender ?? null,
        personality: skin.persona.personality,
        capabilities: skin.persona.capabilities,
        values: skin.persona.values,
        peers: skin.persona.peers,
        reportsTo: skin.persona.reportsTo ?? null,
        avatar: skin.persona.avatar ?? null,
        language: skin.persona.language,
      },
      stats: skin.stats,
      state: skin.state,
      activity,
    });
  });

  // GET /api/agent-personas/:id/activity
  app.get("/:id/activity", async (c) => {
    const owner = c.get("owner");
    const personaId = c.req.param("id");
    const limitRaw = c.req.query("limit");
    const limit = limitRaw ? Number(limitRaw) : 20;
    if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
      throw new AppError("limit must be between 1 and 200", 422);
    }
    const activity = await activityForPersona(deps.db, owner, personaId, limit);
    return c.json({ personaId, total: activity.length, activity });
  });

  return app;
}
```

## File: apps/server/src/engine/agents/personas/stats.ts
```typescript
// PERSONAS_STATS_V1 - calculo de stats de una persona desde datos reales.
//
// Los stats que declara stats.json son el "estado inicial" de la persona.
// computeStats() los recalcula desde las tareas del owner.

import type {
  AgentStats,
  AgentStatus,
} from "../../../../../../packages/domain/src/agent-persona.ts";
import type { AgentTask } from "../../../../../../packages/domain/src/agent.ts";
import type { Store } from "../../../db.ts";

const MIN_TASKS_FOR_PRECISION = 5;
const LEVEL_TASKS_PER_LEVEL = 20;

function deriveLevel(totalTasks: number): number {
  if (totalTasks === 0) return 1;
  const level = Math.floor(Math.log2(totalTasks / LEVEL_TASKS_PER_LEVEL + 1) * 3 + 1);
  return Math.max(1, Math.min(99, level));
}

function deriveStatus(tasks: AgentTask[]): AgentStatus {
  if (tasks.length === 0) return "offline";
  const running = tasks.filter((t) => t.status === "running");
  if (running.length > 0) return "working";
  const queued = tasks.filter((t) => t.status === "queued");
  if (queued.length > 0) return "online";
  const scheduled = tasks.filter(
    (t) =>
      t.status === "scheduled" ||
      t.status === "waiting_input" ||
      t.status === "waiting_approval",
  );
  if (scheduled.length > 0) return "standby";
  return "idle";
}

function deriveCurrentTask(tasks: AgentTask[]): string | undefined {
  const running = tasks.find((t) => t.status === "running");
  return running?.title;
}

function computeAvgTimeMs(tasks: AgentTask[]): number {
  const terminal = tasks.filter(
    (t) => t.status === "succeeded" || t.status === "failed" || t.status === "cancelled",
  );
  if (terminal.length === 0) return 0;
  let total = 0;
  let count = 0;
  for (const t of terminal) {
    const start = Date.parse(t.createdAt);
    const end = Date.parse(t.updatedAt);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) continue;
    total += end - start;
    count += 1;
  }
  return count === 0 ? 0 : Math.floor(total / count);
}

function computePrecision(tasks: AgentTask[]): number {
  const terminal = tasks.filter(
    (t) => t.status === "succeeded" || t.status === "failed" || t.status === "cancelled",
  );
  if (terminal.length < MIN_TASKS_FOR_PRECISION) return 0;
  const succeeded = terminal.filter((t) => t.status === "succeeded").length;
  return succeeded / terminal.length;
}

export async function computeStats(
  db: Store,
  owner: string,
  personaId: string,
  archetype: AgentStats["archetype"],
  limit = 500,
): Promise<AgentStats> {
  const all = await db.list<AgentTask>(owner, "tasks", { limit });
  const mine = all.filter(
    (t) => t.assignedTo === personaId || (t.state && t.state.roleId === personaId),
  );
  const terminal = mine.filter(
    (t) => t.status === "succeeded" || t.status === "failed" || t.status === "cancelled",
  );
  const succeeded = terminal.filter((t) => t.status === "succeeded").length;
  const status = deriveStatus(mine);
  const currentTask = deriveCurrentTask(mine);

  return {
    level: deriveLevel(succeeded),
    archetype,
    totalTasks: succeeded,
    precision: computePrecision(mine),
    avgTimeMs: computeAvgTimeMs(mine),
    uptime: 1.0,
    status,
    ...(currentTask ? { currentTask } : {}),
  };
}
```

## File: apps/server/src/engine/agents/personas/types.ts
```typescript
// PERSONAS_TYPES_V1 - tipos del modulo de personas (runtime).
//
// Estos tipos NO son schemas (esos viven en packages/domain). Son el
// ensamblado runtime: que produce el sistema cuando una persona entra
// en un turno (AgentSkin) y donde vive su grafo cognitivo (AgentNode).
//
// Ver: docs/audits/09-kernel-cognitivo/09z-personas.md (a crear)

import type {
  AgentPersona,
  AgentStats,
} from "../../../../../../packages/domain/src/agent-persona.ts";
import type { AgentMemory } from "../../../../../../packages/domain/src/agent.ts";
import type { Thought } from "../../../kernel/graph/thought.ts";
import type { Turn } from "../../../kernel/graph/turn.ts";

/**
 * AGENT_STATE_V1 - estado runtime de una persona.
 * Es lo que el kernel ensambla antes de abrir un turno y lo que actualiza
 * al cerrarlo. Vive en memoria durante la peticion, se persiste al cerrar.
 */
export interface AgentState {
  mood: "neutral" | "good" | "tired" | "focused" | "distracted";
  focus: string[];
  activeLanes: string[];
}

/**
 * AGENT_SKIN_V1 - ensamblado de la persona para un turno concreto.
 *
 * Una AgentPersona es estatica (vive en JSON). Un AgentSkin es dinamico
 * (se compone al abrir el chat): toma la persona, sus stats, su estado
 * actual, y produce el contexto que el LLM necesita para hablar como ella.
 *
 * No se persiste. Se compone y se descarta al cerrar el turno.
 */
export interface AgentSkin {
  personaId: string;
  persona: AgentPersona;
  stats: AgentStats;
  state: AgentState;
  nodeId: string;
}

/**
 * AGENT_NODE_V1 - grafo cognitivo de una persona.
 *
 * Cada persona tiene su propio nodo: sus Turns, sus Thoughts, su memoria.
 * Aislado de otros nodos por personaId. El kernel escribe aqui cuando la
 * persona esta activa.
 *
 * No se cachea entero (puede tener miles de thoughts). Se consulta por
 * partes: turns recientes, thoughts de un turno, memoria por categoria.
 */
export interface AgentNode {
  personaId: string;
  tenantId: string;
  owner: string;
  turns: Turn[];
  thoughts: Thought[];
  memory: AgentMemory[];
  lastActivityAt?: string;
}

/**
 * PERSONA_BUNDLE_V1 - bundle declarativo de personas de un tenant.
 *
 * Se carga al arrancar el server desde clientes/<tenant>/personas/*.json.
 * Se valida contra agentPersonaSchema. Si algun JSON no valida, ese
 * persona no se carga (fail-soft por persona, fail-closed por tenant si
 * todas fallan).
 */
export interface PersonaBundle {
  personas: AgentPersona[];
  stats: Record<string, AgentStats>;
}
```
