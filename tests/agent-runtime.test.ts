import assert from "node:assert/strict";
import { test } from "node:test";
import { AgentRuntimeManager } from "../apps/server/src/engine/agents/runtime.ts";

test("spawn devuelve runtimeId unico y activoCount lo cuenta", async () => {
  const manager = new AgentRuntimeManager();
  const a = await manager.spawn({ tenantId: "t1", owner: "o1", roleId: "comercial" });
  const b = await manager.spawn({ tenantId: "t1", owner: "o1", roleId: "atencion" });
  assert.notEqual(a.runtimeId, b.runtimeId);
  assert.equal(manager.activeCount("o1"), 2);
  assert.equal(manager.activeCount("o2"), 0);
});

test("complete limpia el runtime activo", async () => {
  const manager = new AgentRuntimeManager();
  const r = await manager.spawn({ tenantId: "t1", owner: "o1", roleId: "comercial" });
  await manager.complete(r.runtimeId, 1500);
  assert.equal(manager.activeCount("o1"), 0);
  assert.equal(manager.get(r.runtimeId), undefined);
});

test("fail limpia el runtime y no propaga excepcion", async () => {
  const manager = new AgentRuntimeManager();
  const r = await manager.spawn({ tenantId: "t1", owner: "o1", roleId: "legal" });
  await manager.fail(r.runtimeId, "boom");
  assert.equal(manager.activeCount("o1"), 0);
});

test("complete/fail sobre runtime inexistente no hace nada", async () => {
  const manager = new AgentRuntimeManager();
  await manager.complete("no-existe", 100);
  await manager.fail("no-existe", "x");
  assert.equal(manager.activeCount("o1"), 0);
});

test("correlationId se genera si no se pasa y se reutiliza si se pasa", async () => {
  const manager = new AgentRuntimeManager();
  const a = await manager.spawn({ tenantId: "t1", owner: "o1", roleId: "x" });
  assert.ok(a.correlationId.length > 0);
  const b = await manager.spawn({ tenantId: "t1", owner: "o1", roleId: "x", correlationId: "fixed" });
  assert.equal(b.correlationId, "fixed");
});
