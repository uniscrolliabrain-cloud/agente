// Crea (o repara) el primer admin sin pasar por la UI. Necesario porque los usuarios
// solo los crea un admin y el primer admin solo nace de ADMIN_EMAIL/ADMIN_PASSWORD.
//
// Uso (con el API parado para que no haya dos procesos escribiendo el mismo store):
//   pnpm admin:create -- --email admin@empresa.com --password "una-contrasena-larga" --name "Ana"
//   ADMIN_EMAIL=admin@empresa.com ADMIN_PASSWORD=... pnpm admin:create
//
// Lee .env igual que el servidor, asi que respeta DATA_DIR y DATABASE_URL.

import { existsSync } from "node:fs";
import { createStore } from "../apps/server/src/db.ts";
import { UserService } from "../apps/server/src/users.ts";

if (existsSync(".env")) process.loadEnvFile(".env");

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").trim();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD ?? "";
  const name = (arg("name") ?? process.env.ADMIN_NAME ?? "Admin").trim();
  if (!email || !password) {
    console.error(
      [
        "Faltan credenciales.",
        "  pnpm admin:create -- --email admin@empresa.com --password \"...\" [--name \"Admin\"]",
        "  o define ADMIN_EMAIL y ADMIN_PASSWORD en .env",
      ].join("\n"),
    );
    process.exit(1);
  }

  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    const users = new UserService(db);
    const existing = await users.getByEmail(email);
    if (existing) {
      const updated = await users.update(existing.id, {
        name: name || existing.name,
        role: "admin",
        active: true,
        password,
      });
      console.log(`Admin actualizado: ${updated.email} (${updated.id})`);
      return;
    }
    const created = await users.create({ email, name: name || "Admin", password, role: "admin" });
    console.log(`Admin creado: ${created.email} (${created.id})`);
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  console.error("No se pudo crear el admin:", error instanceof Error ? error.message : error);
  process.exit(1);
});
