// E15 - las 21 queries de los modulos ACME leen del store con el tenant del
// contexto, no del owner del actor ni del body.
//
// Monta un store temporal con el mismo TenantScopedStore del runtime, escribe
// filas de `acme` (owner `acme-admin`) y filas de `acme-otro` y `default` con
// titulos reconocibles. Las queries se ejecutan con owner `acme-carlos`, que no
// ha escrito nada: si devuelven filas, es porque leen por tenant.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { WorkspaceDispatcher } from "../apps/server/src/engine/workspaces/dispatcher.ts";
import { WorkspaceModuleRegistry } from "../apps/server/src/engine/workspaces/registry.ts";
import { adaptWorkspaceView } from "../apps/server/src/engine/views/workspace-adapter.ts";
import { parseRuntimeViewSpec } from "../packages/domain/src/views.ts";
import { ALL_WORKSPACES } from "../packages/workspaces/src/index.ts";
import { readTenantRows } from "../packages/workspaces/src/runtime/tenant-rows.ts";
import type {
  WorkspaceContext,
  WorkspaceQueryEnvelope,
} from "../packages/workspaces/src/contracts/index.ts";

const ACME = "acme";
const OTRO = "acme-otro";
const ADMIN = "acme-admin";
const SESION = "acme-carlos"; // usuario de acme que no ha escrito estas filas

const ACME_IDS = ["acme-clientes", "acme-obras", "acme-suministros"] as const;

let directory: string;
let db: Store;
let scoped: TenantScopedStore;
const registry = new WorkspaceModuleRegistry();
registry.registerAll(ALL_WORKSPACES);
let dispatcher: WorkspaceDispatcher;

function ctx(tenantId: string, owner = SESION): WorkspaceContext {
  return {
    workspaceId: "acme-obras",
    tenantId,
    owner,
    actorId: owner,
    actorKind: "user",
    permissions: [],
    correlationId: "test-acme-queries",
  };
}

function envelope(moduleId: string, query: string, entityId?: string): WorkspaceQueryEnvelope {
  return {
    id: randomUUID(),
    workspaceId: moduleId,
    query,
    version: 1,
    parameters: entityId ? { entityId } : {},
    limit: 50,
  };
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "agente-acme-queries-"));
  db = await createStore({ dataDir: join(directory, "db") });
  scoped = new TenantScopedStore(db, async () => ACME);

  const put = async (tenantId: string, kind: string, rows: Array<{ id: string } & Record<string, unknown>>) => {
    for (const row of rows) {
      await db.put(`${tenantId}:${ADMIN}`, kind, row);
    }
  };

  await put(ACME, "projects", [
    { id: "acme-obra-tenerife-sur", name: "Tenerife Sur · 6 habitaciones", status: "active", description: "Ampliación", progressPct: 78, createdAt: "2026-10-01T09:00:00.000Z", updatedAt: "2026-11-09T09:00:00.000Z" },
    { id: "acme-obra-las-palmas", name: "Las Palmas · reforma integral", status: "active", description: "Reforma municipal", progressPct: 64, createdAt: "2026-10-02T09:00:00.000Z", updatedAt: "2026-11-09T08:00:00.000Z" },
    { id: "acme-obra-tagoror", name: "Tagoror · urbanización", status: "paused", description: "En pausa por licencia", progressPct: 42, createdAt: "2026-10-03T09:00:00.000Z", updatedAt: "2026-11-09T07:00:00.000Z" },
  ]);

  await put(ACME, "tasks", [
    { id: "acme-task-1", title: "Presupuesto reforma Colón 14", status: "queued", assignedTo: "acme-presupuestos", createdAt: "2026-11-01T09:00:00.000Z" },
    { id: "acme-task-2", title: "Pedido de cemento y ferralla", status: "running", assignedTo: "acme-compras", createdAt: "2026-11-02T09:00:00.000Z" },
    { id: "acme-task-4", title: "Incidencia de humedad en Las Palmas", status: "waiting_input", assignedTo: "acme-soporte", clientId: "acme-cli-3", createdAt: "2026-11-03T09:00:00.000Z" },
    { id: "acme-task-9", title: "Auditar avance de Tenerife Sur", status: "failed", assignedTo: "acme-obra", createdAt: "2026-11-04T09:00:00.000Z" },
  ]);

  await put(ACME, "agent-artifacts", [
    { id: "acme-art-1", taskId: "acme-task-3", kind: "report", title: "Parte diario Tenerife Sur", summary: "14 de 18 partidas cerradas", createdAt: "2026-11-08T09:00:00.000Z" },
    { id: "acme-art-2", taskId: "acme-task-9", kind: "plan", title: "Plan de recuperación de avance", summary: "Refuerzo de dos oficiales", createdAt: "2026-11-09T09:00:00.000Z" },
  ]);

  await put(ACME, "business-records", [
    { id: "acme-cli-1", type: "client", name: "Comunidad Colón 14", status: "activo", city: "Santa Cruz de Tenerife", monthlyFee: 0 },
    { id: "acme-cli-2", type: "client", name: "Hotel Tenerife Sur", status: "activo", city: "Adeje", monthlyFee: 1200 },
    { id: "acme-cli-3", type: "client", name: "Ayuntamiento de Tagoror", status: "activo", city: "Las Palmas de Gran Canaria", monthlyFee: 0 },
    { id: "acme-lead-1", type: "lead", name: "Promotora Levante", domain: "promotora-levante.es", status: "oportunidad", amountEur: 18400, nextStep: "Enviar presupuesto" },
    { id: "acme-lead-2", type: "lead", name: "Clínica Dental Arucas", domain: "dental-aruacas.es", status: "estable", amountEur: 6400, nextStep: "Visita técnica" },
    { id: "acme-lead-3", type: "lead", name: "Restaurante La Bajada", domain: "labajada.es", status: "riesgo", amountEur: null, nextStep: "Recuperar contacto" },
    { id: "acme-lead-4", type: "lead", name: "Hotel Tenerife Sur (ampliación)", domain: "hoteltenerifesur.es", status: "ganado", amountEur: 41200, nextStep: "Firmar contrato" },
    { id: "acme-inv-1", type: "invoice", number: "F-2026-012", clientId: "acme-cli-2", amountEur: 12600, status: "cobrada", dueAt: "2026-10-31" },
    { id: "acme-inv-2", type: "invoice", number: "F-2026-013", clientId: "acme-cli-1", amountEur: 8400, status: "cobrada", dueAt: "2026-11-02" },
    { id: "acme-inv-3", type: "invoice", number: "F-2026-014", clientId: "acme-cli-2", amountEur: 4300, status: "pendiente", dueAt: "2026-11-14" },
    { id: "acme-inv-4", type: "invoice", number: "F-2026-015", clientId: "acme-cli-3", amountEur: 2150, status: "pendiente", dueAt: "2026-11-19" },
  ]);

  await put(ACME, "actions", [
    { id: "acme-act-1", title: "Enviar certificación de octubre a Hotel Tenerife Sur", kind: "email.send", status: "awaiting_review", amountEur: 12600, createdAt: "2026-11-09T09:00:00.000Z" },
    { id: "acme-act-2", title: "Recordatorio de cobro F-2026-014", kind: "email.send", status: "scheduled", amountEur: 4300, executeAt: "2026-11-11T09:00:00.000Z", createdAt: "2026-11-09T08:00:00.000Z" },
    { id: "acme-act-3", title: "Responder incidencia de humedad en Las Palmas", kind: "email.send", status: "failed", amountEur: 640, error: "550", createdAt: "2026-11-09T07:00:00.000Z" },
    { id: "acme-act-4", title: "Enviar dossier final de Las Palmas", kind: "email.send", status: "outcome_unknown", amountEur: 780, createdAt: "2026-11-09T06:00:00.000Z" },
  ]);

  await put(ACME, "notifications", [
    { id: "acme-notif-1", title: "Certificación pendiente de aprobación", body: "Espera tu revisión.", createdAt: "2026-11-09T09:00:00.000Z", read: false, cta: "Revisar certificación" },
    { id: "acme-notif-2", title: "Incidencia con respuesta pendiente", body: "El cliente pregunta.", createdAt: "2026-11-09T08:00:00.000Z", read: false, cta: "Responder incidencia" },
    { id: "acme-notif-3", title: "Cobro programado para mañana", body: "F-2026-014", createdAt: "2026-11-09T07:00:00.000Z", read: true, cta: "Ver factura" },
    { id: "acme-notif-4", title: "Auditoría de avance fallida", body: "No se pudo leer el parte.", createdAt: "2026-11-09T06:00:00.000Z", read: false, cta: "Reintentar auditoría" },
  ]);

  await put(ACME, "files", [
    { id: "acme-doc-1", name: "Presupuesto Colón 14.pdf", mimeType: "application/pdf", size: 184320, pageCount: 6, source: "upload", createdAt: "2026-10-21T09:00:00.000Z" },
    { id: "acme-doc-2", name: "Pliego Tagoror.pdf", mimeType: "application/pdf", size: 402112, pageCount: 18, source: "upload", createdAt: "2026-10-22T09:00:00.000Z" },
    { id: "acme-doc-3", name: "Certificación octubre.xlsx", mimeType: "application/vnd.ms-excel", size: 25600, pageCount: 1, source: "upload", createdAt: "2026-10-23T09:00:00.000Z" },
    { id: "acme-doc-4", name: "Acta de recepción.txt", mimeType: "text/plain", size: 96, pageCount: 1, source: "upload", createdAt: "2026-10-24T09:00:00.000Z" },
  ]);

  await put(ACME, "whatsapp-inbox", [
    { id: "acme-wa-in-1", accountId: "acme-demo", from: "34600111222@s.whatsapp.net", text: "¿Podéis adelantar la visita al miércoles?", receivedAt: "2026-11-10T08:00:00.000Z", status: "received" },
    { id: "acme-wa-in-2", accountId: "acme-demo", from: "34600333444@s.whatsapp.net", text: "Recibida la certificación.", receivedAt: "2026-11-10T08:10:00.000Z", status: "received" },
  ]);

  // Ruido de otros tenants: mismos kinds, titulos inconfundibles.
  for (const tenant of [OTRO, "default"]) {
    await db.put(`${tenant}:${ADMIN}`, "projects", { id: `fuga-${tenant}`, name: `FUGA ${tenant}`, status: "active" });
    await db.put(`${tenant}:${ADMIN}`, "tasks", { id: `fuga-${tenant}`, title: `FUGA ${tenant}`, status: "queued" });
    await db.put(`${tenant}:${ADMIN}`, "agent-artifacts", { id: `fuga-${tenant}`, title: `FUGA ${tenant}` });
    await db.put(`${tenant}:${ADMIN}`, "business-records", { id: `fuga-${tenant}`, type: "client", name: `FUGA ${tenant}` });
    await db.put(`${tenant}:${ADMIN}`, "actions", { id: `fuga-${tenant}`, title: `FUGA ${tenant}`, status: "failed" });
    await db.put(`${tenant}:${ADMIN}`, "notifications", { id: `fuga-${tenant}`, title: `FUGA ${tenant}` });
    await db.put(`${tenant}:${ADMIN}`, "files", { id: `fuga-${tenant}`, name: `FUGA ${tenant}` });
    await db.put(`${tenant}:${ADMIN}`, "whatsapp-inbox", { id: `fuga-${tenant}`, text: `FUGA ${tenant}` });
  }

  dispatcher = new WorkspaceDispatcher({ db: scoped });
});

after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});

// Filas que debe devolver cada vista con el tenant acme. Los formularios
// devuelven 0 a proposito: no hay fila que precargar.
const ESPERADO: Record<string, number> = {
  "acme-obras/resumen": 3,
  "acme-obras/tablero": 3,
  "acme-obras/tareas": 4,
  "acme-obras/incidencias": 1,
  "acme-obras/partes": 2,
  "acme-obras/detalle": 1,
  "acme-obras/parte-nuevo": 0,
  "acme-clientes/resumen": 11,
  "acme-clientes/oportunidades": 4,
  "acme-clientes/facturas": 2,
  "acme-clientes/bandeja": 2,
  "acme-clientes/cartera": 3,
  "acme-clientes/ficha": 1,
  "acme-clientes/alta": 0,
  "acme-suministros/resumen": 4,
  "acme-suministros/pedidos": 4,
  "acme-suministros/aprobaciones": 2,
  "acme-suministros/avisos": 4,
  "acme-suministros/documentos": 4,
  "acme-suministros/ficha": 1,
  "acme-suministros/pedido-nuevo": 0,
};

for (const moduleId of ACME_IDS) {
  const module = registry.get(moduleId);
  assert.ok(module, `falta el modulo ${moduleId}`);

  for (const view of module.views) {
    test(`${moduleId}/${view.id} (${view.kind}) lee del tenant acme aunque el actor no sea el owner`, async () => {
      const result = await dispatcher.dispatchQuery(module, ctx(ACME), envelope(moduleId, view.query));
      assert.equal(result.status === "forbidden", false);
      assert.equal(result.items.length, ESPERADO[`${moduleId}/${view.id}`]);

      const serialized = JSON.stringify(result.items);
      assert.ok(!serialized.includes("FUGA"), `la vista ${view.id} devuelve filas de otro tenant`);

      const adapted = adaptWorkspaceView({
        tenantId: ACME,
        workspaceId: moduleId,
        declaration: view,
        result,
      });
      assert.ok(adapted, `el adapter no normaliza ${moduleId}/${view.id}`);
      assert.equal(adapted.tenantId, ACME);
      assert.ok(parseRuntimeViewSpec(adapted.spec), `spec invalido en ${moduleId}/${view.id}`);
    });
  }
}

test("con un tenant sin datos (default) las 21 vistas salen vacias", async () => {
  for (const moduleId of ACME_IDS) {
    const module = registry.get(moduleId)!;
    for (const view of module.views) {
      // `default` no tiene ninguna fila en este store: la vista no puede
      // rellenarse con lo de acme.
      const result = await dispatcher.dispatchQuery(module, ctx("default-sin-datos"), envelope(moduleId, view.query));
      assert.equal(result.items.length, 0, `${moduleId}/${view.id} devuelve filas de acme`);
      assert.equal(result.status, "empty");
    }
  }
});

test("otro tenant con datos propios no ve ninguna fila de acme", async () => {
  for (const moduleId of ACME_IDS) {
    const module = registry.get(moduleId)!;
    for (const view of module.views) {
      const result = await dispatcher.dispatchQuery(module, ctx(OTRO), envelope(moduleId, view.query));
      // acme-otro si tiene sus propias filas (las "FUGA"): lo que se exige
      // es que ninguna sea de acme, no que la lista este vacia.
      const ids = result.items.map((row) => String((row as { id?: string }).id ?? ""));
      assert.ok(
        ids.every((id) => !id.startsWith("acme-")),
        `${moduleId}/${view.id} devuelve ids de acme a otro tenant: ${ids.join(",")}`,
      );
      assert.ok(!JSON.stringify(result.items).includes("Tenerife Sur · 6 habitaciones"));
    }
  }
});

test("el detalle acepta entityId y devuelve esa fila, no la primera", async () => {
  const module = registry.get("acme-obras")!;
  const result = await dispatcher.dispatchQuery(
    module,
    ctx(ACME),
    envelope("acme-obras", "obras.detalle", "acme-obra-tagoror"),
  );
  assert.equal(result.items.length, 1);
  assert.equal((result.items[0] as { id: string }).id, "acme-obra-tagoror");
});

test("las vistas de tablero y cola conservan los estados reales del store", async () => {
  const obras = registry.get("acme-obras")!;
  const tablero = await dispatcher.dispatchQuery(obras, ctx(ACME), envelope("acme-obras", "obras.tablero"));
  const estados = new Set(tablero.items.map((row) => (row as { status: string }).status));
  assert.deepEqual([...estados].sort(), ["active", "paused"]);

  const suministros = registry.get("acme-suministros")!;
  const pedidos = await dispatcher.dispatchQuery(suministros, ctx(ACME), envelope("acme-suministros", "suministros.pedidos"));
  const estadosAccion = new Set(pedidos.items.map((row) => (row as { status: string }).status));
  assert.deepEqual([...estadosAccion].sort(), ["awaiting_review", "failed", "outcome_unknown", "scheduled"]);
});

test("el dashboard y las tablas no inventan columnas ni filas", async () => {
  const clientes = registry.get("acme-clientes")!;
  const cartera = await dispatcher.dispatchQuery(clientes, ctx(ACME), envelope("acme-clientes", "clientes.cartera"));
  const adapted = adaptWorkspaceView({
    tenantId: ACME,
    workspaceId: "acme-clientes",
    declaration: clientes.views.find((view) => view.id === "cartera")!,
    result: cartera,
  });
  assert.ok(adapted && adapted.spec.kind === "table");
  assert.equal(adapted.spec.rows.length, 3);
  assert.ok(adapted.spec.columns.some((column) => column.key === "name"));
});

test("readTenantRows cae a list(owner) cuando el store no expone scanByPrefix", async () => {
  const calls: string[] = [];
  const doble = {
    list: async (owner: string, kind: string) => {
      calls.push(`${owner}/${kind}`);
      return [{ id: "solo-mio" }];
    },
  };
  const rows = await readTenantRows<{ id: string }>(doble, ACME, "tasks", 10, SESION);
  assert.deepEqual(rows, [{ id: "solo-mio" }]);
  assert.deepEqual(calls, [`${SESION}/tasks`]);
});

test("un tenantId vacio o con delimitador no consulta el store", async () => {
  const doble = { scanByPrefix: async () => assert.fail("no debe consultar") };
  assert.deepEqual(await readTenantRows(doble, "", "tasks", 10, SESION), []);
  assert.deepEqual(await readTenantRows(doble, "acme:acme-admin", "tasks", 10, SESION), []);
});
