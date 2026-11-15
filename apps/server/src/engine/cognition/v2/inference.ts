// C11_INDEPENDENT_LANES_V2: hard durable admission per tenant/profile, no cross-profile fallback.
import { randomUUID } from "node:crypto";
import { CircuitBreaker } from "../../circuit-breaker.ts";
import type { Store } from "../../../db.ts";
export type InferenceProfile = "fast" | "slow";
export class InferenceLane {
  private readonly circuits = new Map<string, CircuitBreaker>();
  constructor(readonly db: Store, readonly profile: InferenceProfile, readonly capacity: number,
    readonly timeoutMs: number, readonly dailyLimit: number) {
  }
  async run<T>(tenant: string, operation: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal): Promise<T> {
    signal?.throwIfAborted();
    const token = randomUUID(), now = new Date(), day = now.toISOString().slice(0, 10);
    const expires = new Date(now.getTime() + this.timeoutMs + 5000).toISOString();
    await this.db.transaction(async () => {
      await this.db.rawQuery(`INSERT INTO cognition_v2_lane_locks(tenant,lane) VALUES($1,$2) ON CONFLICT DO NOTHING`, [tenant, this.profile]);
      await this.db.rawQuery(`SELECT tenant FROM cognition_v2_lane_locks WHERE tenant=$1 AND lane=$2 FOR UPDATE`, [tenant, this.profile]);
      await this.db.rawQuery(`DELETE FROM cognition_v2_lane_slots WHERE tenant=$1 AND lane=$2 AND expires_at<=$3`, [tenant, this.profile, now.toISOString()]);
      const [active] = await this.db.rawQuery<{ count: string }>(`SELECT count(*) AS count FROM cognition_v2_lane_slots WHERE tenant=$1 AND lane=$2`, [tenant, this.profile]);
      if (Number(active.count) >= this.capacity) throw Error("LANE_SATURATED");
      const usage = await this.db.rawQuery(`INSERT INTO cognition_v2_lane_usage(tenant,lane,day,calls) VALUES($1,$2,$3,1)
        ON CONFLICT(tenant,lane,day) DO UPDATE SET calls=cognition_v2_lane_usage.calls+1
        WHERE cognition_v2_lane_usage.calls<$4 RETURNING calls`, [tenant, this.profile, day, this.dailyLimit]);
      if (!usage.length) throw Error("LANE_BUDGET_EXHAUSTED");
      await this.db.rawQuery(`INSERT INTO cognition_v2_lane_slots(tenant,lane,token,expires_at) VALUES($1,$2,$3,$4)`, [tenant, this.profile, token, expires]);
    });
    const controller = new AbortController();
    const abort = () => controller.abort(signal?.reason);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      let circuit = this.circuits.get(tenant);
      if (!circuit) { circuit = new CircuitBreaker(`cognition-v2:${this.profile}:${tenant}`); this.circuits.set(tenant, circuit); }
      const result = await circuit.call(async () => {
        try { return { ok: true as const, value: await Promise.race([
        Promise.resolve().then(() => { controller.signal.throwIfAborted(); return operation(controller.signal); }),
        new Promise<never>((_, reject) => {
          const cancelled = () => reject(Error("INFERENCE_CANCELLED"));
          controller.signal.addEventListener("abort", cancelled, { once: true });
          if (controller.signal.aborted) cancelled();
          timer = setTimeout(() => { reject(Error("INFERENCE_TIMEOUT")); controller.abort(); }, this.timeoutMs);
        }),
      ]) }; }
        catch (error) {
          if (error instanceof Error && error.message === "INFERENCE_CANCELLED") return { ok: false as const, error };
          throw error;
        }
      });
      if (!result.ok) throw result.error;
      return result.value;
    } finally {
      clearTimeout(timer); signal?.removeEventListener("abort", abort);
      await this.db.rawQuery(`DELETE FROM cognition_v2_lane_slots WHERE tenant=$1 AND lane=$2 AND token=$3`, [tenant, this.profile, token]);
    }
  }
}
export function fastOnlyModel(env: NodeJS.ProcessEnv = process.env): { model: string; apiKey: string } {
  const provider = env.FAST_LLM_PROVIDER?.trim(), model = env.FAST_LLM_MODEL?.trim(), apiKey = env.FAST_LLM_API_KEY?.trim();
  if (!provider || !model || !apiKey) throw Error("FAST_PROFILE_UNCONFIGURED");
  return { model: `${provider}/${model}`, apiKey };
}
