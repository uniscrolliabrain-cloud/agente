// TESTS_KERNEL_META_CONTEXT_V1 — Meta hints llegan al contexto del chat.
// Ver: docs/audits/09-kernel-cognitivo/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { Meta } from "../apps/server/src/kernel/observers/meta.ts";
import { progressStep, readyResult } from "../apps/server/src/kernel/graph/progress.ts";

test("Meta evaluateWithProgress devuelve slow_ready_fast_idle con ready + idle", () => {
  const meta = new Meta({ longNoOutputMs: 30_000 });
  const hints = meta.evaluateWithProgress({
    progress: [readyResult("resultado listo")],
    now: new Date().toISOString(),
    lastFastActivityAt: new Date(Date.now() - 5000).toISOString(),
  });
  assert.ok(hints.some((h) => h.rule === "slow_ready_fast_idle"));
});

test("Meta devuelve nothing_to_report si no hay nada", () => {
  const meta = new Meta();
  const hints = meta.evaluateWithProgress({
    progress: [],
    now: new Date().toISOString(),
  });
  assert.equal(hints.length, 1);
  assert.equal(hints[0].rule, "nothing_to_report");
});

test("Meta detecta slow_long_no_output", () => {
  const meta = new Meta({ longNoOutputMs: 1000 });
  const oldProgress = progressStep(1, 5, "trabajando");
  // Forzamos timestamp antiguo.
  const oldTime = new Date(Date.now() - 5000).toISOString();
  oldProgress.timestamp = oldTime;
  const hints = meta.evaluateWithProgress({
    progress: [oldProgress],
    now: new Date().toISOString(),
  });
  assert.ok(hints.some((h) => h.rule === "slow_long_no_output"));
});

test("Meta detecta slow_failed_urgent", () => {
  const { failedResult } = require("../apps/server/src/kernel/graph/progress.ts");
  const meta = new Meta();
  const hints = meta.evaluateWithProgress({
    progress: [failedResult("error del slow")],
    now: new Date().toISOString(),
  });
  assert.ok(hints.some((h) => h.rule === "slow_failed_urgent" && h.urgency === "high"));
});