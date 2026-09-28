import { mkdir, cp, readdir, stat, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

export interface BackupOptions {
  outDir?: string;
  sourceDir?: string;
  retentionDays?: number;
}

export interface BackupResult {
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

export async function runBackup(options: BackupOptions = {}): Promise<BackupResult> {
  const source = options.sourceDir ? resolve(options.sourceDir) : join(repoRoot, ".openmuse");
  if (!existsSync(source)) {
    throw new Error(`No existe ${source}. Nada que respaldar.`);
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupsDir = join(repoRoot, "backups");
  const out = options.outDir ? resolve(options.outDir) : join(backupsDir, stamp);
  await mkdir(out, { recursive: true });

  const paths = ["postgres", "files", "session-signing-key"];
  let totalBytes = 0;
  for (const name of paths) {
    const from = join(source, name);
    if (!existsSync(from)) continue;
    const to = join(out, name);
    await cp(from, to, { recursive: true });
    const size = (await stat(from)).isDirectory() ? await dirSize(from) : (await stat(from)).size;
    totalBytes += size;
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    source,
    node: process.version,
  };
  await writeFile(join(out, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  const pruned =
    options.retentionDays && !options.outDir
      ? await pruneOld(backupsDir, options.retentionDays)
      : 0;

  return { outDir: out, createdAt: manifest.createdAt, bytes: totalBytes, pruned };
}