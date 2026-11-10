// PROVISION_ACME_TENANT_V1 - alta canónica del tenant `acme` (E06).
//
// Por qué existe: el tenant no se crea "a mano en la DB". Este script usa los
// tres caminos oficiales del repo y es idempotente:
//   1. `system/tenant-membership/<tenantId>`  -> registro del tenant (el que
//      lista GET /api/admin/tenants). Vive en `system` porque es global.
//   2. `UserService.create`                   -> usuario admin real (UUID).
//   3. `TenantService.addMembership`          -> fila (user, tenant) en
//      `user-tenants`: es la que autoriza el claim del JWT.
//   4. `TenantService.setMembership`          -> tenant por defecto del owner
//      (fila `tenant-membership/default` bajo su id), que es lo que resuelve
//      `resolveStrict` al entrar por sesión.
//
// No escribe ningún dato de negocio: eso es E07. No toca `system` de otros
// tenants ni la zona de otros owners.
//
// Uso:
//   DATA_DIR=artifacts/demo/acme pnpm tsx scripts/provision-acme-tenant.ts
//   DATA_DIR=artifacts/demo/acme pnpm tsx scripts/provision-acme-tenant.ts --unprovision
//
// Nota sobre el owner: el plan llamaba `acme-admin` al owner admin. El id real
// lo genera `UserService.create` (UUID) y no se puede forzar sin saltarse ese
// camino, así que el alias vive en el registro del tenant (`adminEmail` +
// `adminUserId`). Los seeds resuelven `acme-admin` leyendo esa fila.

import { createStore } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { Config } from "../apps/server/src/config.ts";

const TENANT_ID = "acme";
const DISPLAY_NAME = "ACME Obras y Reformas";
const ADMIN_EMAIL = "carlos@acme-obras.es";
const ADMIN_NAME = "Carlos Ruiz";
// Backend aislado de demo: la contraseña es sintética y se imprime para poder
// entrar en local. No es una credencial de producción.
const ADMIN_PASSWORD = process.env.ACME_ADMIN_PASSWORD ?? "acme-demo-2026";

// ADMIN_TENANTS_TENANT_ID_REGEX_V1 - la misma regex que valida el panel.
if (!/^[a-z0-9-]{2,64}$/.test(TENANT_ID)) {
  throw new Error(`tenantId invalido: ${TENANT_ID}`);
}

const dataDir = `${process.env.DATA_DIR ?? "artifacts/demo/acme"}/postgres`;
const unprovision = process.argv.includes("--unprovision");

const store = await createStore({
  dataDir,
  databaseUrl: process.env.DATABASE_URL,
});
const users = new UserService(store);
// TenantService recibe Config por contrato pero no lee ningún campo: pasar el
// entorno real obligaría a tener PORT/AGENTE_ACCESS_KEY en un script que solo
// mueve memberships.
const tenants = new TenantService(store, {} as Config);

const now = () => new Date().toISOString();

async function resolveAdmin(): Promise<{ id: string; email: string } | null> {
  const user = await users.getByEmail(ADMIN_EMAIL);
  return user ? { id: user.id, email: user.email } : null;
}

async function unprovisionAcme(): Promise<void> {
  const admin = await resolveAdmin();
  const registryPath = ["system", "tenant-membership", TENANT_ID] as const;
  const registry = await store.get<{ id: string }>(...registryPath).catch(() => null);
  if (registry) {
    await store.remove(...registryPath);
    console.log(`- registro ${TENANT_ID}`);
  } else {
    console.log(`= registro ${TENANT_ID} no existía`);
  }

  const state = await store.get("system", "tenant-state", TENANT_ID).catch(() => null);
  if (state) {
    await store.remove("system", "tenant-state", TENANT_ID);
    console.log(`- estado ${TENANT_ID} (kill switch)`);
  }

  if (admin) {
    const membership = await tenants.findMembership(admin.id, TENANT_ID);
    if (membership) {
      await tenants.removeMembership(admin.id, TENANT_ID);
      console.log(`- membership ${ADMIN_EMAIL} -> ${TENANT_ID}`);
    } else {
      console.log(`= membership ${ADMIN_EMAIL} -> ${TENANT_ID} no existía`);
    }
    const primary = await store.get<{ tenantId?: string }>(admin.id, "tenant-membership", "default").catch(() => null);
    if (primary?.tenantId === TENANT_ID) {
      await store.remove(admin.id, "tenant-membership", "default");
      tenants.invalidate(admin.id);
      console.log(`- tenant por defecto de ${ADMIN_EMAIL}`);
    }
  }

  console.log("");
  console.log("No se han borrado datos del tenant (`acme:*`): este script sólo");
  console.log("deshace las filas que él mismo escribe. Los registros de negocio");
  console.log("los crea y los borra el seed de E07+.");
}

async function provisionAcme(): Promise<void> {
  // 1. Registro del tenant.
  const existing = await store.get<{ createdAt?: string; id: string }>(
    "system",
    "tenant-membership",
    TENANT_ID,
  ).catch(() => null);

  // 2. Usuario admin, por el camino oficial.
  let user = await users.getByEmail(ADMIN_EMAIL);
  if (user) {
    console.log(`= usuario ${ADMIN_EMAIL} ya existe (${user.id}, rol ${user.role})`);
  } else {
    user = await users
      .create({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: ADMIN_PASSWORD,
        role: "admin",
        authProviderId: `acme:${ADMIN_EMAIL}`,
      })
      .catch(async (error) => {
        const again = await users.getByEmail(ADMIN_EMAIL);
        if (again) return again;
        throw error;
      });
    console.log(`+ usuario ${ADMIN_EMAIL} (${user.id}) admin`);
  }

  await store.put("system", "tenant-membership", {
    id: TENANT_ID,
    tenantId: TENANT_ID,
    displayName: DISPLAY_NAME,
    adminEmail: ADMIN_EMAIL,
    adminUserId: user.id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
    createdBy: "provision-acme-tenant",
  });
  console.log(existing ? `= registro ${TENANT_ID} actualizado` : `+ registro ${TENANT_ID} (${DISPLAY_NAME})`);

  // 3. Membership multi-tenant: la que autoriza el claim del JWT.
  const membership = await tenants.findMembership(user.id, TENANT_ID);
  if (membership) {
    console.log(`= membership ${ADMIN_EMAIL} -> ${TENANT_ID} ya existe (rol ${membership.role})`);
  } else {
    await tenants.addMembership(user.id, TENANT_ID, "owner");
    console.log(`+ membership ${ADMIN_EMAIL} -> ${TENANT_ID} (owner)`);
  }

  // 4. Tenant por defecto del owner (camino de sesión).
  const primary = await store.get<{ tenantId?: string }>(user.id, "tenant-membership", "default").catch(() => null);
  if (primary?.tenantId === TENANT_ID) {
    console.log(`= tenant por defecto de ${ADMIN_EMAIL} ya es ${TENANT_ID}`);
  } else {
    await tenants.setMembership(user.id, TENANT_ID);
    console.log(`+ tenant por defecto de ${ADMIN_EMAIL} -> ${TENANT_ID}`);
  }

  // Verificación dentro del propio script: si esto no cuadra, el script falla.
  const resolved = await tenants.resolveStrict(user.id);
  if (resolved.tenantId !== TENANT_ID) {
    throw new Error(`resolveStrict(${user.id}) devolvió ${resolved.tenantId}, se esperaba ${TENANT_ID}`);
  }

  const registry = await store.list<{ tenantId?: string; displayName?: string }>(
    "system",
    "tenant-membership",
  );
  const listed = registry.some((row) => row.tenantId === TENANT_ID);

  console.log("");
  console.log(`tenant     : ${TENANT_ID} (${DISPLAY_NAME})`);
  console.log(`admin      : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`owner id   : ${user.id}`);
  console.log(`resolve    : ${resolved.tenantId} (${resolved.source})`);
  console.log(`registrado : ${listed ? "sí" : "NO"}`);
  console.log(`data dir   : ${dataDir}`);

  await store.close();
}

try {
  if (unprovision) {
    await unprovisionAcme();
    await store.close();
  } else {
    await provisionAcme();
  }
} catch (error) {
  await store.close().catch(() => {});
  console.error("FALLO:", error);
  process.exit(1);
}
