// GATE_SINGLE_ENTRYPOINT_V1 - `pnpm gate`: un solo comando, un solo veredicto.
//
// Antes de esto habia tres listas distintas de lo que hay que verificar:
// `ci.yml` encadenaba seis audits a mano en un `run: |` (con `bash -e`, el
// primero en rojo ocultaba los demas), `deploy.yml` llamaba a `audit:coherence`
// (siete, con `anchors` que el CI no corria) y un dev corria los que se acordaba.
// Y por debajo, los audits escribian su informe dentro de `docs/`, asi que
// correrlos ensuciaba el worktree.
//
// Este script corre typecheck + typecheck del worker + la suite + las siete
// auditorias de `scripts/audits/registry.ts`, y deja:
//   artifacts/gate/report.json    el resultado completo, legible por maquina
//   artifacts/gate/summary.txt    el resumen legible (el mismo que sale por stdout)
//   artifacts/gate/logs/*.log     la salida entera de cada step
//   artifacts/gate/audits/*.md    los informes de las auditorias (AUDIT_REPORT_DIR)
//
// `artifacts/` esta en `.gitignore`, asi que nada de esto se versiona.
//
// Uso:
//   pnpm gate                          todo
//   pnpm gate --only=audit:contracts   un step (para iterar sin pagar la suite)
//   pnpm gate --only=test,audit:layers varios
//
// Exit: 0 si todo lo bloqueante esta verde; 1 si algo bloqueante falla; 2 si
// `--only` no selecciona ningun step (barrera contra un gate que "pasa" porque
// no corrio nada).
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { AUDIT_CHECKS, AUDIT_REPORT_DIR_ENV } from "./audits/registry.ts";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface CounterSpec {
  /** Un unico match; cada grupo de captura es un contador. */
  captures?: { keys: string[]; re: RegExp };
  /** Global; grupo 1 = clave, grupo 2 = valor. */
  pairs?: RegExp;
}

export interface StepSpec {
  name: string;
  kind: "typecheck" | "test" | "audit";
  blocking: boolean;
  /** argv completo. Se ejecuta sin shell. */
  command: string[];
  /** Relativo a la raiz del repo. */
  cwd?: string;
  counters?: CounterSpec;
  /** Por que `blocking` es ese valor (evidencia, no deseo). */
  proves?: string;
}

export interface StepResult {
  name: string;
  kind: StepSpec["kind"];
  blocking: boolean;
  command: string;
  cwd: string;
  exitCode: number | null;
  ok: boolean;
  durationMs: number;
  counters: Record<string, number>;
  /** Ultimas lineas no vacias de la salida: la evidencia en crudo. */
  tail: string[];
  logFile: string | null;
}

export interface GateReport {
  gate: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  git: { branch: string | null; head: string | null; dirty: number | null; error?: string };
  auditReportDir: string;
  ok: boolean;
  failed: string[];
  advisory: string[];
  steps: StepResult[];
}

// ---------------------------------------------------------------------------
// Definicion de los steps
// ---------------------------------------------------------------------------

// Rutas absolutas resueltas contra la raiz del repo: el gate tiene que funcionar
// igual desde la raiz, desde CI o con un cwd distinto (el step del worker corre
// con cwd=apps/worker).
function tools(root: string) {
  return {
    tsc: resolve(root, "node_modules/typescript/lib/tsc.js"),
    tsx: resolve(root, "node_modules/tsx/dist/cli.mjs"),
    // apps/worker es un paquete del workspace: pnpm/`npm ci` le deja su propio
    // typescript (misma version, ver lockfile).
    tscWorker: resolve(root, "apps/worker/node_modules/typescript/lib/tsc.js"),
  };
}

/** typecheck + suite. Los audits se añaden desde el registro. */
export function checkSteps(root = process.cwd()): StepSpec[] {
  const { tsc, tsx, tscWorker } = tools(root);
  return [
    {
      name: "typecheck",
      kind: "typecheck",
      blocking: true,
      command: [process.execPath, tsc, "--noEmit"],
      counters: { captures: { keys: ["errores"], re: /Found (\d+) error/ } },
      proves: "tsc sale 0 o no; un exit 0 con errores impresos es imposible",
    },
    {
      name: "typecheck:worker",
      kind: "typecheck",
      blocking: true,
      cwd: "apps/worker",
      command: [process.execPath, tscWorker, "--noEmit"],
      counters: { captures: { keys: ["errores"], re: /Found (\d+) error/ } },
      proves: "mismo tsc, tsconfig propio de apps/worker",
    },
    {
      name: "test",
      kind: "test",
      blocking: true,
      command: [
        process.execPath,
        tsx,
        "--import",
        "./tests/setup.ts",
        "--test",
        "--test-timeout=10000",
        "tests/**/*.test.ts",
      ],
      counters: { pairs: /#\s*(tests|pass|fail|skipped|cancelled|todo)\s+(\d+)/g },
      proves: "node:test sale 1 si algun test falla; el glob es el de package.json",
    },
  ];
}

/** Los siete audits, desde el registro unico. */
export function auditSteps(): StepSpec[] {
  return AUDIT_CHECKS.map((check) => ({
    name: `audit:${check.name}`,
    kind: "audit" as const,
    blocking: check.blocking,
    command: [process.execPath, "--import", "tsx", join("scripts", "audits", check.file)],
    counters: { captures: check.captures, pairs: check.pairs },
    proves: check.proves,
  }));
}

export function allSteps(root = process.cwd()): StepSpec[] {
  return [...checkSteps(root), ...auditSteps()];
}

// ---------------------------------------------------------------------------
// Contadores
// ---------------------------------------------------------------------------

/**
 * Extrae los contadores que el propio step imprime en su salida. No se inventa
 * ningun numero: si el patron no casa, esa clave no aparece.
 */
export function extractCounters(text: string, spec?: CounterSpec): Record<string, number> {
  const out: Record<string, number> = {};
  if (!spec) return out;
  if (spec.captures) {
    const m = spec.captures.re.exec(text);
    if (m) {
      spec.captures.keys.forEach((key, i) => {
        const value = Number(m[i + 1]);
        if (Number.isFinite(value)) out[key] = value;
      });
    }
  }
  if (spec.pairs) {
    for (const m of text.matchAll(spec.pairs)) {
      const value = Number(m[2]);
      if (Number.isFinite(value)) out[m[1]] = value;
    }
  }
  return out;
}

/** Ultimas `limit` lineas no vacias, sin recortar por la izquierda. */
export function tailLines(text: string, limit = 8): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0)
    .slice(-limit);
}

// ---------------------------------------------------------------------------
// Ejecucion
// ---------------------------------------------------------------------------

interface RunOptions {
  root?: string;
  only?: string[];
  /** Inyectable para los tests. */
  spawn?: typeof spawnSync;
  now?: () => Date;
}

function gitInfo(root: string, spawn: typeof spawnSync): GateReport["git"] {
  const git = (args: string[]) =>
    spawn("git", args, { cwd: root, encoding: "utf8", timeout: 10_000, windowsHide: true });
  try {
    const head = git(["rev-parse", "HEAD"]);
    const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
    if (head.status !== 0 || branch.status !== 0) {
      return {
        branch: null,
        head: null,
        dirty: null,
        error: (head.stderr || branch.stderr || "git no respondio").trim().slice(0, 200),
      };
    }
    // `--untracked-files=no`: los informes de los audits van a artifacts/
    // (ignorado) pero no queremos que el gate se cuente a si mismo.
    const status = git(["status", "--porcelain", "--untracked-files=no"]);
    const dirty =
      status.status === 0
        ? status.stdout.split(/\r?\n/).filter((l) => l.trim().length > 0).length
        : null;
    return { branch: branch.stdout.trim(), head: head.stdout.trim(), dirty };
  } catch (error) {
    return {
      branch: null,
      head: null,
      dirty: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function runGate(options: RunOptions = {}): GateReport {
  const root = resolve(options.root ?? process.cwd());
  const spawn = options.spawn ?? spawnSync;
  const now = options.now ?? (() => new Date());

  const available = allSteps(root);
  const selected = options.only?.length
    ? available.filter((s) => options.only!.includes(s.name))
    : available;
  if (selected.length === 0) {
    throw new Error(
      `--only no selecciona ningun step: ${options.only?.join(",") ?? ""}. ` +
        `Disponibles: ${available.map((s) => s.name).join(", ")}`,
    );
  }

  const startedAt = now();
  const outDir = join(root, "artifacts", "gate");
  const auditDir = join(outDir, "audits");
  const logsDir = join(outDir, "logs");
  mkdirSync(auditDir, { recursive: true });
  mkdirSync(logsDir, { recursive: true });

  const env = { ...process.env, [AUDIT_REPORT_DIR_ENV]: auditDir };
  const steps: StepResult[] = [];

  for (const spec of selected) {
    const cwd = spec.cwd ? join(root, spec.cwd) : root;
    const start = Date.now();
    // `ALLOW_NETWORK=0` en los audits: esta campana entera corre sin red.
    const run = spawn(spec.command[0], spec.command.slice(1), {
      cwd,
      env,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    });
    const durationMs = Date.now() - start;
    const stdout = typeof run.stdout === "string" ? run.stdout : "";
    const stderr = typeof run.stderr === "string" ? run.stderr : "";
    const combined = [stdout, stderr].filter((s) => s.length > 0).join("\n");
    const exitCode = run.status ?? null;
    const ok = exitCode === 0;

    const logName = `${spec.name.replace(/[:/\\]/g, "_")}.log`;
    const logFile = join(logsDir, logName);
    try {
      writeFileSync(
        logFile,
        `# ${spec.command.join(" ")}\n# cwd: ${cwd}\n# exit: ${exitCode}  (${durationMs} ms)\n\n${combined}\n`,
        "utf8",
      );
    } catch {
      // El log es evidencia, no el veredicto: si no se puede escribir, el
      // resultado del step sigue siendo valido y se refleja en `logFile: null`.
    }

    steps.push({
      name: spec.name,
      kind: spec.kind,
      blocking: spec.blocking,
      command: spec.command.join(" "),
      cwd,
      exitCode,
      ok,
      durationMs,
      counters: extractCounters(combined, spec.counters),
      tail: tailLines(combined),
      logFile,
    });
  }

  const finishedAt = now();
  const failed = steps.filter((s) => !s.ok && s.blocking).map((s) => s.name);
  const advisory = steps.filter((s) => !s.ok && !s.blocking).map((s) => s.name);

  return {
    gate: "GATE_SINGLE_ENTRYPOINT_V1",
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    git: gitInfo(root, spawn),
    auditReportDir: auditDir,
    ok: failed.length === 0,
    failed,
    advisory,
    steps,
  };
}

// ---------------------------------------------------------------------------
// Resumen legible
// ---------------------------------------------------------------------------

function countersToText(counters: Record<string, number>): string {
  return Object.entries(counters)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
}

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Resumen de una pantalla. Se mantiene por debajo de 30 lineas a proposito. */
export function renderSummary(report: GateReport): string {
  const lines: string[] = [];
  const head = report.git.head ? report.git.head.slice(0, 8) : "sin-head";
  lines.push(`GATE · ${head} (${report.git.branch ?? "sin-rama"}) · ${report.startedAt}`);
  if (report.git.error) lines.push(`aviso: no se pudo leer git (${report.git.error})`);
  else if (report.git.dirty) lines.push(`aviso: worktree sucio (${report.git.dirty} ficheros con cambios)`);

  const width = Math.max(...report.steps.map((s) => s.name.length));
  for (const step of report.steps) {
    const counters = countersToText(step.counters);
    const label = step.name.padEnd(width);
    const tag = step.ok ? "OK  " : step.blocking ? "FAIL" : "WARN";
    const suffix = counters ? `  ${counters}` : "";
    const advisory = !step.ok && !step.blocking ? "  (advisory, no bloquea)" : "";
    lines.push(`${tag} ${label}  ${seconds(step.durationMs)}${suffix}${advisory}`);
  }

  lines.push("");
  const verdict = report.ok ? "GATE OK" : "GATE FALLA";
  const total = report.steps.length;
  lines.push(`${verdict} · ${total - report.failed.length}/${total} steps en verde · ${seconds(report.durationMs)}`);
  if (report.advisory.length > 0) {
    lines.push(`advisory en rojo (se publica, no bloquea): ${report.advisory.join(", ")}`);
  }
  lines.push("informe: artifacts/gate/report.json");
  lines.push("logs:    artifacts/gate/logs/    informes de audits: artifacts/gate/audits/");
  return lines.join("\n");
}

/** Escribe report.json y summary.txt. Devuelve las rutas. */
export function writeArtifacts(report: GateReport, root = process.cwd()): { json: string; summary: string } {
  const dir = join(root, "artifacts", "gate");
  mkdirSync(dir, { recursive: true });
  const json = join(dir, "report.json");
  const summary = join(dir, "summary.txt");
  writeFileSync(json, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(summary, `${renderSummary(report)}\n`, "utf8");
  return { json, summary };
}

export function parseOnly(argv: string[]): string[] | undefined {
  const arg = argv.find((a) => a.startsWith("--only="));
  if (!arg) return undefined;
  const value = arg.slice("--only=".length).trim();
  if (value.length === 0) throw new Error("--only= necesita al menos un nombre de step");
  return value.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function main(argv: string[] = process.argv.slice(2)): number {
  let report: GateReport;
  try {
    report = runGate({ only: parseOnly(argv) });
  } catch (error) {
    console.error(`[gate] ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  }
  writeArtifacts(report);
  console.log(renderSummary(report));
  return report.ok ? 0 : 1;
}

// Solo se ejecuta al invocarlo directamente (`tsx scripts/gate-report.ts`), no al
// importarlo desde un test.
const invoked = (process.argv[1] ?? "").replace(/\\/g, "/");
if (invoked.endsWith("scripts/gate-report.ts") || invoked.endsWith("scripts/gate-report.js")) {
  process.exit(main());
}
