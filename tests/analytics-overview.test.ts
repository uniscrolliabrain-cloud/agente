// E19 - /api/analytics/overview agrega el tenant del contexto: importes
// sumados de amountEur, conteos por estado y cero filas de otro tenant.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { Hono } from "hono";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { analyticsRoutes } from "../apps/server/src/routes/analytics.ts";

type Variables = { owner: string; tenantId?: string; ctx?: { tenantId?: string } };

const ACME = "acme";
const ADMIN = "acme-admin";
const AHORA = new Date().toISOString();

let directory: string;
let db: Store;
let scoped: TenantScopedStore;

function app(tenant: string | null) {
  const hono = new Hono<{ Variables: Variables }>();
  hono.use("*", async (c, next) => {
    c.set("owner", "acme-carlos");
    if (tenant) c.set("ctx", { tenantId: tenant });
    await next();
  });
  hono.route("/api/analytics", analyticsRoutes({ db: scoped }));
  return hono;
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-analytics-"));
  db = await createStore({ dataDir: join(directory, "db") });
  scoped = new TenantScopedStore(db, async () => ACME);

  const put = async (tenant: string, kind: string, rows: Array<{ id: string } & Record<string, unknown>>) => {
    for (const row of rows) await db.put(`${tenant}:${ADMIN}`, kind, row);
  };

  await put(ACME, "tasks", [
    { id: "t-queued", title: "Presupuesto", status: "queued", assignedTo: "acme-presupuestos", createdAt: AHORA },
    { id: "t-running", title: "Pedido de cemento", status: "running", assignedTo: "acme-compras", clientId: "acme-cli-2", createdAt: AHORA },
    { id: "t-approval", title: "Certificación octubre", status: "waiting_approval", assignedTo: "acme-soporte", createdAt: AHORA },
    { id: "t-failed", title: "Auditar avance", status: "failed", assignedTo: "acme-obra", createdAt: AHORA, updatedAt: AHORA },
    { id: "t-done", title: "Parte diario", status: "succeeded", assignedTo: "acme-obra", createdAt: "2026-01-01T09:00:00.000Z", updatedAt: AHORA },
  ]);

  await put(ACME, "projects", [
    { id: "p-1", name: "Tenerife Sur", status: "active", clientId: "acme-cli-2", progressPct: 78, checklistDone: 14, checklistTotal: 18 },
    { id: "p-2", name: "Tagoror", status: "paused", clientId: "acme-cli-3", progressPct: 42, checklistDone: 8, checklistTotal: 19 },
  ]);

  await put(ACME, "business-records", [
    { id: "acme-cli-2", type: "client", name: "Hotel Tenerife Sur", status: "activo", domain: "hoteltenerifesur.es" },
    { id: "acme-cli-3", type: "client", name: "Ayuntamiento de Tagoror", status: "activo", domain: "tagoror.es" },
    { id: "l-1", type: "lead", name: "Promotora Levante", domain: "promotora-levante.es", status: "oportunidad", amountEur: 18400, nextStep: "Enviar presupuesto", action: "Revisar pliego" },
    { id: "l-2", type: "lead", name: "Restaurante La Bajada", domain: "labajada.es", status: "riesgo", amountEur: null, nextStep: "Llamar", action: "Llamar" },
    { id: "inv-1", type: "invoice", number: "F-2026-014", amountEur: 4300, status: "pendiente" },
  ]);

  await put(ACME, "actions", [
    { id: "a-review", title: "Enviar certificación", kind: "email.send", status: "awaiting_review", amountEur: 12600, createdAt: AHORA },
    { id: "a-scheduled", title: "Recordatorio de cobro", kind: "email.send", status: "scheduled", amountEur: 4300, createdAt: AHORA },
    { id: "a-failed", title: "Responder incidencia", kind: "email.send", status: "failed", amountEur: 640, createdAt: AHORA },
    { id: "a-unknown", title: "Enviar dossier", kind: "email.send", status: "outcome_unknown", amountEur: 780, createdAt: AHORA },
  ]);

  await put(ACME, "notifications", [
    { id: "n-1", title: "Certificación pendiente", body: "Espera tu revisión", cta: "Revisar certificación", read: false, createdAt: AHORA },
    { id: "n-2", title: "Cobro programado", body: "F-2026-014", cta: "Ver factura", read: true, createdAt: AHORA },
  ]);

  await put(ACME, "agent-roles", [{ id: "acme-obra", name: "Agente de obra", description: "Partes diarios" }]);

  for (const tenant of ["default", "acme-otro"]) {
    await put(tenant, "tasks", [{ id: `fuga-${tenant}`, title: `FUGA ${tenant}`, status: "running", createdAt: AHORA }]);
    await put(tenant, "actions", [{ id: `fuga-${tenant}`, title: `FUGA ${tenant}`, status: "awaiting_review", amountEur: 999 }]);
  }
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

test("agrega el tenant activo: tareas, importes y cartera", async () => {
  const response = await app(ACME).request("/api/analytics/overview?range=30d");
  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    tenantId: string;
    kpis: Record<string, number>;
    tasks: Array<{ id: string }>;
    leads: Array<{ id: string }>;
    notifications: Array<{ id: string }>;
  };
  assert.equal(body.tenantId, "acme");
  assert.equal(body.kpis.openTasks, 3);
  assert.equal(body.kpis.running, 1);
  assert.equal(body.kpis.awaitingDecision, 1);
  assert.equal(body.kpis.failed, 1);
  assert.equal(body.kpis.done, 1);
  assert.equal(body.kpis.pendingActions, 2);
  // 12 600 + 4 300: solo lo que espera decisión, sin inventar importes.
  assert.equal(body.kpis.pendingAmountEur, 16900);
  assert.equal(body.kpis.leads, 2);
  assert.equal(body.kpis.activeProjects, 1);
  assert.equal(body.tasks.length, 5);
  assert.deepEqual(body.notifications.map((row) => row.id), ["n-1"]);
});

test("no devuelve filas de otro tenant ni suma sus importes", async () => {
  const response = await app(ACME).request("/api/analytics/overview");
  const body = (await response.json()) as {
    tasks: Array<{ id: string }>;
    actions: Array<{ id: string; amountEur?: number }>;
    kpis: { pendingAmountEur: number };
  };
  assert.ok(body.tasks.every((row) => !row.id.startsWith("fuga-")));
  assert.ok(body.actions.every((row) => !row.id.startsWith("fuga-")));
  assert.equal(body.kpis.pendingAmountEur, 16900);
});

test("otro tenant ve su propio dato, no el de acme", async () => {
  const response = await app("acme-otro").request("/api/analytics/overview");
  const body = (await response.json()) as { tenantId: string; tasks: Array<{ id: string }>; kpis: Record<string, number> };
  assert.equal(body.tenantId, "acme-otro");
  assert.deepEqual(body.tasks.map((row) => row.id), ["fuga-acme-otro"]);
  assert.equal(body.kpis.pendingAmountEur, 999);
});

test("sin tenant resuelto responde 403 TENANT_REQUIRED", async () => {
  const response = await app(null).request("/api/analytics/overview");
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "Sesion sin empresa resuelta", code: "TENANT_REQUIRED" });
});

test("range invalido cae a 30d y no rompe", async () => {
  const response = await app(ACME).request("/api/analytics/overview?range=loquesea");
  assert.equal(response.status, 200);
  assert.equal(((await response.json()) as { range: string }).range, "30d");
});
