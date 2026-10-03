// BACKUP_TENANT_CLI_V1 - CLI para backup por tenant.
// Uso: pnpm exec tsx scripts/backup-tenant.ts --tenant acme [--retention 7]
//      pnpm exec tsx scripts/backup-tenant.ts --tenant acme --restore <stamp>

import { runTenantBackup, runTenantRestore } from "../apps/server/src/backup-tenant.ts";

async function main() {
  const args = process.argv.slice(2);
  const tenantIdx = args.indexOf("--tenant");
  const retentionIdx = args.indexOf("--retention");
  const restoreIdx = args.indexOf("--restore");
  const tenant = tenantIdx >= 0 ? args[tenantIdx + 1] : undefined;
  if (!tenant) {
    console.error("Uso: tsx scripts/backup-tenant.ts --tenant <id> [--retention N] [--restore <stamp>]");
    process.exit(1);
  }
  const dataDir = process.env.DATA_DIR ?? ".openmuse";
  if (restoreIdx >= 0 && args[restoreIdx + 1]) {
    await runTenantRestore({ dataDir, tenantId: tenant, backupStamp: args[restoreIdx + 1] });
    console.log("Restore completado.");
    return;
  }
  const retention = retentionIdx >= 0 ? Number(args[retentionIdx + 1]) : 7;
  const result = await runTenantBackup({ dataDir, tenantId: tenant, retentionDays: retention });
  const mb = (result.bytes / 1024 / 1024).toFixed(2);
  console.log(`Backup tenant ${tenant}: ${result.outDir} (${mb} MB)`);
  if (result.pruned > 0) console.log(`Backups antiguos borrados: ${result.pruned}`);
}

void main();