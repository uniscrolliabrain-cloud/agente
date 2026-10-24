// ROLLBACK_V1 - rollback automatico cuando release:verify falla.
// Guarda el ultimo deploy bueno en .openmuse/releases/<stamp>/
// y permite volver a el con un comando.

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

export interface ReleaseRecord {
  stamp: string;
  createdAt: string;
  version: string;
  commit?: string;
  node: string;
}

const RELEASES_DIR = "releases";
const MANIFEST = "manifest.json";

function nowStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function recordGoodRelease(
  dataDir: string,
  version: string,
  commit?: string,
): Promise<ReleaseRecord> {
  const root = resolve(dataDir, RELEASES_DIR);
  await mkdir(root, { recursive: true });
  const stamp = nowStamp();
  const dir = join(root, stamp);
  await mkdir(dir, { recursive: true });
  const record: ReleaseRecord = {
    stamp,
    createdAt: new Date().toISOString(),
    version,
    ...(commit ? { commit } : {}),
    node: process.version,
  };
  await writeFile(join(dir, MANIFEST), JSON.stringify(record, null, 2), "utf8");
  // Mantener solo las 5 ultimas releases buenas.
  await pruneOldReleases(root, 5);
  return record;
}

async function pruneOldReleases(root: string, keep: number): Promise<number> {
  if (!existsSync(root)) return 0;
  const entries = (await readdir(root, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse();
  let pruned = 0;
  for (const name of entries.slice(keep)) {
    await rm(join(root, name), { recursive: true, force: true });
    pruned++;
  }
  return pruned;
}

export async function listGoodReleases(dataDir: string): Promise<ReleaseRecord[]> {
  const root = resolve(dataDir, RELEASES_DIR);
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const out: ReleaseRecord[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const raw = await readFile(join(root, entry.name, MANIFEST), "utf8");
      out.push(JSON.parse(raw) as ReleaseRecord);
    } catch {
      /* ignorar release corrupta */
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function rollbackToRelease(dataDir: string, stamp: string): Promise<ReleaseRecord> {
  const root = resolve(dataDir, RELEASES_DIR);
  const dir = join(root, stamp);
  if (!existsSync(dir)) throw new Error(`Release ${stamp} no existe`);
  const manifest = JSON.parse(await readFile(join(dir, MANIFEST), "utf8")) as ReleaseRecord;
  // El rollback real volveria a hacer checkout del commit o a desplegar la imagen
  // anterior. Aqui registramos la intencion y devolvemos el record para que el
  // operador complete el deploy.
  await writeFile(
    join(dataDir, "ROLLBACK_REQUESTED"),
    JSON.stringify({ requestedAt: new Date().toISOString(), to: manifest }, null, 2),
    "utf8",
  );
  return manifest;
}

export async function hasRollbackRequested(dataDir: string): Promise<boolean> {
  return existsSync(join(dataDir, "ROLLBACK_REQUESTED"));
}