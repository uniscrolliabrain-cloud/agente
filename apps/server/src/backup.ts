import { mkdir, cp, readdir, stat, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { logWarn } from "./log.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

export interface BackupOptions {
  outDir?: string;
  sourceDir?: string;
  retentionDays?: number;
  // BACKUP_DATA_DIR_V1 - en produccion el estado vive en DATA_DIR (/data en la
  // imagen), no en <repo>/.agente: dentro del contenedor `repoRoot` resuelve a
  // /app/dist y el backup fallaba con "No existe /app/dist/.agente".
  dataDir?: string;
}

export interface BackupResult {
  outDir: string;
  createdAt: string;
  bytes: number;
  pruned: number;
}

/**
 * BACKUP_DATABASE_MODE_V1 - con DATABASE_URL remota el estado del negocio NO
 * esta en DATA_DIR: PGlite solo se usa cuando no hay Postgres. Copiar
 * DATA_DIR/postgres daba un backup de "0.00 MB" que parecia correcto y no
 * contenia ni un tenant. Este es el aviso que faltaba.
 */
export function databaseMode(): {
  mode: "embedded" | "external";
  host: string | null;
} {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return { mode: "embedded", host: null };
  try {
    const host = new URL(url).hostname;
    const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
    return { mode: local ? "embedded" : "external", host };
  } catch {
    return { mode: "embedded", host: null };
  }
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
  // BACKUP_DATA_DIR_V1 - el origen por defecto es DATA_DIR si se conoce.
  const defaultSource = options.dataDir ? resolve(options.dataDir) : join(repoRoot, ".agente");
  const source = options.sourceDir ? resolve(options.sourceDir) : defaultSource;
  if (!existsSync(source)) {
    throw new Error(`No existe ${source}. Nada que respaldar.`);
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  // BACKUP_DATA_DIR_V1 - los backups se guardan junto al dato, no en el
  // directorio del compilado (que es de solo lectura y se pierde al desplegar).
  const backupsDir = join(options.dataDir ? resolve(options.dataDir) : repoRoot, "backups");
  const out = options.outDir ? resolve(options.outDir) : join(backupsDir, stamp);
  await mkdir(out, { recursive: true });

  const database = databaseMode();
  // Con base externa no hay ficheros de Postgres que copiar: el estado vive en
  // el proveedor y su recuperacion es PITR/branch, no este directorio.
  const paths =
    database.mode === "external"
      ? ["files", "session-signing-key"]
      : ["postgres", "files", "session-signing-key"];
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
    bytes: totalBytes,
    // BACKUP_DATABASE_MODE_V1 - el manifiesto declara explicitamente que la
    // base no viaja aqui cuando es externa. Sin esto, un backup vacio se lee
    // como un backup valido.
    database: {
      mode: database.mode,
      host: database.host,
      recovery:
        database.mode === "external"
          ? "La base de datos NO esta en este backup. Recuperacion: PITR/restore del proveedor (Neon). Ver docs/operacion/DESPLIEGUE.md#backup"
          : "Postgres embebido (PGlite) en DATA_DIR/postgres.",
    },
    empty: totalBytes === 0,
  };
  if (database.mode === "external") {
    logWarn("backup.external_database", {
      host: database.host,
      bytes: totalBytes,
      note: "Este backup cubre ficheros y clave de sesion; la base vive en el Postgres gestionado.",
    });
  }
  await writeFile(join(out, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  const pruned =
    options.retentionDays && !options.outDir
      ? await pruneOld(backupsDir, options.retentionDays)
      : 0;

  return { outDir: out, createdAt: manifest.createdAt, bytes: totalBytes, pruned };
}