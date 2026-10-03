// BACKUP_TENANT_V1 - backup por tenant en dataDir/tenants/<tenantId>/backups/<stamp>/
// Restore probado. Cada tenant tiene su propio arbol de backups.

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

export interface TenantBackupOptions {
  dataDir: string;
  tenantId: string;
  retentionDays?: number;
}

export interface TenantBackupResult {
  tenantId: string;
  outDir: string;
  createdAt: string;
  bytes: number;
  pruned: number;
}

async function dirSize(path: string): Promise<number> {
  let total = 0;
  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else total += (await stat(full)).size;
  }
  return total;
}

async function pruneOld(backupsDir: string, retentionDays: number): Promise<number> {
  if (!existsSync(backupsDir) || retentionDays <= 0) return 0;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let pruned = 0;
  for (const entry of await readdir(backupsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = join(backupsDir, entry.name);
    const manifestPath = join(full, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { createdAt?: string };
      const created = manifest.createdAt ? Date.parse(manifest.createdAt) : 0;
      if (created > 0 && created < cutoff) {
        await rm(full, { recursive: true, force: true });
        pruned++;
      }
    } catch {
      /* manifest ilegible, no borrar */
    }
  }
  return pruned;
}

export async function runTenantBackup(options: TenantBackupOptions): Promise<TenantBackupResult> {
  const tenantRoot = resolve(options.dataDir, "tenants", options.tenantId);
  if (!existsSync(tenantRoot)) {
    throw new Error(`Tenant ${options.tenantId} no existe en ${tenantRoot}`);
  }
  const backupsDir = join(tenantRoot, "backups");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = join(backupsDir, stamp);
  await mkdir(out, { recursive: true });

  const paths = ["files", "browser-profiles"];
  let totalBytes = 0;
  for (const name of paths) {
    const from = join(tenantRoot, name);
    if (!existsSync(from)) continue;
    const to = join(out, name);
    await cp(from, to, { recursive: true });
    totalBytes += await dirSize(from);
  }

  const manifest = {
    tenantId: options.tenantId,
    createdAt: new Date().toISOString(),
    source: tenantRoot,
    node: process.version,
  };
  await writeFile(join(out, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  const pruned = options.retentionDays
    ? await pruneOld(backupsDir, options.retentionDays)
    : 0;

  return {
    tenantId: options.tenantId,
    outDir: out,
    createdAt: manifest.createdAt,
    bytes: totalBytes,
    pruned,
  };
}

export interface TenantRestoreOptions {
  dataDir: string;
  tenantId: string;
  backupStamp: string;
}

export async function runTenantRestore(options: TenantRestoreOptions): Promise<void> {
  const tenantRoot = resolve(options.dataDir, "tenants", options.tenantId);
  const backupDir = join(tenantRoot, "backups", options.backupStamp);
  if (!existsSync(backupDir)) {
    throw new Error(`Backup ${options.backupStamp} no existe para tenant ${options.tenantId}`);
  }
  const manifest = JSON.parse(await readFile(join(backupDir, "manifest.json"), "utf8")) as {
    createdAt: string;
  };
  const keep = `${tenantRoot}.before-restore-${Date.now()}`;
  if (existsSync(tenantRoot)) {
    await cp(tenantRoot, keep, { recursive: true });
  }
  for (const name of ["files", "browser-profiles"]) {
    const from = join(backupDir, name);
    if (!existsSync(from)) continue;
    const to = join(tenantRoot, name);
    await rm(to, { recursive: true, force: true });
    await cp(from, to, { recursive: true });
  }
  console.log(`Restore completo de tenant ${options.tenantId} desde ${manifest.createdAt}`);
}