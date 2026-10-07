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
- Only files matching these patterns are included: apps/server/src/engine/agents/runtime.ts, apps/server/src/engine/views/resolver.ts, apps/server/src/routes/views.ts, packages/domain/src/views.ts
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
          runtime.ts
        views/
          resolver.ts
      routes/
        views.ts
packages/
  domain/
    src/
      views.ts
```

# Files

## File: packages/domain/src/views.ts
```typescript
// FIX_02_VIEWS_RENAME_V1 - nombres distintos a workspace-spec.ts para no colisionar.
import { z } from "zod";

const kpi = z.object({
  label: z.string().min(1).max(120),
  value: z.union([z.string(), z.number()]),
  delta: z.string().max(60).optional(),
});

const queueItem = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  status: z.enum(["pending", "running", "done", "error"]),
  actions: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        label: z.string().min(1).max(80),
        kind: z.enum(["primary", "default", "danger"]).default("default"),
      }),
    )
    .max(3)
    .default([]),
});

// VIEWSPEC_EXTENDED_V1 - añadidos inbox, board, table, detail y form para
// cubrir los 7 templates que pide docs/TEMPLATES_V2.md. Cada uno con su
// forma especifica y un tope de items para no romper el renderer.
const inboxItem = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  actions: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        label: z.string().min(1).max(80),
        kind: z.enum(["approve", "deny", "open", "edit"]).default("open"),
      }),
    )
    .max(3)
    .default([]),
});

const boardColumn = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  status: z.string().min(1).max(100),
});

const boardCard = z.object({
  id: z.string().min(1).max(200),
  columnId: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional(),
  updatedAt: z.string().max(80).optional(),
});

const tableColumn = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "chip", "action"]).default("text"),
  align: z.enum(["left", "right", "center"]).default("left"),
});

const detailProperty = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  provenance: z.enum(["auto", "alta", "media", "sugerido", "tu", "missing"]).default("auto"),
});

const formField = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "number", "date", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string().max(200)).max(100).optional(),
  value: z.unknown().optional(),
  provenance: z.enum(["auto", "alta", "media", "sugerido", "tu", "missing"]).default("missing"),
});

export const runtimeViewSpecSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("dashboard"),
    title: z.string().min(1).max(300),
    kpis: z.array(kpi).max(6),
  }),
  z.object({
    kind: z.literal("queue"),
    title: z.string().min(1).max(300),
    items: z.array(queueItem).max(50),
  }),
  z.object({
    kind: z.literal("inbox"),
    title: z.string().min(1).max(300),
    items: z.array(inboxItem).max(50),
  }),
  z.object({
    kind: z.literal("board"),
    title: z.string().min(1).max(300),
    entityType: z.string().max(100).optional(),
    columns: z.array(boardColumn).max(10),
    cards: z.array(boardCard).max(200),
  }),
  z.object({
    kind: z.literal("table"),
    title: z.string().min(1).max(300),
    columns: z.array(tableColumn).max(20),
    rows: z.array(z.record(z.string(), z.unknown())).max(200),
  }),
  z.object({
    kind: z.literal("detail"),
    title: z.string().min(1).max(300),
    entityId: z.string().max(200).optional(),
    entityType: z.string().max(100).optional(),
    properties: z.array(detailProperty).max(50),
    relations: z
      .array(
        z.object({
          id: z.string().max(200),
          type: z.string().max(100),
          targetName: z.string().max(300),
        }),
      )
      .max(50)
      .default([]),
  }),
  z.object({
    kind: z.literal("form"),
    title: z.string().min(1).max(300),
    entityType: z.string().max(100),
    fields: z.array(formField).max(50),
    submitLabel: z.string().max(80).default("Guardar"),
  }),
]);

export type RuntimeViewSpec = z.infer<typeof runtimeViewSpecSchema>;
export type ViewKpi = z.infer<typeof kpi>;
export type ViewQueueItem = z.infer<typeof queueItem>;

export function parseRuntimeViewSpec(raw: unknown): RuntimeViewSpec | null {
  const r = runtimeViewSpecSchema.safeParse(raw);
  return r.success ? r.data : null;
}
```

## File: apps/server/src/engine/agents/runtime.ts
```typescript
import { randomUUID } from "node:crypto";
import type { EventBus } from "../events/index.ts";

// AGENT_RUNTIME_V1 — runtime efimero por ejecucion. No se persiste.
// El historial durable vive en el event bus. El runtime solo da identidad
// a cada ejecucion de agente (spawn + complete/fail + destroy).

export interface EphemeralRuntime {
  runtimeId: string;
  // RUNTIME_TENANT_V1
  tenantId: string;
  owner: string;
  roleId: string;
  taskId?: string;
  correlationId: string;
  createdAt: string;
}

export class AgentRuntimeManager {
  private readonly active = new Map<string, EphemeralRuntime>();

  constructor(private readonly bus?: EventBus) {}

  async spawn(input: {
    // RUNTIME_TENANT_V1
    tenantId: string;
    owner: string;
    roleId: string;
    taskId?: string;
    correlationId?: string;
  }): Promise<EphemeralRuntime> {
    const runtime: EphemeralRuntime = {
      runtimeId: randomUUID(),
      tenantId: input.tenantId,
      owner: input.owner,
      roleId: input.roleId,
      ...(input.taskId ? { taskId: input.taskId } : {}),
      correlationId: input.correlationId ?? randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.active.set(runtime.runtimeId, runtime);
    await this.bus?.emit(
      input.owner,
      "agent.runtime_spawned",
      { kind: "agent", id: runtime.runtimeId },
      {
        runtimeId: runtime.runtimeId,
        roleId: runtime.roleId,
        taskId: runtime.taskId ?? "",
      },
      { correlationId: runtime.correlationId },
    );
    return runtime;
  }

  get(runtimeId: string): EphemeralRuntime | undefined {
    return this.active.get(runtimeId);
  }

  async complete(runtimeId: string, durationMs: number): Promise<void> {
    const runtime = this.active.get(runtimeId);
    if (!runtime) return;
    await this.bus?.emit(
      runtime.owner,
      "agent.runtime_completed",
      { kind: "agent", id: runtimeId },
      {
        runtimeId,
        roleId: runtime.roleId,
        taskId: runtime.taskId ?? "",
        durationMs,
      },
      { correlationId: runtime.correlationId },
    );
    this.active.delete(runtimeId);
  }

  async fail(runtimeId: string, error: string): Promise<void> {
    const runtime = this.active.get(runtimeId);
    if (!runtime) return;
    await this.bus?.emit(
      runtime.owner,
      "agent.runtime_failed",
      { kind: "agent", id: runtimeId },
      {
        runtimeId,
        roleId: runtime.roleId,
        taskId: runtime.taskId ?? "",
        error: error.slice(0, 2000),
      },
      { correlationId: runtime.correlationId },
    );
    this.active.delete(runtimeId);
  }

  activeCount(owner: string): number {
    let count = 0;
    for (const runtime of this.active.values()) if (runtime.owner === owner) count += 1;
    return count;
  }

  /** RUNTIME_LIST_V1 - lista runtimes activos por tenant (para admin). */
  listForTenant(tenantId: string): EphemeralRuntime[] {
    const out: EphemeralRuntime[] = [];
    for (const runtime of this.active.values()) {
      if (runtime.tenantId === tenantId) out.push(runtime);
    }
    return out;
  }
}
```

## File: apps/server/src/engine/views/resolver.ts
```typescript
// FIX_02_RESOLVER_V3 - usa RuntimeViewSpec para no colisionar con workspace-spec.
// VIEW_RESOLVER_CLASS_V1 - antes INTENTS era un array global mutable. Dos
// requests concurrentes que llamaran a clearIntents() rompian el resolver
// para todos. Ahora es una clase instanciable; el array vive por instancia.
// La funcion `resolveView` de modulo sigue existiendo por compatibilidad
// con los sitios que ya la importaban, y delega en una instancia singleton.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "@openmuse/domain/views";

export type ViewBuilder = (owner: string) => Promise<unknown>;

interface Intent {
  re: RegExp;
  build: ViewBuilder;
}

export class ViewResolver {
  private readonly intents: Intent[] = [];

  register(re: RegExp, build: ViewBuilder): void {
    this.intents.push({ re, build });
  }

  clear(): void {
    this.intents.length = 0;
  }

  async resolve(owner: string, text: string): Promise<RuntimeViewSpec | null> {
    const t = normalize(text);
    for (const { re, build } of this.intents) {
      if (re.test(t)) {
        return parseRuntimeViewSpec(await build(owner));
      }
    }
    return null;
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Compatibilidad: instancia unica por proceso para el resolver global legacy.
const legacy = new ViewResolver();

export function registerIntent(re: RegExp, build: ViewBuilder): void {
  legacy.register(re, build);
}

export async function resolveView(owner: string, text: string): Promise<RuntimeViewSpec | null> {
  return legacy.resolve(owner, text);
}

export function clearIntents(): void {
  legacy.clear();
}
```

## File: apps/server/src/routes/views.ts
```typescript
// FIX_02_ROUTES_VIEWS_V3 - endpoint resolve real.
import { Hono } from "hono";
import { z } from "zod";
import { resolveView } from "../engine/views/resolver.ts";

export function viewsRoutes() {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.post("/resolve", async (c) => {
    const body = z.object({ intent: z.string().min(1).max(1000) }).parse(await c.req.json());
    const spec = await resolveView(c.get("owner"), body.intent);
    return c.json({ spec });
  });
  return app;
}
```
