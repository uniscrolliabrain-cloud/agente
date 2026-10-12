// USER_HEADER_MIDDLEWARE_V1
import type { Context, Next } from "hono";

const USER_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

export function userHeaderMiddleware() {
  return async (c: Context, next: Next) => {
    const header = c.req.header("x-user-id");
    if (header && !USER_ID_RE.test(header)) {
      c.header("X-User-Id-Rejected", "1");
      await next();
      return;
    }
    await next();
  };
}