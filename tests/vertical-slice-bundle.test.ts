// VERTICAL_SLICE_BUNDLE_TEST_V1 - campaña 07.
// Aserción de cierre: plan estable y sin escrituras; nombre duplicado no
// reasigna empresa y referencias inválidas se rechazan.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  findSecretPaths,
  normalizeCompanyName,
  parseVerticalSliceBundle,
  planVerticalSlice,
  type VerticalSliceBundle,
} from "../scripts/lib/vertical-slice-bundle.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function example(): Promise<VerticalSliceBundle> {
  const raw = JSON.parse(
    await readFile(join(root, "clientes", "_template", "vertical-slice.example.json"), "utf8"),
  );
  const parsed = parseVerticalSliceBundle(raw);
  assert.equal(parsed.ok, true, parsed.ok ? "" : JSON.stringify(parsed.errors));
  return parsed.bundle as VerticalSliceBundle;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

test("el bundle de ejemplo del repo es válido", async () => {
  const bundle = await example();
  assert.equal(bundle.schema, "VERTICAL_SLICE_BUNDLE_V1");
  assert.equal(bundle.memberships.length, 3);
  assert.equal(bundle.persons.length, 2);
  assert.equal(bundle.automations.length, 1);
  assert.notEqual(bundle.operationKey, bundle.template.slug);
  assert.equal(findSecretPaths(bundle).length, 0);
});

test("rechaza material secreto y datos privados en la plantilla", async () => {
  const bundle = await example();
  const withSecret = clone(bundle) as unknown as Record<string, unknown>;
  (withSecret.connections as Array<Record<string, unknown>>)[0].apiKey = "sk-live-no";
  const parsed = parseVerticalSliceBundle(withSecret);
  assert.equal(parsed.ok, false);
  assert.ok(parsed.errors.some((e) => e.code === "SECRETO_EN_BUNDLE"));

  const withPrivate = { ...clone(bundle), private: { billing: "x" } };
  const second = parseVerticalSliceBundle(withPrivate);
  assert.equal(second.ok, false);
  assert.ok(second.errors.some((e) => e.code === "DATO_PRIVADO_EN_BUNDLE"));
});

test("rechaza conteos, ids y clave de operación inválidos", async () => {
  const base = await example();

  const twoMemberships = { ...clone(base), memberships: base.memberships.slice(0, 2) };
  const a = parseVerticalSliceBundle(twoMemberships);
  assert.equal(a.ok, false);
  assert.ok(a.errors.some((e) => e.code === "MEMBRESIAS_INVALIDAS"));

  const noAutomation = { ...clone(base), automations: [] };
  const b = parseVerticalSliceBundle(noAutomation);
  assert.ok(b.errors.some((e) => e.code === "AUTOMATIZACIONES_INVALIDAS"));

  const badTemplate = { ...clone(base), template: { ...base.template, id: "agencia-ejemplo" } };
  const c = parseVerticalSliceBundle(badTemplate);
  assert.ok(c.errors.some((e) => e.code === "TEMPLATE_ID_INVALIDO"));

  const slugKey = { ...clone(base), operationKey: base.template.slug };
  const d = parseVerticalSliceBundle(slugKey);
  assert.ok(d.errors.some((e) => e.code === "OPERATION_KEY_IGUAL_SLUG"));

  const noOwner = {
    ...clone(base),
    memberships: [
      { personId: "person_8a41c2d9", role: "admin" },
      { personId: "person_1b77e0c4", role: "member" },
      { personId: "person_1b77e0c4", role: "member" },
    ],
  };
  const e1 = parseVerticalSliceBundle(noOwner);
  assert.ok(e1.errors.some((error) => error.code === "SIN_OWNER"));
});

test("rechaza referencias a personas inexistentes", async () => {
  const base = await example();
  const broken = {
    ...clone(base),
    memberships: [
      base.memberships[0],
      base.memberships[1],
      { personId: "person_fantasma", role: "member" },
    ],
  };
  const parsed = parseVerticalSliceBundle(broken);
  assert.equal(parsed.ok, false);
  assert.ok(parsed.errors.some((e) => e.code === "REFERENCIA_INVALIDA"));
});

test("el plan es estable y no escribe: mismas entradas, mismo JSON", async () => {
  const bundle = await example();
  const first = planVerticalSlice(bundle, {});
  const second = planVerticalSlice(await example(), {});
  assert.deepEqual(first, second);
  assert.equal(first.blocked, false);
  assert.equal(first.fromVersion, null);
  assert.deepEqual(
    first.operations.map((o) => o.id),
    [...first.operations.map((o) => o.id)].sort(),
  );
  // Las conexiones se referencian, no se instalan.
  assert.ok(first.operations.filter((o) => o.kind === "connection").every((o) => o.action === "skip"));
  assert.equal(first.operations.filter((o) => o.kind === "membership").length, 3);
});

test("versión: misma v es skip, v superior es update y v futura bloquea", async () => {
  const bundle = await example();
  const same = planVerticalSlice(bundle, {
    templateId: bundle.template.id,
    version: bundle.version,
    displayName: bundle.profile.displayName,
  });
  assert.equal(same.blocked, false);
  assert.equal(same.operations.find((o) => o.kind === "version")?.action, "skip");

  const older = planVerticalSlice(bundle, { templateId: bundle.template.id, version: bundle.version - 1 });
  assert.equal(older.operations.find((o) => o.kind === "version")?.action, "update");

  const future = planVerticalSlice(bundle, { templateId: bundle.template.id, version: bundle.version + 1 });
  assert.equal(future.blocked, true);
  assert.ok(future.errors.some((e) => e.code === "BUNDLE_OBSOLETO"));
});

test("nombre duplicado no reasigna la empresa existente", async () => {
  const bundle = await example();
  const plan = planVerticalSlice(bundle, {
    claimedNames: { [normalizeCompanyName(bundle.profile.displayName)]: "tpl_otra_plantilla_01" },
  });
  assert.equal(plan.blocked, true);
  assert.ok(plan.errors.some((e) => e.code === "NOMBRE_DUPLICADO"));
  // No hay ninguna operación que toque el tenant existente para reasignarlo.
  assert.equal(plan.operations.some((o) => o.kind === "tenant" && o.action !== "skip"), false);
});

test("referencias faltantes bloquean y respetan las divergencias locales", async () => {
  const bundle = await example();
  const plan = planVerticalSlice(bundle, {
    templateId: bundle.template.id,
    version: bundle.version,
    displayName: bundle.profile.displayName,
    sopIds: ["otra-sop"],
    customized: [`profile:${bundle.profile.displayName}`],
  });
  assert.equal(plan.blocked, true);
  assert.equal(plan.missingReferences.length, 1);
  assert.ok(plan.missingReferences[0].includes(bundle.automations[0].sopId));
  assert.equal(plan.divergences.length, 1);
  assert.equal(plan.operations.find((o) => o.kind === "profile")?.action, "skip");
});
