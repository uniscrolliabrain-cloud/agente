// TESTS_EDIT_LOCK_V1 — lock optimista in-process.
// Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md.

import assert from "node:assert/strict";
import { test } from "node:test";
import { EditLock } from "../apps/server/src/engine/edit-lock.ts";

test("acquire: primer usuario obtiene el lock", () => {
  const lock = new EditLock();
  const acquired = lock.acquire("user-A", "project", "p1");
  assert.ok(acquired);
  assert.equal(acquired.userId, "user-A");
});

test("acquire: segundo usuario NO obtiene el lock", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  const second = lock.acquire("user-B", "project", "p1");
  assert.equal(second, null);
});

test("acquire: mismo usuario puede re-adquirir", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  const again = lock.acquire("user-A", "project", "p1");
  assert.ok(again);
});

test("release libera el lock si es del usuario", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  lock.release("user-A", "project", "p1");
  const second = lock.acquire("user-B", "project", "p1");
  assert.ok(second);
});

test("release NO libera el lock si es de otro usuario", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  lock.release("user-B", "project", "p1");
  const second = lock.acquire("user-B", "project", "p1");
  assert.equal(second, null);
});

test("locks de recursos distintos no se pisan", () => {
  const lock = new EditLock();
  lock.acquire("user-A", "project", "p1");
  const other = lock.acquire("user-A", "project", "p2");
  assert.ok(other);
});
