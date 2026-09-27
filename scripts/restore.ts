// Restore script. Copia un backup de vuelta a .openmuse/. El backend debe estar parado.
// Uso: pnpm exec tsx scripts/restore.ts --from DIR

import { cp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const target = join(root, ".openmuse");

async function main() {
  const args = process.argv.slice(2);
  const fromIdx = args.indexOf("--from");
  if (fromIdx < 0 || !args[fromIdx + 1]) {
    console.error("Uso: pnpm exec tsx scripts/restore.ts --from DIR");
    process.exit(1);
  }
  const from = resolve(args[fromIdx + 1]);
  if (!existsSync(join(from, "manifest.json"))) {
    console.error(`No hay manifest en ${from}. Asegurate de que es un backup de OpenMuse.`);
    process.exit(1);
  }
  const manifest = JSON.parse(await readFile(join(from, "manifest.json"), "utf8"));
  console.log(`Restore desde ${from}`);
  console.log(`  createdAt: ${manifest.createdAt}`);
  if (existsSync(target)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const keep = `${target}.before-restore-${stamp}`;
    console.log(`  Muevo ${target} -> ${keep}`);
    await cp(target, keep, { recursive: true });
    await rm(target, { recursive: true, force: true });
  }
  await cp(from, target, { recursive: true });
  await rm(join(target, "manifest.json"), { force: true });
  console.log("Restore completo. Arranca el backend con pnpm dev.");
}

main().catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});
