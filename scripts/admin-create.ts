import { createStore } from "../apps/server/src/db.ts";
import { readConfig } from "../apps/server/src/config.ts";
import { UserService } from "../apps/server/src/users.ts";

// Uso:
//   $env:ADMIN_EMAIL="admin@tu-dominio.com"
//   $env:ADMIN_PASSWORD="una-clave-de-8-o-mas"
//   pnpm exec tsx scripts/admin-create.ts
//
// Crea el primer admin si no existe ningun usuario. Idempotente:
// si ya hay usuarios, no hace nada y avisa.

const config = readConfig();
const db = await createStore({
  dataDir: `${config.dataDir}/postgres`,
  databaseUrl: config.databaseUrl,
});

const email = process.env.ADMIN_EMAIL?.trim();
const password = process.env.ADMIN_PASSWORD?.trim();
const name = process.env.ADMIN_NAME?.trim() || "Admin";

if (!email || !password) {
  console.error("Define ADMIN_EMAIL y ADMIN_PASSWORD antes de ejecutar.");
  await db.close();
  process.exit(1);
}
if (password.length < 8) {
  console.error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  await db.close();
  process.exit(1);
}

const users = new UserService(db);
const existing = await users.list();
if (existing.length > 0) {
  console.log(`Ya hay ${existing.length} usuario(s). No se crea admin nuevo.`);
  await db.close();
  process.exit(0);
}

const user = await users.create({ email, name, password, role: "admin" });
console.log(`Admin creado: ${user.email} (${user.id})`);
await db.close();
