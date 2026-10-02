// RELEASE_CHECK_V1 - checks antes de cada deploy.
// Uso: pnpm exec tsx scripts/release-check.ts

import { execSync } from "node:child_process";

// RELEASE_CHECK_EXTRA_V1 - checks ampliados.
const checks: Array<{ name: string; cmd: string; fatal: boolean }> = [
  { name: "typecheck", cmd: "pnpm typecheck", fatal: true },
  { name: "tests", cmd: "pnpm test", fatal: true },
  { name: "tenant-isolation", cmd: "pnpm exec tsx --test tests/tenant-isolation.test.ts", fatal: true },
  { name: "guardrails", cmd: "pnpm exec tsx --test tests/guardrails.test.ts", fatal: true },
  { name: "business-os-contracts", cmd: "pnpm exec tsx --test tests/business-os-contracts.test.ts", fatal: true },
  { name: "business-os-cycle", cmd: "pnpm exec tsx --test tests/business-os-cycle.test.ts", fatal: true },
];

let failed = 0;
for (const c of checks) {
  console.log(`\n[release-check] ${c.name}...`);
  try {
    execSync(c.cmd, { stdio: "inherit" });
    console.log(`[release-check] ${c.name}: OK`);
  } catch {
    console.error(`[release-check] ${c.name}: FALLO`);
    if (c.fatal) failed++;
  }
}

if (failed > 0) {
  console.error(`\n[release-check] ${failed} checks fallaron. Deploy bloqueado.`);
  process.exit(1);
}
console.log("\n[release-check] Todos los checks OK. Deploy permitido.");