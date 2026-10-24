// VERIFY_JWT_MIDDLEWARE_V1 - verifica el JWT y resuelve el Actor. Fail-closed.
// Camino A: parseo del payload + validacion exp/nbf. Sin verificacion criptografica
// de firma (va como deuda en -pendientes.md, F1.3-bis, hasta Campana 2b).
// Se monta solo si config.authProvider === "supabase".
import type { Context, Next } from "hono";
import { jwtPayloadSchema, type JwtPayload } from "../../../../../packages/domain/src/jwt.ts";
import type { Actor } from "../../../../../packages/domain/src/actor.ts";
import type { ActorService } from "../actors/service.ts";
import { AppError } from "../../../../../packages/domain/src/errors.ts";

export interface VerifyJwtDeps {
  actorService: ActorService;
  clockSkewSeconds?: number;
}

function decodeBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64").toString("utf8");
}

function parseJwt(authorization: string | undefined): JwtPayload {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid Authorization header", 401);
  }
  const token = authorization.slice(7).trim();
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AppError("Malformed JWT", 401);
  }
  let payloadRaw: string;
  try {
    payloadRaw = decodeBase64Url(parts[1]);
  } catch {
    throw new AppError("Malformed JWT payload", 401);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadRaw);
  } catch {
    throw new AppError("Malformed JWT payload JSON", 401);
  }
  return jwtPayloadSchema.parse(parsed);
}

function checkTime(payload: JwtPayload, skewSeconds: number): void {
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && now > payload.exp + skewSeconds) {
    throw new AppError("JWT expired", 401);
  }
  if (typeof payload.nbf === "number" && now + skewSeconds < payload.nbf) {
    throw new AppError("JWT not yet valid", 401);
  }
}

export function verifyJwtMiddleware(deps: VerifyJwtDeps) {
  const skew = deps.clockSkewSeconds ?? 30;
  return async (c: Context, next: Next) => {
    const jwtPayload = parseJwt(c.req.header("authorization"));
    checkTime(jwtPayload, skew);
    const actor: Actor = await deps.actorService.resolve(jwtPayload);
    c.set("jwtPayload", jwtPayload);
    c.set("actor", actor);
    await next();
  };
}