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