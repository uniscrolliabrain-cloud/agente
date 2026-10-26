// JWT_SIGNATURE_VERIFY_V1 - verificacion criptografica del JWT del proveedor.
//
// Hasta ahora verifyJwtMiddleware solo decodificaba el payload y comprobaba
// exp/nbf: cualquiera podia fabricar un token con el `sub` de un admin y entrar.
// Este modulo cierra esa deuda.
//
// Soporta los dos modos que Supabase usa de verdad:
//   - HS256 con el secreto compartido del proyecto (legacy, SUPABASE_JWT_SECRET).
//   - RS256/ES256 con la JWKS publica (`.well-known/jwks.json`), que es el modo
//     actual y el que permite rotar claves sin tocar el servidor.
//
// Fail-closed: si no hay material de verificacion configurado se lanza 503. Un
// despliegue mal configurado no debe aceptar tokens sin firma "por comodidad".
import {
  createHmac,
  createPublicKey,
  timingSafeEqual,
  verify as verifySignatureWithKey,
} from "node:crypto";
import { AppError } from "../../errors.ts";
import { jwtPayloadSchema, type JwtPayload } from "../../../../../packages/domain/src/jwt.ts";

type HmacAlg = "HS256" | "HS384" | "HS512";
type AsymAlg = "RS256" | "RS384" | "RS512" | "ES256" | "ES384";
type Alg = HmacAlg | AsymAlg;

const HMAC: Record<HmacAlg, { hash: string; bytes: number }> = {
  HS256: { hash: "sha256", bytes: 32 },
  HS384: { hash: "sha384", bytes: 48 },
  HS512: { hash: "sha512", bytes: 64 },
};
const ASYM: Record<AsymAlg, { hash: string; p1363: boolean }> = {
  RS256: { hash: "sha256", p1363: false },
  RS384: { hash: "sha384", p1363: false },
  RS512: { hash: "sha512", p1363: false },
  ES256: { hash: "sha256", p1363: true },
  ES384: { hash: "sha384", p1363: true },
};

export interface JwksFetcher {
  (url: string): Promise<unknown>;
}

export interface VerifyJwtOptions {
  /** Secreto compartido para HS256/384/512. */
  secret?: string;
  /** URL de la JWKS para RS256/ES256. */
  jwksUrl?: string;
  /** aud obligatorio del token (Supabase: "authenticated"). */
  audience: string;
  /** iss obligatorio, si se conoce. */
  issuer?: string;
  clockSkewSeconds?: number;
  /** Solo tests: inyectar fetch y reloj. */
  fetchImpl?: typeof fetch;
  now?: () => number;
  jwksTtlMs?: number;
}

interface Jwk {
  kid?: string;
  kty?: string;
  alg?: string;
  [key: string]: unknown;
}

function decodeBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function parseJson(part: string, what: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(decodeBase64Url(part).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new AppError(`Malformed JWT ${what}`, 401);
  }
}

export interface DecodedJwt {
  header: { alg?: string; kid?: string; typ?: string };
  payload: unknown;
  signingInput: string;
  signature: Buffer;
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.split(".");
  if (parts.length !== 3) throw new AppError("Malformed JWT", 401);
  const header = parseJson(parts[0], "header") as DecodedJwt["header"];
  if (!header.alg || typeof header.alg !== "string") {
    throw new AppError("JWT without alg", 401);
  }
  return {
    header,
    payload: parseJson(parts[1], "payload"),
    signingInput: `${parts[0]}.${parts[1]}`,
    signature: decodeBase64Url(parts[2]),
  };
}

/** Cache de JWKS por URL. Se reusa entre peticiones del mismo proceso. */
const jwksCache = new Map<string, { keys: Jwk[]; expiresAt: number }>();

async function loadJwks(url: string, options: VerifyJwtOptions): Promise<Jwk[]> {
  const now = (options.now ?? Date.now)();
  const ttl = options.jwksTtlMs ?? 10 * 60 * 1000;
  const cached = jwksCache.get(url);
  if (cached && cached.expiresAt > now) return cached.keys;
  const doFetch = options.fetchImpl ?? fetch;
  let body: unknown;
  try {
    const response = await doFetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    body = await response.json();
  } catch (error) {
    // JWT_JWKS_FAIL_CLOSED_V1 - si no se puede leer la JWKS, no se acepta el
    // token. Un 401 con causa es mejor que confiar en una firma sin verificar.
    throw new AppError(
      `JWT verification unavailable: ${error instanceof Error ? error.message : "jwks fetch failed"}`,
      503,
    );
  }
  const keys = (body as { keys?: unknown }).keys;
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new AppError("JWT verification unavailable: empty JWKS", 503);
  }
  const parsed = keys.filter((k): k is Jwk => Boolean(k) && typeof k === "object");
  jwksCache.set(url, { keys: parsed, expiresAt: now + ttl });
  return parsed;
}

/** Solo tests: vaciar la cache de JWKS. */
export function clearJwksCache(): void {
  jwksCache.clear();
}

async function verifyAsymmetric(
  decoded: DecodedJwt,
  alg: AsymAlg,
  options: VerifyJwtOptions,
): Promise<void> {
  if (!options.jwksUrl) {
    throw new AppError("JWT verification is not configured (JWKS)", 503);
  }
  const keys = await loadJwks(options.jwksUrl, options);
  const kid = decoded.header.kid;
  const candidates = kid ? keys.filter((k) => k.kid === kid) : keys;
  const jwk = candidates.find((k) => !k.alg || k.alg === alg) ?? candidates[0];
  if (!jwk) throw new AppError("JWT signing key not found", 401);
  let key;
  try {
    key = createPublicKey({
      key: jwk as unknown as import("node:crypto").JsonWebKey,
      format: "jwk",
    });
  } catch {
    throw new AppError("JWT signing key is not a public key", 401);
  }
  const { hash, p1363 } = ASYM[alg];
  const ok = verifySignatureWithKey(
    hash,
    Buffer.from(decoded.signingInput, "utf8"),
    p1363 ? { key, dsaEncoding: "ieee-p1363" } : key,
    decoded.signature,
  );
  if (!ok) throw new AppError("Invalid JWT signature", 401);
}

function verifyHmac(decoded: DecodedJwt, alg: HmacAlg, secret: string): void {
  const { hash, bytes } = HMAC[alg];
  const expected = createHmac(hash, secret).update(decoded.signingInput, "utf8").digest();
  // Comparacion en tiempo constante; longitudes distintas ya son no validas.
  if (decoded.signature.length !== bytes || expected.length !== decoded.signature.length) {
    throw new AppError("Invalid JWT signature", 401);
  }
  if (!timingSafeEqual(expected, decoded.signature)) {
    throw new AppError("Invalid JWT signature", 401);
  }
}

function audienceMatches(aud: unknown, expected: string): boolean {
  if (typeof aud === "string") return aud === expected;
  if (Array.isArray(aud)) return aud.some((value) => value === expected);
  return false;
}

/**
 * Verifica firma, tiempo, audiencia e issuer, y devuelve el payload tipado.
 * Toda desviacion es 401 (o 503 si falta configuracion), nunca un bypass.
 */
export async function verifyJwtToken(token: string, options: VerifyJwtOptions): Promise<JwtPayload> {
  const decoded = decodeJwt(token);
  const alg = decoded.header.alg as Alg;
  if (alg in HMAC) {
    if (!options.secret) {
      throw new AppError("JWT verification is not configured (secret)", 503);
    }
    verifyHmac(decoded, alg as HmacAlg, options.secret);
  } else if (alg in ASYM) {
    await verifyAsymmetric(decoded, alg as AsymAlg, options);
  } else {
    // alg=none y cualquier algoritmo no listado: rechazo explicito.
    throw new AppError(`Unsupported JWT alg: ${String(decoded.header.alg)}`, 401);
  }

  const payload = jwtPayloadSchema.safeParse(decoded.payload);
  if (!payload.success) throw new AppError("Invalid JWT claims", 401);
  const claims = payload.data;

  const nowSeconds = Math.floor((options.now ?? Date.now)() / 1000);
  const skew = options.clockSkewSeconds ?? 30;
  if (nowSeconds > claims.exp + skew) throw new AppError("JWT expired", 401);
  if (typeof claims.nbf === "number" && nowSeconds + skew < claims.nbf) {
    throw new AppError("JWT not yet valid", 401);
  }
  if (!audienceMatches(claims.aud, options.audience)) {
    throw new AppError("JWT audience mismatch", 401);
  }
  if (options.issuer && claims.iss !== options.issuer) {
    throw new AppError("JWT issuer mismatch", 401);
  }
  return claims;
}
