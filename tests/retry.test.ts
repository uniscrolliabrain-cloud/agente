// TESTS_RETRY_V1 — retry, backoff y circuit breaker.
// Ver: docs/audits/03-resiliencia/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { retryWithBackoff, defaultIsRetryable } from "../apps/server/src/engine/retry.ts";
import { CircuitBreaker, CircuitOpenError } from "../apps/server/src/engine/circuit-breaker.ts";

test("retryWithBackoff reintenta y termina con éxito", async () => {
  let attempts = 0;
  const result = await retryWithBackoff(
    async () => {
      attempts += 1;
      if (attempts < 3) throw Object.assign(new Error("transient"), { status: 503 });
      return "ok";
    },
    { maxAttempts: 5, baseMs: 5, maxMs: 20 },
  );
  assert.equal(result, "ok");
  assert.equal(attempts, 3);
});

test("retryWithBackoff respeta maxAttempts", async () => {
  let attempts = 0;
  await assert.rejects(
    retryWithBackoff(
      async () => {
        attempts += 1;
        throw Object.assign(new Error("always fails"), { status: 503 });
      },
      { maxAttempts: 3, baseMs: 5, maxMs: 10 },
    ),
  );
  assert.equal(attempts, 3);
});

test("retryWithBackoff no reintenta errores 4xx (no 408/429)", async () => {
  let attempts = 0;
  await assert.rejects(
    retryWithBackoff(
      async () => {
        attempts += 1;
        throw Object.assign(new Error("bad request"), { status: 400 });
      },
      { maxAttempts: 5, baseMs: 5, maxMs: 10 },
    ),
  );
  assert.equal(attempts, 1, "un 400 no se reintenta");
});

test("defaultIsRetryable reconoce 5xx, 408, 429 y errores de red", () => {
  assert.equal(defaultIsRetryable(Object.assign(new Error(""), { status: 500 })), true);
  assert.equal(defaultIsRetryable(Object.assign(new Error(""), { status: 408 })), true);
  assert.equal(defaultIsRetryable(Object.assign(new Error(""), { status: 429 })), true);
  assert.equal(defaultIsRetryable(Object.assign(new Error(""), { status: 400 })), false);
  assert.equal(defaultIsRetryable(new Error("fetch failed")), true);
  assert.equal(defaultIsRetryable(new Error("ECONNREFUSED")), true);
  assert.equal(defaultIsRetryable(Object.assign(new Error(""), { outcomeUnknown: true })), false);
});

test("circuit breaker abre tras N fallos y rechaza llamadas", async () => {
  const breaker = new CircuitBreaker("test", {
    failureThreshold: 3,
    openMs: 1000,
    halfOpenTimeoutMs: 500,
  });
  for (let i = 0; i < 3; i++) {
    await assert.rejects(breaker.call(async () => { throw new Error("fail"); }));
  }
  await assert.rejects(
    breaker.call(async () => "should not run"),
    (error) => error instanceof CircuitOpenError,
  );
});

test("circuit breaker pasa a half-open tras el cooldown", async () => {
  const breaker = new CircuitBreaker("test2", {
    failureThreshold: 2,
    openMs: 50,
    halfOpenTimeoutMs: 500,
  });
  await assert.rejects(breaker.call(async () => { throw new Error("fail"); }));
  await assert.rejects(breaker.call(async () => { throw new Error("fail"); }));
  assert.equal(breaker.getState(), "open");
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(breaker.getState(), "half-open");
  const result = await breaker.call(async () => "recovered");
  assert.equal(result, "recovered");
  assert.equal(breaker.getState(), "closed");
});

test("circuit breaker: 1 fallo en half-open reabre", async () => {
  const breaker = new CircuitBreaker("test3", {
    failureThreshold: 2,
    openMs: 50,
    halfOpenTimeoutMs: 500,
  });
  await assert.rejects(breaker.call(async () => { throw new Error("fail"); }));
  await assert.rejects(breaker.call(async () => { throw new Error("fail"); }));
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(breaker.getState(), "half-open");
  await assert.rejects(breaker.call(async () => { throw new Error("still failing"); }));
  assert.equal(breaker.getState(), "open");
});
