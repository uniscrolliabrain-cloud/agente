import assert from "node:assert/strict";
import { test } from "node:test";
import {
  alertUrgency,
  pickPrimary,
  type LiveActivity,
} from "../packages/domain/src/live.ts";

const alert = (id: string, since: number): LiveActivity => ({
  kind: "alert", id, label: "OK", since, slaSec: 1000,
});
const pulse: LiveActivity = { kind: "pulse", id: "p", label: "escribiendo…" };
const prog: LiveActivity = { kind: "progress", id: "g", label: "procesando", value: 3, max: 10 };
const stale: LiveActivity = { kind: "stale", id: "s", lastSeen: Date.now() - 400000 };
const err: LiveActivity = { kind: "error", id: "e", label: "fallo", at: Date.now() };
const timer: LiveActivity = { kind: "timer", id: "t", label: "corriendo", startedAt: Date.now() };

test("pickPrimary devuelve null si no hay actividad", () => {
  assert.equal(pickPrimary([]), null);
});

test("alert gana a todo", () => {
  assert.equal(pickPrimary([prog, pulse, alert("a", 1)])?.id, "a");
});

test("error gana a stale", () => {
  assert.equal(pickPrimary([stale, err])?.id, "e");
});

test("stale gana a pulse", () => {
  assert.equal(pickPrimary([pulse, stale])?.id, "s");
});

test("pulse gana a progress", () => {
  assert.equal(pickPrimary([prog, pulse])?.id, "p");
});

test("progress gana a timer", () => {
  assert.equal(pickPrimary([timer, prog])?.id, "g");
});

test("entre alertas gana la mas antigua", () => {
  assert.equal(pickPrimary([alert("a", 10), alert("b", 500)])?.id, "b");
});

test("alertUrgency soft a la mitad del SLA", () => {
  assert.equal(alertUrgency(alert("a", 400) as never), "soft");
});

test("alertUrgency urgent pasada la mitad del SLA", () => {
  assert.equal(alertUrgency(alert("a", 600) as never), "urgent");
});