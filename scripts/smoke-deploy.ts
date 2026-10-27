// SMOKE_DEPLOY_V1 - humo de un despliegue real, sin framework de tests.
//
// Comprueba lo minimo que un despliegue tiene que cumplir antes de decir
// "esta vivo". No sustituye a los tests: solo dice si el proceso responde, si
// el auth falla cerrado y si la cabecera de tenant es la esperada.
//
// Uso:
//   OPENMUSE_URL=https://api.agntiapro.io pnpm smoke:deploy
//   pnpm smoke:deploy --url=https://api.agntiapro.io --tenant=agntia
//
// Credenciales (opcionales, para la parte autenticada):
//   SMOKE_EMAIL / SMOKE_PASSWORD  -> POST /api/auth/login
//   OPENMUSE_ACCESS_KEY           -> POST /api/session (sample mode)
// Sin credenciales el script hace los checks publicos y marca el resto como
// "skipped", nunca como verde.

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value] as const;
  }),
);

const base = (args.get("url") ?? process.env.OPENMUSE_URL ?? "http://127.0.0.1:8787").replace(
  /\/$/,
  "",
);
const expectedTenant = args.get("tenant") ?? process.env.SMOKE_TENANT ?? "agntia";

type Check = { name: string; status: "pass" | "fail" | "skipped"; detail: string };
const checks: Check[] = [];

const record = (name: string, status: Check["status"], detail: string) => {
  checks.push({ name, status, detail });
  console.log(`${status === "pass" ? "OK  " : status === "fail" ? "FAIL" : "SKIP"} ${name.padEnd(42)} ${detail}`);
};

async function get(path: string, token?: string) {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res;
  } catch (error) {
    record(path, "fail", `unreachable: ${error instanceof Error ? error.message : "unknown"}`);
    return null;
  }
}

// 1) Publico: salud normal y profunda.
const health = await get("/api/health");
if (health) {
  const body = await health.text();
  record("GET /api/health", health.ok ? "pass" : "fail", `${health.status} ${body.slice(0, 80)}`);
}
const deep = await get("/api/health-deep");
if (deep) {
  record("GET /api/health-deep", deep.ok ? "pass" : "fail", String(deep.status));
}

// 2) Fail-closed: sin token, la API no entrega datos.
const anonymous = await get("/api/agent");
if (anonymous) {
  record("GET /api/agent sin token -> 401", anonymous.status === 401 ? "pass" : "fail", String(anonymous.status));
}

// 3) Parte autenticada.
let token: string | undefined;
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;
if (email && password) {
  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).catch(() => null);
  if (login?.ok) {
    token = ((await login.json()) as { token: string }).token;
    record("POST /api/auth/login", "pass", email);
  } else {
    record("POST /api/auth/login", "fail", `${login?.status ?? "no response"}`);
  }
} else if (process.env.OPENMUSE_ACCESS_KEY) {
  const session = await fetch(`${base}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: process.env.OPENMUSE_ACCESS_KEY }),
  }).catch(() => null);
  if (session?.ok) {
    token = ((await session.json()) as { token: string }).token;
    record("POST /api/session", "pass", "access key");
  } else {
    record("POST /api/session", "fail", `${session?.status ?? "no response"}`);
  }
} else {
  record("login", "skipped", "define SMOKE_EMAIL/SMOKE_PASSWORD o OPENMUSE_ACCESS_KEY");
}

if (token) {
  const agent = await get("/api/agent", token);
  if (agent) {
    const tenantHeader = agent.headers.get("x-tenant-id");
    record("GET /api/agent", agent.ok ? "pass" : "fail", `${agent.status} tenant=${tenantHeader ?? "-"}`);
    record(
      "X-Tenant-Id esperado",
      tenantHeader === expectedTenant ? "pass" : "fail",
      `esperado ${expectedTenant}, recibido ${tenantHeader ?? "-"}`,
    );
  }
  // Pedir otro tenant es un salto, no un filtro: 403.
  const cross = await get("/api/agent?tenantId=tenant-ajeno", token);
  if (cross) {
    record("salto de tenant -> 403", cross.status === 403 ? "pass" : "fail", String(cross.status));
  }
}

// 4) Webs publicas, si se piden.
const site = args.get("site");
if (site) {
  const res = await fetch(site).catch(() => null);
  record("GET site publico", res?.ok ? "pass" : "fail", `${site} -> ${res?.status ?? "no response"}`);
}

const failed = checks.filter((c) => c.status === "fail").length;
const skipped = checks.filter((c) => c.status === "skipped").length;
console.log(
  `\n[smoke:deploy] ${checks.length - failed - skipped} pass, ${failed} fail, ${skipped} skipped (${base})`,
);
process.exit(failed > 0 ? 1 : 0);
