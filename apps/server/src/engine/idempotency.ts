// IDEMPOTENCY_KEYS_V1 â€” evita duplicar efectos externos cuando se reintenta.
//
// Los retries con backoff (03-01) pueden duplicar un efecto si el primer
// intento sÃ­ llegÃ³ al proveedor pero la respuesta se perdiÃ³. El proveedor
// recibe la misma idempotency key en el reintento y responde con el mismo
// resultado.
//
// Proveedores que la soportan: Stripe (nativo), Gmail (vÃ­a Message-ID
// determinista), Calendar (vÃ­a ETag + If-Match).
//
// Ver: docs/audits/03-resiliencia/roadmap.md Â§8.

import { createHash, randomUUID } from "node:crypto";

export type IdempotencyScope = "stripe" | "gmail" | "calendar" | "whatsapp" | "computer";

export interface IdempotencyKey {
  scope: IdempotencyScope;
  /** Clave determinista (misma entrada â†’ misma clave). */
  key: string;
  /** Timestamp de creaciÃ³n, informativo. */
  createdAt: string;
}

/**
 * Genera una idempotency key estable a partir de los datos de la operaciÃ³n.
 * Si dos llamadas tienen el mismo payload, obtienen la misma clave.
 */
// IDEMPOTENCY_CANONICAL_V1 - canonicaliza recursivamente.
function canonicalize(value: unknown, legacy = false): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(item => canonicalize(item, legacy));
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = legacy ? {} : Object.create(null);
  for (const k of Object.keys(obj).sort()) out[k] = canonicalize(obj[k], legacy);
  return out;
}

export function makeIdempotencyKey(
  scope: IdempotencyScope,
  payload: unknown,
): IdempotencyKey {
  const key = digestKey(scope, payload, false);
  return { scope, key, createdAt: new Date().toISOString() };
}

/** Read historical claim keys only; never use this to dispatch a new effect. */
export function legacyIdempotencyLookupKey(scope: IdempotencyScope, payload: unknown): string {
  return digestKey(scope, payload, true);
}

function digestKey(scope: IdempotencyScope, payload: unknown, legacy: boolean): string {
  const canonical = JSON.stringify(canonicalize(payload, legacy));
  return createHash("sha256")
    .update(`${scope}:${canonical}`)
    .digest("hex")
    .slice(0, 32);
}

/** Variante aleatoria para operaciones sin payload reproducible. */
export function randomIdempotencyKey(scope: IdempotencyScope): IdempotencyKey {
  return { scope, key: randomUUID(), createdAt: new Date().toISOString() };
}
