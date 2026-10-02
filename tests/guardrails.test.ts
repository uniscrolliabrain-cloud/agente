// GUARDRAILS_TEST_V1 - verifica que los guardrails cortan.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { GuardrailService } from "../apps/server/src/engine/guardrails/service.ts";
import { AppError } from "../apps/server/src/errors.ts";

test("checkTaskCreation bloquea al superar cuota", async () => {
  const db = await createStore();
  try {
    const guard = new GuardrailService(db);
    await guard.checkTaskCreation("t1", 0);
    await assert.rejects(
      () => guard.checkTaskCreation("t1", 10_000),
      (err: unknown) => err instanceof AppError && err.status === 429,
    );
    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});

test("checkTokens bloquea al superar cuota", async () => {
  const db = await createStore();
  try {
    const guard = new GuardrailService(db);
    await guard.checkTokens("t1", 0);
    await assert.rejects(
      () => guard.checkTokens("t1", 1_000_000),
      (err: unknown) => err instanceof AppError && err.status === 429,
    );
    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});