// Diagnostico SOLO LECTURA de la tabla de usuarios. No escribe nada en la DB.
// Uso: tsx scripts/diagnose-users.ts
import { existsSync, writeFileSync } from "node:fs";
import { createStore } from "../apps/server/src/db.ts";
import { UserService, verifyPassword } from "../apps/server/src/users.ts";

const OUT = "C:/Users/Alfonso/AppData/Local/Temp/diag-report.txt";
const log: string[] = [];
const say = (s: string) => {
  log.push(s);
};

try {
  say("[1] antes de loadEnvFile");
  if (existsSync(".env")) process.loadEnvFile(".env");
  say("[2] .env cargado");

  say("[3] antes de createStore");
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  say("[4] createStore OK");

  say("DATA_DIR     : " + (process.env.DATA_DIR ?? ".openmuse"));
  say("DATABASE_URL : " + (process.env.DATABASE_URL ? "(definida -> Postgres remoto)" : "(vacia -> PGlite embebido)"));
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  say("ADMIN_EMAIL  : " + (adminEmail || "(vacio)"));

  const users = new UserService(db);
  const all = await users.list();

  say("");
  say(`=== ${all.length} usuario(s) en system/users ===`);
  for (const u of all) {
    say(`  ${u.email}  rol=${u.role}  activo=${u.active}  creado=${u.createdAt.slice(0, 10)}  id=${u.id}`);
  }
  if (all.length === 0) say("  (VACIA) -> por eso ensureAdmin no repara nada y el login da 401");

  if (adminEmail && adminPassword) {
    say("");
    say("=== ADMIN_PASSWORD del .env vs hash almacenado ===");
    const match = all.find((u) => u.email === adminEmail);
    if (!match) {
      say(`  NO existe ningun usuario con ese email. El hash es irrelevante.`);
    } else {
      const rec = await db.get<{ passwordHash: string }>("system", "users", match.id);
      const ok = await verifyPassword(adminPassword, rec?.passwordHash ?? "");
      say(ok ? "  COINCIDE -> el problema NO es la contrasena" : "  NO COINCIDE -> el hash guardado es de otra contrasena (CAUSA RAIZ)");
      if (!match.active) say("  usuario DESACTIVADO -> verifyCredentials devuelve null siempre");
    }
  }

  await db.close();
} catch (error) {
  say("");
  const e = error as { message?: string; stack?: string; code?: string; cause?: unknown };
  say("ERROR message: " + String(e?.message ?? error));
  say("ERROR code   : " + String(e?.code ?? "-"));
  say("ERROR stack  : " + String(e?.stack ?? "-"));
  try {
    say("ERROR raw    : " + JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2));
  } catch {
    say("ERROR raw    : (no serializable)");
  }
}

writeFileSync(OUT, log.join("\n"), "utf8");
