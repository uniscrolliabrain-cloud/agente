// Backup script para OpenMuse. Copia .openmuse/postgres y .openmuse/files a un directorio de backup.
// Uso: pnpm exec tsx scripts/backup.ts [--out DIR]
//
// El backup es un snapshot consistente del estado de la DB y los archivos. Se puede restaurar
// copiando el contenido de vuelta a .openmuse/ con el backend parado.

import { mkdir, cp, readdir, stat, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = join(root, ".openmuse");

function parseArgs(): { out: string } {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const out = outIdx >= 0 && args[outIdx + 1]
    ? resolve(args[outIdx + 1])
    : join(root, "backups", new Date().toISOString().replace(/[:.]/g, "-"));
  return { out };
}

async function dirSize(path: string): Promise<number> {
  let total = 0;
  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else {
      const info = await stat(full);
      total += info.size;
    }
  }
  return total;
}

async function main() {
  const { out } = parseArgs();
  if (!existsSync(source)) {
    console.error(`No existe ${source}. Nada que respaldar.`);
    process.exit(1);
  }
  console.log(`Backup: ${source} -> ${out}`);
  await mkdir(out, { recursive: true });

  const paths = ["postgres", "files", "session-signing-key"];
  for (const name of paths) {
    const from = join(source, name);
    if (!existsSync(from)) {
      console.log(`  skip ${name} (no existe)`);
      continue;
    }
    const to = join(out, name);
    await cp(from, to, { recursive: true });
    const size = (await stat(from)).isDirectory() ? await dirSize(from) : (await stat(from)).size;
    console.log(`  ${name}: ${(size / 1024 / 1024).toFixed(2)} MB`);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    source,
    node: process.version,
  };
  await writeFile(join(out, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Backup completo: ${out}`);
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
