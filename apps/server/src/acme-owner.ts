// ACME_OWNER_BINDING_V1 - el owner del tenant demo `acme` entra con su cuenta
// de GitHub. El login social resuelve un usuario por email verificado, pero el
// email de GitHub puede cambiar o no ser publico; por eso el binding se hace
// por el login de GitHub (ACME_OWNER_GITHUB), no por el email.
//
// Al entrar:
//   1. se crea el registro del tenant `acme` si no existe;
//   2. se anade la membership (user, acme) con rol owner;
//   3. se fija `acme` como tenant por defecto, que es lo que lee el middleware
//      de auth y devuelve /api/auth/me.
//
// Es idempotente y no escribe datos de negocio: el seed (scripts/seed-acme.ts)
// sigue siendo el unico camino para poblar el tenant. Asi el mismo binding vale
// para cualquier deployment (local, movil o produccion) sin tocar la DB a mano.

import type { Store } from "./db.ts";
import type { TenantService } from "./engine/tenant.ts";

export const ACME_TENANT_ID = "acme";
export const ACME_DISPLAY_NAME = "ACME Obras y Reformas";

/** Login de GitHub del owner; configurable para no clavar la cuenta en codigo. */
export function acmeOwnerGithub(): string {
  return (process.env.ACME_OWNER_GITHUB?.trim() || "uniscrolliabrain-cloud").toLowerCase();
}

export function isAcmeOwnerLogin(login: string | null | undefined): boolean {
  return Boolean(login) && login?.toLowerCase() === acmeOwnerGithub();
}

export interface AcmeOwnerUser {
  id: string;
  email: string;
  name: string;
}

/** Ata al usuario al tenant acme como owner y lo deja como tenant activo. */
export async function bindAcmeOwner(
  db: Store,
  tenants: TenantService,
  user: AcmeOwnerUser,
): Promise<void> {
  const registry = await db
    .get<{ createdAt?: string; displayName?: string; createdBy?: string }>(
      "system",
      "tenant-membership",
      ACME_TENANT_ID,
    )
    .catch(() => null);

  // El registro se reapunta al owner de GitHub aunque ya existiera: el seed
  // escribe los datos de demo bajo `adminUserId`, asi que si se quedara el
  // admin sintetico el owner entraria a un tenant vacio.
  const now = new Date().toISOString();
  await db.put("system", "tenant-membership", {
    id: ACME_TENANT_ID,
    tenantId: ACME_TENANT_ID,
    displayName: registry?.displayName ?? ACME_DISPLAY_NAME,
    adminEmail: user.email,
    adminUserId: user.id,
    createdAt: registry?.createdAt ?? now,
    updatedAt: now,
    createdBy: registry?.createdBy ?? "oauth-acme-owner",
  });

  await tenants.addMembership(user.id, ACME_TENANT_ID, "owner");
  await tenants.setMembership(user.id, ACME_TENANT_ID);
}
