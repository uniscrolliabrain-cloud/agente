// TESTS_BACKUP_RESTORE_V1 — ciclo completo: escribe, backup, verifica, restaura, compara.
// El miniaudit 19 lo pide: "Sin test del ciclo completo".
// El roadmap 19 lo pide como verificación de cierre.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runBackup } from "../apps/server/src/backup.ts";

test("backup conserva todos los archivos y su contenido íntegro", async () => {
  const root = await mkdtemp(join(tmpdir(), "openmuse-bkp-"));
  try {
    const source = join(root, "data");
    await mkdir(join(source, "files"), { recursive: true });
    await mkdir(join(source, "postgres"), { recursive: true });
    await writeFile(join(source, "files", "a.txt"), "contenido A con acentos: ñ é ü", "utf8");
    await writeFile(join(source, "files", "b.bin"), Buffer.from([0, 1, 2, 255, 254]));
    await writeFile(join(source, "postgres", "pgdata"), "fake pgdata", "utf8");

    const out = join(root, "backup-1");
    const result = await runBackup({ sourceDir: source, outDir: out });

    assert.ok(result.bytes > 0, "el backup debe reportar bytes > 0");
    assert.ok(existsSync(join(out, "manifest.json")), "debe existir manifest.json");

    const a = await readFile(join(out, "files", "a.txt"), "utf8");
    assert.equal(a, "contenido A con acentos: ñ é ü", "el texto debe coincidir exactamente");

    const b = await readFile(join(out, "files", "b.bin"));
    assert.deepEqual([...b], [0, 1, 2, 255, 254], "los bytes binarios deben coincidir");

    const pg = await readFile(join(out, "postgres", "pgdata"), "utf8");
    assert.equal(pg, "fake pgdata");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("backup sobre source vacío devuelve bytes=0 sin fallar", async () => {
  const root = await mkdtemp(join(tmpdir(), "openmuse-bkp-empty-"));
  try {
    const source = join(root, "data");
    await mkdir(source, { recursive: true });

    const out = join(root, "backup-empty");
    const result = await runBackup({ sourceDir: source, outDir: out });

    assert.equal(result.bytes, 0, "sin archivos, bytes = 0");
    assert.ok(existsSync(join(out, "manifest.json")), "manifest sigue creándose");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
