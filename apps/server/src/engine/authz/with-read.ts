// WITH_READ_V1 - wrapper de lectura con PDP + FieldFilter + AuditTrail.
// Separa actor.id, owner del store y tenantId. No los sustituye.
import type { PolicyDecisionPoint, PolicyContext, PolicyTarget } from "./pdp.ts";
import type { FieldFilter } from "./field-filter.ts";
import type { Store } from "../../db.ts";
import type { StoreAuditStore } from "../../kernel/audit/store-store.ts";
import { AppError } from "../../errors.ts";

export interface WithReadDeps {
  pdp: PolicyDecisionPoint;
  fieldFilter: FieldFilter;
  db: Store;
  audit?: StoreAuditStore;
}

export async function withRead<T extends Record<string, unknown>>(
  deps: WithReadDeps,
  ctx: PolicyContext,
  kind: string,
  id: string,
  fn: (record: T) => Promise<T> | T,
): Promise<T> {
  // owner del store se resuelve con ctx.tenantId + actor.id, no se sustituye.
  const owner = `${ctx.tenantId}:${ctx.actor.id}`;
  const record = await deps.db.get<T>(owner, kind, id);
  if (!record) throw new AppError("Not found", 404);
  const target: PolicyTarget = { ownerId: ctx.actor.id };
  const decision = await deps.pdp.can(ctx, "read", kind as never, undefined, target);
  if (decision === "deny") {
    if (deps.audit) {
      await deps.audit.append({
        tenantId: ctx.tenantId,
        owner,
        action: "read.denied",
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
    // WITH_READ_AUDIT_TRAIL_V1 - la denegacion a nivel de campo restricted/secret
    // la emite AuditTrail.recordDenied (engine/audit-trail/service.ts). withRead
    // opera sobre el registro completo, no conoce field/classification, asi que
    // aqui solo se audita la denegacion del PDP.
    throw new AppError("Forbidden", 403);
  }
  const filtered = await deps.fieldFilter.filter(ctx, kind, record, target);
  return fn(filtered as T);
}