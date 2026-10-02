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

const TENANT_CACHE_TTL_MS = 5 * 60 * 1000;

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
}

export { DEFAULT_TENANT_ID };
