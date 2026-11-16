import { randomUUID } from "node:crypto";
import { backgroundFailure } from "../../../log.ts";
import type { Store } from "../../../db.ts";
import type { CognitionV2Runtime } from "./runtime.ts";
import { runInTenantScope } from "../../../tenant-scope.ts";

export const COGNITION_WORKER_LANES = ["projection", "slow", "delivery", "receipts"] as const;
type Lane = typeof COGNITION_WORKER_LANES[number];
const HEALTH_PREFIX = "worker-health-v2:";
// A slow inference can legitimately take 45s; a stuck lane must eventually go unhealthy.
const HEARTBEAT_MS = 90_000;
const pause = (signal: AbortSignal, ms: number) => new Promise<void>((resolve) => {
  const done = () => { clearTimeout(timer); signal.removeEventListener("abort", done); resolve(); };
  const timer = setTimeout(done, ms);
  signal.addEventListener("abort", done, { once: true });
  if (signal.aborted) done();
});

/** Readiness requires recent successful ticks on every lane for every requested tenant.
 * It does not assert an empty backlog or that external providers are operational. */
export async function cognitionWorkerReady(db: Pick<Store, "rawQuery">, tenants: ReadonlySet<string>, now = Date.now()): Promise<boolean> {
  if (!tenants.size) return false;
  // Projectors record retry/dead-letter internally rather than throwing; a tick
  // alone is not evidence that those durable effects succeeded.
  const blocked = await db.rawQuery(`SELECT tenant FROM cognition_v2_inbox
    WHERE tenant=ANY($1::text[]) AND consumer=ANY($2::text[]) AND status IN ('retry','dead_letter') LIMIT 1`,
    [[...tenants], ["cognitive-v2.1", "kernel-receipts-v2.1"]]);
  if (blocked.length) return false;
  const rows = await db.rawQuery<{ tenant: string; consumer: string }>(
    `SELECT tenant,consumer FROM cognition_v2_cursors WHERE tenant=ANY($1::text[]) AND consumer LIKE $2 AND lease_until>$3`,
    [[...tenants], `${HEALTH_PREFIX}%`, new Date(now).toISOString()]);
  const present = new Set(rows.map((row) => JSON.stringify([row.tenant, row.consumer.slice(HEALTH_PREFIX.length).split(":")[0]])));
  return [...tenants].every((tenant) => COGNITION_WORKER_LANES.every((lane) => present.has(JSON.stringify([tenant, lane]))));
}

/** Independent tenant/lane loops: one stalled tenant or inference does not block others. */
export async function runCognitionWorkers(runtime: CognitionV2Runtime, signal: AbortSignal): Promise<void> {
  const work: Record<Lane, (tenant: string) => Promise<unknown>> = {
    projection: (tenant) => runtime.projector.tick(tenant),
    slow: (tenant) => runtime.slow.tick(tenant, signal),
    delivery: (tenant) => runtime.deliveryRecovery.tick(tenant),
    receipts: (tenant) => runtime.kernelReceipts.tick(tenant),
  };
  const instance = randomUUID();
  const loop = async (tenantId: string, lane: Lane) => {
    let failures = 0;
    const consumer = `${HEALTH_PREFIX}${lane}:${instance}`;
    try { while (!signal.aborted) {
      try {
        await runInTenantScope({ tenantId, actorId: "cognition-worker" }, () => work[lane](tenantId));
        if (signal.aborted) break;
        const now = Date.now();
        await runtime.db.rawQuery(`DELETE FROM cognition_v2_cursors WHERE tenant=$1 AND consumer LIKE $2 AND lease_until<=$3`,
          [tenantId, `${HEALTH_PREFIX}${lane}:%`, new Date(now).toISOString()]);
        await runtime.db.rawQuery(`INSERT INTO cognition_v2_cursors(tenant,consumer,lease_until) VALUES($1,$2,$3)
          ON CONFLICT(tenant,consumer) DO UPDATE SET lease_until=EXCLUDED.lease_until`,
        [tenantId, consumer, new Date(now + HEARTBEAT_MS).toISOString()]);
        failures = 0;
      } catch (error) {
        if (signal.aborted) break;
        failures = Math.min(failures + 1, 7);
        await runtime.db.rawQuery(`DELETE FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2`, [tenantId, consumer])
          .catch((cleanupError) => backgroundFailure("cognition v2 heartbeat cleanup", cleanupError));
        backgroundFailure(`cognition v2 ${lane} worker`, error);
      }
      await pause(signal, failures ? Math.min(30_000, 500 * 2 ** failures) : 500);
    } } finally {
      // Never delete another worker's heartbeat during a rolling restart.
      await runtime.db.rawQuery(`DELETE FROM cognition_v2_cursors WHERE tenant=$1 AND consumer=$2`, [tenantId, consumer])
        .catch((error) => backgroundFailure("cognition v2 heartbeat cleanup", error));
    }
  };
  await Promise.all([...runtime.tenants].flatMap((tenant) => COGNITION_WORKER_LANES.map((lane) => loop(tenant, lane))));
}
