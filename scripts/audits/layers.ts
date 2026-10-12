// SCRIPTS_AUDIT_LAYERS_V1
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const LAYERS = {
  domain: "packages/domain/src",
  kernel: "apps/server/src/kernel",
  engine: "apps/server/src/engine",
  db: "apps/server/src/db.ts",
  web: "apps/web/src",
};

interface Hit {
  file: string;
  line: number;
  rule: string;
  snippet: string;
}

const RULES: Array<{ from: keyof typeof LAYERS; forbidden: string[]; rule: string }> = [
  { from: "domain", forbidden: ["apps/server", "apps/web", "packages/workspaces"], rule: "domain no importa de apps ni workspaces" },
  { from: "kernel", forbidden: ["apps/web"], rule: "kernel no importa de web" },
  { from: "web", forbidden: ["apps/server/src"], rule: "web no importa de server (salvo types .d.ts)" },
];

async function walk(dir: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === "dist") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) out.push(full);
  }
}

async function main() {
  const hits: Hit[] = [];
  for (const [name, dir] of Object.entries(LAYERS)) {
    if (!dir.endsWith(".ts")) {
      const files: string[] = [];
      await walk(dir, files);
      for (const file of files) {
        const src = await readFile(file, "utf8");
        const lines = src.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.includes("import")) continue;
          for (const rule of RULES.filter((r) => r.from === name)) {
            for (const f of rule.forbidden) {
              if (line.includes(f)) {
                hits.push({ file, line: i + 1, rule: rule.rule, snippet: line.trim().slice(0, 180) });
              }
            }
          }
        }
      }
    }
  }
  const report = [
    "# Auditoria de capas",
    "",
    `> ${new Date().toISOString()}`,
    "",
    `- Violaciones: **${hits.length}**`,
    "",
    "| Fichero | Linea | Regla | Snippet |",
    "|---|---|---|---|",
    ...hits.map((h) => `| ${h.file} | ${h.line} | ${h.rule} | ${h.snippet.replace(/\|/g, "\\|")} |`),
    "",
  ];
  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_LAYERS.md", report.join("\n"), "utf8");
  console.log(`[audit:layers] ${hits.length} violaciones`);
}

void main().catch((e) => {
  console.error("[audit:layers] FALLO:", e instanceof Error ? e.message : e);
  process.exit(1);
});