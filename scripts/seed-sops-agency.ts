// SEED_SOPS_AGENCY_V1 - publica las SOPs de la agencia en un API ya arrancado.
//
// Las definiciones viven en clientes/agntia/sops.ts (tipadas y validadas con el
// schema del dominio). Este script solo las envia: asi el seed y el bootstrap
// del tenant no pueden divergir, que es lo que pasaba cuando el catalogo estaba
// duplicado dentro de este fichero.
//
// Uso:
//   OPENMUSE_URL=http://localhost:8787 pnpm exec tsx scripts/seed-sops-agency.ts
//
// Autenticacion: OPENMUSE_ACCESS_KEY (modo live, POST /api/session) o
// OPENMUSE_EMAIL + OPENMUSE_PASSWORD (login normal). Sin una de las dos, el
// script sale en vez de adivinar.

import { agencySops } from "../clientes/agntia/sops.ts";

const base = process.env.OPENMUSE_URL ?? "http://localhost:8787";
const headersJson = { "content-type": "application/json" };

async function login(): Promise<string> {
  const accessKey = process.env.OPENMUSE_ACCESS_KEY;
  if (accessKey) {
    const res = await fetch(`${base}/api/session`, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ accessKey }),
    });
    if (!res.ok) throw new Error(`POST /api/session -> ${res.status} ${await res.text()}`);
    return ((await res.json()) as { token: string }).token;
  }
  const email = process.env.OPENMUSE_EMAIL;
  const password = process.env.OPENMUSE_PASSWORD;
  if (email && password) {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`POST /api/auth/login -> ${res.status} ${await res.text()}`);
    return ((await res.json()) as { token: string }).token;
  }
  throw new Error("Define OPENMUSE_ACCESS_KEY o OPENMUSE_EMAIL + OPENMUSE_PASSWORD.");
}

const token = await login();
const auth = { ...headersJson, authorization: `Bearer ${token}` };

const existingRes = await fetch(`${base}/api/sops`, { headers: auth });
if (!existingRes.ok) throw new Error(`GET /api/sops -> ${existingRes.status}`);
const existing = (await existingRes.json()) as Array<{ id: string }>;
const existingIds = new Set(existing.map((s) => s.id));

let created = 0;
let skipped = 0;
for (const sop of agencySops) {
  if (existingIds.has(sop.id)) {
    console.log(`skip   ${sop.id}`);
    skipped++;
    continue;
  }
  const res = await fetch(`${base}/api/sops`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify(sop),
  });
  if (!res.ok) {
    console.error(`FAIL   ${sop.id}: ${res.status} ${await res.text()}`);
    continue;
  }
  console.log(`create ${sop.id}`);
  created++;
}

console.log(`\n${created} created, ${skipped} skipped, ${agencySops.length} total`);
