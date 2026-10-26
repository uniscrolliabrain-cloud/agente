// VERIFY_JWT_MIDDLEWARE_V2 - verifica el JWT (firma incluida) y resuelve el Actor.
//
// V1 decodificaba el payload sin comprobar la firma: un token fabricado a mano
// con el `sub` de un admin entraba como admin. V2 delega en jwt-verify.ts, que
// valida HS256 (secreto compartido) o RS256/ES256 (JWKS) y comprueba
// exp/nbf/aud/iss. Se monta solo si config.authProvider === "supabase".
import type { Context, Next } from "hono";
import type { Actor } from "../../../../../packages/domain/src/actor.ts";
import type { ActorService } from "../actors/service.ts";
import { verifyJwtToken } from "./jwt-verify.ts";

export interface VerifyJwtDeps {
  actorService: ActorService;
  /** Secreto HS256 del proyecto. */
  secret?: string;
  /** URL de la JWKS para RS256/ES256. */
  jwksUrl?: string;
  audience: string;
  issuer?: string;
  clockSkewSeconds?: number;
  /** Solo tests. */
  fetchImpl?: typeof fetch;
  now?: () => number;
}

export function verifyJwtMiddleware(deps: VerifyJwtDeps) {
  const skew = deps.clockSkewSeconds ?? 30;
  return async (c: Context, next: Next) => {
    const authorization = c.req.header("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid Authorization header" }, 401);
    }
    const token = authorization.slice(7).trim();
    if (!token) return c.json({ error: "Missing or invalid Authorization header" }, 401);

    const jwtPayload = await verifyJwtToken(token, {
      ...(deps.secret ? { secret: deps.secret } : {}),
      ...(deps.jwksUrl ? { jwksUrl: deps.jwksUrl } : {}),
      audience: deps.audience,
      ...(deps.issuer ? { issuer: deps.issuer } : {}),
      clockSkewSeconds: skew,
      ...(deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : {}),
      ...(deps.now ? { now: deps.now } : {}),
    });

    const actor: Actor = await deps.actorService.resolve(jwtPayload);
    c.set("jwtPayload", jwtPayload);
    c.set("actor", actor);
    await next();
  };
}
