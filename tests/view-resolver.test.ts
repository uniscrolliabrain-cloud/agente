import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clearIntents,
  registerIntent,
  resolveView,
} from "../apps/server/src/engine/views/resolver.ts";

test("resolveView devuelve null si no hay intencion", async () => {
  clearIntents();
  const spec = await resolveView("o", "cualquier cosa");
  assert.equal(spec, null);
});

test("resolveView matchea dashboard", async () => {
  clearIntents();
  registerIntent(/\bresumen\b/, async () => ({
    kind: "dashboard",
    title: "Resumen",
    kpis: [{ label: "Tareas", value: 5 }],
  }));
  const spec = await resolveView("o", "dame un resumen");
  assert.ok(spec);
  assert.equal(spec.kind, "dashboard");
});

test("resolveView matchea queue", async () => {
  clearIntents();
  registerIntent(/pendiente|aprobacion/, async () => ({
    kind: "queue",
    title: "Pendientes",
    items: [],
  }));
  const spec = await resolveView("o", "que tengo pendiente");
  assert.ok(spec);
  assert.equal(spec.kind, "queue");
});

test("resolveView normaliza tildes y mayusculas", async () => {
  clearIntents();
  registerIntent(/aprobacion/, async () => ({
    kind: "queue",
    title: "Pendientes",
    items: [],
  }));
  const spec = await resolveView("o", "APROBACIÓN de pagos");
  assert.ok(spec);
});

test("resolveView valida el spec del builder", async () => {
  clearIntents();
  registerIntent(/roto/, async () => ({ kind: "dashboard", title: "x" }));
  const spec = await resolveView("o", "algo roto");
  assert.equal(spec, null);
});