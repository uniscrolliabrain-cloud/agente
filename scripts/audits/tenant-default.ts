import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

interface Hit {
  file: string;
  line: number;
  snippet: string;
  allowed: boolean;
  reason: string;
}

const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages/domain/src", "scripts"];
const SKIP_DIRS = new Set([
  "node_modules", "dist", ".git", "artifacts", "backups", ".openmuse",
  "audits", "e2e", "load",
]);

const ALLOWED_FILES = [
  "apps/server/src/engine/tenant.ts",
  "apps/server/src/files.ts",
  "apps/server/src/kernel-routes.ts",
  "apps/server/src/db-rls.ts",
  "apps/server/src/admin-routes.ts",
  "apps/server/src/gmb-routes.ts",
  "apps/server/src/notification-prefs.ts",
  "apps/server/src/engine/business/graph.ts",
  "apps/server/src/engine/form-builder.ts",
  "apps/server/src/engine/guardrails/service.ts",
  "apps/server/src/engine/orchestrator/orchestrator.ts",
  "apps/server/src/engine/service.ts",
  "apps/server/src/engine/sop-executor.ts",
  "apps/server/src/engine/model.ts",
  "apps/server/src/engine/conversation.ts",
  "apps/server/src/engine/workspace/generator.ts",
  "apps/server/src/kernel/tenancy/default-resolver.ts",
  "scripts/backfill-task-tenant.ts",
  "scripts/migrate-tenant-id.ts",
  "scripts/migrate-tenant-scope.ts",
  "scripts/seed-business-schema.ts",
  "scripts/seed-sops-agency.ts",
];

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

function isAllowed(file: string, line: string): { allowed: boolean; reason: string } {
  const normalized = file.split("\\").join("/");
  for (const allowed of ALLOWED_FILES) {
    if (normalized.endsWith(allowed)) return { allowed: true, reason: "fichero permitido" };
  }
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
    return { allowed: true, reason: "comentario" };
  }
  if (/cursor:\s*["']default["']/.test(line)) return { allowed: true, reason: "css cursor" };
  if (/FALLBACK_TENANT_V1/.test(line)) return { allowed: true, reason: "fallback marcado" };
  return { allowed: false, reason: "ocurrencia fuera de contexto" };
}

async function main(): Promise<void> {
  console.log("[audit:tenant-default] Recorriendo ficheros...");
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) files.push(...(await listFiles(dir)));
  console.log("[audit:tenant-default] Ficheros: " + files.length);

  const hits: Hit[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasDefault = line.indexOf("\u0027default\u0027") >= 0 || line.indexOf("\u0022default\u0022") >= 0;
      if (!hasDefault) continue;
      const { allowed, reason } = isAllowed(file, line);
      hits.push({ file, line: i + 1, snippet: line.trim().slice(0, 180), allowed, reason });
    }
  }

  const forbidden = hits.filter((h) => !h.allowed);
  const report: string[] = [
    "# Auditoria de default hardcodeado",
    "",
    "> Generado por scripts/audits/tenant-default.ts el " + new Date().toISOString(),
    "",
    "- Ficheros revisados: **" + files.length + "**",
    "- Ocurrencias totales: **" + hits.length + "**",
    "- Permitidas: **" + (hits.length - forbidden.length) + "**",
    "- Prohibidas: **" + forbidden.length + "**",
    "",
  ];
  if (forbidden.length > 0) {
    report.push("## Prohibidas");
    report.push("");
    report.push("| Fichero | Linea | Snippet |");
    report.push("|---|---|---|");
    for (const h of forbidden) {
      const safe = h.snippet.split("|").join("\\|");
      report.push("| " + h.file + " | " + h.line + " | " + safe + " |");
    }
  }
  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_TENANT_DEFAULT.md", report.join("\n"), "utf8");
  console.log("[audit:tenant-default] Informe en docs/AUDIT_TENANT_DEFAULT.md");
  console.log(
    "[audit:tenant-default] PERMITIDAS: " +
      (hits.length - forbidden.length) +
      "   PROHIBIDAS: " +
      forbidden.length,
  );
  if (forbidden.length > 0) process.exit(1);
}

void main().catch((error) => {
  console.error("[audit:tenant-default] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});