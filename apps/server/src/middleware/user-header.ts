// USER_HEADER_MIDDLEWARE_V1
import type { Context, Next } from "hono";

const USER_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

// USER_HEADER_REMOVED_V1 - userHeaderMiddleware ya no se monta en app.ts.
// Solo se mantiene si DEBUG_USER_HEADER=true. No autoriza.
export function userHeaderMiddleware() {
  return async (c: Context, next: Next) => {
    // USER_HEADER_DEPRECATED_V1 - x-user-id deprecado. No autoriza.
    const header = c.req.header("x-user-id");
    if (header) {
      if (!USER_ID_RE.test(header)) {
        c.header("X-User-Id-Rejected", "1");
      } else {
        const ctx = c.get("ctx") as { actorId?: string } | undefined;
        if (ctx?.actorId && ctx.actorId !== header) {
          c.header("X-User-Id-Mismatch", "1");
        }
      }
    }
    await next();
  };
}