// TRANS06_TRUTH_DIAGNOSE_V1 - diagnostico de procedencia; no concede autoridad ni verified_fact.
// Uso: tsx scripts/trans06-truth-diagnose.ts --candidates <fichero.json> [--field <campo>] [--now <iso>] [--json]
// El fichero contiene { "field": "...", "candidates": [...] } o directamente el array de candidatos.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { TruthResolver } from "../apps/server/src/engine/business/truth-resolver.ts";
import { truthCandidateSchema, type TruthCandidate } from "../packages/domain/src/truth.ts";

export interface DiagnosisConflict {
  value: unknown;
  source: string;
  observedAt: string;
  epistemic: string;
}

export interface Diagnosis {
  field: string;
  value: unknown;
  source: string;
  observedAt: string | null;
  resolvedAt: string;
  epistemic: "hecho_declarado" | "inferencia" | "afirmacion_usuario";
  certainty: number;
  receipt: null;
  conflicts: DiagnosisConflict[];
  wasConflict: boolean;
  authority: "none";
  verifiedFact: false;
  notes: string[];
}

const EPISTEMIC: Record<string, Diagnosis["epistemic"]> = {
  fact: "hecho_declarado",
  inference: "inferencia",
  user_assertion: "afirmacion_usuario",
};

/** Diagnostico puro: no escribe, no llama a proveedores y no imprime el candidato completo. */
export function diagnose(
  field: string,
  rawCandidates: readonly unknown[],
  now: number,
): Diagnosis {
  // la validacion es la misma que aplica el resolver: fecha, field y tipos
  const candidates = rawCandidates.map((candidate) => truthCandidateSchema.parse(candidate));
  const resolution = new TruthResolver(() => now).resolve(field, candidates);
  const matching = candidates.filter(
    (candidate) =>
      candidate.source === resolution.source &&
      JSON.stringify(candidate.value) === JSON.stringify(resolution.value),
  );
  const observedAt =
    matching.length > 0
      ? matching
          .map((candidate) => candidate.observedAt)
          .sort((a, b) => Date.parse(b) - Date.parse(a))[0]
      : null;

  return {
    field: resolution.field,
    value: resolution.value,
    source: resolution.source,
    observedAt,
    resolvedAt: resolution.resolvedAt,
    epistemic: EPISTEMIC[resolution.kind] ?? "inferencia",
    certainty: resolution.confidence,
    receipt: null,
    conflicts: resolution.conflicts.map((conflict) => ({
      value: conflict.value,
      source: conflict.source,
      observedAt: conflict.observedAt,
      epistemic: EPISTEMIC[conflict.kind] ?? "inferencia",
    })),
    wasConflict: resolution.wasConflict,
    authority: "none",
    verifiedFact: false,
    notes: [
      "TruthCandidate no modela receipt: el diagnostico lo declara ausente en vez de inventarlo.",
      "El ranking solo ordena candidatos; un hecho verificado exige un receipt de cognition-v2.",
      "observedAt se deriva del candidato ganador (fuente + valor); el resolver no lo devuelve.",
    ],
  };
}

export function render(diagnosis: Diagnosis): string {
  const lines = [
    `Dato: ${diagnosis.field}`,
    `Valor: ${JSON.stringify(diagnosis.value)}`,
    `Fuente: ${diagnosis.source}`,
    `Fecha de observacion: ${diagnosis.observedAt ?? "desconocida"}`,
    `Resuelto: ${diagnosis.resolvedAt}`,
    `Estado epistemico: ${diagnosis.epistemic}`,
    `Certeza: ${diagnosis.certainty}`,
    `Receipt: ausente (no modelado en TruthCandidate)`,
    `Conflictos: ${diagnosis.conflicts.length}`,
  ];
  for (const conflict of diagnosis.conflicts)
    lines.push(
      `  - ${JSON.stringify(conflict.value)} · ${conflict.source} · ${conflict.observedAt} · ${conflict.epistemic}`,
    );
  lines.push("Autoridad: ninguna (el ranking no concede verified_fact ni permisos)");
  return lines.join("\n");
}

function main(argv: readonly string[]): number {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") args.set("json", "1");
    else if (arg.startsWith("--")) {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        console.error(`Falta el valor de ${arg}`);
        return 2;
      }
      args.set(arg.slice(2), value);
      i++;
    }
  }
  const file = args.get("candidates");
  if (!file) {
    console.error(
      "Uso: tsx scripts/trans06-truth-diagnose.ts --candidates <fichero.json> [--field <campo>] [--now <iso>] [--json]",
    );
    return 2;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`No se pudo leer ${file}: ${(error as Error).message}`);
    return 2;
  }
  const data = Array.isArray(payload) ? { candidates: payload } : (payload as Record<string, unknown>);
  const candidates = data.candidates;
  const field = args.get("field") ?? (typeof data.field === "string" ? data.field : undefined);
  if (!Array.isArray(candidates) || !field) {
    console.error("El fichero necesita un array candidates y un field (o --field).");
    return 2;
  }
  const now = args.has("now") ? Date.parse(args.get("now")!) : Date.now();
  if (!Number.isFinite(now)) {
    console.error("--now no es una fecha valida.");
    return 2;
  }

  try {
    const diagnosis = diagnose(field, candidates, now);
    console.log(args.has("json") ? JSON.stringify(diagnosis, null, 2) : render(diagnosis));
    return 0;
  } catch (error) {
    console.error(`Diagnostico rechazado: ${(error as Error).message}`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}

export type { TruthCandidate };
