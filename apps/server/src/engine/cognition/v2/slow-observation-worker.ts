import type { Store } from "../../../db.ts";
import type { SystemEvent } from "../../events/types.ts";
import type { CognitionV2Runtime } from "./runtime.ts";
import { DurableProjector } from "./storage.ts";
import { SlowObservationBridge } from "./slow-observation.ts";
import { selectSlowObservationCandidate } from "./slow-observation-candidates.ts";

/** C06.P03b: dormant opt-in consumer; never invoked from the fast chat path. */
export class SlowObservationWorker {
  private readonly cursor: DurableProjector;
  private readonly bridge: SlowObservationBridge;
  constructor(private readonly runtime: CognitionV2Runtime,
    private readonly dailyLimit = 20, db: Store = runtime.db) {
    if (!Number.isSafeInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 500) throw Error("SLOW_OBSERVER_QUOTA_INVALID");
    this.cursor = new DurableProjector(db, "slow-observer-v2.1");
    this.bridge = new SlowObservationBridge(runtime.context, runtime.slow);
  }
  async tick(tenant: string, limit = 25): Promise<number> {
    if (!this.runtime.tenants.has(tenant)) throw Error("SLOW_OBSERVER_TENANT_DENIED");
    const lease = await this.cursor.acquire(tenant);
    if (!lease) return 0;
    try {
      return await this.cursor.batch(lease, event => this.process(tenant, event), Math.min(limit, 25));
    } finally { await this.cursor.release(lease); }
  }
  private async process(tenant: string, event: SystemEvent): Promise<void> {
    const candidate = selectSlowObservationCandidate(event);
    if (!candidate || candidate.tenantId !== tenant) return;
    // A proposed card alone is not an authoritative business receipt.
    const record = (event.payload as { record?: { sourceEventId?: unknown } }).record;
    const sourceId = record?.sourceEventId;
    if (typeof sourceId !== "string" || !sourceId || sourceId === event.id) return;
    const receipts = await this.runtime.db.rawQuery<{ event: SystemEvent }>(
      `SELECT event FROM cognition_v2_events WHERE tenant=$1 AND event_id=$2 LIMIT 1`,
      [tenant, sourceId]);
    const receipt = receipts[0]?.event;
    if (!receipt || receipt.tenantId !== tenant || receipt.owner !== candidate.actorId ||
        receipt.id !== sourceId || !BUSINESS_EVENTS.has(receipt.type) ||
        !["task", "sop", "action", "entity"].includes(receipt.source.kind)) return;
    const identity = await this.runtime.identity(tenant, candidate.actorId, candidate.actorId, "chat");
    const today = new Date().toISOString().slice(0, 10);
    const quota = await this.runtime.db.rawQuery<{ calls: number }>(
      `INSERT INTO cognition_v2_observation_quotas(tenant,day,calls)
        VALUES($1,$2,1) ON CONFLICT(tenant,day) DO UPDATE
        SET calls=cognition_v2_observation_quotas.calls+1
        WHERE cognition_v2_observation_quotas.calls < $3 RETURNING calls`,
      [tenant, today, this.dailyLimit]);
    if (!quota.length) return; // Exhausted: skip without unbounded retries.
    await this.bridge.observe({
      identity, operationId: event.id, sourceId: candidate.sourceId,
      sourceRevision: candidate.sourceRevision,
      prompt: "Analiza la evidencia empresarial autorizada. Conserva su estado epistemológico (" +
        candidate.epistemic + "); no eleves inferencias o hechos reportados a hechos verificados. " +
        "No propongas ejecutar herramientas ni acciones empresariales.",
    });
  }
}

const BUSINESS_EVENTS = new Set<SystemEvent["type"]>([
  "task.completed", "task.failed", "sop.step_completed", "action.executed",
  "entity.created", "entity.updated", "invoice.issued", "invoice.paid",
  "lead.created", "opportunity.stage.changed", "payment.succeeded",
  "payment.failed", "ticket.resolved", "order.fulfilled",
]);
