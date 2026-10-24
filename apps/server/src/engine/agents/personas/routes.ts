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

// PERSONA_ROUTES_KERNEL_V1 - kernel para leer turns/thoughts de la persona.
export interface PersonaRoutesDeps {
  registry: PersonaRegistry;
  db: Store;
  kernel?: import("../../../kernel/index.ts").Kernel;
  tenantService?: TenantService;
  authz?: { pdp: { can: (...args: unknown[]) => Promise<"allow" | "deny"> }; fieldFilter: { filter: (...args: unknown[]) => Promise<unknown> } };
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
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
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
        // PERSONAS_ARCHETYPE_FIX_V1 - devuelve el arquetipo real (stats), no el tono.
        archetype: skin.stats.archetype,
        stats: skin.stats,
        avatar: skin.persona.avatar ?? null,
        reportsTo: skin.persona.reportsTo ?? null,
        peers: skin.persona.peers,
      })),
    });
  });

  // GET /api/agent-personas/:id
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
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

  // PERSONAS_ALL_NODES_V1 - informe agregado de todos los agentes del tenant.
  // Laia (supervisora) puede pedir turnos + thoughts + memory de los 12 de golpe.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/all/nodes", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    if (!deps.kernel) {
      return c.json({ tenantId, total: 0, nodes: [], note: "kernel not wired" });
    }
    const { loadAgentNode } = await import("./node.ts");
    const skins = resolveAllSkins(deps.registry, tenantId);
    const nodes = [];
    for (const skin of skins) {
      if (skin.personaId === "laia") continue;
      try {
        const node = await loadAgentNode(deps.db, deps.kernel, tenantId, owner, skin, 50);
        nodes.push(node);
      } catch {
        nodes.push({ personaId: skin.personaId, tenantId, owner, turns: [], thoughts: [], memory: [] });
      }
    }
    return c.json({ tenantId, total: nodes.length, nodes });
  });

  // PERSONAS_REFRESH_STATS_LOG_V1
  // PERSONAS_STATS_REFRESH_BUTTON_V1 - recalcula stats de todas las personas.
  // WITH_WRITE_WIRE_V1 - withWrite aplica PDP + CAS
  app.post("/refresh-stats", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const skins = resolveAllSkins(deps.registry, tenantId);
    let refreshed = 0;
    const errors: string[] = [];
    for (const skin of skins) {
      try {
        await resolveSkin(deps.registry, tenantId, skin.personaId, {
          refreshStats: true,
          db: deps.db,
          owner,
        });
        refreshed += 1;
      } catch (err) {
        errors.push(`${skin.personaId}: ${err instanceof Error ? err.message : "unknown"}`);
      }
    }
    return c.json({ tenantId, refreshed, errors });
  });

  // PERSONAS_ATTENTION_V1 - atencion agregada de una persona.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id/attention", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const personaId = c.req.param("id");
    const skin = await resolveSkin(deps.registry, tenantId, personaId);
    if (!skin) throw new AppError(`Persona not found: ${personaId}`, 404);
    if (!deps.kernel) {
      return c.json({ personaId, tenantId, attention: null, note: "kernel not wired" });
    }
    const ctx: import("../../../kernel/context/kernel-context.ts").KernelContext = {
      tenantId,
      owner,
      role: "system",
      requestId: `attention:${personaId}:${Date.now()}`,
      personaId,
    };
    // PERSONAS_ATTENTION_ENDPOINT_WIRE_V1
    const attention = await deps.kernel.attentionOfPersona(ctx, personaId);
    return c.json({ personaId, tenantId, attention });
  });

  // PERSONAS_ATTENTION_PAIRS_ENDPOINT_V1
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:a/attention-pairs/:b", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const a = c.req.param("a");
    const b = c.req.param("b");
    if (!deps.kernel) return c.json({ a, b, pairs: null, note: "kernel not wired" });
    const ctx: import("../../../kernel/context/kernel-context.ts").KernelContext = {
      tenantId,
      owner,
      role: "system",
      requestId: `attention-pairs:${a}:${b}:${Date.now()}`,
    };
    const pairs = await deps.kernel.attentionPairs(ctx, a, b);
    return c.json({ a, b, pairs });
  });

  // PERSONA_ROUTES_NODE_V1 - turns + thoughts de la persona.
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
  app.get("/:id/node", async (c) => {
    const owner = c.get("owner");
    const tenantId = await tenantIdFor(owner);
    const personaId = c.req.param("id");
    const skin = await resolveSkin(deps.registry, tenantId, personaId);
    if (!skin) throw new AppError(`Persona not found: ${personaId}`, 404);
    if (!deps.kernel) {
      return c.json({ personaId, tenantId, owner, turns: [], thoughts: [], memory: [], note: "kernel not wired" }); // NODE_FALLBACK_OWNER_V1
    }
    const { loadAgentNode } = await import("./node.ts");
    const node = await loadAgentNode(deps.db, deps.kernel, tenantId, owner, skin);
    return c.json(node);
  });

  // PERSONAS_ACTIVITY_LIMIT_V1
  // GET /api/agent-personas/:id/activity
  // WITH_READ_WIRE_V1 - withRead aplica PDP + FieldFilter
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