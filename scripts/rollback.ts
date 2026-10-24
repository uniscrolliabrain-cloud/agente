// ROLLBACK_CLI_V1 - lista releases buenas o solicita rollback a una.
// Uso: pnpm exec tsx scripts/rollback.ts --list
//      pnpm exec tsx scripts/rollback.ts --to <stamp>

import { listGoodReleases, rollbackToRelease } from "../apps/server/src/rollback.ts";

async function main() {
  const dataDir = process.env.DATA_DIR ?? ".openmuse";
  const args = process.argv.slice(2);
  if (args.includes("--list") || args.length === 0) {
    const releases = await listGoodReleases(dataDir);
    if (releases.length === 0) {
      console.log("No hay releases buenas registradas.");
      return;
    }
    console.log("Releases buenas:");
    for (const r of releases) {
      console.log(`  ${r.stamp}  version=${r.version}  commit=${r.commit ?? "-"}  at=${r.createdAt}`);
    }
    return;
  }
  const toIdx = args.indexOf("--to");
  if (toIdx >= 0 && args[toIdx + 1]) {
    const record = await rollbackToRelease(dataDir, args[toIdx + 1]);
    console.log(`Rollback solicitado a ${record.stamp}. Aplica el deploy correspondiente.`);
    return;
  }
  console.log("Uso: tsx scripts/rollback.ts [--list | --to <stamp>]");
}

void main();