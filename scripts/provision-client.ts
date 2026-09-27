
// Provisiona un cliente nuevo en un deployment ya arrancado.
// Uso: pnpm provision-client clientes/empresa-x

import { readFile, readdir, cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const base = process.env.OPENMUSE_URL ?? "http://127.0.0.1:8787";

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
    console.log(`  Creando admin nuevo con ${cfg.adminEmail}...`);
    throw new Error(`Login fallo: ${err instanceof Error ? err.message : "desconocido"}. ` +
      `Configura ADMIN_EMAIL/ADMIN_PASSWORD en .env o crea el admin manualmente.`);
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

  const skillsDir = join(baseDir, "skills");
  if (existsSync(skillsDir)) {
    const target = join(root, "apps", "computer", "workspace-template", "skills");
    await mkdir(target, { recursive: true });
    const subs = await readdir(skillsDir);
    for (const sub of subs) {
      const src = join(skillsDir, sub);
      const dst = join(target, sub);
      await cp(src, dst, { recursive: true });
      console.log(`  + skill ${sub} (copia a workspace-template)`);
    }
    console.log("  Recuerda rebuild la imagen Docker del computer si lo usas.");
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

  console.log(`Provision completo: ${cfg.name}`);
}

main().catch((err) => {
  console.error("Provision failed:", err);
  process.exit(1);
});
