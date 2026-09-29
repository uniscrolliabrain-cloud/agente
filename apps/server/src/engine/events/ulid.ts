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