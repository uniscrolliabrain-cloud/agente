// BACKUP_TENANT_V1 - backup por tenant en dataDir/tenants/<tenantId>/backups/<stamp>/
// Restore probado. Cada tenant tiene su propio arbol de backups.
// BACKUP_TENANT_PATH_V1 — verificado: la ruta de backup es
// dataDir/tenants/<tenantId>/backups/<stamp>/, y los directorios copiados son
// "files" y "browser-profiles". Coincide con lo que escribe Files.import
// (dataDir/tenants/<tenantId>/files). No requiere cambio de ruta.

import { cp, mkdir, readdir, readFile, rm, stat, writeFile, rename, realpath, lstat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";

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

const ROOTS = ["files", "browser-profiles"] as const;
type Inventory = Array<{ path: string; bytes: number; sha256: string }>;

function segment(value: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/.test(value) || value === "." || value === "..") throw Error("Invalid backup path segment");
}

async function tenantPath(dataDir: string, tenantId: string): Promise<string> {
  segment(tenantId);
  const base = await realpath(resolve(dataDir, "tenants"));
  const path = join(base, tenantId);
  if ((await lstat(path)).isSymbolicLink() || await realpath(path) !== path) throw Error("Symlink tenant path rejected");
  return path;
}

async function inventory(base: string): Promise<Inventory> {
  const files: Inventory = [];
  let nodes = 0;
  async function walk(relative: string, depth: number): Promise<void> {
    if (++nodes > 100_000 || depth > 64) throw Error("Backup inventory limit exceeded");
    const path = join(base, relative);
    const info = await lstat(path);
    if (info.isSymbolicLink()) throw Error("Symlink backup content rejected");
    if (info.isDirectory()) {
      // Include empty directories in the digest with a distinct marker.
      files.push({ path: relative + "/", bytes: 0, sha256: "directory" });
      for (const entry of (await readdir(path)).sort()) await walk(relative + "/" + entry, depth + 1);
    } else if (info.isFile()) {
      const hash = createHash("sha256");
      const { createReadStream } = await import("node:fs");
      for await (const chunk of createReadStream(path)) hash.update(chunk);
      files.push({ path: relative, bytes: info.size, sha256: hash.digest("hex") });
    } else throw Error("Unsupported backup content");
  }
  for (const root of ROOTS) if (existsSync(join(base, root))) await walk(root, 0);
  return files;
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
  const tenantRoot = await tenantPath(options.dataDir, options.tenantId);
  if (!existsSync(tenantRoot)) {
    throw new Error(`Tenant ${options.tenantId} no existe en ${tenantRoot}`);
  }
  const backupsDir = join(tenantRoot, "backups");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-") + "-" + randomUUID();
  const out = join(backupsDir, stamp);
  await mkdir(out, { recursive: true });

  const paths = ROOTS;
  let totalBytes = 0;
  for (const name of paths) {
    const from = join(tenantRoot, name);
    if (!existsSync(from)) continue;
    const to = join(out, name);
    await cp(from, to, { recursive: true });

  }

  const entries = await inventory(out);
  totalBytes = entries.reduce((sum, item) => sum + item.bytes, 0);
  const manifest = {
    schema: "TENANT_FILE_BACKUP_V2",
    inventory: entries,
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
  segment(options.backupStamp);
  const tenantRoot = await tenantPath(options.dataDir, options.tenantId);
  const backupDir = join(tenantRoot, "backups", options.backupStamp);
  if (await realpath(backupDir) !== backupDir || (await lstat(backupDir)).isSymbolicLink()) throw Error("Symlink backup path rejected");
  const manifestFile = join(backupDir, "manifest.json");
  if ((await lstat(manifestFile)).size > 32 * 1024 * 1024 || (await lstat(manifestFile)).isSymbolicLink()) throw Error("Invalid backup manifest");
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  if (manifest.schema !== "TENANT_FILE_BACKUP_V2" || manifest.tenantId !== options.tenantId ||
      !Number.isFinite(Date.parse(manifest.createdAt)) || !Array.isArray(manifest.inventory)) throw Error("Unverified or mismatched tenant backup");
  const actual = await inventory(backupDir);
  if (JSON.stringify(actual) !== JSON.stringify(manifest.inventory)) throw Error("Backup inventory integrity mismatch");
  const stage = join(tenantRoot, ".restore-" + randomUUID());
  const keep = join(tenantRoot, ".before-restore-" + randomUUID());
  await mkdir(stage);
  const moved: string[] = [];
  const installed: string[] = [];
  try {
    for (const name of ROOTS) if (existsSync(join(backupDir, name))) await cp(join(backupDir, name), join(stage, name), { recursive: true });
    if (JSON.stringify(await inventory(stage)) !== JSON.stringify(manifest.inventory)) throw Error("Staged backup integrity mismatch");
    await mkdir(keep);
    for (const name of ROOTS) {
      const target = join(tenantRoot, name);
      if (existsSync(target)) { await rename(target, join(keep, name)); moved.push(name); }
      if (existsSync(join(stage, name))) { await rename(join(stage, name), target); installed.push(name); }
    }
  } catch (error) {
    for (const name of installed.reverse()) await rm(join(tenantRoot, name), { recursive: true, force: true });
    for (const name of moved.reverse()) await rename(join(keep, name), join(tenantRoot, name));
    throw error;
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
  // Pre-restore roots remain in keep for operator recovery; no DB guarantee.
}
