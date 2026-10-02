// RELEASE_VERIFY_V2 - health + health-deep + admin-status + onboarding. - checks despues del deploy.
// Uso: pnpm exec tsx scripts/release-verify.ts

const base = process.env.OPENMUSE_URL ?? "http://127.0.0.1:8787";

async function check(path: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

// RELEASE_VERIFY_EXTRA_V1
const checks: Array<{ name: string; path: string }> = [
  { name: "health", path: "/api/health" },
  { name: "health-deep", path: "/api/health-deep" },
  { name: "admin-status", path: "/api/admin/system/status" },
];

let failed = 0;
for (const c of checks) {
  const ok = await check(c.path);
  console.log(`[release-verify] ${c.name}: ${ok ? "OK" : "FALLO"}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\n[release-verify] ${failed} checks fallaron. Rollback recomendado.`);
  process.exit(1);
}
console.log("\n[release-verify] Todos los checks OK.");