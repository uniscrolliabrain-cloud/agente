// SCRIPTS_AUDIT_COHERENCE_V1
//
// AUDITS_RUNNER_NO_SHORTCIRCUIT_V1 - corre TODAS las auditorias y resume. Antes
// el script de package.json las encadenaba con `&&`: la primera en rojo cortaba
// el resto y solo se veia un sintoma. Ademas este runner no incluia `anchors` y
// terminaba siempre con exit 0, asi que el fallo se perdia en CI.
//
// AUDITS_RUNNER_NO_PNPM_V1 - se invoca node/tsx directamente (`process.execPath
// --import tsx`) para que funcione igual en local y en CI sin pnpm en el PATH.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

// Nombre del check -> fichero. `console` se llama no-console.ts.
const CHECKS = [
  { name: "layers", file: "layers.ts" },
  { name: "bridges", file: "bridges.ts" },
  { name: "console", file: "no-console.ts" },
  { name: "anchors", file: "anchors.ts" },
  { name: "contracts", file: "contracts.ts" },
  { name: "idempotency", file: "idempotency.ts" },
  { name: "tenant-default", file: "tenant-default.ts" },
] as const;

const root = process.cwd();
const results: { name: string; ok: boolean }[] = [];

for (const check of CHECKS) {
  const script = join(root, "scripts", "audits", check.file);
  const run = spawnSync(process.execPath, ["--import", "tsx", script], {
    cwd: root,
    stdio: "inherit",
  });
  results.push({ name: check.name, ok: run.status === 0 });
}

const failed = results.filter((r) => !r.ok);
console.log("\n[audit:coherence] resumen");
for (const r of results) console.log(`  ${r.ok ? "OK  " : "FAIL"} ${r.name}`);
console.log(`[audit:coherence] ${results.length - failed.length}/${results.length} checks OK`);
if (failed.length > 0) process.exit(1);
