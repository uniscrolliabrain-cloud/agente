// IDEMPOTENCY_MARKS_V2 - indice de marcas de campana + defectos reales.
//
// QUE CAMBIA RESPECTO DE V1 (y por que, medido)
//
// V1 fallaba si una misma marca (`NOMBRE_V1`) aparecia en dos ficheros con
// cuerpo distinto (157 casos) o dos veces en el mismo fichero (138 casos). Eso
// no es un defecto: una campana se aplica en N call sites. Medido en este repo:
// `TAKE_FOR_TENANT_COMPUTER_V1` esta 7 veces en `computer.ts` porque el rate
// limit por tenant se cablea en 7 sitios; `APP_TENANT_DB_V1` esta 2 veces en
// `app.ts`. El audit convertia el libro de mantenimiento en una barrera de CI
// que solo se podia poner verde borrando informacion.
//
// V2 separa dos cosas que V1 mezclaba:
//
//   INDICE (informativo, no bloquea)
//     - duplicadas con cuerpo distinto: la marca vive en varios sitios.
//     - repetidas en el mismo fichero: la marca se aplico en N call sites.
//   Se cuentan, se listan y se exportan. Un numero alto es normal.
//
//   DEFECTOS (bloquean, exit 1)
//     - `orphan`: la marca esta en un comentario y despues no hay ni una linea
//       de codigo en el resto del fichero. La marca afirma un cambio que no
//       existe. V1 media "menos de 3 lineas", que daba falsos positivos en los
//       barrel (`log-reexport.ts` es un `export {...}` de una linea: eso es
//       implementacion, no hueco). V2 cuenta presencia, no volumen.
//     - `double-paste`: misma marca, mismo fichero y **mismo cuerpo** dos veces.
//       Eso si es el bloque pegado dos veces.
//
// `idempotency-allowlist.json` permite revisar un defecto con motivo y fecha.
// Una entrada sin motivo (>= 10 caracteres) o sin fecha ISO tumba el audit: la
// lista no puede convertirse en un silenciador.
//
// Uso: pnpm audit:idempotency
// Salida: $AUDIT_REPORT_DIR/AUDIT_IDEMPOTENCY.md + idempotency.json (artifacts/
// por defecto, fuera de git). Exit 1 solo si queda algun defecto sin revisar.

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { auditReportPath } from "./report-dir.ts";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Mark {
  name: string;
  file: string;
  /** 1-based. */
  line: number;
  /** Hash del bloque que sigue a la marca: detecta el pegado dos veces. */
  bodyHash: string;
  /** Lineas de codigo real desde esta marca hasta el final del fichero. */
  codeLinesAfter: number;
  /** El comentario dice que el codigo se retiro: no es un hueco. */
  documented: boolean;
}

export type DefectKind = "orphan" | "double-paste";

export interface AllowEntry {
  mark: string;
  /** Si se omite, vale para cualquier fichero. */
  file?: string;
  category: DefectKind;
  /** Obligatorio: por que este caso es correcto. */
  reason: string;
  /** Obligatorio: ISO date (YYYY-MM-DD). */
  date: string;
}

export interface DoublePaste {
  file: string;
  name: string;
  bodyHash: string;
  lines: number[];
}

export interface Classification {
  marks: number;
  uniqueMarks: number;
  locations: Record<string, { file: string; line: number }[]>;
  /** Indice (informativo): misma marca, cuerpos distintos. */
  conflicts: { name: string; marks: Mark[] }[];
  /** Indice (informativo): misma marca repetida en un fichero. */
  sameFileRepeats: { file: string; name: string; count: number }[];
  /** Defecto: mismo nombre + mismo cuerpo en el mismo fichero. */
  doublePastes: DoublePaste[];
  /** Defecto: marca sin codigo detras. */
  orphans: Mark[];
  /** Defectos cubiertos por la allowlist (revisados). */
  allowed: { kind: DefectKind; mark: string; file: string; reason: string; date: string }[];
  /** Defectos sin revisar: los unicos que tumban el audit. */
  blocking: { doublePastes: DoublePaste[]; orphans: Mark[] };
}

// ---------------------------------------------------------------------------
// Barrido
// ---------------------------------------------------------------------------

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

/** Una linea que no es codigo: vacia, `//`, o dentro de un bloque de comentario. */
export function isCommentLine(line: string): boolean {
  const t = line.trim();
  return (
    t === "" ||
    t.startsWith("//") ||
    t.startsWith("*") ||
    t.startsWith("/*") ||
    t.startsWith("*/") ||
    t.startsWith("{/*")
  );
}

/**
 * Extrae las marcas de un fichero.
 *
 * `codeLinesAfter` cuenta codigo real **en el resto del fichero**. No se corta en
 * la siguiente marca: varias marcas seguidas son cabeceras de bloque y su
 * implementacion es el codigo de debajo (p. ej. la cabecera de `actions.ts`).
 * Lo que distingue una marca huerfana es que no quede ni una linea de codigo
 * despues: no que queden pocas.
 */
export function extractMarks(file: string, source: string): Mark[] {
  const lines = source.split("\n");
  const out: Mark[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(MARK_RE);
    if (!m) continue;
    if (!isCommentLine(lines[i])) continue;

    // Comentario contiguo hacia delante: es lo que dice que la marca es una
    // nota ("eliminado", "retirado") y no un bloque implementado.
    let commentBlock = "";
    for (let j = i; j < Math.min(i + 15, lines.length); j++) {
      if (!isCommentLine(lines[j])) break;
      commentBlock += `${lines[j].trim()}\n`;
    }

    // Codigo real en el resto del fichero.
    let codeLinesAfter = 0;
    for (let j = i + 1; j < lines.length && codeLinesAfter < 500; j++) {
      if (isCommentLine(lines[j])) continue;
      codeLinesAfter++;
    }

    // Cuerpo del bloque: lo que hay entre esta marca y la siguiente. Se quitan
    // comentarios y blancos para que dos pegados identicos den el mismo hash.
    const block: string[] = [];
    for (let j = i + 1; j < lines.length && j < i + 80; j++) {
      if (MARK_RE.test(lines[j]) && isCommentLine(lines[j])) break;
      if (isCommentLine(lines[j])) continue;
      block.push(lines[j].trim());
    }
    out.push({
      name: m[1],
      file,
      line: i + 1,
      bodyHash: createHash("sha256").update(block.join("\n")).digest("hex").slice(0, 16),
      codeLinesAfter,
      documented: /eliminad|removed|deleted|retirad/i.test(commentBlock),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Clasificacion
// ---------------------------------------------------------------------------

function allowEntryFor(
  allow: AllowEntry[],
  kind: DefectKind,
  mark: string,
  file: string,
): AllowEntry | undefined {
  return allow.find(
    (e) => e.category === kind && e.mark === mark && (e.file === undefined || e.file === file),
  );
}

export function classify(marks: Mark[], allow: AllowEntry[] = []): Classification {
  const byName = new Map<string, Mark[]>();
  for (const m of marks) {
    const list = byName.get(m.name) ?? [];
    list.push(m);
    byName.set(m.name, list);
  }

  // INDICE 1: misma marca, cuerpos distintos.
  const conflicts: { name: string; marks: Mark[] }[] = [];
  for (const [name, list] of byName) {
    if (list.length < 2) continue;
    if (new Set(list.map((m) => m.bodyHash)).size > 1) conflicts.push({ name, marks: list });
  }

  // INDICE 2: misma marca repetida en un fichero.
  const sameFileRepeats: { file: string; name: string; count: number }[] = [];
  const perFile = new Map<string, Map<string, number>>();
  for (const m of marks) {
    const inner = perFile.get(m.file) ?? new Map<string, number>();
    inner.set(m.name, (inner.get(m.name) ?? 0) + 1);
    perFile.set(m.file, inner);
  }
  for (const [file, inner] of perFile) {
    for (const [name, count] of inner) {
      if (count > 1) sameFileRepeats.push({ file, name, count });
    }
  }

  // DEFECTO 1: mismo nombre + mismo cuerpo + mismo fichero, dos veces.
  const doublePastes: DoublePaste[] = [];
  const perFileBody = new Map<string, { file: string; name: string; bodyHash: string; lines: number[] }>();
  for (const m of marks) {
    const key = `${m.file}\u0000${m.name}\u0000${m.bodyHash}`;
    const entry = perFileBody.get(key) ?? {
      file: m.file,
      name: m.name,
      bodyHash: m.bodyHash,
      lines: [],
    };
    entry.lines.push(m.line);
    perFileBody.set(key, entry);
  }
  for (const entry of perFileBody.values()) {
    if (entry.lines.length > 1) doublePastes.push({ ...entry, lines: entry.lines.sort((a, b) => a - b) });
  }

  // DEFECTO 2: marca sin codigo detras.
  const orphans = marks.filter((m) => !m.documented && m.codeLinesAfter === 0);

  const allowed: Classification["allowed"] = [];
  const blockingPastes: DoublePaste[] = [];
  for (const dp of doublePastes) {
    const hit = allowEntryFor(allow, "double-paste", dp.name, dp.file);
    if (hit) allowed.push({ kind: hit.category, mark: dp.name, file: dp.file, reason: hit.reason, date: hit.date });
    else blockingPastes.push(dp);
  }
  const blockingOrphans: Mark[] = [];
  for (const o of orphans) {
    const hit = allowEntryFor(allow, "orphan", o.name, o.file);
    if (hit) allowed.push({ kind: hit.category, mark: o.name, file: o.file, reason: hit.reason, date: hit.date });
    else blockingOrphans.push(o);
  }

  return {
    marks: marks.length,
    uniqueMarks: byName.size,
    locations: Object.fromEntries(
      [...byName.keys()].sort().map((name) => [
        name,
        (byName.get(name) ?? [])
          .map(({ file, line }) => ({ file, line }))
          .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line),
      ]),
    ),
    conflicts,
    sameFileRepeats,
    doublePastes,
    orphans,
    allowed,
    blocking: { doublePastes: blockingPastes, orphans: blockingOrphans },
  };
}

// ---------------------------------------------------------------------------
// Allowlist
// ---------------------------------------------------------------------------

export const ALLOWLIST_PATH = join("scripts", "audits", "idempotency-allowlist.json");

/**
 * Lee y valida la allowlist. Una entrada sin motivo o sin fecha es un error,
 * no una entrada ignorada: si alguien la deja a medias, el audit lo dice.
 */
export async function loadAllowlist(path = ALLOWLIST_PATH): Promise<AllowEntry[]> {
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch {
    return [];
  }
  const parsed = JSON.parse(raw) as { entries?: unknown };
  if (!Array.isArray(parsed.entries)) throw new Error(`${path}: falta "entries"`);
  return parsed.entries.map((value, i) => {
    const e = value as Partial<AllowEntry>;
    const where = `${path}: entries[${i}]`;
    if (typeof e.mark !== "string" || !MARK_RE.test(e.mark)) throw new Error(`${where}: "mark" invalida`);
    if (e.category !== "orphan" && e.category !== "double-paste")
      throw new Error(`${where}: "category" debe ser orphan | double-paste`);
    if (typeof e.reason !== "string" || e.reason.trim().length < 10)
      throw new Error(`${where}: "reason" es obligatorio (>= 10 caracteres)`);
    if (typeof e.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.date))
      throw new Error(`${where}: "date" debe ser YYYY-MM-DD`);
    if (e.file !== undefined && typeof e.file !== "string") throw new Error(`${where}: "file" invalida`);
    // ALLOWLIST_PATH_SEPARATORS_V1 - las entradas escritas en Windows traen
    // `apps\\server\\src\\...` y el barrido produce `apps/server/src/...`. La
    // comparacion era exacta, asi que esas revisiones no casaban nunca y el
    // audit las ignoraba en silencio: el defecto salia como bloqueante aunque
    // estuviera revisado. Se normaliza al leer, para que valga en cualquier SO.
    const file = e.file ? e.file.replace(/\\/g, "/") : undefined;
    return { mark: e.mark, category: e.category, reason: e.reason, date: e.date, ...(file ? { file } : {}) };
  });
}

// ---------------------------------------------------------------------------
// Informe
// ---------------------------------------------------------------------------

function reportMarkdown(files: number, c: Classification): string {
  const lines: string[] = [
    "# Auditoria de marcas de idempotencia",
    "",
    `> Generado por \`scripts/audits/idempotency.ts\` el ${new Date().toISOString()}.`,
    "> Criterio: **IDEMPOTENCY_MARKS_V2** (indice informativo + defectos bloqueantes).",
    "",
    "## Resumen",
    "",
    `- Ficheros revisados: **${files}**`,
    `- Marcas encontradas: **${c.marks}**`,
    `- Marcas unicas: **${c.uniqueMarks}**`,
    `- Indice · duplicadas con cuerpo distinto: **${c.conflicts.length}** (informativo)`,
    `- Indice · repetidas en el mismo fichero: **${c.sameFileRepeats.length}** (informativo)`,
    `- Defecto · bloques pegados dos veces: **${c.blocking.doublePastes.length}** (bloqueante)`,
    `- Defecto · marcas sin codigo detras: **${c.blocking.orphans.length}** (bloqueante)`,
    `- Revisadas en allowlist: **${c.allowed.length}**`,
    "",
    "## Como leer esto",
    "",
    "Una marca (`NOMBRE_V1`) identifica **un cambio**, no un sitio: un cambio se",
    "aplica en N call sites. Por eso aparecer varias veces (en el mismo fichero o",
    "en varios) es el caso normal y esta en el indice, sin veredicto.",
    "Bloquean solo dos cosas que si son un error: una marca que no tiene codigo",
    "detras (afirma un cambio inexistente) y el mismo bloque con el mismo cuerpo",
    "pegado dos veces en el mismo fichero.",
    "",
    "Este audit **no comprueba idempotencia**: no ejecuta nada. Que una operacion",
    "con la misma clave ocurra una sola vez lo mide",
    "`tests/gate/idempotency-execution.test.ts`.",
    "",
  ];

  if (c.blocking.orphans.length > 0) {
    lines.push("## DEFECTO · marcas sin codigo detras", "");
    lines.push("La marca esta en un comentario y no hay ninguna linea de codigo entre ella y la siguiente marca (o el final del fichero).");
    lines.push("");
    lines.push("| Marca | Fichero:linea |");
    lines.push("|---|---|");
    for (const m of c.blocking.orphans) lines.push(`| \`${m.name}\` | \`${m.file}:${m.line}\` |`);
    lines.push("");
  }

  if (c.blocking.doublePastes.length > 0) {
    lines.push("## DEFECTO · bloques pegados dos veces", "");
    lines.push("Misma marca, mismo fichero y mismo cuerpo. Probable bloque aplicado dos veces.");
    lines.push("");
    lines.push("| Marca | Fichero | Lineas | Hash |");
    lines.push("|---|---|---|---|");
    for (const d of c.blocking.doublePastes)
      lines.push(`| \`${d.name}\` | \`${d.file}\` | ${d.lines.join(", ")} | ${d.bodyHash} |`);
    lines.push("");
  }

  if (c.allowed.length > 0) {
    lines.push("## Revisadas (allowlist)", "");
    lines.push("| Marca | Fichero | Categoria | Motivo | Fecha |");
    lines.push("|---|---|---|---|---|");
    for (const a of c.allowed)
      lines.push(`| \`${a.mark}\` | \`${a.file}\` | ${a.kind} | ${a.reason} | ${a.date} |`);
    lines.push("");
  }

  if (c.sameFileRepeats.length > 0) {
    lines.push("## Indice · repetidas en el mismo fichero", "");
    lines.push("La marca se aplico en varios call sites del mismo fichero. Informativo.");
    lines.push("");
    lines.push("| Marca | Fichero | Veces |");
    lines.push("|---|---|---|");
    for (const d of c.sameFileRepeats.slice(0, 200)) lines.push(`| \`${d.name}\` | \`${d.file}\` | ${d.count} |`);
    if (c.sameFileRepeats.length > 200) lines.push(`\n_(+${c.sameFileRepeats.length - 200} mas en el JSON)_`);
    lines.push("");
  }

  if (c.conflicts.length > 0) {
    lines.push("## Indice · duplicadas con cuerpo distinto", "");
    lines.push("La misma marca en varios sitios, cada uno con su bloque. Informativo.");
    lines.push("");
    lines.push("| Marca | Fichero:linea | Hash cuerpo |");
    lines.push("|---|---|---|");
    for (const { name, marks } of c.conflicts.slice(0, 100)) {
      for (const m of marks) lines.push(`| \`${name}\` | \`${m.file}:${m.line}\` | ${m.bodyHash} |`);
    }
    if (c.conflicts.length > 100) lines.push(`\n_(+${c.conflicts.length - 100} marcas mas en el JSON)_`);
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export interface AuditResult {
  ok: boolean;
  files: number;
  classification: Classification;
}

export async function runAudit(options: { write?: boolean } = {}): Promise<AuditResult> {
  const { write = true } = options;
  console.log("[audit:idempotency] Recorriendo ficheros...");
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) files.push(...(await listFiles(dir)));
  console.log(`[audit:idempotency] Ficheros: ${files.length}`);

  const marks: Mark[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    marks.push(...extractMarks(file, source));
  }
  const allow = await loadAllowlist();
  const classification = classify(marks, allow);
  console.log(`[audit:idempotency] Marcas encontradas: ${classification.marks}`);

  const blocking = classification.blocking.doublePastes.length + classification.blocking.orphans.length;
  if (write) {
    const md = auditReportPath("AUDIT_IDEMPOTENCY.md");
    await writeFile(md, reportMarkdown(files.length, classification), "utf8");
    const json = auditReportPath("idempotency.json");
    await writeFile(
      json,
      JSON.stringify(
        {
          criterion: "IDEMPOTENCY_MARKS_V2",
          generatedAt: new Date().toISOString(),
          files: files.length,
          marks: classification.marks,
          uniqueMarks: classification.uniqueMarks,
          index: {
            conflicts: classification.conflicts.length,
            sameFileRepeats: classification.sameFileRepeats.length,
            locations: classification.locations,
          },
          defects: {
            doublePastes: classification.blocking.doublePastes,
            orphans: classification.blocking.orphans.map((m) => ({
              name: m.name,
              file: m.file,
              line: m.line,
            })),
          },
          allowed: classification.allowed,
          blocking,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(`[audit:idempotency] Informe escrito en ${md}`);
  }

  // La linea de contadores la parsea scripts/audits/registry.ts: no cambiar el
  // formato sin cambiar alli.
  console.log(
    `[audit:idempotency] DUPLICADAS: ${classification.conflicts.length}   HUERFANAS: ${classification.blocking.orphans.length}   REPETIDAS: ${classification.sameFileRepeats.length}`,
  );
  console.log(`[audit:idempotency] PEGADAS_DOS_VECES: ${classification.blocking.doublePastes.length}`);

  if (blocking > 0) {
    console.error(
      `[audit:idempotency] ${blocking} defecto(s) sin revisar: marcas sin codigo o bloques pegados dos veces.`,
    );
    return { ok: false, files: files.length, classification };
  }
  return { ok: true, files: files.length, classification };
}

// Solo corre cuando se invoca como script (los tests importan las funciones).
if (process.argv[1] && /idempotency\.ts$/.test(process.argv[1].replace(/\\/g, "/"))) {
  void runAudit()
    .then((result) => {
      if (!result.ok) process.exit(1);
    })
    .catch((error) => {
      console.error("[audit:idempotency] FALLO:", error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
