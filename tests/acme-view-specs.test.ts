// E16 - los 21 specs (3 modulos x 7 kinds) que produce el adapter real para
// ACME pasan runtimeViewSpecSchema, sin campos de mas ni de menos.
//
// El store es un doble con solo `list`: ejercita tambien el camino de respaldo
// de readTenantRows (sin scanByPrefix). No se valida contra fixtures de UI ni
// contra el seed: solo el contrato del spec.
import assert from "node:assert/strict";
import { test } from "node:test";
import { WorkspaceDispatcher } from "../apps/server/src/engine/workspaces/dispatcher.ts";
import { WorkspaceModuleRegistry } from "../apps/server/src/engine/workspaces/registry.ts";
import { adaptWorkspaceView } from "../apps/server/src/engine/views/workspace-adapter.ts";
import { runtimeViewSpecSchema } from "../packages/domain/src/views.ts";
import { ALL_WORKSPACES } from "../packages/workspaces/src/index.ts";
import type { WorkspaceContext } from "../packages/workspaces/src/contracts/index.ts";

const ACME_IDS = ["acme-clientes", "acme-obras", "acme-suministros"] as const;

// Claves que el schema admite por kind. Un spec con cualquier otra clave
// significa que el adapter esta pintando algo que el contrato no contempla.
const CLAVES: Record<string, string[]> = {
  dashboard: ["kind", "title", "kpis"],
  queue: ["kind", "title", "items"],
  inbox: ["kind", "title", "items"],
  board: ["kind", "title", "entityType", "columns", "cards"],
  table: ["kind", "title", "columns", "rows"],
  detail: ["kind", "title", "entityId", "entityType", "properties", "relations"],
  form: ["kind", "title", "entityType", "fields", "submitLabel"],
};

const FILAS: Record<string, Array<Record<string, unknown>>> = {
  projects: [
    { id: "acme-obra-1", name: "Tenerife Sur", status: "active", description: "Ampliación", progressPct: 78, updatedAt: "2026-11-09T09:00:00.000Z" },
    { id: "acme-obra-2", name: "Las Palmas", status: "paused", description: "Reforma", progressPct: 64, updatedAt: "2026-11-09T08:00:00.000Z" },
  ],
  tasks: [
    { id: "acme-task-1", title: "Presupuesto Colón 14", status: "queued", assignedTo: "acme-presupuestos" },
    { id: "acme-task-4", title: "Incidencia de humedad", status: "waiting_input", clientId: "acme-cli-3" },
  ],
  "agent-artifacts": [{ id: "acme-art-1", title: "Parte diario", kind: "report", summary: "14 de 18", taskId: "acme-task-3" }],
  "business-records": [
    { id: "acme-cli-1", type: "client", name: "Comunidad Colón 14", status: "activo", city: "Santa Cruz" },
    { id: "acme-lead-1", type: "lead", name: "Promotora Levante", status: "oportunidad", amountEur: 18400, domain: "promotora-levante.es" },
    { id: "acme-inv-3", type: "invoice", number: "F-2026-014", status: "pendiente", amountEur: 4300, dueAt: "2026-11-14" },
  ],
  actions: [
    { id: "acme-act-1", title: "Enviar certificación", kind: "email.send", status: "awaiting_review", amountEur: 12600, createdAt: "2026-11-09T09:00:00.000Z" },
    { id: "acme-act-2", title: "Recordatorio de cobro", kind: "email.send", status: "scheduled", amountEur: 4300, executeAt: "2026-11-11T09:00:00.000Z" },
  ],
  notifications: [{ id: "acme-notif-1", title: "Certificación pendiente", body: "Espera tu revisión", cta: "Revisar", createdAt: "2026-11-09T09:00:00.000Z" }],
  files: [{ id: "acme-doc-1", name: "Presupuesto Colón 14.pdf", mimeType: "application/pdf", size: 184320, pageCount: 6 }],
  "whatsapp-inbox": [{ id: "acme-wa-in-1", from: "34600111222@s.whatsapp.net", text: "¿Podéis adelantar la visita?" }],
};

const storeConDatos = {
  get: async () => null,
  put: async <T extends { id: string }>(_owner: string, _kind: string, value: T) => value,
  list: async <T>(_owner: string, kind: string) => (FILAS[kind] ?? []) as T[],
  insertIfAbsent: async () => null,
  remove: async () => {},
};

const storeVacio = { ...storeConDatos, list: async <T>() => [] as T[] };

const registry = new WorkspaceModuleRegistry();
registry.registerAll(ALL_WORKSPACES);

function ctx(): WorkspaceContext {
  return {
    workspaceId: "acme",
    tenantId: "acme",
    owner: "acme-carlos",
    actorId: "acme-carlos",
    actorKind: "user",
    permissions: [],
    correlationId: "test-acme-specs",
  };
}

async function specs(db: typeof storeConDatos) {
  const dispatcher = new WorkspaceDispatcher({ db });
  const out: Array<{ id: string; kind: string; spec: unknown }> = [];
  for (const moduleId of ACME_IDS) {
    const module = registry.get(moduleId)!;
    for (const view of module.views) {
      const result = await dispatcher.dispatchQuery(module, ctx(), {
        id: "spec",
        workspaceId: moduleId,
        query: view.query,
        version: 1,
        parameters: {},
        limit: 50,
      });
      const adapted = adaptWorkspaceView({ tenantId: "acme", workspaceId: moduleId, declaration: view, result });
      assert.ok(adapted, `sin envelope para ${moduleId}/${view.id}`);
      out.push({ id: `${moduleId}/${view.id}`, kind: view.kind, spec: adapted.spec });
    }
  }
  return out;
}

test("las 21 vistas producen un spec valido con runtimeViewSpecSchema", async () => {
  const listado = await specs(storeConDatos);
  assert.equal(listado.length, 21);
  for (const { id, kind, spec } of listado) {
    const parsed = runtimeViewSpecSchema.safeParse(spec);
    assert.ok(parsed.success, `${id}: ${JSON.stringify(parsed.error?.issues)}`);
    assert.equal(parsed.data.kind, kind, `${id} cae en otro template`);
  }
});

test("los 7 kinds aparecen una vez por modulo, sin caer al default", async () => {
  const listado = await specs(storeConDatos);
  for (const moduleId of ACME_IDS) {
    const delModulo = listado.filter((row) => row.id.startsWith(`${moduleId}/`));
    assert.equal(delModulo.length, 7);
    assert.deepEqual(
      delModulo.map((row) => (row.spec as { kind: string }).kind).sort(),
      ["board", "dashboard", "detail", "form", "inbox", "queue", "table"],
    );
  }
});

test("ningun spec lleva claves fuera del contrato de su kind", async () => {
  for (const { id, spec } of await specs(storeConDatos)) {
    const kind = (spec as { kind: string }).kind;
    const permitidas = CLAVES[kind];
    assert.ok(permitidas, `kind sin lista de claves: ${kind}`);
    for (const key of Object.keys(spec as Record<string, unknown>)) {
      assert.ok(permitidas.includes(key), `${id} (${kind}) lleva la clave no declarada "${key}"`);
    }
  }
});

test("con el store vacio los 21 specs siguen siendo validos", async () => {
  for (const { id, spec } of await specs(storeVacio)) {
    const parsed = runtimeViewSpecSchema.safeParse(spec);
    assert.ok(parsed.success, `${id} invalido sin datos: ${JSON.stringify(parsed.error?.issues)}`);
  }
});

test("los topes del schema no se superan: 50 items, 10 columnas, 200 filas", async () => {
  for (const { id, spec } of await specs(storeConDatos)) {
    const s = spec as Record<string, unknown>;
    if (Array.isArray(s.items)) assert.ok(s.items.length <= 50, `${id} supera 50 items`);
    if (Array.isArray(s.columns)) assert.ok((s.columns as unknown[]).length <= 10, `${id} supera 10 columnas`);
    if (Array.isArray(s.rows)) assert.ok((s.rows as unknown[]).length <= 200, `${id} supera 200 filas`);
    if (Array.isArray(s.kpis)) assert.ok((s.kpis as unknown[]).length <= 6, `${id} supera 6 KPIs`);
  }
});
