// BOOTSTRAP_AGENCY_CLI_V1 - alta del tenant de la agencia en un deployment.
//
// Uso:
//   pnpm bootstrap:agency --admin=tu@agntiapro.io
//   pnpm bootstrap:agency --admin=tu@agntiapro.io --profile=clientes/agntia/agency.json
//   pnpm bootstrap:agency --admin=tu@agntiapro.io --dry-run
//
// Requiere el owner ya creado (pnpm admin:create o el primer login con Supabase)
// y el API parado si usas PGlite: el proceso abre la misma base.
//
// No crea usuarios ni imprime secretos: solo escribe el tenant y su perfil.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import { UserService } from "../apps/server/src/users.ts";
import { readConfig } from "../apps/server/src/config.ts";
import { bootstrapAgency, type AgencyProfile } from "./lib/agency-bootstrap.ts";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value] as const;
  }),
);

const adminEmail = args.get("admin");
if (!adminEmail) {
  console.error("Falta --admin=<email del owner>. Ejemplo: pnpm bootstrap:agency --admin=yo@agntiapro.io");
  process.exit(1);
}
const profilePath = resolve(args.get("profile") ?? "clientes/agntia/agency.json");
const dryRun = args.get("dry-run") === "true";

const profile = JSON.parse(await readFile(profilePath, "utf8")) as AgencyProfile;
const config = readConfig();
const db = await createStore({
  dataDir: `${config.dataDir}/postgres`,
  databaseUrl: config.databaseUrl,
});

try {
  const user = await new UserService(db).getByEmail(adminEmail);
  if (!user) {
    console.error(
      `No existe un usuario con ${adminEmail}. Crea el primero con "pnpm admin:create" ` +
        "o entra una vez con Supabase para que el alta JIT lo materialice.",
    );
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] tenant=${profile.tenantId} owner=${user.id} perfil=${profilePath}`);
    console.log(`[dry-run] memorias: ${profile.offer ? "oferta " : ""}${profile.icp ? "icp " : ""}${profile.pricing?.length ? "precios " : ""}${profile.tone ? "tono " : ""}${profile.boundaries?.length ? "limites " : ""}${profile.domain ? "dominio" : ""}`);
    process.exit(0);
  }

  const result = await bootstrapAgency(db, config, user.id, profile);
  const counts = new Map<string, number>();
  for (const action of result.actions) {
    const key = `${action.kind}:${action.action}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  console.log(`Tenant ${result.tenantId} listo para ${adminEmail} (owner ${result.owner}).`);
  for (const [key, value] of counts) console.log(`  ${key.padEnd(32)} ${value}`);
  console.log(
    "\nSiguiente paso: entra al panel, comprueba que X-Tenant-Id es el tenant de la agencia " +
      "y lanza una SOP de prueba. Si usas PGlite, reinicia el API para que vea los datos.",
  );
} finally {
  await db.close();
}
