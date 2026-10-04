// TESTS_LOG_V1 — redacción y propagación de correlationId.
// Ver: docs/audits/02-observabilidad/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  redact,
  withLogContext,
  logContext,
  logInfo,
} from "../apps/server/src/log.ts";

test("redact elimina authorization, apiKey, password, token", () => {
  const input = {
    user: "alice",
    authorization: "Bearer sk-123",
    nested: {
      apiKey: "secret-key",
      password: "hunter2",
      token: "abc",
      visible: "ok",
    },
  };
  const out = redact(input) as Record<string, unknown>;
  assert.equal(out.user, "alice");
  assert.equal(out.authorization, "[REDACTED]");
  const nested = out.nested as Record<string, unknown>;
  assert.equal(nested.apiKey, "[REDACTED]");
  assert.equal(nested.password, "[REDACTED]");
  assert.equal(nested.token, "[REDACTED]");
  assert.equal(nested.visible, "ok");
});

test("redact no rompe con ciclos ni con primitivos", () => {
  assert.equal(redact(null), null);
  assert.equal(redact(42), 42);
  assert.equal(redact("texto"), "texto");
});

test("withLogContext propaga correlationId a logInfo", () => {
  const original = console.log;
  const captured: string[] = [];
  console.log = (line: string) => captured.push(line);
  try {
    withLogContext({ correlationId: "test-corr-123", owner: "alice" }, () => {
      logInfo("test.event", { foo: "bar" });
    });
  } finally {
    console.log = original;
  }
  assert.equal(captured.length, 1);
  const parsed = JSON.parse(captured[0]);
  assert.equal(parsed.correlationId, "test-corr-123");
  assert.equal(parsed.owner, "alice");
  assert.equal(parsed.event, "test.event");
  assert.equal(parsed.foo, "bar");
});

test("logContext.getStore devuelve undefined fuera de contexto", () => {
  assert.equal(logContext.getStore(), undefined);
});
