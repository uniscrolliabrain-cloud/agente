// POLICY_ENFORCEMENT_POINT_V1 - middleware HTTP que adjunta ctx al request.
// No es la unica defensa: los handlers usan withRead/withWrite.
import type { Context, Next } from "hono";
import type { PolicyDecisionPoint, PolicyContext } from "./pdp.ts";

export function authzMiddleware(pdp: PolicyDecisionPoint) {
  return async (c: Context, next: Next) => {
    const actor = c.get("actor");
    const ctx = c.get("ctx");
    if (!actor || !ctx) {
      c.set("authz", { pdp, ctx: null });
      await next();
      return;
    }
    const policyCtx: PolicyContext = {
      tenantId: ctx.tenantId,
      actor,
      sessionId: ctx.sessionId,
      requestId: ctx.requestId,
    };
    c.set("authz", { pdp, ctx: policyCtx });
    await next();
  };
}