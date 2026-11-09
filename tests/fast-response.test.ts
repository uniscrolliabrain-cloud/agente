// CHAT_TIMEOUT_TWO_CLOCKS_V1 - el chat ya no usa un unico timeout de 2s:
// separa el primer byte (para saltar al fallback) del total (para cortar una
// respuesta colgada). Ambos son configurables.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const SOURCE = readFileSync(
  new URL("../apps/server/src/engine/conversation.ts", import.meta.url),
  "utf8",
);

test("el chat configura primer byte y total por separado", () => {
  assert.match(SOURCE, /CHAT_FIRST_BYTE_MS \?\? "8000"/);
  assert.match(SOURCE, /CHAT_TOTAL_MS \?\? "45000"/);
  assert.doesNotMatch(SOURCE, /CHAT_TIMEOUT_MS \?\? "2000"/);
});

test("model-chain usa firstByteMs en el setTimeout", () => {
  const chain = readFileSync(
    new URL("../apps/server/src/engine/model-chain.ts", import.meta.url),
    "utf8",
  );
  assert.ok(
    /}, firstByteMs\);/.test(chain),
    "model-chain no usa firstByteMs en el setTimeout",
  );
});
