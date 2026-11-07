// GATE_REPORT_TEST_V1 - tests del gate unico (campana VERDAD, fase V0).
//
// No ejecutan la suite ni los audits: prueban el contrato del gate con `spawn`
// inyectado. La corrida real del gate es `pnpm gate`.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

import { AUDIT_CHECKS } from "../../scripts/audits/registry.ts";
import {
  allSteps,
  auditSteps,
  extractCounters,
  parseOnly,
  renderSummary,
  runGate,
  tailLines,
  writeArtifacts,
  type GateReport,
  type StepResult,
} from "../../scripts/gate-report.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

/**
 * spawnSync de mentira. `exitByFile` se indexa por el fichero que aparece en el
 * argv (`layers.ts`, `tsc.js`, ...): el nombre del step no viaja en la linea de
 * comandos. Lo que no aparece sale 0.
 */
function fakeSpawn(exitByFile: Record<string, number>) {
  return ((cmd: string, args: string[]) => {
    // `git` siempre "no hay repo": el gate tiene que aguantarlo, y asi el test no
    // depende de si la maquina que lo corre esta dentro de un repositorio.
    if (cmd === "git") {
      return {
        status: 1,
        stdout: "",
        stderr: "fatal: not a git repository",
        error: undefined,
        pid: 1,
        output: [],
        signal: null,
      };
    }
    const joined = args.join(" ");
    const key = Object.keys(exitByFile).find((file) => joined.includes(file));
    const status = key ? exitByFile[key] : 0;
    return {
      status,
      stdout: status === 0 ? "# pass 3\n# fail 0\n" : `[fake] ${joined} falla\n`,
      stderr: "",
      error: undefined,
      pid: 1,
      output: [],
      signal: null,
    };
  }) as unknown as typeof import("node:child_process").spawnSync;
}

function syntheticStep(over: Partial<StepResult>): StepResult {
  return {
    name: "audit:x",
    kind: "audit",
    blocking: true,
    command: "node scripts/audits/x.ts",
    cwd: "/tmp",
    exitCode: 0,
    ok: true,
    durationMs: 1200,
    counters: {},
    tail: [],
    logFile: null,
    ...over,
  };
}

function syntheticReport(steps: StepResult[]): GateReport {
  const failed = steps.filter((s) => !s.ok && s.blocking).map((s) => s.name);
  return {
    gate: "GATE_SINGLE_ENTRYPOINT_V1",
    startedAt: "2026-10-27T00:00:00.000Z",
    finishedAt: "2026-10-27T00:01:00.000Z",
    durationMs: 60_000,
    git: { branch: "test", head: "0000000000000000000000000000000000000000", dirty: 0 },
    auditReportDir: "/tmp/artifacts/gate/audits",
    ok: failed.length === 0,
    failed,
    advisory: steps.filter((s) => !s.ok && !s.blocking).map((s) => s.name),
    steps,
  };
}

test("el resumen cabe en 30 lineas y nombra cada step", () => {
  const steps = [
    syntheticStep({ name: "typecheck", kind: "typecheck", counters: { errores: 0 } }),
    syntheticStep({ name: "test", kind: "test", counters: { tests: 439, pass: 427, fail: 0 } }),
    ...AUDIT_CHECKS.map((c) =>
      syntheticStep({
        name: `audit:${c.name}`,
        blocking: c.blocking,
        ok: c.name !== "contracts",
        exitCode: c.name === "contracts" ? 1 : 0,
        counters: { huerfanos: c.name === "contracts" ? 150 : 0 },
      }),
    ),
  ];
  const summary = renderSummary(syntheticReport(steps));
  const lines = summary.split("\n");
  assert.ok(lines.length <= 30, `el resumen tiene ${lines.length} lineas, el limite es 30`);
  for (const step of steps) {
    assert.ok(summary.includes(step.name), `el resumen no menciona ${step.name}`);
  }
  assert.ok(summary.includes("GATE FALLA"), "un step bloqueante en rojo debe hacer fallar el gate");
  assert.ok(summary.includes("huerfanos=150"), "los contadores del audit deben salir en el resumen");
});

test("un step advisory en rojo no tumba el gate pero se publica", () => {
  const report = syntheticReport([
    syntheticStep({ name: "audit:console", blocking: false, ok: false, exitCode: 0 }),
  ]);
  assert.equal(report.ok, true, "advisory no bloquea");
  assert.deepEqual(report.advisory, ["audit:console"]);
  const summary = renderSummary(report);
  assert.ok(summary.includes("WARN audit:console"), "debe verse el WARN, no un OK");
  assert.ok(summary.includes("advisory"), "el resumen debe decir que es advisory");
  assert.ok(summary.includes("GATE OK"), "sin rojos bloqueantes el veredicto es OK");
});

test("extractCounters no inventa numeros cuando el patron no casa", () => {
  const spec = { captures: { keys: ["huerfanos", "pending"], re: /HUERFANOS: (\d+)\s+PENDING: (\d+)/ } };
  assert.deepEqual(extractCounters("[audit:contracts] HUERFANOS: 150   PENDING: 14", spec), {
    huerfanos: 150,
    pending: 14,
  });
  // Salida limpia: sin la linea, no hay contador. Un 0 aqui seria una afirmacion
  // que nadie ha medido.
  assert.deepEqual(extractCounters("[audit:contracts] todo ok", spec), {});
});

test("extractCounters lee los pares del runner de tests", () => {
  const pairs = /#\s*(tests|pass|fail|skipped|cancelled|todo)\s+(\d+)/g;
  const counters = extractCounters("# tests 439\n# pass 427\n# fail 0\n# skipped 12\n", { pairs });
  assert.deepEqual(counters, { tests: 439, pass: 427, fail: 0, skipped: 12 });
});

test("tailLines devuelve las ultimas lineas no vacias", () => {
  assert.deepEqual(tailLines("a\n\nb\nc\n", 2), ["b", "c"]);
});

test("los siete audits del registro existen en disco", () => {
  // El import roto de audit:console mantuvo la auditoria muerta durante meses
  // (el runner decia OK porque no arrancaba). Este test ancla el registro al
  // arbol: si una entrada apunta a un fichero que no esta, el gate lo dice.
  assert.equal(AUDIT_CHECKS.length, 7);
  for (const check of AUDIT_CHECKS) {
    const file = join(ROOT, "scripts", "audits", check.file);
    assert.ok(existsSync(file), `falta ${check.file} (entrada "${check.name}" del registro)`);
  }
  const names = auditSteps().map((s) => s.name);
  assert.deepEqual(names, AUDIT_CHECKS.map((c) => `audit:${c.name}`));
});

test("allSteps cubre typecheck, worker, test y los siete audits", () => {
  const names = allSteps(ROOT).map((s) => s.name);
  assert.equal(names.length, 10);
  assert.ok(names.includes("typecheck"));
  assert.ok(names.includes("typecheck:worker"));
  assert.ok(names.includes("test"));
});

test("runGate separa rojo bloqueante de rojo advisory y escribe los artefactos", () => {
  const workspace = mkdtempSync(join(tmpdir(), "gate-test-"));
  const report = runGate({
    root: workspace,
    only: ["audit:layers", "audit:console"],
    spawn: fakeSpawn({ "layers.ts": 1 }),
  });

  assert.equal(report.ok, false, "layers es bloqueante y sale 1");
  assert.deepEqual(report.failed, ["audit:layers"]);
  assert.deepEqual(report.advisory, []);
  assert.equal(report.steps.length, 2);

  const { json, summary } = writeArtifacts(report, workspace);
  const parsed = JSON.parse(readFileSync(json, "utf8")) as GateReport;
  assert.equal(parsed.gate, "GATE_SINGLE_ENTRYPOINT_V1");
  assert.equal(parsed.ok, false);
  assert.ok(readFileSync(summary, "utf8").includes("GATE FALLA"));
  // Un root que no es un repo: el gate lo dice, no se cae.
  assert.ok(parsed.git.error !== undefined || parsed.git.head === null);
});

test("--only vacio o desconocido no es un gate que pasa: es un gate que no corrio", () => {
  assert.deepEqual(parseOnly(["--only=test,audit:layers"]), ["test", "audit:layers"]);
  assert.equal(parseOnly([]), undefined);
  assert.throws(() => parseOnly(["--only="]), /--only/);
  assert.throws(
    () => runGate({ root: ROOT, only: ["no-existe"], spawn: fakeSpawn({}) }),
    /no selecciona ningun step/,
  );
});
