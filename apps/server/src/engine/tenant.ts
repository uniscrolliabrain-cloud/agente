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
// TENANT_MEMBERSHIPS_V1 - una fila por (user, tenant). La membership unica de
// arriba sigue existiendo para el modo single-tenant; esta lista es la que
// permite que un usuario trabaje en varias empresas y que el JWT elija en cual.
const MEMBERSHIPS_KIND = "user-tenants";

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
}

export interface TenantResolution {
  tenantId: string;
  source: "database" | "default";
}

/** TENANT_STATE_V1 - estado de la empresa para el kill switch. */
export interface TenantState {
  suspended: boolean;
  reason?: string;
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

  /**
   * TENANT_RESOLVE_STRICT_V1 - lectura de membership sin tragarse el fallo del
   * store. La campana 02 necesita distinguir "no es miembro" (403) de "la DB no
   * responde" (503); `resolve()` devuelve "default" en ambos casos y por eso la
   * peticion seguia escribiendo en el tenant equivocado.
   */
  private async readMembershipStrict(owner: string): Promise<TenantResolution> {
    const row = await this.db.get<{ tenantId: string }>(owner, MEMBERSHIP_KIND, MEMBERSHIP_ID);
    if (row?.tenantId) return { tenantId: row.tenantId, source: "database" };
    // Misma regla que `resolve()`: en el namespace `system` no se busca una
    // membership antigua, porque ahi vive el registro de tenants.
    const legacy =
      owner === "system"
        ? []
        : await this.db.list<{ id: string; tenantId: string }>(owner, MEMBERSHIP_KIND);
    const legacyRow = legacy.find((m) => m.id !== MEMBERSHIP_ID && m.tenantId);
    if (legacyRow) return { tenantId: legacyRow.tenantId, source: "database" };
    return { tenantId: DEFAULT_TENANT_ID, source: "default" };
  }

  /** Membership durable con el cache del servicio; propaga el fallo del store. */
  async resolveStrict(owner: string): Promise<TenantResolution> {
    const cached = this.cache.get(owner);
    if (cached && Date.now() - cached.at < TENANT_CACHE_TTL_MS) {
      return { tenantId: cached.tenantId, source: "database" };
    }
    const resolution = await this.readMembershipStrict(owner);
    this.cache.set(owner, { tenantId: resolution.tenantId, at: Date.now() });
    return resolution;
  }

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
    // TENANT_MEMBERSHIP_LEGACY_MIGRATE_V1 - si existe una fila con id=owner
    // (convencion antigua), la migramos al vuelo a id="default".
    //
    // TENANT_SYSTEM_NAMESPACE_GUARD_V1 - el namespace `system` no contiene
    // memberships: ahi vive el registro de tenants, cuyas filas tienen
    // id=tenantId. Al resolver el tenant de "system" (lo hacia el store con
    // scope al listar algo global) esta migracion tomaba el registro por una
    // membership antigua, lo reescribia como id="default" y lo borraba: el
    // tenant desaparecia del panel. En `system` no se migra nada.
    const legacy =
      owner === "system"
        ? []
        : await this.db
            .list<{ id: string; tenantId: string }>(owner, MEMBERSHIP_KIND)
            .catch(() => []);
    const legacyRow = legacy.find((m) => m.id !== MEMBERSHIP_ID && m.tenantId);
    if (legacyRow) {
      await this.db.put(owner, MEMBERSHIP_KIND, {
        id: MEMBERSHIP_ID,
        tenantId: legacyRow.tenantId,
        migratedAt: new Date().toISOString(),
      });
      await this.db.remove(owner, MEMBERSHIP_KIND, legacyRow.id);
      this.cache.set(owner, { tenantId: legacyRow.tenantId, at: Date.now() });
      return { tenantId: legacyRow.tenantId, source: "database" };
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
   * TENANT_MEMBERSHIP_FRESH_V1 - lectura sin caché para decidir permisos.
   * El caché enruta; no autoriza: una revocación debe cortar en la siguiente
   * petición, no cuando expire el TTL.
   */
  async findMembership(userId: string, tenantId: string): Promise<TenantMembership | null> {
    const row = await this.db.get<TenantMembership>(userId, MEMBERSHIPS_KIND, tenantId);
    if (!row || row.tenantId !== tenantId) return null;
    return row;
  }

  /**
   * TENANT_REVOKE_V1 - retira la membership y corta el acceso en caliente.
   * Devuelve si había algo que quitar, para que el panel distinga revocar de
   * intentar revocar dos veces.
   */
  async removeMembership(userId: string, tenantId: string): Promise<boolean> {
    const existing = await this.findMembership(userId, tenantId);
    await this.db.remove(userId, MEMBERSHIPS_KIND, tenantId);
    this.invalidate(userId);
    return existing !== null;
  }

  /**
   * TENANT_STATE_V1 - kill switch de la empresa. Vive en `system` porque el
   * estado es de la plataforma: si estuviera en la zona del tenant, suspender
   * exigiría conocer su owner.
   */
  async tenantState(tenantId: string): Promise<TenantState> {
    const row = await this.db.get<{ suspended?: boolean; suspendedReason?: string }>(
      "system",
      "tenant-state",
      tenantId,
    );
    return {
      suspended: Boolean(row?.suspended),
      ...(row?.suspendedReason ? { reason: row.suspendedReason } : {}),
    };
  }

  /** Todos los tenants a los que pertenece un usuario. */
  async membershipsFor(userId: string): Promise<TenantMembership[]> {
    const rows = await this.db
      .list<TenantMembership>(userId, MEMBERSHIPS_KIND)
      .catch(() => []);
    return rows.filter((row) => typeof row.tenantId === "string" && row.tenantId.length > 0);
  }

  /**
   * Alta idempotente de (user, tenant). No toca la membership unica del modo
   * single-tenant: son mecanismos distintos y mezclarlos fue lo que dejo datos
   * en "default" cuando ya habia multi-tenant.
   */
  async addMembership(
    userId: string,
    tenantId: string,
    role: TenantMembership["role"] = "member",
  ): Promise<TenantMembership> {
    const existing = await this.db.get<TenantMembership>(userId, MEMBERSHIPS_KIND, tenantId);
    if (existing) return existing;
    const membership: TenantMembership = {
      id: tenantId,
      tenantId,
      userId,
      role,
      createdAt: new Date().toISOString(),
    };
    await this.db.put(userId, MEMBERSHIPS_KIND, membership);
    this.invalidate(userId);
    return membership;
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
    // MEMBERSHIP_CACHE_INVALIDATE_V1 — invalidar TODA la caché tras un
    // cambio administrativo. Un admin puede estar moviendo un owner entre
    // tenants y otros owners pueden verse afectados si el admin también
    // reasigna sus memberships. Es más seguro invalidar todo que solo el
    // owner cambiado.
    this.invalidateAll();
    // MEMBERSHIP_CACHE_INVALIDATE_V1 — emitir evento al bus si está
    // disponible. El evento lo consumen audit y metrics (Fase 6 los cableó).
    // NOTA: el constructor actual NO recibe bus. Este bloque se activa
    // cuando Fase 8/9 añada bus al constructor. Por ahora, no-op.
    // if (this.bus) { await this.bus.emit(...); }
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
   * TENANT_CACHE_INVALIDATE_ALL_V1 Ã¢â‚¬â€ invalida toda la cache tras cambios
   * administrativos (mover owner entre tenants).
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /** TENANT_CACHE_STATS_V1 Ã¢â‚¬â€ tamaÃƒÂ±o actual de la cache, para debug. */
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