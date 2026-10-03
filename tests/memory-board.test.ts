import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findDuplicate,
  groupMemories,
  similarity,
  type Memory,
} from "../apps/web/src/lib/groupMemories.ts";

const mem = (id: string, text: string, category = "empresa", roleId?: string): Memory => ({
  id, text, category, tags: [], roleId,
});

test("groupMemories agrupa por categoria cuando no hay roleId", () => {
  const list = [mem("1", "a", "empresa"), mem("2", "b", "proceso")];
  const groups = groupMemories(list, (r) => r, {});
  assert.equal(groups.length, 2);
});

test("groupMemories agrupa por rol si tiene roleId", () => {
  const list = [mem("1", "a", "empresa", "leo"), mem("2", "b", "empresa", "leo")];
  const groups = groupMemories(list, (r) => r.toUpperCase(), {});
  assert.equal(groups.length, 1);
  assert.equal(groups[0][0], "Rol: LEO");
});

test("groupMemories filtra por categoria", () => {
  const list = [mem("1", "a", "empresa"), mem("2", "b", "proceso")];
  const groups = groupMemories(list, (r) => r, { category: "empresa" });
  assert.equal(groups.length, 1);
  assert.equal(groups[0][1].length, 1);
});

test("similarity es 1 con textos identicos y 0 sin overlap", () => {
  assert.equal(similarity("hola mundo", "hola mundo"), 1);
  assert.equal(similarity("uno", "dos"), 0);
});

test("findDuplicate detecta exacto normalizado", () => {
  const list = [mem("1", "Cliente Prefiere Tono Cercano")];
  const dup = findDuplicate("  cliente   prefiere tono cercano  ", list);
  assert.ok(dup);
  assert.equal(dup.score, 1);
});

test("findDuplicate detecta similar por jaccard >= 0.6", () => {
  const list = [mem("1", "El cliente prefiere cafe por la manana")];
  const dup = findDuplicate("El cliente prefiere cafe por la tarde", list, 0.6);
  assert.ok(dup);
  assert.ok(dup.score >= 0.6);
});

test("findDuplicate no devuelve nada si no supera threshold", () => {
  const list = [mem("1", "El cliente prefiere cafe")];
  const dup = findDuplicate("Facturas el primer dia del mes", list, 0.6);
  assert.equal(dup, null);
});