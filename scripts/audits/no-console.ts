// SCRIPTS_AUDIT_NO_CONSOLE_V1
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { auditReportPath } from "./report-dir.ts";
// AUDIT_CONSOLE_IMPORT_FIX_V1 - este script vive en scripts/audits/, un nivel
// mas abajo que scripts/: el import necesita ../../ o el audit no arranca.
import { detectConsoleUsage, type ConsoleAuditHit } from "../../apps/server/src/engine/events/audits/no-console.ts";

const SEARCH_DIRS = ["apps/server/src"];
const SKIP = new Set(["node_modules", "dist", ".git", "artifacts", "backups", ".openmuse", "demo"]);

async function walk(dir: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (e.name.endsWith(".ts")) out.push(full);
  }
}

async function main() {
  const files: string[] = [];
  for (const d of SEARCH_DIRS) await walk(d, files);
  const hits: ConsoleAuditHit[] = [];
  for (const file of files) {
    const src = await readFile(file, "utf8");
    hits.push(...detectConsoleUsage(src, file));
  }
  const lines = [
    "# Auditoria de console.* en server",
    "",
    `> ${new Date().toISOString()}`,
    "",
    `- Ficheros revisados: **${files.length}**`,
    `- Ocurrencias: **${hits.length}**`,
    "",
    "| Fichero | Linea | Tipo | Snippet |",
    "|---|---|---|---|",
    ...hits.map((h) => `| ${h.file} | ${h.line} | ${h.kind} | ${h.snippet.replace(/\|/g, "\\|")} |`),
    "",
  ];
  // AUDIT_CONSOLE_ADVISORY_V1 - este audit cuenta `console.*` en el server y NO
  // falla: hay 24 ocurrencias preexistentes y convertirlas en error es una
  // campana aparte, no un cambio de umbral. Se declara `blocking: false` en el
  // registro para que el gate lo publique sin taparlo ni fingir que bloquea.
  const reportPath = auditReportPath("AUDIT_CONSOLE.md");
  await writeFile(reportPath, lines.join("\n"), "utf8");
  console.log(`[audit:console] ${hits.length} ocurrencias en ${files.length} ficheros`);
}

void main().catch((e) => {
  console.error("[audit:console] FALLO:", e instanceof Error ? e.message : e);
  process.exit(1);
});