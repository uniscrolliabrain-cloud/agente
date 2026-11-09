// LEADS_ROUTES_V2 (campana 17) - Places devuelve candidatos; una ficha entra
// en el pipeline solo cuando un comercial la acepta.
//
// Antes cada busqueda persistia los 20 negocios como leads: el pipeline se
// llenaba de ruido y repetir la busqueda devolvia "existing". Ahora la busqueda
// es de solo lectura, la aceptacion es idempotente por empresa y la ficha vive
// en un pipeline compartido por los comerciales de esa empresa.
import { Hono } from "hono";
import { z } from "zod";
import {
  GoogleMapsClient,
  type PlaceSearchInput,
} from "../../../packages/integrations/src/google-maps.ts";
import { AppError } from "./errors.ts";
import { TenantScopedStore } from "./db-tenant.ts";
import { LeadsService, leadAcceptInput } from "./engine/leads.ts";
import { currentTenantScope, runInTenantScope } from "./tenant-scope.ts";
import type { AgentService } from "./engine/service.ts";

const discoverInput = z
  .object({
    query: z.string().trim().min(3).max(500),
    limit: z.number().int().min(1).max(20).optional(),
    region: z.string().trim().length(2).optional(),
  })
  .strict();

export function leadsRoutes(
  service: Pick<AgentService, "db" | "config" | "tenantService">,
  deps: { maps?: () => GoogleMapsClient } = {},
) {
  const app = new Hono<{ Variables: { owner: string; tenantId: string } }>();

  app.use("*", async (c, next) => {
    const owner = c.get("owner");
    if (!owner) throw new AppError("Sesion requerida", 401);
    if (!(service.db instanceof TenantScopedStore)) {
      throw new AppError("Leads requiere almacenamiento aislado por empresa", 503);
    }
    const scope = currentTenantScope();
    let tenantId = scope?.tenantId;
    if (scope && scope.actorId !== owner) throw new AppError("Actor no valido", 403);
    if (!tenantId) {
      const memberships = (await service.tenantService?.membershipsFor(owner)) ?? [];
      const tenants = [...new Set(memberships.map((row) => row.tenantId))];
      if (tenants.length !== 1) throw new AppError("Selecciona una empresa autorizada", 409);
      tenantId = tenants[0];
    }
    c.set("tenantId", tenantId);
    await runInTenantScope({ tenantId, actorId: owner }, next);
  });

  const maps = deps.maps ?? (() => new GoogleMapsClient({ apiKey: process.env.GOOGLE_MAPS_API_KEY }));
  const leads = () => new LeadsService(service.db as TenantScopedStore, maps());

  app.get("/", async (c) => {
    const rows = await leads().list(c.get("tenantId"));
    return c.json({ leads: rows });
  });

  // Contrato previo conservado: `found`, `created`, `existing` y `leads`
  // siguen ahi. `created` es 0 porque buscar ya no escribe, y los resultados
  // transitorios viajan en `candidates` hasta que alguien los acepta.
  app.post("/discover", async (c) => {
    const body = discoverInput.parse(await c.req.json());
    const result = await leads().discover(c.get("tenantId"), body as PlaceSearchInput);
    return c.json({
      found: result.found,
      created: 0,
      existing: result.accepted,
      leads: [],
      candidates: result.candidates,
    });
  });

  app.post("/accept", async (c) => {
    const owner = c.get("owner");
    const body = leadAcceptInput.parse(await c.req.json());
    const result = await leads().accept(owner, c.get("tenantId"), body);
    return c.json(result, result.created ? 201 : 200);
  });

  return app;
}
