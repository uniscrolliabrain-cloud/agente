import { randomBytes } from "node:crypto";

/**
 * ULID sin dependencia externa. Ordenable por tiempo, 26 caracteres, base32 Crockford.
 * Formato: 10 chars de timestamp (48 bits) + 16 chars aleatorios (80 bits).
 *
 * Por que ULID y no UUIDv4: los eventos del bus se ordenan por id cuando
 * emittedAt empata. Con UUIDv4 el orden seria aleatorio; con ULID es temporal.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function ulid(now: number = Date.now()): string {
  let ts = now;
  let time = "";
  for (let i = 0; i < 10; i += 1) {
    time = ALPHABET[ts % 32] + time;
    ts = Math.floor(ts / 32);
  }
  const bytes = randomBytes(16);
  let rand = "";
  for (let i = 0; i < 16; i += 1) {
    rand += ALPHABET[bytes[i] % 32];
  }
  return time + rand;
}
// EVENTS_TIMESTAMP_OF_V1 - extrae ms del ULID.
export function timestampOf(id: string): number {
  if (typeof id !== "string" || id.length < 10) return 0;
  const time = id.slice(0, 10);
  let ts = 0;
  for (const c of time) {
    const idx = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".indexOf(c);
    if (idx < 0) return 0;
    ts = ts * 32 + idx;
  }
  return ts;
}