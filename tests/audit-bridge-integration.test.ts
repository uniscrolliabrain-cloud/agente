import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import { createApp } from "../apps/server/src/app.ts";
import { testConfig } from "./helpers/config.ts";
import { globalSubscribers } from "../apps/server/src/engine/events/subscriber.ts";
import { globalMetrics } from "../apps/server/src/metrics/registry.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";

async function eventually<T>(read: () => Promise<T | undefined>): Promise<T> {
  // The real kernel waits its default 10s quiescence before closing a turn.
  const end = Date.now() + 20_000;
  while (Date.now() < end) {
    const result = await read();
    if (result !== undefined) return result;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw Error("bridge effect not observed");
}

test("registered kernel bridges project audit and notifications, metrics and a bus-to-kernel turn", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bridge-test-"));
  const db = await createStore();
  let app: Awaited<ReturnType<typeof createApp>> | undefined;
  try {
    globalSubscribers.clear();
    app = await createApp(db, testConfig({ dataDir: directory }));
    assert.ok(app.agent.kernel);
    assert.equal(await app.agent.registerKernelListeners(), 6);
    assert.equal(await app.agent.registerKernelListeners(), 0, "registration is idempotent");
    const tenant = "bridge-integration", owner = "bridge-user";
    const receipt = await runInTenantScope({ tenantId: tenant, actorId: owner }, () => app!.bus.emit(owner, "policy.denied", { kind: "system", id: "bridge-test" }, { policyId: "synthetic-policy", action: "read", reason: "synthetic denied" }, { tenantId: tenant }));
    assert.equal(receipt.persisted, true);
    await eventually(async () => (await db.get(`${tenant}:${tenant}`, "kernel-audit-index", `ka-${receipt.id}`)) ?? undefined);
    await eventually(async () => (await db.get(`${tenant}:${owner}`, "notifications", `kn-${receipt.id}`)) ?? undefined);
    await eventually(async () => {
      const turns = await db.list<{ id: string; status?: string; triggers?: string[] }>(tenant, "cognitive-turns");
      return turns.find(turn => turn.triggers?.includes(`bus:policy.denied:${receipt.id}`) && turn.status === "closed");
    });
    const metric = `agente_kernel_turns_total{owner="${owner}",tenantId="${tenant}"}`;
    const count = () => Number(globalMetrics.render().split("\n").find(line => line.startsWith(`${metric} `))?.slice(metric.length + 1) ?? 0);
    const before = count();
    globalSubscribers.publish({ id: "metrics-bridge", tenantId: tenant, owner, type: "kernel.turn.opened", schemaVersion: "1.0",
      emittedAt: new Date().toISOString(), source: { kind: "system", id: "bridge-test" }, payload: {} });
    assert.equal(count(), before + 1);
  } finally {
    globalSubscribers.clear();
    await app?.agent.stop();
    await db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
