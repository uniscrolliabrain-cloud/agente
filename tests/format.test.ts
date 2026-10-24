import assert from "node:assert/strict";
import { test } from "node:test";
import { fmtDur } from "../apps/web/src/hooks/useNow.ts";

test("fmtDur segundos", () => {
  assert.equal(fmtDur(45), "45s");
});

test("fmtDur cero", () => {
  assert.equal(fmtDur(0), "0s");
});

test("fmtDur minuto exacto", () => {
  assert.equal(fmtDur(60), "1m 00s");
});

test("fmtDur minutos y segundos", () => {
  assert.equal(fmtDur(134), "2m 14s");
});

test("fmtDur negativos se clampean a 0", () => {
  assert.equal(fmtDur(-5), "0s");
});