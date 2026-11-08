// VERTICAL_SLICE_VERIFY_V1 — campaña 01 del vertical slice.
// Ver: docs/vertical-slice-actual/01-baseline/CAMPAIGN.md
//
// Encadena: entorno -> typecheck -> typecheck del worker -> tests focalizados ->
// smoke HTTP autenticado sin proveedores reales. NO sustituye al gate general
// (`pnpm gate`): lo complementa con el arranque real del slice.
//
// Uso:
//   pnpm verify:slice                 # todos los pasos
//   pnpm verify:slice --only smoke    # solo el smoke (lo que corre el CI)
//
// Cada paso imprime su exit real. Exit 1 si falla cualquier paso ejecutado.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const ROOT = process.cwd();
const TSX = resolve(ROOT, "node_modules/tsx/dist/cli.mjs");
const TSC = resolve(ROOT, "node_modules/typescript/lib/tsc.js");
const TSC_WORKER = resolve(ROOT, "apps/worker/node_modules/typescript/lib/tsc.js");

// Rutas de prueba que el plan asigna a la rama de Codex. Aquí sólo se ejecutan.
const FOCUSED_TESTS = ["tests/tenant-http-e2e.test.ts", "tests/model-worker.test.ts"];

interface StepResult {
  name: string;
  ok: boolean;
  detail: string;
  ms: number;
}

const LIMITE_NODE = { major: 22, minor: 6 } as const;

function entorno(): StepResult {
  const started = Date.now();
  const problemas: string[] = [];
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < LIMITE_NODE.major || (major === LIMITE_NODE.major && minor < LIMITE_NODE.minor)) {
    problemas.push(`node ${process.version} es anterior a ${LIMITE_NODE.major}.${LIMITE_NODE.minor}`);
  }
  if (!existsSync(TSX)) problemas.push("falta node_modules: ejecuta `pnpm install --frozen-lockfile`");
  if (!existsSync(resolve(ROOT, "pnpm-lock.yaml"))) problemas.push("falta pnpm-lock.yaml");

  const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
    packageManager?: string;
  };
  const detalle =
    problemas.length > 0
      ? problemas.join("; ")
      : `node ${process.version} · ${pkg.packageManager ?? "packageManager sin fijar"} · lockfile presente`;
  return { name: "entorno", ok: problemas.length === 0, detail: detalle, ms: Date.now() - started };
}

function comando(name: string, cmd: string[], cwd = ROOT): StepResult {
  const started = Date.now();
  // Sin red: el slice no debe depender de proveedores para acreditar el arranque.
  const res = spawnSync(cmd[0], cmd.slice(1), {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ALLOW_NETWORK: "0" },
  });
  const exit = res.status ?? `señal ${res.signal ?? "desconocida"}`;
  return {
    name,
    ok: res.status === 0,
    detail: `exit=${exit}`,
    ms: Date.now() - started,
  };
}

function testsFocalizados(): StepResult {
  const ausentes = FOCUSED_TESTS.filter((file) => !existsSync(resolve(ROOT, file)));
  if (ausentes.length > 0) {
    // Un fichero que el plan exige y no existe es un fallo del checkout, no un
    // paso a saltar: se reporta con la ruta exacta.
    return {
      name: "test:focalizado",
      ok: false,
      detail: `no existe ${ausentes.join(", ")}`,
      ms: 0,
    };
  }
  return comando("test:focalizado", [
    process.execPath,
    TSX,
    "--import",
    "./tests/setup.ts",
    "--test",
    "--test-timeout=30000",
    "--test-force-exit",
    ...FOCUSED_TESTS,
  ]);
}

/**
 * Smoke autenticado en proceso: arranca la app real contra un store temporal y
 * recorre salud -> rechazo sin sesión -> login -> petición autenticada.
 * No usa proveedores externos ni red.
 */
async function smoke(): Promise<StepResult> {
  const started = Date.now();

  // Entorno determinista: no queremos el .env del operador ni sus credenciales.
  process.env.WORKSPACE_MODE = "sample";
  process.env.HOST = "127.0.0.1";
  process.env.TASK_WORKER_ENABLED = "false";
  process.env.ALLOW_NETWORK = "0";

  const directory = await mkdtemp(join(tmpdir(), "openmuse-slice-"));
  process.env.DATA_DIR = directory;

  const cleanup: Array<() => Promise<unknown> | unknown> = [];
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
  const check = (name: string, ok: boolean, detail: string) => {
    checks.push({ name, ok, detail });
  };

  try {
    const { createApp } = await import("../apps/server/src/app.ts");
    const { createStore } = await import("../apps/server/src/db.ts");
    const { readConfig } = await import("../apps/server/src/config.ts");
    const { UserService } = await import("../apps/server/src/users.ts");
    const { TenantService } = await import("../apps/server/src/engine/tenant.ts");

    const db = await createStore({ dataDir: join(directory, "db") });
    cleanup.push(() => db.close());

    const config = readConfig();
    check("modo sample", config.mode === "sample", `mode=${config.mode}`);

    const server = await createApp(db, config);
    cleanup.push(() => server.agent.stop());

    const users = new UserService(db);
    const admin = await users.create({
      email: "slice@tenant-slice.local",
      password: "contrasena-larga-1",
      name: "Slice",
      role: "admin",
    });
    const tenants = new TenantService(db, config);
    await tenants.setMembership(admin.id, "tenant-slice");

    const health = await server.app.request("/api/health");
    const healthBody = (await health.json()) as { ok?: boolean };
    check("health 200", health.status === 200 && healthBody.ok === true, `status=${health.status}`);

    const anonimo = await server.app.request("/api/agent");
    check("sin sesión no entra", anonimo.status === 401, `status=${anonimo.status}`);

    const login = await server.app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "slice@tenant-slice.local", password: "contrasena-larga-1" }),
    });
    const token = login.status === 200 ? ((await login.json()) as { token?: string }).token : undefined;
    check("login devuelve token", typeof token === "string" && token.length > 0, `status=${login.status}`);

    const autenticado = await server.app.request("/api/agent", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    check("con sesión responde 200", autenticado.status === 200, `status=${autenticado.status}`);
  } catch (error) {
    check("arranque", false, error instanceof Error ? error.message : String(error));
  } finally {
    for (const fn of cleanup.reverse()) {
      try {
        await fn();
      } catch {
        // Limpieza best-effort: un fallo al cerrar no debe tapar el resultado.
      }
    }
    await rm(directory, { recursive: true, force: true }).catch(() => {});
  }

  const fallidos = checks.filter((c) => !c.ok);
  return {
    name: "smoke",
    ok: fallidos.length === 0,
    detail: checks.map((c) => `${c.ok ? "ok" : "FALLO"} ${c.name} (${c.detail})`).join(" · "),
    ms: Date.now() - started,
  };
}

type Step = { name: string; run: () => StepResult | Promise<StepResult> };

const pasos: Step[] = [
  { name: "entorno", run: entorno },
  { name: "typecheck", run: () => comando("typecheck", [process.execPath, TSC, "--noEmit"]) },
  {
    name: "typecheck:worker",
    run: () => comando("typecheck:worker", [process.execPath, TSC_WORKER, "--noEmit"], resolve(ROOT, "apps/worker")),
  },
  { name: "test:focalizado", run: testsFocalizados },
  { name: "smoke", run: smoke },
];

function seleccionados(argv: string[]): Step[] {
  const solo = argv.indexOf("--only");
  if (solo === -1) return pasos;
  const pedidos = (argv[solo + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const desconocidos = pedidos.filter((p) => !pasos.some((paso) => paso.name === p));
  if (desconocidos.length > 0) {
    console.error(`[verify:slice] paso desconocido: ${desconocidos.join(", ")}`);
    console.error(`[verify:slice] disponibles: ${pasos.map((p) => p.name).join(", ")}`);
    process.exit(2);
  }
  return pasos.filter((paso) => pedidos.includes(paso.name));
}

const elegidos = seleccionados(process.argv.slice(2));
const resultados: StepResult[] = [];
for (const paso of elegidos) {
  const resultado = await paso.run();
  resultados.push(resultado);
  const marca = resultado.ok ? "OK  " : "FAIL";
  console.log(`[verify:slice] ${marca} ${resultado.name}  ${(resultado.ms / 1000).toFixed(1)}s  ${resultado.detail}`);
}

const fallidos = resultados.filter((r) => !r.ok);
console.log(
  `\n[verify:slice] ${resultados.length - fallidos.length}/${resultados.length} pasos OK` +
    (fallidos.length > 0 ? ` — falla: ${fallidos.map((r) => r.name).join(", ")}` : ""),
);
process.exit(fallidos.length > 0 ? 1 : 0);
