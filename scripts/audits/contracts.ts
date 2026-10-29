// AUDIT_CONTRACTS_V2 - audita los contratos del dominio contra el USO real.
//
// Recorre packages/domain/src/*.ts, extrae los contratos exportados (schemas
// Zod, interfaces, tipos y enums) y los clasifica por donde se usan:
//
//   code     -> se usa en otro modulo de apps/ o packages/  (implementado)
//   self     -> se usa dentro de su propio modulo           (parte del contrato exportado)
//   harness  -> se usa solo en tests/ o scripts/
//   orphan   -> no se usa en ninguna parte                  (esto bloquea)
//
// CONTRACTS_CRITERION_V2 - el criterio anterior era "el nombre aparece literal
// en otro fichero", que daba 150 huerfanos de los que 75 eran falsos positivos
// del propio criterio (ver docs/INFORME-CONTRATOS.md). El criterio vive en
// `contracts-criterion.ts` y tiene test propio.
//
// Un huerfano se puede cerrar de tres formas, y solo tres:
//   1. se consume (alguien lo importa y lo usa)
//   2. se marca PENDING(motivo, fecha) junto a su declaracion
//   3. se declara en `contracts-allowlist.json` con motivo y fecha
// No hay cuarta: borrar el contrato es una decision de producto, no del audit.
//
// Uso: pnpm exec tsx scripts/audits/contracts.ts
// Salida: artifacts/gate/audits/AUDIT_CONTRACTS.md + exit 1 si queda algo sin
//         decision o si la allowlist se ha quedado obsoleta.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import {
  classifyContract,
  extractDeclarations,
  inferredAliases,
  type ContractKind,
  type ContractUsage,
  type UsageSources,
} from "./contracts-criterion.ts";
import { auditReportPath } from "./report-dir.ts";

interface Contract extends ContractUsage {
  file: string;
  rel: string;
  kind: ContractKind;
  pending: boolean;
  allow?: { motivo: string; fecha: string };
}

interface AllowlistEntry {
  file: string;
  contracts: string[];
  motivo: string;
  fecha: string;
}

const ROOT = resolve(".");
const DOMAIN_DIR = resolve("packages/domain/src");
const CODE_DIRS = ["apps/server/src", "apps/web/src", "packages"];
const HARNESS_DIRS = ["tests", "scripts"];
const ALLOWLIST_PATH = resolve("scripts/audits/contracts-allowlist.json");

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

const rel = (file: string): string => relative(ROOT, file).replaceAll("\\", "/");

async function loadSources(dirs: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const dir of dirs) {
    for (const file of await listFiles(dir, [".ts", ".tsx"])) {
      out.set(resolve(file), await readFile(file, "utf8"));
    }
  }
  return out;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

async function loadAllowlist(): Promise<{ entries: AllowlistEntry[]; problems: string[] }> {
  const problems: string[] = [];
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(ALLOWLIST_PATH, "utf8"));
  } catch (error) {
    return {
      entries: [],
      problems: [`No se pudo leer ${rel(ALLOWLIST_PATH)}: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
  const list = (raw as { entries?: unknown }).entries;
  if (!Array.isArray(list)) return { entries: [], problems: ["contracts-allowlist.json sin array `entries`"] };

  const entries: AllowlistEntry[] = [];
  for (const [index, item] of list.entries()) {
    const e = item as Partial<AllowlistEntry>;
    const where = `entries[${index}]`;
    // CONTRACTS_ALLOWLIST_NEEDS_REASON_V1 - una entrada sin motivo escrito y sin
    // fecha es una forma de silenciar el audit, no una decision. No se acepta.
    if (typeof e.file !== "string" || e.file.length === 0) {
      problems.push(`${where}: falta \`file\``);
      continue;
    }
    if (!Array.isArray(e.contracts) || e.contracts.length === 0 || e.contracts.some((c) => typeof c !== "string")) {
      problems.push(`${where} (${e.file}): \`contracts\` debe ser una lista de nombres`);
      continue;
    }
    if (typeof e.motivo !== "string" || e.motivo.trim().length < 12) {
      problems.push(`${where} (${e.file}): \`motivo\` debe explicar por que se acepta (>= 12 caracteres)`);
      continue;
    }
    if (typeof e.fecha !== "string" || !isValidDate(e.fecha)) {
      problems.push(`${where} (${e.file}): \`fecha\` debe ser YYYY-MM-DD`);
      continue;
    }
    entries.push({ file: e.file, contracts: e.contracts, motivo: e.motivo.trim(), fecha: e.fecha });
  }
  return { entries, problems };
}

async function main(): Promise<void> {
  console.log("[audit:contracts] Recorriendo dominios...");

  const domainFiles = await listFiles(DOMAIN_DIR, [".ts"]);
  const domainSources = new Map<string, string>();
  for (const file of domainFiles) domainSources.set(resolve(file), await readFile(file, "utf8"));

  console.log("[audit:contracts] Cargando implementaciones y harness...");
  const sources: UsageSources = {
    code: await loadSources(CODE_DIRS),
    harness: await loadSources(HARNESS_DIRS),
  };
  console.log(
    `[audit:contracts] Ficheros de codigo: ${sources.code.size}   de tests/scripts: ${sources.harness.size}`,
  );

  // Alias `z.infer` -> el schema se consume por su tipo. Se resuelven sobre el
  // dominio entero (un alias puede vivir en el barrel).
  const aliases = new Map<string, string>();
  for (const source of domainSources.values()) {
    for (const [from, to] of inferredAliases(source)) aliases.set(from, to);
  }

  const contracts: Contract[] = [];
  for (const [file, source] of domainSources) {
    for (const decl of extractDeclarations(source)) {
      const usage = classifyContract(decl.name, file, sources, aliases.get(decl.name));
      const head = source.slice(0, 2000);
      contracts.push({
        ...usage,
        file,
        rel: rel(file),
        kind: decl.kind,
        pending: new RegExp(`PENDING[^\\n]*\\b${decl.name}\\b|\\b${decl.name}\\b[^\\n]*PENDING`).test(head),
      });
    }
  }
  console.log(`[audit:contracts] Contratos encontrados: ${contracts.length}`);

  // Allowlist
  const { entries, problems } = await loadAllowlist();
  const byName = new Map(contracts.map((c) => [`${c.rel}::${c.name}`, c]));
  const allowProblems = [...problems];
  const claimed = new Set<string>();
  for (const entry of entries) {
    for (const name of entry.contracts) {
      const key = `${entry.file}::${name}`;
      const contract = byName.get(key);
      if (!contract) {
        allowProblems.push(`allowlist: \`${name}\` no existe en \`${entry.file}\``);
        continue;
      }
      claimed.add(key);
      contract.allow = { motivo: entry.motivo, fecha: entry.fecha };
    }
  }

  // CONTRACTS_ALLOWLIST_STALE_V1 - si un contrato ya se usa, su entrada sobra y
  // esconde una decision que ya no aplica. Falla para que la lista no envejezca.
  const stale: Contract[] = [];
  for (const contract of contracts) {
    if (!contract.allow) continue;
    if (contract.bucket !== "orphan") {
      stale.push(contract);
      allowProblems.push(
        `allowlist obsoleta: \`${contract.name}\` (${contract.rel}) ya tiene uso (${contract.bucket}); quita la entrada`,
      );
    }
  }

  const allowlisted = contracts.filter((c) => c.bucket === "orphan" && c.allow);
  const pending = contracts.filter((c) => c.bucket === "orphan" && !c.allow && c.pending);
  const missing = contracts.filter((c) => c.bucket === "orphan" && !c.allow && !c.pending);
  const byBucket = {
    code: contracts.filter((c) => c.bucket === "code"),
    self: contracts.filter((c) => c.bucket === "self"),
    harness: contracts.filter((c) => c.bucket === "harness"),
  };

  const lines: string[] = [
    "# Auditoria de contratos del dominio",
    "",
    `> Generado por \`scripts/audits/contracts.ts\` (criterio V2) el ${new Date().toISOString()}.`,
    "> Criterio: se mide **uso** del nombre en lineas de codigo, no su mencion en otro fichero.",
    "",
    `- Contratos totales: **${contracts.length}**`,
    `- Usados desde otro modulo (code): **${byBucket.code.length}**`,
    `- Usados dentro de su propio modulo (self): **${byBucket.self.length}**`,
    `- Usados solo en tests/scripts (harness): **${byBucket.harness.length}**`,
    `- Declarados PENDING(motivo, fecha): **${pending.length}**`,
    `- En allowlist con motivo y fecha: **${allowlisted.length}**`,
    `- **Sin uso y sin decision: ${missing.length}** (esto bloquea el gate)`,
    "",
  ];

  const table = (title: string, list: Contract[], extra?: (c: Contract) => string): void => {
    if (list.length === 0) return;
    lines.push(`## ${title}`, "");
    lines.push("| Contrato | Fichero | Tipo |" + (extra ? " Detalle |" : ""));
    lines.push("|---|---|---|" + (extra ? "---|" : ""));
    for (const c of [...list].sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(
        `| \`${c.name}\` | \`${c.rel}\` | ${c.kind} |` + (extra ? ` ${extra(c)} |` : ""),
      );
    }
    lines.push("");
  };

  table("Sin uso y sin decision (BLOQUEA)", missing);
  table("Allowlist: superficie publica sin consumidor (revisar caducidad)", allowlisted, (c) =>
    `${c.allow?.motivo ?? ""} _(${c.allow?.fecha ?? ""})_`,
  );
  table("Usados solo en tests/scripts", byBucket.harness, (c) =>
    c.harnessHits.slice(0, 2).map((f) => `\`${rel(f)}\``).join(", "),
  );
  table("Usados dentro de su propio modulo", byBucket.self);
  table("Usados desde otro modulo", byBucket.code, (c) => c.codeHits.slice(0, 2).map((f) => `\`${rel(f)}\``).join(", "));
  if (allowProblems.length > 0) {
    lines.push("## Problemas de allowlist", "");
    for (const p of allowProblems) lines.push(`- ${p}`);
    lines.push("");
  }

  const reportPath = auditReportPath("AUDIT_CONTRACTS.md");
  await writeFile(reportPath, lines.join("\n"), "utf8");
  console.log(`[audit:contracts] Informe escrito en ${reportPath}`);
  console.log(
    `[audit:contracts] OK: ${byBucket.code.length}   MODULO: ${byBucket.self.length}   HARNESS: ${byBucket.harness.length}   ` +
      `PENDING: ${pending.length}   ALLOWLIST: ${allowlisted.length}   HUERFANOS: ${missing.length}`,
  );

  if (allowProblems.length > 0) {
    console.error(`[audit:contracts] ${allowProblems.length} problema(s) en la allowlist:`);
    for (const p of allowProblems) console.error(`  - ${p}`);
    process.exit(1);
  }
  if (missing.length > 0) {
    console.error(
      `[audit:contracts] ${missing.length} contrato(s) sin uso y sin decision. ` +
        "Consume, marca PENDING(motivo, fecha) o declara en contracts-allowlist.json con motivo y fecha.",
    );
    process.exit(1);
  }
  if (stale.length > 0) process.exit(1);
}

void main().catch((error) => {
  console.error("[audit:contracts] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});
