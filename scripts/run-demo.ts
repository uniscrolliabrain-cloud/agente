// DEMO_RUN_V1 - arranca backend + frontend + siembra tenant demo.
// Uso: pnpm demo:dev
// Levanta dos procesos (API y Vite) y abre el navegador en http://localhost:5173.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const root = process.cwd();
const apiPort = Number(process.env.PORT ?? 8787);
const webPort = 5173;
const demoUrl = `http://localhost:${webPort}/?demo=1`;

function log(prefix: string, msg: string) {
  console.log(`[${prefix}] ${msg}`);
}

async function waitFor(url: string, timeoutMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch { /* seguir intentando */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  log("demo", "Arrancando backend...");
  const api = spawn("pnpm", ["dev"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });

  const ready = await waitFor(`http://127.0.0.1:${apiPort}/api/health`, 45000);
  if (!ready) {
    log("demo", "El backend no arranco en 45s. Revisa los logs.");
    api.kill();
    process.exit(1);
  }
  log("demo", `Backend OK en puerto ${apiPort}`);

  log("demo", "Sembrando tenant demo...");
  const seed = spawn("pnpm", ["demo:seed"], { cwd: root, stdio: "inherit", shell: true });
  await new Promise<void>((resolve) => seed.on("close", () => resolve()));

  log("demo", "Arrancando frontend...");
  const web = spawn("pnpm", ["--filter", "@openmuse/web", "dev"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });

  const webReady = await waitFor(`http://localhost:${webPort}/`, 30000);
  if (webReady) {
    log("demo", `Frontend OK: ${demoUrl}`);
    log("demo", "Abriendo navegador...");
    const opener =
      process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
    spawn(opener, [demoUrl], { shell: true, stdio: "ignore" });
  } else {
    log("demo", "El frontend no arranco en 30s. Prueba a abrirlo manualmente.");
  }

  const shutdown = () => {
    log("demo", "Cerrando...");
    api.kill();
    web.kill();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void main().catch((err) => {
  console.error("FALLO:", err);
  process.exit(1);
});