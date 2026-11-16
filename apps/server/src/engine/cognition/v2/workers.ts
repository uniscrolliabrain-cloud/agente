import { backgroundFailure } from "../../../log.ts";
import type { CognitionV2Runtime } from "./runtime.ts";
import { runInTenantScope } from "../../../tenant-scope.ts";
const pause = (signal: AbortSignal) => new Promise<void>((resolve) => {
  const done = () => { clearTimeout(timer); signal.removeEventListener("abort", done); resolve(); };
  const timer = setTimeout(done, 500);
  signal.addEventListener("abort", done, { once: true });
  if (signal.aborted) done();
});
/** Independent loops; inference never stalls projections or delivery recovery. */
export async function runCognitionWorkers(runtime: CognitionV2Runtime, signal: AbortSignal): Promise<void> {
  const loop = async (work: (tenant: string) => Promise<unknown>) => {
    while (!signal.aborted) {
      for (const tenantId of runtime.tenants) {
        if (signal.aborted) break;
        await runInTenantScope({ tenantId, actorId: "cognition-worker" }, () => work(tenantId)).catch((error) => backgroundFailure("cognition v2 worker", error));
      }
      if (!signal.aborted) await pause(signal);
    }
  };
  await Promise.all([loop((tenant) => runtime.projector.tick(tenant)), loop((tenant) => runtime.slow.tick(tenant, signal)),
    loop((tenant) => runtime.deliveryRecovery.tick(tenant))]);
}
