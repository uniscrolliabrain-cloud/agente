// FIX_11_D_TONE_TEST_V1 - test del prompt de tono del chat.
// Verifica que las 9 reglas estan en el fuente de conversation.ts.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const SOURCE = readFileSync(
  new URL("../apps/server/src/engine/conversation.ts", import.meta.url),
  "utf8",
);

test("el prompt tiene las reglas 1-9 de tono", () => {
  const rules = [
    "(1) Responde en 1-3 frases",
    "(2) Nunca uses terminos internos",
    "(3) Traduce todo",
    "(4) Nunca digas lo que vas a hacer",
    "(5) Nunca digas 'puedo hacer X'",
    "(6) Cuando sea util, termina con una pregunta corta",
    "(7) Nada de emojis",
    "(8) Nada de 'Perfecto'",
    "(9) Si el usuario pide 'paso a paso'",
  ];
  for (const rule of rules) {
    assert.ok(SOURCE.includes(rule), `Falta regla: ${rule}`);
  }
});

test("el prompt no tiene emojis", () => {
  const match = SOURCE.match(/const prompt =[\s\S]*?computerInstructions/);
  const block = match?.[0] ?? "";
  const emojiRegex = /[\u{1F300}-\u{1FAFF}]/u;
  assert.ok(!emojiRegex.test(block), "El prompt tiene emojis");
});

// FIX_11_D_TONE_TEST_V1_END
