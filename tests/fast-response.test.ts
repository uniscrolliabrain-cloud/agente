// FIX_11_N_TIMEOUT_TEST_V1 - test del timeout 2s del chat.
// Verifica que el chat pasa timeoutMs: 2000 a runWithModelFallback.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const SOURCE = readFileSync(
  new URL("../apps/server/src/engine/conversation.ts", import.meta.url),
  "utf8",
);

test("el chat configura timeoutMs a 2000 (o CHAT_TIMEOUT_MS)", () => {
  assert.ok(
    /timeoutMs:\s*Number\(process\.env\.CHAT_TIMEOUT_MS \?\? "2000"\)/.test(SOURCE) ||
      /timeoutMs:\s*2000/.test(SOURCE),
    "El chat no configura timeoutMs",
  );
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

// FIX_11_N_TIMEOUT_TEST_V1_END
