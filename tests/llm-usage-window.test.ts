import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";

// LLM_USAGE_WINDOW_V1 - el bug no era de calculo sino de lectura: list() corta
// en 1000 filas, asi que con mas consumo diario la cuota veia menos gasto del
// real y nunca saltaba. Este test fija las dos mitades.
test("la ventana de cuota de llm-usage no se corta en 1000 filas", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "llm-usage-"));
  const store = await createStore({ dataDir });
  const close = (store as { close?: () => Promise<void> }).close;
  try {
    const owner = "alice";
    const now = Date.now();
    for (let i = 0; i < 1100; i += 1) {
      await store.put(owner, "llm-usage", {
        id: `usage-${i}`,
        date: new Date(now - i * 1000).toISOString(),
        speed: "chat",
        inputTokens: 10,
        outputTokens: 5,
        costEur: 0.001,
      });
    }

    const capped = await store.list(owner, "llm-usage");
    assert.equal(capped.length, 1000, "list() mantiene su techo de seguridad");

    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const window = await store.listSince<{ id: string; costEur: number }>(
      owner,
      "llm-usage",
      "date",
      dayAgo,
    );
    assert.equal(window.length, 1100, "la cuota debe ver todo el consumo del dia");
    const cost = window.reduce((sum, row) => sum + row.costEur, 0);
    assert.equal(Number(cost.toFixed(3)), 1.1);

    const future = await store.listSince(
      owner,
      "llm-usage",
      "date",
      new Date(now + 60_000).toISOString(),
    );
    assert.equal(future.length, 0, "una ventana futura no devuelve nada");

    // Otra empresa no ve consumos ajenos.
    const foreign = await store.listSince("bob", "llm-usage", "date", dayAgo);
    assert.equal(foreign.length, 0);

    // listSince es async: valida el campo dentro de la promesa.
    await assert.rejects(
      () => store.listSince(owner, "llm-usage", "date); drop", dayAgo),
      /Campo no valido/,
    );
  } finally {
    if (close) await close.call(store).catch(() => undefined);
  }
});
