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
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve, relative, isAbsolute } from "node:path";

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
  logSha256?: string;
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
  runManifest?: { before: GateReport["git"]; lockSha256: string | null; nodeVersion: string };
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
        "--test-reporter=tap",
        // GATE_TEST_TIMEOUT_V1 - 10 s mataba tests legitimos: el primero de
        // tests/auth.test.ts tarda 13 s solo (hash de password) y bajo carga de
        // suite completa pasa de 10 s. El fallo se veia como "test timed out",
        // no como un fallo de comportamiento.
        "--test-timeout=30000",
        // GATE_TEST_FORCE_EXIT_V1 - sin esto el gate termina los tests y se
        // queda colgado con handles abiertos (timers, pools, sockets de los
        // dobles). No relaja nada: node sigue saliendo 1 si un test falla; solo
        // deja de esperar a que se cierren recursos que no afectan al veredicto.
        "--test-force-exit",
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
    // Ignored artifacts are excluded by Git; untracked source must count.
    const status = git(["status", "--porcelain", "--untracked-files=all"]);
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
  const selected = options.only !== undefined
    ? available.filter((s) => options.only!.includes(s.name))
    : available;
  if (selected.length === 0) {
    throw new Error(
      `--only no selecciona ningun step: ${options.only?.join(",") ?? ""}. ` +
        `Disponibles: ${available.map((s) => s.name).join(", ")}`,
    );
  }

  const before = gitInfo(root, spawn);
  let lockSha256: string | null = null;
  try { lockSha256 = sha256(readFileSync(join(root, "pnpm-lock.yaml"))); } catch { /* Incomplete evidence remains local-only. */ }
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
    let logSha256: string | undefined;
    try {
      writeFileSync(
        logFile,
        `# ${spec.command.join(" ")}\n# cwd: ${cwd}\n# exit: ${exitCode}  (${durationMs} ms)\n\n${combined}\n`,
        "utf8",
      );
      logSha256 = sha256(readFileSync(logFile));
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
      logFile: logSha256 ? logFile : null,
      logSha256,
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
    runManifest: { before, lockSha256, nodeVersion: process.version },
    auditReportDir: auditDir,
    ok: failed.length === 0,
    failed,
    advisory,
    steps,
  };
}

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Validate full local execution evidence. Integrity is not external attestation. */
export function validateExecutedGate(source: unknown, root = process.cwd()): GateReport {
  const fail = (reason: string): never => { throw new Error(`Invalid gate evidence: ${reason}`); };
  if (!source || typeof source !== "object") fail("report shape");
  const report = source as GateReport;
  const current = gitInfo(root, spawnSync);
  const before = report.runManifest?.before;
  if (report.gate !== "GATE_SINGLE_ENTRYPOINT_V1" || !Array.isArray(report.steps)) fail("report shape");
  if (!current.head || !/^[a-f0-9]{40}$/.test(current.head) || current.dirty !== 0 ||
      report.git?.head !== current.head || report.git.dirty !== 0 ||
      before?.head !== current.head || before.dirty !== 0) fail("stale or dirty checkout");
  if (report.runManifest?.nodeVersion !== process.version ||
      report.runManifest.lockSha256 !== sha256(readFileSync(join(root, "pnpm-lock.yaml")))) fail("runtime or lockfile changed");
  const specs = allSteps(root);
  if (report.steps.length !== specs.length || new Set(report.steps.map(s => s?.name)).size !== specs.length) fail("full unique step set required");
  const logRoot = realpathSync(join(root, "artifacts/gate/logs"));
  for (const spec of specs) {
    const step = report.steps.find(s => s.name === spec.name);
    if (!step || step.kind !== spec.kind || step.blocking !== spec.blocking ||
        step.command !== spec.command.join(" ") || step.cwd !== resolve(root, spec.cwd ?? "") ||
        (step.exitCode !== null && !Number.isInteger(step.exitCode)) || step.ok !== (step.exitCode === 0)) return fail(`step contract ${spec.name}`);
    if (!step.logFile || !step.logSha256) return fail(`missing log ${spec.name}`);
    const logPath = realpathSync(step.logFile);
    const rel = relative(logRoot, logPath);
    if (!rel || rel.startsWith("..") || isAbsolute(rel)) fail(`log outside evidence directory ${spec.name}`);
    const log = readFileSync(logPath, "utf8");
    if (sha256(log) !== step.logSha256) fail(`log digest ${spec.name}`);
    const header = `# ${step.command}\n# cwd: ${step.cwd}\n# exit: ${step.exitCode}  (${step.durationMs} ms)\n\n`;
    if (!log.startsWith(header)) fail(`log header ${spec.name}`);
    const counters = extractCounters(log.slice(header.length), spec.counters);
    if (JSON.stringify(counters) !== JSON.stringify(step.counters)) fail(`counters ${spec.name}`);
    if (spec.kind === "test") {
      const keys = ["tests", "pass", "fail", "skipped", "cancelled", "todo"];
      if (keys.some(k => !Number.isSafeInteger(counters[k]) || counters[k] < 0) || counters.tests <= 0 ||
          counters.tests !== counters.pass + counters.fail + counters.skipped + counters.cancelled + counters.todo ||
          (step.ok && (counters.fail !== 0 || counters.cancelled !== 0))) fail("no complete executed test counters");
    }
  }
  const failed = report.steps.filter(s => !s.ok && s.blocking).map(s => s.name);
  const advisory = report.steps.filter(s => !s.ok && !s.blocking).map(s => s.name);
  if (report.ok !== (failed.length === 0) || JSON.stringify(failed) !== JSON.stringify(report.failed) ||
      JSON.stringify(advisory) !== JSON.stringify(report.advisory)) fail("verdict mismatch");
  return report;
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
