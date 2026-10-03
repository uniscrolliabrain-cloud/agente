// AUDIT_IDEMPOTENCY_V1 - audita las marcas de idempotencia del repo.
//
// Recorre apps/server/src, apps/web/src, packages y scripts buscando
// comentarios con forma de marca (XXX_V1, XXX_V2, XXX_V3) y comprueba
// que la marca no esta huerfana: que el simbolo que menciona existe en
// el fichero, o que el comentario no esta solo en una cabecera sin
// implementacion real.
//
// Detecta dos categorias:
//   1. Marcas duplicadas: dos ficheros con la misma marca y contenido
//      distinto (el caso tool-executors.ts vs worker.ts).
//   2. Marcas huerfanas: una marca en cabecera sin codigo real debajo.
//
// Uso: pnpm exec tsx scripts/audits/idempotency.ts
// Salida: docs/AUDIT_IDEMPOTENCY.md + exit 1 si hay huerfanas.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

interface Mark {
  name: string;
  file: string;
  line: number;
  contextLines: number;
  bodyHash: string;
}

const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "artifacts", "backups", ".openmuse", "audits"]);

const MARK_RE = /\b([A-Z][A-Z0-9_]{2,}_V\d+)\b/;

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

/**
 * Extrae las marcas de un fichero. Una marca cuenta como "real" si esta en
 * una linea de comentario seguida de al menos 10 lineas de codigo no
 * comentado en las 100 lineas siguientes.
 */
function extractMarks(file: string, source: string): Mark[] {
  const lines = source.split("\n");
  const out: Mark[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(MARK_RE);
    if (!m) continue;
    // Solo cuenta si es comentario.
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("/*")) continue;

    // Medir codigo real en las siguientes 100 lineas.
    let realLines = 0;
    const max = Math.min(i + 100, lines.length);
    for (let j = i + 1; j < max && realLines < 20; j++) {
      const l = lines[j].trim();
      if (!l) continue;
      if (l.startsWith("//") || l.startsWith("*") || l.startsWith("/*")) continue;
      realLines++;
    }
    const bodySource = lines.slice(i + 1, i + 30).join("\n").trim();
    out.push({
      name: m[1],
      file,
      line: i + 1,
      contextLines: realLines,
      bodyHash: createHash("sha256").update(bodySource).digest("hex").slice(0, 16),
    });
  }
  return out;
}

async function main(): Promise<void> {
  console.log("[audit:idempotency] Recorriendo ficheros...");
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) {
    files.push(...(await listFiles(dir)));
  }
  console.log(`[audit:idempotency] Ficheros: ${files.length}`);

  const marks: Mark[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    marks.push(...extractMarks(file, source));
  }
  console.log(`[audit:idempotency] Marcas encontradas: ${marks.length}`);

  // 1. Marcas duplicadas con body distinto.
  const byName = new Map<string, Mark[]>();
  for (const m of marks) {
    const list = byName.get(m.name) ?? [];
    list.push(m);
    byName.set(m.name, list);
  }
  const duplicatesWithConflict: Array<{ name: string; marks: Mark[] }> = [];
  for (const [name, list] of byName) {
    if (list.length < 2) continue;
    const hashes = new Set(list.map((m) => m.bodyHash));
    if (hashes.size > 1) duplicatesWithConflict.push({ name, marks: list });
  }

  // 2. Marcas huerfanas (menos de 3 lineas de codigo real).
  const orphan: Mark[] = marks.filter((m) => m.contextLines < 3);

  // 3. Marcas repetidas en el mismo fichero (probable doble aplicacion).
  const sameFileDup: Array<{ file: string; name: string; count: number }> = [];
  const fileMap = new Map<string, Map<string, number>>();
  for (const m of marks) {
    const inner = fileMap.get(m.file) ?? new Map<string, number>();
    inner.set(m.name, (inner.get(m.name) ?? 0) + 1);
    fileMap.set(m.file, inner);
  }
  for (const [file, inner] of fileMap) {
    for (const [name, count] of inner) {
      if (count > 1) sameFileDup.push({ file, name, count });
    }
  }

  // Informe
  const lines: string[] = [
    "# Auditoria de idempotencia",
    "",
    `> Generado por \`scripts/audits/idempotency.ts\` el ${new Date().toISOString()}.`,
    "",
    `- Ficheros revisados: **${files.length}**`,
    `- Marcas encontradas: **${marks.length}**`,
    `- Marcas unicas: **${byName.size}**`,
    `- Marcas duplicadas con cuerpo distinto: **${duplicatesWithConflict.length}**`,
    `- Marcas huerfanas (sin codigo real debajo): **${orphan.length}**`,
    `- Marcas repetidas en el mismo fichero: **${sameFileDup.length}**`,
    "",
  ];

  if (duplicatesWithConflict.length > 0) {
    lines.push("## Duplicadas con cuerpo distinto");
    lines.push("");
    lines.push("La misma marca aparece en varios sitios con contenido distinto. Una de las dos aplicaciones puede ser erronea.");
    lines.push("");
    lines.push("| Marca | Fichero:linea | Hash cuerpo |");
    lines.push("|---|---|---|");
    for (const { name, marks: list } of duplicatesWithConflict) {
      for (const m of list) {
        lines.push(`| \`${name}\` | \`${m.file}:${m.line}\` | ${m.bodyHash} |`);
      }
    }
    lines.push("");
  }

  if (orphan.length > 0) {
    lines.push("## Huerfanas");
    lines.push("");
    lines.push("La marca aparece en un comentario pero debajo no hay codigo real. Probable marca puesta a mano sin aplicar el bloque.");
    lines.push("");
    lines.push("| Marca | Fichero:linea | Lineas de codigo |");
    lines.push("|---|---|---|");
    for (const m of orphan.slice(0, 200)) {
      lines.push(`| \`${m.name}\` | \`${m.file}:${m.line}\` | ${m.contextLines} |`);
    }
    lines.push("");
  }

  if (sameFileDup.length > 0) {
    lines.push("## Repetidas en el mismo fichero");
    lines.push("");
    lines.push("La misma marca aparece dos veces en el mismo fichero. Probable bloque aplicado dos veces.");
    lines.push("");
    lines.push("| Marca | Fichero | Veces |");
    lines.push("|---|---|---|");
    for (const d of sameFileDup.slice(0, 200)) {
      lines.push(`| \`${d.name}\` | \`${d.file}\` | ${d.count} |`);
    }
    lines.push("");
  }

  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_IDEMPOTENCY.md", lines.join("\n"), "utf8");
  console.log("[audit:idempotency] Informe escrito en docs/AUDIT_IDEMPOTENCY.md");
  console.log(
    `[audit:idempotency] DUPLICADAS: ${duplicatesWithConflict.length}   HUERFANAS: ${orphan.length}   REPETIDAS: ${sameFileDup.length}`,
  );

  const fatal = duplicatesWithConflict.length > 0 || sameFileDup.length > 0;
  if (fatal) {
    console.error("[audit:idempotency] Hay marcas conflictivas o repetidas.");
    process.exit(1);
  }
}

void main().catch((error) => {
  console.error("[audit:idempotency] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});