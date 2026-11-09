// PROVISION_AGNTIA_V1 - alta del tenant de la agencia y de su owner.
//
// Por que existe: POST /api/admin/tenants crea el tenant, y
// POST /api/admin/tenants/:id/members mete gente, pero las dos cosas exigen un
// admin ya autenticado. El primer arranque de un deployment no tiene ninguno
// (el login social crea el usuario, pero no la empresa), asi que el tenant
// quedaba inaccesible: `switch-tenant` respondia 403.
//
// Este script escribe las tres filas que hacen falta, de forma idempotente y
// contra la DB real (DATABASE_URL), sin pedir sesion:
//   1. system/tenant-membership/<tenantId>  -> el registro del tenant.
//   2. system/users/<userId>                -> el usuario, si no existe.
//   3. <userId>/user-tenants/<tenantId>     -> la membership (multi-tenant).
//   4. <userId>/tenant-membership/default   -> el tenant por defecto al entrar.
//
// Uso:
//   DATABASE_URL=... pnpm tsx scripts/provision-agntia.ts \
//     --tenant agntia-pro --email uniscrolliabrain@gmail.com --name "Alfonso"
//
// Es seguro repetirlo: si las filas existen, no las pisa (salvo el rol, que se
// alinea con lo pedido).

import { randomBytes } from "node:crypto";
import { createStore } from "../apps/server/src/db.ts";
import { UserService } from "../apps/server/src/users.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import type { Config } from "../apps/server/src/config.ts";

function arg(name: string, fallback?: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`Falta --${name}`);
}

// El id por defecto coincide con `clientes/agntia` y con el `tenantId` de
// `agency.json`: si divergen, el bootstrap escribe en un tenant y la membership
// apunta a otro.
const tenantId = arg("tenant", "agntia");
const email = arg("email").toLowerCase().trim();
const name = arg("name", email.split("@")[0] ?? "Owner");
const displayName = arg("display", "Agntia Pro");

if (!/^[a-z0-9-]{2,64}$/.test(tenantId)) {
  throw new Error(`tenantId invalido: ${tenantId} (solo a-z, 0-9 y guiones)`);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL: este script escribe en la DB del deployment, no en PGlite.");
}

const store = await createStore({ databaseUrl });
const users = new UserService(store);
// TenantService recibe Config por contrato pero no lee ningun campo: pasar el
// entorno real obligaria a tener PORT/AGENTE_ACCESS_KEY en este script, que
// solo escribe membresias.
const tenants = new TenantService(store, {} as Config);
const now = new Date().toISOString();

// 1. Registro del tenant.
const registry = await store.get<{ id: string }>("system", "tenant-membership", tenantId).catch(() => null);
if (registry) {
  console.log(`= tenant ${tenantId} ya registrado`);
} else {
  await store.put("system", "tenant-membership", {
    id: tenantId,
    tenantId,
    displayName,
    createdAt: now,
    createdBy: "provision-agntia",
  });
  console.log(`+ tenant ${tenantId} (${displayName})`);
}

// 2. Usuario.
let user = await users.getByEmail(email);
if (!user) {
  user = await users
    .create({
      email,
      name,
      // Contrasena aleatoria: la identidad la da el proveedor de OAuth. Se puede
      // reemplazar luego con `pnpm admin:create` si hace falta acceso local.
      password: randomBytes(32).toString("base64url"),
      role: "admin",
      authProviderId: `google:${email}`,
    })
    .catch(async (error) => {
      const again = await users.getByEmail(email);
      if (again) return again;
      throw error;
    });
  console.log(`+ usuario ${email} (${user.id}) admin`);
} else {
  console.log(`= usuario ${email} ya existe (${user.id}, rol ${user.role})`);
}

// 3. Membership multi-tenant.
const existing = await tenants.membershipsFor(user.id);
const hit = existing.find((m) => m.tenantId === tenantId);
if (hit) {
  console.log(`= membership ${tenantId} ya existe (rol ${hit.role})`);
} else {
  await tenants.addMembership(user.id, tenantId, "owner");
  console.log(`+ membership ${email} -> ${tenantId} (owner)`);
}

// 4. Tenant por defecto: es lo que resuelve TenantService al entrar, asi que sin
//    esta fila el usuario cae a "default" y el panel abre la empresa vacia.
const primary = await store.get<{ tenantId?: string }>(user.id, "tenant-membership", "default").catch(() => null);
if (primary?.tenantId === tenantId) {
  console.log("= tenant por defecto ya es " + tenantId);
} else {
  await store.put(user.id, "tenant-membership", {
    id: "default",
    tenantId,
    userId: user.id,
    role: "owner",
    createdAt: now,
  });
  tenants.invalidate(user.id);
  console.log(`+ tenant por defecto de ${email} -> ${tenantId}`);
}

console.log("\nListo. Comprobacion:");
console.log(`  tenant   : ${tenantId}`);
console.log(`  owner    : ${email} (${user.id})`);
console.log(`  resolve  : ${await tenants.tenantIdFor(user.id)}`);
await store.close();
