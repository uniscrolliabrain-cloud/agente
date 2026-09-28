// CLI wrapper. La logica vive en apps/server/src/backup.ts (compilada a dist).
// Uso: pnpm exec tsx scripts/backup.ts [--out DIR] [--retention-days N]

import { runBackup } from "../apps/server/src/backup.ts";

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const retentionIdx = args.indexOf("--retention-days");
  const outDir = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : undefined;
  const retentionDays =
    retentionIdx >= 0 && args[retentionIdx + 1] ? Number(args[retentionIdx + 1]) : undefined;

  try {
    const result = await runBackup({ outDir, retentionDays });
    const mb = (result.bytes / 1024 / 1024).toFixed(2);
    console.log(`Backup completo: ${result.outDir} (${mb} MB)`);
    if (result.pruned > 0) console.log(`Backups antiguos borrados: ${result.pruned}`);
  } catch (err) {
    console.error("Backup failed:", err);
    process.exit(1);
  }
}

void main();