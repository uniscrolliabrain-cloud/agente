// AUDIT_CONTRACTS_V1 - audita los contratos del dominio contra el codigo real.
//
// Recorre packages/domain/src/*.ts, extrae los schemas Zod y sus tipos
// inferidos, y verifica que cada uno tiene al menos una implementacion real
// en apps/server o apps/web. Si no la tiene, comprueba que esta marcado
// explicitamente como PENDING o STUB.
//
// Uso: pnpm exec tsx scripts/audits/contracts.ts
// Salida: docs/AUDIT_CONTRACTS.md + exit 1 si hay contratos sin implementar
//         y sin marca PENDING.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

interface Contract {
  name: string;
  file: string;
  kind: "schema" | "interface" | "type" | "enum";
  exported: boolean;
  pending: boolean;
  implemented: boolean;
  implementedIn: string[];
}

const DOMAIN_DIR = resolve("packages/domain/src");
const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages/catalog"];

async function listFiles(dir: string, ext: string[]): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (ext.some((e) => entry.name.endsWith(e))) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

/**
 * Extrae los contratos exportados de un fichero del dominio.
 * Detecta:
 *   export const fooSchema = z.object({...})
 *   export interface Foo {...}
 *   export type Foo = ...
 *   export const FOO = z.enum([...])
 */
function extractContracts(file: string, source: string): Contract[] {
  const out: Contract[] = [];
  const pendingFile = /PENDING|STUB|TODO_IMPLEMENT/i.test(source);

  // Schemas Zod
  const zodSchemaRe = /export\s+const\s+(\w+Schema)\s*=\s*z\./g;
  for (const match of source.matchAll(zodSchemaRe)) {
    out.push({
      name: match[1],
      file,
      kind: "schema",
      exported: true,
      pending: pendingFile || /PENDING|STUB/i.test(source.slice(match.index ?? 0, (match.index ?? 0) + 400)),
      implemented: false,
      implementedIn: [],
    });
  }

  // Interfaces
  const interfaceRe = /export\s+interface\s+(\w+)/g;
  for (const match of source.matchAll(interfaceRe)) {
    const idx = match.index ?? 0;
    out.push({
      name: match[1],
      file,
      kind: "interface",
      exported: true,
      pending: /PENDING|STUB/i.test(source.slice(idx, idx + 400)),
      implemented: false,
      implementedIn: [],
    });
  }

  // Types
  const typeRe = /export\s+type\s+(\w+)\s*=/g;
  for (const match of source.matchAll(typeRe)) {
    const idx = match.index ?? 0;
    out.push({
      name: match[1],
      file,
      kind: "type",
      exported: true,
      pending: /PENDING|STUB/i.test(source.slice(idx, idx + 400)),
      implemented: false,
      implementedIn: [],
    });
  }

  // Zod enum const
  const enumRe = /export\s+const\s+(\w+(?:Types|Enum|_TYPES)?)\s*=\s*z\.enum\(/g;
  for (const match of source.matchAll(enumRe)) {
    if (out.some((c) => c.name === match[1])) continue;
    out.push({
      name: match[1],
      file,
      kind: "enum",
      exported: true,
      pending: false,
      implemented: false,
      implementedIn: [],
    });
  }

  return out;
}

/**
 * Busca un contrato por nombre en los directorios de implementacion.
 * Se considera "implementado" si el nombre aparece en un fichero del
 * servidor o del frontend fuera de comentarios.
 */
async function findImplementation(name: string, sources: Map<string, string>): Promise<string[]> {
  const found: string[] = [];
  const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  for (const [file, source] of sources) {
    // Excluir lineas de comentario puro para no confundir.
    const lines = source.split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l));
    if (lines.some((l) => pattern.test(l))) found.push(file);
  }
  return found;
}

async function main(): Promise<void> {
  console.log("[audit:contracts] Recorriendo dominios...");

  const domainFiles = await listFiles(DOMAIN_DIR, [".ts"]);
  const contracts: Contract[] = [];
  for (const file of domainFiles) {
    const source = await readFile(file, "utf8");
    contracts.push(...extractContracts(file, source));
  }

  console.log(`[audit:contracts] Contratos encontrados: ${contracts.length}`);

  console.log("[audit:contracts] Cargando implementaciones...");
  const implSources = new Map<string, string>();
  for (const dir of SEARCH_DIRS) {
    const files = await listFiles(dir, [".ts", ".tsx"]);
    for (const file of files) {
      implSources.set(file, await readFile(file, "utf8"));
    }
  }
  console.log(`[audit:contracts] Ficheros de implementacion: ${implSources.size}`);

  console.log("[audit:contracts] Buscando implementaciones...");
  for (const contract of contracts) {
    const hits = await findImplementation(contract.name, implSources);
    contract.implemented = hits.length > 0;
    contract.implementedIn = hits.slice(0, 5);
  }

  // Informe
  const missing = contracts.filter((c) => !c.implemented && !c.pending);
  const ok = contracts.filter((c) => c.implemented);
  const pending = contracts.filter((c) => c.pending && !c.implemented);

  const lines: string[] = [
    "# Auditoria de contratos del dominio",
    "",
    `> Generado por \`scripts/audits/contracts.ts\` el ${new Date().toISOString()}.`,
    "",
    `- Contratos totales: **${contracts.length}**`,
    `- Con implementacion real: **${ok.length}**`,
    `- Marcados PENDING o STUB: **${pending.length}**`,
    `- Sin implementacion y sin marca: **${missing.length}** (esto es lo que hay que arreglar)`,
    "",
  ];

  if (missing.length > 0) {
    lines.push("## Sin implementacion y sin marca PENDING");
    lines.push("");
    lines.push("| Contrato | Fichero | Tipo |");
    lines.push("|---|---|---|");
    for (const c of missing.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| \`${c.name}\` | \`${c.file}\` | ${c.kind} |`);
    }
    lines.push("");
  }

  if (pending.length > 0) {
    lines.push("## Marcados PENDING o STUB");
    lines.push("");
    lines.push("| Contrato | Fichero | Tipo |");
    lines.push("|---|---|---|");
    for (const c of pending.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| \`${c.name}\` | \`${c.file}\` | ${c.kind} |`);
    }
    lines.push("");
  }

  lines.push("## Con implementacion real");
  lines.push("");
  lines.push("| Contrato | Fichero | Implementado en |");
  lines.push("|---|---|---|");
  for (const c of ok.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 300)) {
    const where = c.implementedIn.map((f) => `\`${f}\``).join(", ") || "-";
    lines.push(`| \`${c.name}\` | \`${c.file}\` | ${where} |`);
  }
  lines.push("");

  if (!(await safeMkdir("docs"))) return;
  await writeFile("docs/AUDIT_CONTRACTS.md", lines.join("\n"), "utf8");
  console.log(`[audit:contracts] Informe escrito en docs/AUDIT_CONTRACTS.md`);
  console.log(`[audit:contracts] OK: ${ok.length}   PENDING: ${pending.length}   HUERFANOS: ${missing.length}`);

  if (missing.length > 0) {
    console.error(`[audit:contracts] Hay ${missing.length} contratos sin implementar y sin marca PENDING.`);
    process.exit(1);
  }
}

async function safeMkdir(dir: string): Promise<boolean> {
  try {
    await readdir(dir);
    return true;
  } catch {
    try {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(dir, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }
}

void main().catch((error) => {
  console.error("[audit:contracts] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});