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

// AUDIT_REGISTRY_ONE_LIST_V1 - la lista vive en registry.ts y la comparte con
// `scripts/gate-report.ts`. Antes cada uno tenia la suya.
import { AUDIT_CHECKS } from "./registry.ts";

const root = process.cwd();
const results: { name: string; ok: boolean; blocking: boolean }[] = [];

for (const check of AUDIT_CHECKS) {
  const script = join(root, "scripts", "audits", check.file);
  const run = spawnSync(process.execPath, ["--import", "tsx", script], {
    cwd: root,
    stdio: "inherit",
  });
  results.push({ name: check.name, ok: run.status === 0, blocking: check.blocking });
}

const failed = results.filter((r) => !r.ok && r.blocking);
console.log("\n[audit:coherence] resumen");
for (const r of results) {
  const tag = r.ok ? "OK  " : "FAIL";
  console.log(`  ${tag} ${r.name}${r.blocking ? "" : "  (advisory, no bloquea)"}`);
}
console.log(`[audit:coherence] ${results.length - failed.length}/${results.length} checks OK`);
if (failed.length > 0) process.exit(1);
