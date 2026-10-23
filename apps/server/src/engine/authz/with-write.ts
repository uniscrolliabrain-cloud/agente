// WITH_WRITE_V1 - wrapper de escritura con PDP + CAS (sin version, F4) + AuditTrail.
// Separa actor.id, owner del store y tenantId. No los sustituye.
import type { PolicyDecisionPoint, PolicyContext, PolicyTarget } from "./pdp.ts";
import type { Store } from "../../db.ts";
import type { StoreAuditStore } from "../../kernel/audit/store-store.ts";
import { AppError } from "../../errors.ts";

export interface WithWriteDeps {
  pdp: PolicyDecisionPoint;
  db: Store;
  audit?: StoreAuditStore;
}

export async function withWrite<T extends Record<string, unknown>>(
  deps: WithWriteDeps,
  ctx: PolicyContext,
  kind: string,
  id: string,
  fn: (record: T | null) => Promise<T> | T,
  useCompareAndSwap = false,
): Promise<T> {
  const owner = `${ctx.tenantId}:${ctx.actor.id}`;
  const target: PolicyTarget = { ownerId: ctx.actor.id };
  const decision = await deps.pdp.can(ctx, "update", kind as never, undefined, target);
  if (decision === "deny") {
    if (deps.audit) {
      await deps.audit.append({
        tenantId: ctx.tenantId,
        owner,
        action: "write.denied",
        actor: { kind: ctx.actor.kind, id: ctx.actor.id },
        payload: {
          resource: kind,
          field: null,
          classification: null,
          allowed: false,
          timestamp: new Date().toISOString(),
        },
      });
    }
    throw new AppError("Forbidden", 403);
  }
  const current = await deps.db.get<T>(owner, kind, id);
  const next = await fn(current);
  // WITH_WRITE_CAS_V1 - si useCompareAndSwap, CAS sobre {} para no perder updates concurrentes.
  if (useCompareAndSwap && deps.db.compareAndSwap) {
    const updated = await deps.db.compareAndSwap<T>(owner, kind, id, {}, next as Record<string, unknown>);
    if (!updated) throw new AppError("Conflict", 409);
  } else {
    await deps.db.put(owner, kind, next);
  }
  if (deps.audit) {
    await deps.audit.append({
      tenantId: ctx.tenantId,
      owner,
      action: "write.ok",
      actor: { kind: ctx.actor.kind, id: ctx.actor.id },
      payload: {
        resource: kind,
        allowed: true,
        timestamp: new Date().toISOString(),
      },
    });
  }
  return next;
}