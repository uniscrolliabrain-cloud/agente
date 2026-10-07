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