// IDEMPOTENCY_KEYS_V1 — evita duplicar efectos externos cuando se reintenta.
//
// Los retries con backoff (03-01) pueden duplicar un efecto si el primer
// intento sí llegó al proveedor pero la respuesta se perdió. El proveedor
// recibe la misma idempotency key en el reintento y responde con el mismo
// resultado.
//
// Proveedores que la soportan: Stripe (nativo), Gmail (vía Message-ID
// determinista), Calendar (vía ETag + If-Match).
//
// Ver: docs/audits/03-resiliencia/roadmap.md §8.

import { createHash, randomUUID } from "node:crypto";

export type IdempotencyScope = "stripe" | "gmail" | "calendar" | "whatsapp" | "computer";

export interface IdempotencyKey {
  scope: IdempotencyScope;
  /** Clave determinista (misma entrada → misma clave). */
  key: string;
  /** Timestamp de creación, informativo. */
  createdAt: string;
}

/**
 * Genera una idempotency key estable a partir de los datos de la operación.
 * Si dos llamadas tienen el mismo payload, obtienen la misma clave.
 */
export function makeIdempotencyKey(
  scope: IdempotencyScope,
  payload: unknown,
): IdempotencyKey {
  const canonical = JSON.stringify(payload, Object.keys(payload as object).sort());
  const key = createHash("sha256")
    .update(`${scope}:${canonical}`)
    .digest("hex")
    .slice(0, 32);
  return { scope, key, createdAt: new Date().toISOString() };
}

/** Variante aleatoria para operaciones sin payload reproducible. */
export function randomIdempotencyKey(scope: IdempotencyScope): IdempotencyKey {
  return { scope, key: randomUUID(), createdAt: new Date().toISOString() };
}
