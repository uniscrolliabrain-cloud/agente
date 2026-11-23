import assert from "node:assert/strict";
import { test } from "node:test";
import { SlowObservationWorker } from "../apps/server/src/engine/cognition/v2/slow-observation-worker.ts";
import type { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";

const runtime = {
  tenants: new Set(["tenant-a"]),
  db: {} as unknown,
  context: {},
  slow: {},
} as unknown as CognitionV2Runtime;

test("C06.P03b observation worker rejects invalid tenant quotas", () => {
  for (const limit of [0, -1, 501, 1.5, Number.NaN]) {
    assert.throws(() => new SlowObservationWorker(runtime, limit), /SLOW_OBSERVER_QUOTA_INVALID/);
  }
  assert.doesNotThrow(() => new SlowObservationWorker(runtime, 20));
});

test("C06.P03b observation worker denies unknown tenants before acquiring a lease", async () => {
  const worker = new SlowObservationWorker(runtime);
  await assert.rejects(worker.tick("tenant-b"), /SLOW_OBSERVER_TENANT_DENIED/);
});
