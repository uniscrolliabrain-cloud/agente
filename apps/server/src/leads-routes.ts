// LEADS_ROUTES_V1 - descubrimiento de negocios locales para la agencia.
//
// El bootstrap del vertical ya declaraba el tipo `lead`, pero no habia forma de
// poblarlo: los leads se copiaban a mano. Esto busca en Google Places y guarda
// cada negocio bajo el owner y su empresa, deduplicando por `placeId` (el unico
// id estable que da Google). Repetir la misma busqueda no duplica filas.
import { Hono } from "hono";
import { z } from "zod";
import { GoogleMapsClient } from "../../../packages/integrations/src/google-maps.ts";
import { AppError } from "./errors.ts";
import { TenantScopedStore } from "./db-tenant.ts";
import { currentTenantScope, runInTenantScope } from "./tenant-scope.ts";
import type { AgentService } from "./engine/service.ts";

const KIND = "leads";

const leadSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  owner: z.string().min(1),
  name: z.string().min(1),
  address: z.string().default(""),
  phone: z.string().optional(),
  website: z.string().optional(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  mapsUrl: z.string().optional(),
  status: z.string().default("new"),
  source: z.literal("google_places"),
  query: z.string().min(1),
  discoveredAt: z.string(),
});
type Lead = z.infer<typeof leadSchema>;

const discoverInput = z
  .object({
    query: z.string().trim().min(3).max(500),
    limit: z.number().int().min(1).max(20).optional(),
    region: z.string().trim().length(2).optional(),
  })
  .strict();

export function leadsRoutes(service: Pick<AgentService, "db" | "config" | "tenantService">) {
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

  const client = () => new GoogleMapsClient({ apiKey: process.env.GOOGLE_MAPS_API_KEY });

  app.get("/", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId");
    const rows = await service.db.list<Lead>(owner, KIND, { limit: 200 });
    return c.json({ leads: rows.filter((row) => row.tenantId === tenantId) });
  });

  app.post("/discover", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId");
    const body = discoverInput.parse(await c.req.json());
    const found = await client().searchLeads(body);

    const now = new Date().toISOString();
    const created: Lead[] = [];
    const existing: Lead[] = [];
    for (const place of found) {
      const lead: Lead = leadSchema.parse({
        ...place,
        id: place.placeId,
        tenantId,
        owner,
        status: "new",
        source: "google_places",
        query: body.query,
        discoveredAt: now,
      });
      // insertIfAbsent es el dedupe: la segunda busqueda devuelve la fila previa.
      const inserted = await service.db.insertIfAbsent(owner, KIND, lead);
      if (inserted) created.push(lead);
      else {
        const previous = await service.db.get<Lead>(owner, KIND, lead.id);
        if (previous && previous.tenantId !== tenantId) {
          throw new AppError("Lead de otra empresa", 403);
        }
        if (previous) existing.push(previous);
      }
    }
    return c.json(
      { found: found.length, created: created.length, existing: existing.length, leads: created },
      created.length > 0 ? 201 : 200,
    );
  });

  return app;
}
