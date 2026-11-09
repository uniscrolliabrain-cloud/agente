// VERTICAL_SLICE_LEADS_TEST_V1 - Places, seleccion y ficha compartida (campana 17).
//
// Cierre de campana:
//   - buscar devuelve candidatos transitorios y no modifica el pipeline;
//   - dos comerciales de A aceptan la misma ficha sin duplicarla ni pisar notas;
//   - B acepta su propia ficha y no ve la de A;
//   - el dominio es una senal, no la clave de unicidad;
//   - las filas legacy se migran conservando notas y origen acreditado;
//   - las rutas HTTP mantienen el contrato y la aceptacion es idempotente.

import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { Hono } from "hono";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { LeadsService, leadRef } from "../apps/server/src/engine/leads.ts";
import { leadsRoutes } from "../apps/server/src/leads-routes.ts";
import { currentTenantScope, runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import {
  type GoogleMapsClient,
  type PlaceLead,
  type PlaceSearchInput,
} from "../packages/integrations/src/google-maps.ts";
import { testConfig } from "./helpers/config.ts";

const A = { tenantId: "agencia-a", actorId: "fundador-a" };
const A2 = { tenantId: "agencia-a", actorId: "comercial-a2" };
const B = { tenantId: "agencia-b", actorId: "fundador-b" };

const CAFE: PlaceLead = {
  placeId: "place-cafe",
  name: "Cafe Norte",
  address: "Calle 1, 3",
  phone: "+34600000000",
  website: "https://cafenorte.example",
  rating: 4.5,
  reviews: 120,
  mapsUrl: "https://maps.google.com/?cid=1",
  businessStatus: "OPERATIONAL",
};

const PAN: PlaceLead = {
  placeId: "place-pan",
  name: "Pan Sur",
  address: "Calle 1, 5",
  website: "https://www.cafenorte.example/menu",
  rating: 4.1,
  reviews: 22,
  mapsUrl: "https://maps.google.com/?cid=2",
  businessStatus: "OPERATIONAL",
};

async function harness(t: TestContext) {
  const db: Store = await createStore();
  t.after(() => db.close());
  const tdb = new TenantScopedStore(db, async () => currentTenantScope()?.tenantId ?? "default");
  return { tdb };
}

function fakeMaps(places: PlaceLead[]) {
  const calls: PlaceSearchInput[] = [];
  const client = {
    searchLeads: async (input: PlaceSearchInput) => {
      calls.push(input);
      return places;
    },
  } as unknown as GoogleMapsClient;
  return { calls, client };
}

test("buscar devuelve candidatos y no escribe el pipeline", async (t) => {
  const { tdb } = await harness(t);
  const maps = fakeMaps([CAFE, PAN]);
  const leads = new LeadsService(tdb, maps.client);

  const first = await runInTenantScope(A, () => leads.discover("agencia-a", { query: "cafeterias" }));
  assert.equal(first.found, 2);
  assert.equal(first.accepted, 0);
  assert.deepEqual(
    first.candidates.map((candidate) => candidate.ref),
    [leadRef("agencia-a", "place-cafe"), leadRef("agencia-a", "place-pan")],
  );
  assert.ok(first.candidates.every((candidate) => !candidate.accepted));
  assert.equal(first.candidates[0].domain, "cafenorte.example");
  assert.equal(first.candidates[0].businessStatus, "OPERATIONAL");
  assert.equal((await runInTenantScope(A, () => tdb.list("pipeline", "leads"))).length, 0);

  await runInTenantScope(A, () => leads.discover("agencia-a", { query: "cafeterias" }));
  assert.equal(
    (await runInTenantScope(A, () => tdb.list("pipeline", "leads"))).length,
    0,
    "repetir la busqueda tampoco escribe",
  );
});

test("dos comerciales de A aceptan la misma ficha sin duplicarla ni pisar notas", async (t) => {
  const { tdb } = await harness(t);
  const leads = new LeadsService(tdb, fakeMaps([CAFE]).client);

  const first = await runInTenantScope(A, () =>
    leads.accept("fundador-a", "agencia-a", { ...CAFE, query: "cafeterias", notes: "llamar el martes" }),
  );
  assert.equal(first.created, true);
  assert.deepEqual(first.lead.acceptedBy, ["fundador-a"]);
  assert.equal(first.lead.notes, "llamar el martes");
  assert.deepEqual(first.lead.source, {
    provider: "google_places",
    placeId: "place-cafe",
    query: "cafeterias",
    discoveredAt: first.lead.source.discoveredAt,
  });

  const second = await runInTenantScope(A2, () =>
    leads.accept("comercial-a2", "agencia-a", { ...CAFE, notes: "texto que no debe pisar" }),
  );
  assert.equal(second.created, false);
  assert.equal(second.lead.ref, first.lead.ref);
  assert.equal(second.lead.tenantId, "agencia-a");
  assert.deepEqual(second.lead.acceptedBy, ["fundador-a", "comercial-a2"]);
  assert.equal(second.lead.notes, "llamar el martes");
  assert.equal((await runInTenantScope(A, () => tdb.list("pipeline", "leads"))).length, 1);
});

test("B acepta su propia ficha y no ve la de A", async (t) => {
  const { tdb } = await harness(t);
  const leads = new LeadsService(tdb, fakeMaps([CAFE]).client);

  const fromA = await runInTenantScope(A, () => leads.accept("fundador-a", "agencia-a", { ...CAFE }));
  const fromB = await runInTenantScope(B, () => leads.accept("fundador-b", "agencia-b", { ...CAFE }));
  assert.equal(fromB.created, true);
  assert.notEqual(fromB.lead.ref, fromA.lead.ref, "la referencia es por empresa");
  assert.equal(fromB.lead.tenantId, "agencia-b");
  assert.deepEqual(fromB.lead.acceptedBy, ["fundador-b"]);

  const listA = await runInTenantScope(A, () => leads.list("agencia-a"));
  const listB = await runInTenantScope(B, () => leads.list("agencia-b"));
  assert.deepEqual(listA.map((ficha) => ficha.tenantId), ["agencia-a"]);
  assert.deepEqual(listB.map((ficha) => ficha.tenantId), ["agencia-b"]);
  assert.ok(listA.every((ficha) => ficha.ref !== fromB.lead.ref));
  assert.ok(listB.every((ficha) => ficha.ref !== fromA.lead.ref));
});

test("el dominio es una senal y no la clave de unicidad", async (t) => {
  const { tdb } = await harness(t);
  const leads = new LeadsService(tdb, fakeMaps([CAFE, PAN]).client);

  const cafe = await runInTenantScope(A, () => leads.accept("fundador-a", "agencia-a", { ...CAFE }));
  const pan = await runInTenantScope(A, () => leads.accept("fundador-a", "agencia-a", { ...PAN }));
  assert.equal(pan.created, true, "otra ficha del mismo dominio sigue siendo otra ficha");
  assert.notEqual(pan.lead.ref, cafe.lead.ref);
  assert.equal(cafe.lead.domain, "cafenorte.example");
  assert.equal(pan.lead.domain, "cafenorte.example");
  assert.equal((await runInTenantScope(A, () => leads.list("agencia-a"))).length, 2);
});

test("la fila legacy se migra con notas y origen acreditado", async (t) => {
  const { tdb } = await harness(t);
  const leads = new LeadsService(tdb, fakeMaps([CAFE]).client);
  await runInTenantScope(A, () =>
    tdb.put("fundador-a", "leads", {
      id: "place-cafe",
      tenantId: "agencia-a",
      owner: "fundador-a",
      name: "Cafe Norte",
      address: "Calle 1, 3",
      website: "https://cafenorte.example",
      status: "new",
      source: "google_places",
      query: "cafeterias",
      discoveredAt: "2026-09-01T10:00:00.000Z",
      notes: "hablar con Marta",
    }),
  );

  const listed = await runInTenantScope(A, () => leads.list("agencia-a"));
  assert.equal(listed.length, 1);
  assert.equal(listed[0].ref, leadRef("agencia-a", "place-cafe"));
  assert.equal(listed[0].status, "accepted");
  assert.equal(listed[0].notes, "hablar con Marta");
  assert.deepEqual(listed[0].source, {
    provider: "google_places",
    placeId: "place-cafe",
    query: "cafeterias",
    discoveredAt: "2026-09-01T10:00:00.000Z",
  });

  const accepted = await runInTenantScope(A, () => leads.accept("fundador-a", "agencia-a", { ...CAFE }));
  assert.equal(accepted.created, true);
  assert.equal(accepted.lead.notes, "hablar con Marta");
  assert.equal(
    await runInTenantScope(A, () => tdb.get("fundador-a", "leads", "place-cafe")),
    null,
    "la fila legacy se retira solo despues de escribir la ficha",
  );
  assert.equal((await runInTenantScope(A, () => tdb.list("pipeline", "leads"))).length, 1);
});

test("las rutas descubren sin escribir y aceptan de forma idempotente", async (t) => {
  const { tdb } = await harness(t);
  const maps = fakeMaps([CAFE]);
  const app = new Hono<{ Variables: { owner: string } }>();
  app.use("*", async (c, next) => {
    c.set("owner", c.req.header("x-owner") ?? "");
    await next();
  });
  app.route(
    "/api/leads",
    leadsRoutes({ db: tdb, config: testConfig({}), tenantService: undefined } as unknown as Parameters<
      typeof leadsRoutes
    >[0], { maps: () => maps.client }),
  );
  const post = (path: string, body: unknown, owner: string) =>
    app.request(`/api/leads${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-owner": owner },
      body: JSON.stringify(body),
    });

  const discovered = await runInTenantScope(A, () => post("/discover", { query: "cafeterias" }, "fundador-a"));
  assert.equal(discovered.status, 200);
  const payload = (await discovered.json()) as {
    found: number;
    created: number;
    existing: number;
    leads: unknown[];
    candidates: Array<{ ref: string; accepted: boolean }>;
  };
  assert.equal(payload.found, 1);
  assert.equal(payload.created, 0);
  assert.equal(payload.existing, 0);
  assert.deepEqual(payload.leads, []);
  assert.equal(payload.candidates[0].accepted, false);

  const empty = await runInTenantScope(A, () =>
    app.request("/api/leads", { headers: { "x-owner": "fundador-a" } }),
  );
  assert.deepEqual(((await empty.json()) as { leads: unknown[] }).leads, []);

  const created = await runInTenantScope(A, () =>
    post("/accept", { ...CAFE, query: "cafeterias" }, "fundador-a"),
  );
  assert.equal(created.status, 201);
  const createdBody = (await created.json()) as { created: boolean; lead: { ref: string } };
  assert.equal(createdBody.created, true);

  const again = await runInTenantScope(A2, () => post("/accept", { ...CAFE }, "comercial-a2"));
  assert.equal(again.status, 200);
  const againBody = (await again.json()) as { created: boolean; lead: { ref: string; acceptedBy: string[] } };
  assert.equal(againBody.created, false);
  assert.equal(againBody.lead.ref, createdBody.lead.ref);
  assert.deepEqual(againBody.lead.acceptedBy, ["fundador-a", "comercial-a2"]);

  const listed = await runInTenantScope(A, () =>
    app.request("/api/leads", { headers: { "x-owner": "fundador-a" } }),
  );
  assert.equal(((await listed.json()) as { leads: unknown[] }).leads.length, 1);
});
