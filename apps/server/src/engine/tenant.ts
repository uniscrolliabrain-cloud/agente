// ENGINE_TENANT_V1 - punto unico de resolucion de tenantId.
//
// Cierra #1, #113, #193: nadie hardcodea "default" fuera de aqui.
//
// Como funciona:
//   1. Si el owner tiene fila en records/tenant-membership/default, se usa ese tenantId.
//   2. Si no, cae a "default" (single-tenant).
//   3. Cachea por owner en el proceso. La membership no cambia en caliente.
//
// Cuando migremos a multi-tenant real, DatabaseTenantResolver leera de otra
// tabla o de un subdominio. Este servicio es la frontera que permite esa
// migracion sin tocar el kernel.

import type { Store } from "../db.ts";
import type { Config } from "../config.ts";

const DEFAULT_TENANT_ID = "default";
const MEMBERSHIP_KIND = "tenant-membership";
const MEMBERSHIP_ID = "default";

export interface TenantResolution {
  tenantId: string;
  source: "database" | "default";
}

// TENANT_SERVICE_TTL_ENV_V1 - antes el TTL era 5 min hardcodeado. Si un admin
// cambia la membership, el cache no se entera hasta 5 min despues, y el kernel
// escribe en el tenant viejo durante ese tiempo. Ahora es configurable:
// en produccion conviene bajarlo a 30s; en dev, mantener 5 min.
const TENANT_CACHE_TTL_MS = (() => {
  const raw = process.env.TENANT_CACHE_TTL_MS;
  if (!raw) return 5 * 60 * 1000;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 5 * 60 * 1000;
})();

export class TenantService {
  // TENANT_SERVICE_TTL_V1 - cache con TTL de 5 min.
  private readonly cache = new Map<string, { tenantId: string; at: number }>();

  constructor(
    private readonly db: Store,
    private readonly config: Config,
  ) {}

  /**
   * Resuelve el tenantId para un owner.
   * Cachea en el proceso: la membership no cambia en caliente.
   */
  async resolve(owner: string): Promise<TenantResolution> {
    const cached = this.cache.get(owner);
    if (cached && Date.now() - cached.at < TENANT_CACHE_TTL_MS) {
      return { tenantId: cached.tenantId, source: "database" };
    }
    const row = await this.db
      .get<{ tenantId: string }>(owner, MEMBERSHIP_KIND, MEMBERSHIP_ID)
      .catch(() => null);
    if (row?.tenantId) {
      this.cache.set(owner, { tenantId: row.tenantId, at: Date.now() });
      return { tenantId: row.tenantId, source: "database" };
    }
    // TENANT_CACHE_FALLBACK_V1 - cachear el fallback.
    this.cache.set(owner, { tenantId: DEFAULT_TENANT_ID, at: Date.now() });
    return { tenantId: DEFAULT_TENANT_ID, source: "default" };
  }

  /** Atajo: solo el tenantId. */
  async tenantIdFor(owner: string): Promise<string> {
    return (await this.resolve(owner)).tenantId;
  }

  /**
   * Registra el owner en un tenant. Idempotente.
   * Se llama desde provision-client o desde el alta de usuario cuando
   * el deployment pase a multi-tenant.
   */
  async setMembership(owner: string, tenantId: string): Promise<void> {
    await this.db.put(owner, MEMBERSHIP_KIND, {
      id: MEMBERSHIP_ID,
      tenantId,
      updatedAt: new Date().toISOString(),
    });
    this.cache.set(owner, { tenantId, at: Date.now() });
  }

  /** Invalida la cache de un owner (p.ej. tras cambiar membership). */
  invalidate(owner: string): void {
    this.cache.delete(owner);
  }

  /** Limpia toda la cache (para tests). */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * TENANT_CACHE_INVALIDATE_ALL_V1 â€” invalida toda la cache tras cambios
   * administrativos (mover owner entre tenants).
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /** TENANT_CACHE_STATS_V1 â€” tamaÃ±o actual de la cache, para debug. */
  cacheSize(): number {
    return this.cache.size;
  }
}

export { DEFAULT_TENANT_ID };

// TENANT_SERVICE_V2 - helpers para que nadie hardcodee tenantId.
//
// Regla: en codigo de negocio, todo acceso al Store pasa por TenantScopedStore,
// que resuelve el tenant con este servicio. Si alguien necesita el tenantId
// directamente, usa tenantIdFor(owner).
//
// El unico sitio donde "default" es legitimo es DEFAULT_TENANT_ID (arriba).
// El resto de codigo nunca lo hardcodea.

export function assertNotHardcodedTenantId(value: string, where: string): void {
  if (value === DEFAULT_TENANT_ID) {
    throw new Error(
      `TENANT_ID_HARDCODED_V2: "${DEFAULT_TENANT_ID}" hardcodeado en ${where}. ` +
        "Usa TenantService.tenantIdFor(owner) en su lugar.",
    );
  }
}