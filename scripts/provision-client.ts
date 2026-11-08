
// Provisiona un cliente nuevo en un deployment ya arrancado.
// Uso: pnpm provision-client clientes/empresa-x

import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const base = process.env.OPENMUSE_URL ?? "http://127.0.0.1:8787";

// PROVISION_BUNDLE_PLAN_V1 - el plan se calcula antes de tocar el API: si está
// bloqueado no se escribe nada (campaña 07, aserción "plan sin escrituras").
async function runBundlePlan(path: string): Promise<void> {
  const { parseVerticalSliceBundle, planVerticalSlice } = await import(
    "./lib/vertical-slice-bundle.ts"
  );
  const raw: unknown = JSON.parse(await readFile(path, "utf8"));
  const parsed = parseVerticalSliceBundle(raw);
  if (!parsed.ok) {
    console.error(`Bundle invalido: ${parsed.errors.map((e) => `${e.code}: ${e.message}`).join("; ")}`);
    process.exit(1);
  }
  const plan = planVerticalSlice(parsed.bundle, {});
  console.log(JSON.stringify(plan, null, 2));
  if (plan.blocked) {
    console.error("Plan bloqueado: no se aplica y no se ha escrito nada.");
    process.exit(1);
  }
  console.log(`Plan OK (${plan.operations.length} operaciones). No se ha escrito nada.`);
  process.exit(0);
}

interface ClientConfig {
  name: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} -> ${res.status}: ${text}`);
  return body as T;
}

async function main() {
  const bundleIndex = process.argv.indexOf("--bundle");
  if (bundleIndex !== -1) {
    const requested = process.argv[bundleIndex + 1];
    if (!requested) {
      console.error("Uso: pnpm provision-client -- --bundle clientes/<cliente>/vertical-slice.json [--plan]");
      process.exit(1);
    }
    await runBundlePlan(resolve(root, requested));
    return;
  }
  const dir = process.argv[2];
  if (!dir) {
    console.error("Uso: pnpm provision-client clientes/empresa-x");
    process.exit(1);
  }
  const baseDir = resolve(root, dir);
  if (!existsSync(join(baseDir, "config.json"))) {
    console.error(`Falta ${baseDir}/config.json`);
    process.exit(1);
  }
  const cfg: ClientConfig = JSON.parse(await readFile(join(baseDir, "config.json"), "utf8"));
  console.log(`Provisionando: ${cfg.name}`);

  let token: string;
  try {
    const session = await http<{ token: string; user: { id: string; role: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email: cfg.adminEmail, password: cfg.adminPassword }) },
    );
    token = session.token;
    console.log(`  Admin existente: ${cfg.adminEmail}`);
  } catch (err) {
    throw new Error(
      `El login fallo (${err instanceof Error ? err.message : "desconocido"}). ` +
        `El script no crea admins: solo provisiona SOPs, skills y usuarios con un admin que ya exista. ` +
        `Crea el primero con "pnpm admin:create -- --email ${cfg.adminEmail} --password \\"...\\"" ` +
        `o define ADMIN_EMAIL/ADMIN_PASSWORD en .env y arranca el API.`,
    );
  }
  const auth = { Authorization: `Bearer ${token}` };

  const sopsDir = join(baseDir, "sops");
  if (existsSync(sopsDir)) {
    const files = (await readdir(sopsDir)).filter((f) => f.endsWith(".json"));
    const existing = await http<Array<{ id: string }>>("/api/sops", { headers: auth }).catch(() => []);
    const existingIds = new Set(existing.map((s) => s.id));
    for (const file of files) {
      const sop = JSON.parse(await readFile(join(sopsDir, file), "utf8"));
      if (existingIds.has(sop.id)) { console.log(`  skip SOP ${sop.id}`); continue; }
      await http("/api/sops", { method: "POST", headers: auth, body: JSON.stringify(sop) });
      console.log(`  + SOP ${sop.id}`);
    }
  }

  // PROVISION_NO_GLOBAL_SKILL_COPY_V1 - las skills del cliente no se copian al
  // template global: dos clientes dejaban de distinguirse. Se quedan en su
  // carpeta y la imagen del computer se versiona con el bundle (campaña 07).
  const skillsDir = join(baseDir, "skills");
  if (existsSync(skillsDir)) {
    const subs = await readdir(skillsDir);
    for (const sub of subs) {
      console.log(`  = skill ${sub} (queda en ${dir}/skills, sin copia global)`);
    }
  }

  const usersFile = join(baseDir, "users.json");
  if (existsSync(usersFile)) {
    const users = JSON.parse(await readFile(usersFile, "utf8")) as Array<{
      email: string;
      name: string;
      role?: "admin" | "user";
      password: string;
    }>;
    for (const u of users) {
      try {
        await http("/api/auth/users", {
          method: "POST",
          headers: auth,
          body: JSON.stringify({
            email: u.email,
            name: u.name,
            role: u.role ?? "user",
            password: u.password,
          }),
        });
        console.log(`  + user ${u.email}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "desconocido";
        if (msg.includes("409") || msg.includes("ya existe") || msg.includes("registered")) {
          console.log(`  skip user ${u.email} (ya existe)`);
        } else throw err;
      }
    }
  }

  // PROVISION_SEED_16_ROLES_V1 - si el cliente no trae agentes.json,
  // se copia el catalogo base y se seedean los 16 roles.
  const agentesPath = join(baseDir, "agentes.json");
  if (!existsSync(agentesPath)) {
    const baseCatalog = join(root, "clientes", "_base", "agentes.json");
    if (existsSync(baseCatalog)) {
      const baseContent = await readFile(baseCatalog, "utf8");
      await writeFile(agentesPath, baseContent, "utf8");
      console.log(`  + agentes.json copiado del catalogo base`);
    }
  }
  if (existsSync(agentesPath)) {
    const catalog = JSON.parse(await readFile(agentesPath, "utf8")) as { agentes?: Array<Record<string, unknown>> };
    const roles = catalog.agentes ?? [];
    const existingRoles = await http<Array<{ id: string }>>("/api/agent/roles", { headers: auth }).catch(() => []);
    const existingIds = new Set(existingRoles.map((r) => r.id));
    let created = 0;
    for (const role of roles) {
      const id = String(role.id ?? "");
      if (!id || existingIds.has(id)) continue;
      try {
        await http("/api/agent/roles", {
          method: "POST",
          headers: auth,
          body: JSON.stringify(role),
        });
        created++;
      } catch (err) {
        console.log(`  FALLO rol ${id}: ${err instanceof Error ? err.message : "desconocido"}`);
      }
    }
    console.log(`  + ${created} roles creados (${roles.length} en el catalogo)`);
  }

  console.log(`Provision completo: ${cfg.name}`);
}

main().catch((err) => {
  console.error("Provision failed:", err);
  process.exit(1);
});
