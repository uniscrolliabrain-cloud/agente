This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: package.json, pnpm-workspace.yaml, .github/**, infra/**, docker-compose*.yml, docker-compose*.yaml, compose*.yml, compose*.yaml, vitest.config.*, vitest.workspace.*, scripts/audits/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.github/
  workflows/
    ci.yml
infra/
  compose.yaml
scripts/
  audits/
    blocks/
      README.md
    anchors.ts
    capture-log-samples.ps1
    check-secret-redaction.ps1
    contracts.ts
    find-hanging-before.ps1
    idempotency.ts
    tenant-default.ts
    test-coverage-report.ps1
package.json
pnpm-workspace.yaml
```

# Files

## File: infra/compose.yaml
```yaml
name: openmuse
services:
  browser-worker:
    build:
      context: ../apps/worker
    init: true
    restart: unless-stopped
    environment:
      WORKER_HOST: 0.0.0.0
      WORKER_TOKEN: ${WORKER_TOKEN:?Set WORKER_TOKEN to a random secret of at least 32 characters}
    ports:
      - "127.0.0.1:8790:8790"
    volumes:
      - browser-profiles:/data
    tmpfs:
      - /tmp:size=256m,mode=1777
    shm_size: 256mb
    mem_limit: 2g
    pids_limit: 256
    read_only: true
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8790/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 15s
      timeout: 5s
      retries: 3
volumes:
  browser-profiles:
```

## File: pnpm-workspace.yaml
```yaml
packages:
  - apps/worker
  - apps/web
allowBuilds:
  esbuild: true
  "@biomejs/biome": true
  "@scarf/scarf": false
```

## File: scripts/audits/blocks/README.md
```markdown
# Bloques pendientes de auditar

Mete aqui los bloques .ps1 que quieras revisar antes de aplicarlos.
El script `scripts/audits/anchors.ts` los lee y verifica que cada anclaje
existe en el fichero destino.

Uso:
    pnpm exec tsx scripts/audits/anchors.ts
    pnpm exec tsx scripts/audits/anchors.ts --file scripts/audits/blocks/mi-bloque.ps1

Cuando un bloque ya se aplico y esta verificado, se puede borrar de aqui.
```

## File: scripts/audits/anchors.ts
```typescript
// AUDIT_ANCHORS_V1 - verifica los anclajes de bloques PowerShell contra el
// repo real, antes de aplicarlos.
//
// Un bloque PowerShell del plan suele hacer:
//     $anchor = '...' o @'...'@
//     if ($t.Contains($anchor)) { $t = $t.Replace($anchor, $replacement) }
// Si el anchor no existe en el fichero real, el Replace no hace nada y el
// bloque sigue diciendo "OK". Este script detecta ese caso antes de aplicar.
//
// Uso:
//   pnpm exec tsx scripts/audits/anchors.ts                (revisa todos los bloques guardados)
//   pnpm exec tsx scripts/audits/anchors.ts --file X.ps1   (revisa un bloque concreto)
//   pnpm exec tsx scripts/audits/anchors.ts --stdin        (lee un bloque por stdin)
//
// Los bloques se buscan en scripts/audits/blocks/*.ps1. Se puede meter ahi
// cualquier bloque pegado antes de ejecutarlo.
//
// Salida: docs/AUDIT_ANCHORS.md + exit 1 si hay anclajes rotos.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

interface AnchorCheck {
  blockFile: string;
  targetPath: string;
  anchorSnippet: string;
  found: boolean;
  reason: string;
}

const BLOCKS_DIR = resolve("scripts/audits/blocks");

/**
 * Extrae los pares ($path, $anchor) de un bloque PowerShell.
 * Formas soportadas:
 *     $path = "..."       (o "..." con comillas simples)
 *     $anchor = "..."     (o '...', o @'...'@)
 *     $anchor = 'texto'   con -replace "`r`n", "`n" al final
 *     $anchorImport = ...
 *     $anchorTenant = ...
 *     $anchor2 = ...
 */
function extractAnchors(block: string): Array<{ path: string; anchor: string; raw: string }> {
  const out: Array<{ path: string; anchor: string; raw: string }> = [];
  // Encontrar todas las asignaciones $path = "..."
  const pathRe = /\$path\s*=\s*"([^"]+)"/g;
  const paths: Array<{ value: string; index: number }> = [];
  for (const m of block.matchAll(pathRe)) {
    paths.push({ value: m[1], index: m.index ?? 0 });
  }
  // Encontrar todas las asignaciones $anchor* = "..." o '...' o @'...'@
  const anchorSingleLine = /\$(anchor\w*)\s*=\s*(['"])((?:\\.|(?!\2).)*)\2/g;
  const anchorHereString = /\$(anchor\w*)\s*=\s*@'((?:[^']|'(?!@))*)'@/g;
  const anchors: Array<{ value: string; index: number }> = [];
  for (const m of block.matchAll(anchorSingleLine)) {
    anchors.push({ value: m[3], index: m.index ?? 0 });
  }
  for (const m of block.matchAll(anchorHereString)) {
    anchors.push({ value: m[2], index: m.index ?? 0 });
  }
  // Emparejar por proximidad: para cada anchor, el path mas cercano por encima.
  for (const a of anchors.sort((x, y) => x.index - y.index)) {
    const closestPath = paths
      .filter((p) => p.index < a.index)
      .sort((x, y) => y.index - x.index)[0];
    if (!closestPath) continue;
    // Excluir anchors que no son de reemplazo (por ejemplo $anchorImport vacio).
    if (a.value.trim().length < 5) continue;
    out.push({ path: closestPath.value, anchor: a.value, raw: a.value });
  }
  return out;
}

/**
 * Normaliza CRLF a LF y recorta a la primera y ultima linea no vacias
 * del anchor para reducir el ruido.
 */
function normalizeAnchor(anchor: string): string {
  return anchor.replace(/\r\n/g, "\n").replace(/^\n+|\n+$/g, "");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const blocks: Array<{ file: string; content: string }> = [];

  if (args.includes("--stdin")) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    blocks.push({ file: "<stdin>", content: Buffer.concat(chunks).toString("utf8") });
  } else {
    const fileIdx = args.indexOf("--file");
    if (fileIdx >= 0 && args[fileIdx + 1]) {
      const full = resolve(args[fileIdx + 1]);
      blocks.push({ file: full, content: await readFile(full, "utf8") });
    } else {
      if (!existsSync(BLOCKS_DIR)) {
        console.log(`[audit:anchors] No existe ${BLOCKS_DIR}. Nada que revisar.`);
        return;
      }
      for (const entry of await readdir(BLOCKS_DIR)) {
        if (!entry.endsWith(".ps1")) continue;
        const full = join(BLOCKS_DIR, entry);
        blocks.push({ file: full, content: await readFile(full, "utf8") });
      }
    }
  }

  if (blocks.length === 0) {
    console.log("[audit:anchors] No hay bloques para revisar.");
    return;
  }

  const checks: AnchorCheck[] = [];
  for (const block of blocks) {
    const anchors = extractAnchors(block.content);
    for (const a of anchors) {
      const targetPath = a.path.replace(/\\/g, "/");
      const check: AnchorCheck = {
        blockFile: block.file,
        targetPath,
        anchorSnippet: a.anchor.slice(0, 120),
        found: false,
        reason: "",
      };
      if (!existsSync(targetPath)) {
        check.reason = "fichero no existe";
        checks.push(check);
        continue;
      }
      const target = await readFile(targetPath, "utf8").catch(() => "");
      const normalizedTarget = target.replace(/\r\n/g, "\n");
      const normalizedAnchor = normalizeAnchor(a.anchor);
      if (normalizedTarget.includes(normalizedAnchor)) {
        check.found = true;
        check.reason = "OK";
      } else {
        // Intento alternativo: recortar espacios al inicio y fin de linea.
        const looseAnchor = normalizedAnchor
          .split("\n")
          .map((l) => l.trim())
          .join("\n");
        const looseTarget = normalizedTarget
          .split("\n")
          .map((l) => l.trim())
          .join("\n");
        if (looseTarget.includes(looseAnchor)) {
          check.found = true;
          check.reason = "OK (coincidencia con espacios normalizados)";
        } else {
          check.reason = "anclaje no coincide";
        }
      }
      checks.push(check);
    }
  }

  const missing = checks.filter((c) => !c.found);

  const lines: string[] = [
    "# Auditoria de anclajes",
    "",
    `> Generado por \`scripts/audits/anchors.ts\` el ${new Date().toISOString()}.`,
    "",
    `- Bloques revisados: **${blocks.length}**`,
    `- Anclajes verificados: **${checks.length}**`,
    `- Anclajes rotos: **${missing.length}**`,
    "",
  ];

  if (missing.length > 0) {
    lines.push("## Anclajes rotos");
    lines.push("");
    lines.push("El bloque intentara reemplazar estos fragmentos, pero no existen en el fichero real. El Replace no hara nada y el bloque seguira diciendo OK.");
    lines.push("");
    lines.push("| Bloque | Fichero | Motivo | Anchor (recortado) |");
    lines.push("|---|---|---|---|");
    for (const c of missing) {
      lines.push(`| \`${c.blockFile}\` | \`${c.targetPath}\` | ${c.reason} | \`${c.anchorSnippet.replace(/`/g, "\\`")}\` |`);
    }
    lines.push("");
  }

  if (checks.length > 0 && missing.length === 0) {
    lines.push("Todos los anclajes coinciden con el codigo real.");
    lines.push("");
  }

  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_ANCHORS.md", lines.join("\n"), "utf8");
  console.log("[audit:anchors] Informe escrito en docs/AUDIT_ANCHORS.md");
  console.log(`[audit:anchors] OK: ${checks.length - missing.length}   ROTOS: ${missing.length}`);

  if (missing.length > 0) {
    console.error(`[audit:anchors] Hay ${missing.length} anclajes rotos.`);
    process.exit(1);
  }
}

void main().catch((error) => {
  console.error("[audit:anchors] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});
```

## File: scripts/audits/capture-log-samples.ps1
```powershell
# CAPTURE_LOG_SAMPLES_V1 — arranca el API, hace un request, captura logs.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/log-samples.txt"
$correlation = "audit-corr-$(Get-Random -Maximum 99999)"

Write-Host "Arrancando API en background..." -ForegroundColor Cyan
$api = Start-Process -FilePath "pnpm" -ArgumentList "dev" -PassThru -NoNewWindow `
  -RedirectStandardOutput "artifacts/api-stdout.log" `
  -RedirectStandardError "artifacts/api-stderr.log" `
  -ErrorAction SilentlyContinue

Start-Sleep -Seconds 8

try {
  Write-Host "Haciendo request con correlationId=$correlation..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri "http://127.0.0.1:8787/api/health" `
    -Headers @{ "X-Correlation-Id" = $correlation } -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
} finally {
  $api.Kill()
}

if (Test-Path "artifacts/api-stdout.log") {
  $matches = Select-String -Path "artifacts/api-stdout.log" -Pattern $correlation
  "=== Líneas con correlationId $correlation ===" | Out-File -FilePath $out -Encoding utf8
  if ($matches) {
    $matches | ForEach-Object { $_.Line } | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "OK: $($matches.Count) líneas encontradas" -ForegroundColor Green
  } else {
    "FALLO: ninguna línea con el correlationId" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "FALLO: el correlationId no se propagó" -ForegroundColor Red
  }
}
```

## File: scripts/audits/check-secret-redaction.ps1
```powershell
# CHECK_SECRET_REDACTION_V1 — verifica que los logs no contienen secretos.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/secret-redaction-check.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$patterns = @(
  "Bearer\s+[A-Za-z0-9_\-\.]{20,}",         # authorization
  "sk-[A-Za-z0-9]{20,}",                    # api key estilo OpenAI
  "AIza[A-Za-z0-9_\-]{30,}",                # api key Google
  '"password"\s*:\s*"[^"]+"',               # password en JSON
  '"token"\s*:\s*"[^"]+"'                   # token en JSON
)

$logs = Get-ChildItem -Path "artifacts" -Recurse -Include "*.log" -ErrorAction SilentlyContinue
if (-not $logs) {
  "=== No hay logs en artifacts/ para analizar ===" | Out-File -FilePath $out -Encoding utf8
  Write-Host "SKIP: no hay logs en artifacts/" -ForegroundColor Yellow
  return
}

$findings = @()
foreach ($log in $logs) {
  foreach ($pattern in $patterns) {
    $hits = Select-String -Path $log.FullName -Pattern $pattern -ErrorAction SilentlyContinue
    if ($hits) {
      $findings += [pscustomobject]@{
        File = $log.Name
        Pattern = $pattern
        Count = $hits.Count
      }
    }
  }
}

"=== Resultado de la verificación de redacción ===" | Out-File -FilePath $out -Encoding utf8
if ($findings.Count -eq 0) {
  "OK: no se han encontrado secretos en claro en los logs." | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "OK: redacción funciona" -ForegroundColor Green
} else {
  "FALLO: los siguientes archivos contienen posibles secretos:" | Out-File -FilePath $out -Append -Encoding utf8
  $findings | Format-Table -AutoSize | Out-String | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "FALLO: hay $($findings.Count) hallazgos" -ForegroundColor Red
}
```

## File: scripts/audits/contracts.ts
```typescript
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
```

## File: scripts/audits/find-hanging-before.ps1
```powershell
# FIND_HANGING_BEFORE_V1 — localiza los tests cuyo `before` se cuelga.
# Ejecuta cada archivo de tests por separado con timeout de 10s.
# Los que salen por timeout son candidatos.
# Salida: docs/audits/_prep/hanging-before.txt

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/hanging-before.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$files = Get-ChildItem tests -Filter "*.test.ts" -File
$hanging = @()

"# Tests que superan 10s (candidatos a before colgado)" | Out-File -FilePath $out -Encoding utf8
"# Generado: $(Get-Date -Format o)" | Out-File -FilePath $out -Append -Encoding utf8

foreach ($f in $files) {
  $start = Get-Date
  $proc = Start-Process -FilePath "pnpm" -ArgumentList "exec","tsx","--test","--test-timeout=10000",$f.FullName -PassThru -NoNewWindow -RedirectStandardOutput "NUL" -RedirectStandardError "NUL"
  $done = $proc.WaitForExit(15000)
  if (-not $done) {
    $proc.Kill()
    $hanging += $f.Name
    "$($f.Name) — TIMEOUT >15s" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "HANG: $($f.Name)" -ForegroundColor Red
  } else {
    $elapsed = ((Get-Date) - $start).TotalSeconds
    if ($elapsed -gt 8) {
      "$($f.Name) — lento: $([math]::Round($elapsed,1))s" | Out-File -FilePath $out -Append -Encoding utf8
      Write-Host "SLOW: $($f.Name) $([math]::Round($elapsed,1))s" -ForegroundColor Yellow
    }
  }
}

"" | Out-File -FilePath $out -Append -Encoding utf8
"Total candidatos: $($hanging.Count)" | Out-File -FilePath $out -Append -Encoding utf8
Write-Host "Informe: $out" -ForegroundColor Green
```

## File: scripts/audits/idempotency.ts
```typescript
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
```

## File: scripts/audits/test-coverage-report.ps1
```powershell
# TEST_COVERAGE_REPORT_V1 — % de cobertura por bloque de la campaña.
# Los 6 módulos críticos del roadmap 01: worker, service, actions,
# kernel, rag, tenant. Este script los mide.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

Write-Host "Corriendo pnpm test:coverage..." -ForegroundColor Cyan
pnpm test:coverage 2>&1 | Out-Host

$summary = "coverage/coverage-summary.json"
if (-not (Test-Path $summary)) {
  Write-Host "FALLO: no hay $summary. ¿Instalaste c8?" -ForegroundColor Red
  return
}

$data = Get-Content $summary -Raw | ConvertFrom-Json

$critical = @{
  "worker.ts"   = "apps/server/src/engine/worker.ts"
  "service.ts"  = "apps/server/src/engine/service.ts"
  "actions.ts"  = "apps/server/src/actions.ts"
  "kernel/*"    = "apps/server/src/kernel/"
  "rag.ts"      = "apps/server/src/engine/rag.ts"
  "tenant.ts"   = "apps/server/src/engine/tenant.ts"
}

Write-Host "`n=== Cobertura por módulo crítico ===" -ForegroundColor Cyan
foreach ($name in $critical.Keys) {
  $path = $critical[$name]
  $matches = $data.PSObject.Properties | Where-Object { $_.Name -like "*$path*" }
  if ($matches) {
    $sum = $matches | ForEach-Object { $_.Value.lines.pct } | Measure-Object -Average
    $pct = [math]::Round($sum.Average, 1)
    $color = if ($pct -ge 50) { "Green" } else { "Yellow" }
    Write-Host ("  {0,-15} {1,6}%" -f $name, $pct) -ForegroundColor $color
  } else {
    Write-Host ("  {0,-15} sin datos" -f $name) -ForegroundColor DarkGray
  }
}
```

## File: scripts/audits/tenant-default.ts
```typescript
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

  // TENANT_DEFAULT_AUDIT_V2 — verificado como parte del bloque 07.
  // Ver: docs/audits/07-aislamiento-multi-tenant/roadmap.md §8.
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
```

## File: .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  unit:
    name: unit (typecheck + test, no network)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: corepack enable
      - run: corepack pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
        env:
          ALLOW_NETWORK: "0"
      - name: audits
        run: |
          pnpm audit:tenant-default
          pnpm audit:idempotency
          pnpm audit:contracts
        continue-on-error: true

  worker:
    name: worker (typecheck)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - working-directory: apps/worker
        run: npm ci
      - working-directory: apps/worker
        run: npm run typecheck

  integration:
    name: integration (network + Docker, main only)
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: corepack enable
      - run: corepack pnpm install --frozen-lockfile
      - run: pnpm test
        env:
          ALLOW_NETWORK: "1"
# CI_RELEASE_GATE_V1 - gate adicional antes de release.
  release-gate:
    name: release gate (main only)
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [unit, worker]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: corepack enable
      - run: corepack pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm exec tsx scripts/release-check.ts
```

## File: package.json
```json
{
  "name": "openmuse",
  "version": "0.2.0-beta.1",
  "private": true,
  "type": "module",
  "license": "MIT",
  "packageManager": "pnpm@11.19.0",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "tsx watch apps/server/src/index.ts",
    "// DEMO_SCRIPTS_V1": "scripts de demo",
    "demo:seed": "tsx scripts/seed-demo.ts",
    "demo:dev": "tsx scripts/run-demo.ts",
    "dev:all": "concurrently -n api,web -c blue,magenta \"pnpm dev\" \"pnpm --filter @openmuse/web dev\"",
    "dev:demo": "tsx apps/server/src/demo/entry.ts",
    "test": "tsx --import ./tests/setup.ts --test --test-timeout=5000 tests/*.test.ts",
    "test:hanging": "tsx --import ./tests/setup.ts --test --test-timeout=10000 tests/*.test.ts",
    "test:coverage": "c8 --reporter=text --reporter=lcov pnpm test",
    "test:browser": "node --experimental-strip-types --test apps/worker/tests/lifecycle.test.ts",
    "typecheck": "tsc --noEmit && npm --prefix apps/worker run typecheck",
    "lint": "biome check .",
    "format": "biome check --write .",
    "build:server": "tsc -p tsconfig.build.json",
    "start": "node dist/apps/server/src/index.js",
    "dev:worker": "tsx apps/server/src/worker-entry.ts",
    "start:worker": "node dist/apps/server/src/worker-entry.js",
    "dev:browser": "node --env-file=.env --import tsx apps/worker/src/index.ts",
    "test:computer": "tsx --test apps/computer/smoke.test.ts",
    "provision-client": "tsx scripts/provision-client.ts",
    "backup:create": "tsx scripts/backup.ts",
    "backup:tenant": "tsx scripts/backup-tenant.ts",
    "backup:restore": "tsx scripts/restore.ts",
    "beta:smoke": "tsx scripts/beta-smoke.ts",
    "beta:vertical": "tsx scripts/beta-vertical.ts",
    "release:check": "tsx scripts/release-check.ts",
    "audit:contracts": "tsx scripts/audits/contracts.ts",
    "audit:idempotency": "tsx scripts/audits/idempotency.ts",
    "audit:anchors": "tsx scripts/audits/anchors.ts",
    "audit:tenant-default": "tsx scripts/audits/tenant-default.ts",
    "release:verify": "tsx scripts/release-verify.ts",
    "migrate:tenant": "tsx scripts/migrate-tenant-id.ts",
    "migrate:tenant-scope": "tsx scripts/migrate-tenant-scope.ts",
    "migrate:drop-tenant-id": "tsx scripts/drop-tenant-id-column.ts",
    "admin:create": "tsx scripts/admin-create.ts",
    "roles:export": "tsx scripts/export-roles-public.ts",
    "SEED_AGENTS_REMOVED": "removed: scripts/seed-agents.ts no existe"
  },
  "dependencies": {
    "@ag-ui/client": "0.0.59",
    "@ag-ui/core": "0.0.59",
    "@copilotkit/runtime": "1.70.1",
    "@electric-sql/pglite": "^0.3.14",
    "@hono/node-server": "^1.19.0",
    "hono": "^4.11.4",
    "parse5": "^7.3.0",
    "pdf-lib": "^1.17.1",
    "pg": "^8.16.3",
    "rxjs": "7.8.1",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.0",
    "@copilotkit/aimock": "1.42.0",
    "@copilotkit/core": "1.70.1",
    "@types/node": "^24.0.0",
    "@types/pg": "^8.15.5",
    "concurrently": "^9.1.0",
    "tsx": "^4.20.0",
    "typescript": "~5.9.2"
  }
}
```
