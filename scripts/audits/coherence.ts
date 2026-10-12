// SCRIPTS_AUDIT_COHERENCE_V1
import { execSync } from "node:child_process";

const CHECKS = [
  { name: "layers", cmd: "pnpm exec tsx scripts/audits/layers.ts", fatal: false },
  { name: "bridges", cmd: "pnpm exec tsx scripts/audits/bridges.ts", fatal: false },
  { name: "console", cmd: "pnpm exec tsx scripts/audits/no-console.ts", fatal: false },
  { name: "contracts", cmd: "pnpm audit:contracts", fatal: false },
  { name: "idempotency", cmd: "pnpm audit:idempotency", fatal: false },
  { name: "tenant-default", cmd: "pnpm audit:tenant-default", fatal: false },
];

let failed = 0;
for (const c of CHECKS) {
  try {
    execSync(c.cmd, { stdio: "inherit" });
  } catch {
    failed++;
  }
}
console.log(`\n[audit:coherence] ${CHECKS.length - failed}/${CHECKS.length} checks OK`);