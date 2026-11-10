// E14 - los tres modulos ACME estan en el catalogo global, declaran 7 vistas
// (una por kind) y no tocan los 34 modulos existentes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_WORKSPACES } from "../packages/workspaces/src/index.ts";
import { WorkspaceModuleRegistry } from "../apps/server/src/engine/workspaces/registry.ts";
import { workspaceViewDeclarationSchema } from "../packages/workspaces/src/contracts/index.ts";

const ACME_IDS = ["acme-clientes", "acme-obras", "acme-suministros"] as const;
const KINDS = ["dashboard", "queue", "inbox", "board", "table", "detail", "form"] as const;

function registry() {
  const reg = new WorkspaceModuleRegistry();
  reg.registerAll(ALL_WORKSPACES);
  return reg;
}

test("el catalogo sigue teniendo los 34 modulos historicos mas los 3 de acme", () => {
  const reg = registry();
  assert.equal(ALL_WORKSPACES.length, 37);
  assert.equal(reg.count(), 37);
  for (const id of ["gmail", "hubspot", "trello", "stripe"]) {
    assert.ok(reg.get(id), `falta el modulo historico ${id}`);
  }
});

test("GET /api/workspaces incluiria los tres ids de acme con su familia", () => {
  const reg = registry();
  const ids = reg.list().map((m) => m.manifest.id);
  for (const id of ACME_IDS) assert.ok(ids.includes(id), `falta ${id}`);
  assert.equal(reg.get("acme-obras")?.manifest.family, "trabajo");
  assert.equal(reg.get("acme-clientes")?.manifest.family, "comunicacion");
  assert.equal(reg.get("acme-suministros")?.manifest.family, "operaciones");
});

for (const id of ACME_IDS) {
  test(`${id} declara 7 vistas, una por kind, y no cae en la vista por defecto`, () => {
    const module = registry().get(id);
    assert.ok(module, `no esta registrado ${id}`);
    assert.equal(module.views.length, 7);
    assert.notEqual(module.views[0]?.id, "default");

    for (const view of module.views) {
      const parsed = workspaceViewDeclarationSchema.safeParse(view);
      assert.ok(parsed.success, `vista invalida en ${id}: ${JSON.stringify(parsed.error?.issues)}`);
    }
    const kinds = module.views.map((v) => v.kind).sort();
    assert.deepEqual(kinds, [...KINDS].sort());
    const ids = module.views.map((v) => v.id);
    assert.equal(new Set(ids).size, 7);
  });

  test(`${id}: cada vista apunta a una query declarada y no ofrece acciones`, () => {
    const module = registry().get(id);
    assert.ok(module);
    const queries = Object.keys(module.queries);
    assert.equal(queries.length, 7);
    for (const view of module.views) {
      assert.ok(queries.includes(view.query), `la vista ${view.id} usa una query inexistente (${view.query})`);
      assert.deepEqual([...view.actions], []);
    }
    assert.equal(Object.keys(module.commands).length, 0);
  });

  test(`${id}: las vistas no filtran datos de otro tenant por si mismas`, () => {
    // El aislamiento lo pone el store con scope (E15); aqui solo se comprueba
    // que la declaracion no lleva owner, tenant ni ruta de fichero incrustada.
    const module = registry().get(id);
    assert.ok(module);
    const serialized = JSON.stringify(module.views);
    for (const prohibido of ["DATA_DIR", "artifacts/", ".agente", "owner"]) {
      assert.ok(!serialized.includes(prohibido), `la declaracion menciona ${prohibido}`);
    }
    for (const view of module.views) {
      assert.ok(!view.query.includes(":"), "la query no debe llevar prefijo de tenant");
    }
  });
}

test("los modulos acme no publican ni consumen eventos del bus todavia", () => {
  const reg = registry();
  for (const id of ACME_IDS) {
    const module = reg.get(id);
    assert.ok(module);
    assert.equal(module.publishes.length, 0);
    assert.equal(module.consumes.length, 0);
    assert.equal(module.manifest.events.publishes.length, 0);
    assert.equal(module.manifest.events.consumes.length, 0);
  }
});
