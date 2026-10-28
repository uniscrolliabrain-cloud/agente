// IDEMPOTENCY_MARKS_CRITERION_TEST_V1 - el criterio del audit, con fixtures.
//
// El audit de marcas no puede probarse contra el repo entero (el numero cambia
// con cada commit). Se prueba contra cadenas que reproducen cada caso, incluido
// el falso positivo que motivo V2: un barrel de una sola linea no es un hueco.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  type AllowEntry,
  classify,
  extractMarks,
  isCommentLine,
  loadAllowlist,
} from "../../scripts/audits/idempotency.ts";

function marksOf(source: string, file = "fixture.ts") {
  return extractMarks(file, source);
}

test("una marca con codigo detras no es huerfana", () => {
  const marks = marksOf("// ALGO_WIRE_V1\nexport const x = 1;\n");
  assert.equal(marks.length, 1);
  assert.equal(marks[0].codeLinesAfter, 1);
  assert.equal(classify(marks).orphans.length, 0);
});

test("un barrel de una linea es implementacion, no hueco (regresion de V1)", () => {
  // V1 pedia >= 3 lineas de codigo y marcaba esto como huerfana.
  const marks = marksOf('// LOG_STRUCTURED_INDEX_V1\nexport { logInfo } from "../log.ts";\n');
  assert.equal(marks[0].codeLinesAfter, 1);
  assert.equal(classify(marks).orphans.length, 0);
});

test("una marca al final del fichero sin nada debajo si es huerfana", () => {
  const marks = marksOf("export const x = 1;\n// MARCA_SIN_CODIGO_V1\n");
  assert.equal(marks[0].codeLinesAfter, 0);
  const c = classify(marks);
  assert.equal(c.orphans.length, 1);
  assert.equal(c.blocking.orphans.length, 1);
});

test("una marca seguida solo de comentarios es huerfana", () => {
  const marks = marksOf("// MARCA_VACIA_V1\n// nota que no implementa nada\n");
  assert.equal(classify(marks).orphans.length, 1);
});

test("una marca que documenta una retirada no es huerfana", () => {
  const marks = marksOf("// VIEJO_WIRE_V1 - eliminado en la campana anterior\n");
  assert.equal(marks[0].codeLinesAfter, 0);
  assert.equal(classify(marks).orphans.length, 0);
});

test("varias marcas seguidas son cabeceras: la ultima tiene el codigo", () => {
  const source = ["// PRIMERA_V1", "// SEGUNDA_V1", "// TERCERA_V1", "import { a } from \"./a.ts\";", ""].join("\n");
  const marks = marksOf(source);
  assert.equal(marks.length, 3);
  // Las tres cuentan el import como implementacion del fichero.
  assert.deepEqual(
    marks.map((m) => m.codeLinesAfter),
    [1, 1, 1],
  );
  assert.equal(classify(marks).orphans.length, 0);
});

test("la misma marca en varios call sites es indice, no defecto", () => {
  const source = [
    "// TAKE_FOR_TENANT_V1",
    "limiter.takeForTenant(tenantId, owner, \"a\");",
    "// TAKE_FOR_TENANT_V1",
    "limiter.takeForTenant(tenantId, owner, \"b\");",
    "",
  ].join("\n");
  const c = classify(marksOf(source));
  assert.equal(c.sameFileRepeats.length, 1);
  assert.equal(c.sameFileRepeats[0].count, 2);
  assert.equal(c.blocking.doublePastes.length, 0);
  assert.equal(c.blocking.orphans.length, 0);
});

test("el mismo bloque pegado dos veces si es defecto", () => {
  const source = [
    "// PAGO_WIRE_V1",
    "await cobrar({ id: \"x\" });",
    "// PAGO_WIRE_V1",
    "await cobrar({ id: \"x\" });",
    "",
  ].join("\n");
  const c = classify(marksOf(source));
  assert.equal(c.blocking.doublePastes.length, 1);
  assert.deepEqual(c.blocking.doublePastes[0].lines, [1, 3]);
});

test("el mismo nombre con cuerpos distintos no es pegado doble", () => {
  const source = [
    "// PAGO_WIRE_V1",
    "await cobrar({ id: \"x\" });",
    "// PAGO_WIRE_V1",
    "await devolver({ id: \"y\" });",
    "",
  ].join("\n");
  assert.equal(classify(marksOf(source)).blocking.doublePastes.length, 0);
});

test("la allowlist razonada quita el defecto de bloqueantes y lo deja registrado", () => {
  const marks = marksOf("export const x = 1;\n// MARCA_SIN_CODIGO_V1\n");
  const allow: AllowEntry[] = [
    {
      mark: "MARCA_SIN_CODIGO_V1",
      category: "orphan",
      reason: "la marca documenta un cambio que vive en otro fichero",
      date: "2026-10-28",
    },
  ];
  const c = classify(marks, allow);
  assert.equal(c.orphans.length, 1);
  assert.equal(c.blocking.orphans.length, 0);
  assert.equal(c.allowed.length, 1);
  assert.match(c.allowed[0].reason, /otro fichero/);
});

test("una allowlist sin motivo no se acepta (no puede ser un silenciador)", async () => {
  const { writeFile, mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = await mkdtemp(join(tmpdir(), "idem-allow-"));
  const path = join(dir, "allow.json");
  try {
    await writeFile(
      path,
      JSON.stringify({ entries: [{ mark: "MARCA_X_V1", category: "orphan", reason: "corto", date: "2026-10-28" }] }),
      "utf8",
    );
    await assert.rejects(() => loadAllowlist(path), /reason/);
    await writeFile(
      path,
      JSON.stringify({ entries: [{ mark: "MARCA_X_V1", category: "orphan", reason: "motivo suficiente", date: "ayer" }] }),
      "utf8",
    );
    await assert.rejects(() => loadAllowlist(path), /date/);
    await writeFile(path, JSON.stringify({ entries: [] }), "utf8");
    assert.deepEqual(await loadAllowlist(path), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("el detector de comentarios no confunde codigo con comentario", () => {
  assert.equal(isCommentLine("// hola"), true);
  assert.equal(isCommentLine("   * bloque"), true);
  assert.equal(isCommentLine("export const x = 1;"), false);
  assert.equal(isCommentLine(""), true);
});
