// DISTRIBUTED_NOTE: en Fly multi-machine este limiter es por maquina. Para prod cliente-unico con min=1 basta. Si escalas a 2+ maquinas, mover a Redis.
/**
 * Limite de intentos en memoria, por clave arbitraria (IP, email...). Cada proceso del
 * API lleva su propia cuenta, que es lo que basta para frenar fuerza bruta contra
 * /api/auth/login en un deployment de un solo proceso sin anadir dependencias.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Milisegundos que faltan hasta que la ventana se reabra. 0 cuando se permite. */
  retryAfterMs: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 5000,
  ) {}

  /**
   * RATE_LIMIT_TENANT_V1 - toma un intento scoped por tenant+usuario.
   * La key compuesta evita que un tenant agote el limite del otro.
   */
  takeForTenant(tenantId: string, userId: string, action: string): RateLimitResult {
    return this.take(`${tenantId}:${userId}:${action}`);
  }

  /** Registra un intento. `allowed: false` significa que la clave agoto su ventana. */
  take(key: string): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.prune(now);
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }
    if (bucket.count >= this.limit) return { allowed: false, retryAfterMs: bucket.resetAt - now };
    bucket.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  /** Un acceso correcto limpia la ventana de esa clave. */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  private prune(now: number): void {
    if (this.buckets.size < this.maxKeys) return;
    for (const [key, bucket] of this.buckets)
      if (bucket.resetAt <= now) this.buckets.delete(key);
    // Still full: drop the oldest entries so a flood of keys cannot grow the map forever.
    while (this.buckets.size >= this.maxKeys) {
      const oldest = this.buckets.keys().next();
      if (oldest.done) return;
      this.buckets.delete(oldest.value);
    }
  }
}
