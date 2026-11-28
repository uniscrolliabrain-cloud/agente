import assert from "node:assert/strict";
import { test } from "node:test";
import { CircuitBreaker } from "../apps/server/src/engine/circuit-breaker.ts";

const options = { failureThreshold: 1, openMs: 0, halfOpenTimeoutMs: 10000 };

test("half-open reserves one probe and rejects concurrent calls", async () => {
  const breaker = new CircuitBreaker("probe", options);
  breaker.recordFailure(new Error("offline"));
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  const first = breaker.call(() => pending);
  try {
    await assert.rejects(() => breaker.call(async () => "extra"), { code: "circuit_open" });
  } finally { release(); await first; }
  assert.equal(breaker.getState(), "closed");
});

test("call preserves the same deterministic failure policy as recordFailure", async () => {
  const breaker = new CircuitBreaker("validation", { ...options, openMs: 10000 });
  const error = Object.assign(new Error("invalid"), { status: 422 });
  await assert.rejects(() => breaker.call(async () => { throw error; }), error);
  assert.equal(breaker.getState(), "closed");
});

test("a neutral cancellation preserves the provider failure count", async () => {
  const breaker = new CircuitBreaker("neutral", { ...options, failureThreshold: 2, openMs: 10000 });
  breaker.recordFailure(new Error("offline"));
  await assert.rejects(() => breaker.call(async () => { throw new Error("cancelled"); }, { isFailure: () => false }));
  breaker.recordFailure(new Error("offline"));
  assert.equal(breaker.getState(), "open");
});

test("a response from an older generation cannot close a newly opened circuit", async () => {
  const breaker = new CircuitBreaker("late", { ...options, openMs: 10000 });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  const first = breaker.call(() => pending);
  breaker.recordFailure(new Error("offline"));
  release();
  await first;
  assert.equal(breaker.getState(), "open");
});
