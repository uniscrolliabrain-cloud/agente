// CONNECTIONS_CLI_V1 - informe de conexiones: que falta, con que nombre, y si
// responde de verdad.
//
// Uso:
//   pnpm connections                 # contrato: solo lee el entorno, no llama a nadie
//   pnpm connections --probe         # ademas llama a cada servicio (necesita red)
//   pnpm connections --probe --json  # escribe artifacts/connections/report.json
//   pnpm connections --mode=live     # exige las obligatorias de produccion
//   pnpm connections --only=whatsapp,voice
//
// Nunca imprime un valor: solo si existe, que nombre lo aporto y que contesto el
// servicio. Sale 1 si falta una obligatoria en el modo pedido, o si falla la
// sonda de una obligatoria.

import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  CONNECTIONS,
  describeProbeError,
  envReader,
  resolveAll,
  type ConnectionSpec,
  type ProbeResult,
  type Resolution,
} from "./lib/connections.ts";

type Mode = "sample" | "live";

interface Row {
  id: string;
  label: string;
  feature: string;
  env: string;
  need: ConnectionSpec["need"];
  source: string | null;
  /** El nombre que gano no es el canonico: lo aporta un alias. */
  alias: boolean;
  present: boolean;
  /** Donde vive el valor: en el config de Doppler o solo en el shell que lanza el script. */
  origin: "doppler" | "shell" | null;
  probe?: ProbeResult;
}

/**
 * Nombres que existen en el config de Doppler. `doppler run` hereda ademas el
 * entorno del shell, asi que una variable puede estar verde sin estar en Doppler:
 * eso es un falso verde que se paga en el primer despliegue, cuando el unico
 * entorno es el del contenedor.
 */
function dopplerNames(): Set<string> | null {
  if (!process.env.DOPPLER_PROJECT && !process.env.DOPPLER_TOKEN) return null;
  const result = spawnSync("doppler", ["secrets", "--only-names", "--json"], {
    encoding: "utf8",
    timeout: 15_000,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) return null;
  try {
    return new Set(Object.keys(JSON.parse(result.stdout) as Record<string, unknown>));
  } catch {
    return null;
  }
}

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value] as const;
  }),
);

const mode: Mode = (args.get("mode") ?? process.env.WORKSPACE_MODE ?? "sample").trim() === "live"
  ? "live"
  : "sample";
const only = args.get("only")
  ? new Set(args.get("only")!.split(",").map((value) => value.trim()).filter(Boolean))
  : null;
const doProbe = args.has("probe");
const wantJson = args.has("json");
const strictProbe = args.has("strict");

function visible(spec: ConnectionSpec): boolean {
  return !only || only.has(spec.feature) || only.has(spec.id);
}

function statusOf(row: Row): "OK" | "FALTA" | "SHELL" | "opcional" | "ROTA" | "?" {
  if (row.present && row.origin === "shell" && row.need === "required-live" && mode === "live")
    return "SHELL";
  if (!row.present) return row.need === "required-live" && mode === "live" ? "FALTA" : "opcional";
  if (row.probe && !row.probe.ok) return "ROTA";
  if (row.probe) return row.origin === "shell" ? "SHELL" : "OK";
  if (row.origin === "shell") return "SHELL";
  return row.need === "required-live" && mode === "live" ? "OK" : "?";
}

function pad(value: string, width: number): string {
  return value.length > width ? `${value.slice(0, width - 1)}…` : value.padEnd(width);
}

async function runProbe(resolution: Resolution): Promise<ProbeResult | undefined> {
  const probe = resolution.spec.probe;
  if (!probe) return undefined;
  const read = envReader();
  // La sonda de WhatsApp necesita dos secretos: sin el segundo, el detalle
  // decia "token invalido" cuando el problema era que faltaba el phone id.
  if (resolution.spec.id === "whatsapp-token" && !read("WHATSAPP_PHONE_ID", "WHATSAPP_PHONE_NUMBER_ID")) {
    return { ok: false, detail: "falta WHATSAPP_PHONE_ID / WHATSAPP_PHONE_NUMBER_ID" };
  }
  if (resolution.spec.id === "google-oauth") {
    if (!read("GOOGLE_CLIENT_SECRET")) return { ok: false, detail: "falta GOOGLE_CLIENT_SECRET" };
  }
  try {
    return await probe({ read });
  } catch (error) {
    return { ok: false, detail: describeProbeError(error) };
  }
}

const resolutions = resolveAll().filter((row) => visible(row.spec));
const managed = dopplerNames();
const rows: Row[] = [];

for (const resolution of resolutions) {
  const { spec, source } = resolution;
  rows.push({
    id: spec.id,
    label: spec.label,
    feature: spec.feature,
    env: spec.names[0],
    need: spec.need,
    source,
    alias: source !== null && source !== spec.names[0],
    present: source !== null,
    origin:
      source === null || managed === null ? null : managed.has(source) ? "doppler" : "shell",
    probe: doProbe && source !== null ? await runProbe(resolution) : undefined,
  });
}

// --- salida ---------------------------------------------------------------

const missingRequired = rows.filter((row) => statusOf(row) === "FALTA");
const shellOnly = rows.filter((row) => statusOf(row) === "SHELL");
const broken = rows.filter((row) => statusOf(row) === "ROTA");
const aliased = rows.filter((row) => row.alias);
const probed = rows.filter((row) => row.probe);
const healthy = probed.filter((row) => row.probe?.ok);

if (wantJson) {
  const report = {
    generatedAt: new Date().toISOString(),
    mode,
    probed: doProbe,
    summary: {
      total: rows.length,
      present: rows.filter((row) => row.present).length,
      missingRequired: missingRequired.length,
      shellOnly: shellOnly.length,
      probed: probed.length,
      healthy: healthy.length,
      broken: broken.length,
      aliased: aliased.length,
    },
    rows,
  };
  const target = resolve("artifacts/connections/report.json");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`[connections] informe JSON: ${target}`);
}

console.log(`\n[connections] modo=${mode}${doProbe ? " + sondas en vivo" : " (sin red)"}`);
console.log("[connections] los valores nunca se imprimen, solo el nombre que los aporta\n");

let feature = "";
for (const row of rows) {
  if (row.feature !== feature) {
    feature = row.feature;
    console.log(`  ${feature.toUpperCase()}`);
  }
  const status = statusOf(row);
  const origin = row.source ? (row.alias ? `${row.source} (alias de ${row.env})` : row.source) : "-";
  const probe = row.probe ? ` ${row.probe.ok ? "✓" : "✗"} ${row.probe.detail}` : "";
  console.log(
    `    ${pad(status, 8)} ${pad(row.label, 38)} ${pad(origin, 44)}${probe}`,
  );
}

const notes: string[] = [];
if (shellOnly.length > 0) {
  notes.push(
    `${shellOnly.length} valores solo existen en el shell, no en el config de Doppler: ${shellOnly
      .map((row) => row.source)
      .join(", ")}. En un contenedor desaparecen.`,
  );
}
if (aliased.length > 0) {
  notes.push(
    `${aliased.length} conexiones se resuelven por alias. Son validas, pero el nombre canonico evita sorpresas: ${aliased
      .map((row) => `${row.env}←${row.source}`)
      .join(", ")}`,
  );
}
for (const row of missingRequired) {
  const spec = CONNECTIONS.find((candidate) => candidate.id === row.id)!;
  notes.push(`FALTA ${row.env} (${row.label}): ${spec.note}`);
}
for (const row of broken) {
  notes.push(`ROTA ${row.env}: ${row.probe?.detail ?? ""}`);
}

if (notes.length > 0) {
  console.log("\n[connections] notas:");
  for (const note of notes) console.log(`  - ${note}`);
}

const probeFailures = probed.filter((row) => !row.probe?.ok);
console.log(
  `\n[connections] ${rows.filter((row) => row.present).length}/${rows.length} presentes` +
    (doProbe ? `, ${healthy.length}/${probed.length} sondas en verde` : "") +
    (missingRequired.length ? `, ${missingRequired.length} obligatorias ausentes` : ""),
);

const failedRequiredProbe = strictProbe
  ? probeFailures.length > 0
  : probeFailures.some((row) => row.need === "required-live");
// En sample, una variable que solo vive en el shell es informacion, no fallo:
// el aviso ya sale en las notas. En live sí bloquea, porque el contenedor no
// hereda el entorno de la maquina.
process.exit(
  missingRequired.length > 0 || (mode === "live" && shellOnly.length > 0) || failedRequiredProbe
    ? 1
    : 0,
);
