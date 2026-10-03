// AUDIT_TENANT_DEFAULT_V1 - detecta "default" hardcodeado en codigo de negocio.
//
// El unico sitio donde puede aparecer "default" es TenantService (que lo usa
// como fallback cuando no hay membership). En cualquier otro sitio es un bug
// de aislamiento multi-tenant.
//
// Uso: pnpm exec tsx scripts/audits/tenant-default.ts
// Salida: docs/AUDIT_TENANT_DEFAULT.md + exit 1 si hay ocurrencias fuera de
// las excepciones permitidas.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

interface Hit {
  file: string;
  line: number;
  snippet: string;
  allowed: boolean;
  reason: string;
}

const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages/domain/src", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "artifacts", "backups", ".openmuse", "audits", "e2e", "load"]);

// Ficheros y patrones donde "default" es legitimo.
const ALLOWED_FILES = [
  "apps/server/src/engine/tenant.ts",
];

const ALLOWED_CONTEXTS = [
  // Fallbacks declarados y comentados como tales.
  /tenantIdFor\\(\\s*[^)]+\\)\\s*\\?\\?\\s*[\x22']default[\x22']/, 
  /tenantId\\s*\\?\\?\\s*[\x22']default[\x22']/, 
  /fallback\\s*[:\x22']\\s*default/, 
  /DEFAULT_TENANT_ID/, 
  // Tests y scripts de seed con proposito explicito.
  /test\\(|describe\\(|it\\(/, 
  // Comentarios.
  /^\\s*\\/\\//, 
];

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith(\x22.\x22)) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

function isAllowed(file: string, line: string): { allowed: boolean; reason: string } {
  const normalized = file.replace(/\\\\/g, \x22/\x22);
  for (const allowed of ALLOWED_FILES) {
    if (normalized.endsWith(allowed)) {
      return { allowed: true, reason: \x22fichero permitido\x22 };
    }
  }
  for (const pattern of ALLOWED_CONTEXTS) {
    if (pattern.test(line)) return { allowed: true, reason: \x22contexto permitido\x22 };
  }
  return { allowed: false, reason: \x22ocurrencia fuera de contexto\x22 };
}

async function main(): Promise<void> {
  console.log(\x22[audit:tenant-default] Recorriendo ficheros...\x22);
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) {
    files.push(...(await listFiles(dir)));
  }
  console.log([audit:tenant-default] Ficheros: );

  const hits: Hit[] = [];
  for (const file of files) {
    const source = await readFile(file, \x22utf8\x22);
    const lines = source.split(\x22\\n\x22);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!/[\x22']default[\x22']/.test(line)) continue;
      // Descartar strings que no son tenantId (por ejemplo \x22default\x22 en zod .default(...)).
      if (/\\.default\\(/.test(line)) continue;
      if (/import|require/.test(line)) continue;
      const { allowed, reason } = isAllowed(file, line);
      hits.push({ file, line: i + 1, snippet: line.trim().slice(0, 180), allowed, reason });
    }
  }

  const forbidden = hits.filter((h) => !h.allowed);

  const report: string[] = [
    \x22# Auditoria de \\\x22default\\\x22 hardcodeado\x22,
    \x22\x22,
    > Generado por \\scripts/audits/tenant-default.ts\\ el .,
    \x22\x22,
    - Ficheros revisados: ****,
    - Ocurrencias totales: ****,
    - Permitidas: ****,
    - Prohibidas: ****,
    \x22\x22,
  ];

  if (forbidden.length > 0) {
    report.push(\x22## Prohibidas\x22);
    report.push(\x22\x22);
    report.push(\x22\\\x22default\\\x22 hardcodeado fuera de un fallback declarado. Hay que sustituirlo por TenantService.tenantIdFor(owner).\x22);
    report.push(\x22\x22);
    report.push(\x22| Fichero | Linea | Snippet |\x22);
    report.push(\x22|---|---|---|\x22);
    for (const h of forbidden) {
      const safe = h.snippet.replace(/\\|/g, \x22\\\\|\x22);
      report.push(| \\${h.file}\\ |  | \\${safe}\\ |);
    }
    report.push(\x22\x22);
  }

  await mkdir(\x22docs\x22, { recursive: true });
  await writeFile(\x22docs/AUDIT_TENANT_DEFAULT.md\x22, report.join(\x22\\n\x22), \x22utf8\x22);
  console.log(\x22[audit:tenant-default] Informe escrito en docs/AUDIT_TENANT_DEFAULT.md\x22);
  console.log([audit:tenant-default] PERMITIDAS:    PROHIBIDAS: );

  if (forbidden.length > 0) {
    console.error([audit:tenant-default] Hay  ocurrencias prohibidas.);
    process.exit(1);
  }
}

void main().catch((error) => {
  console.error(\x22[audit:tenant-default] FALLO:\x22, error instanceof Error ? error.message : error);
  process.exit(1);
});