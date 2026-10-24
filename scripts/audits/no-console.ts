// SCRIPTS_AUDIT_NO_CONSOLE_V1
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { detectConsoleUsage, type ConsoleAuditHit } from "../apps/server/src/engine/events/audits/no-console.ts";

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
  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_CONSOLE.md", lines.join("\n"), "utf8");
  console.log(`[audit:console] ${hits.length} ocurrencias en ${files.length} ficheros`);
}

void main().catch((e) => {
  console.error("[audit:console] FALLO:", e instanceof Error ? e.message : e);
  process.exit(1);
});