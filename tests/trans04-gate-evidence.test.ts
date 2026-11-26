import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runGate, validateExecutedGate } from "../scripts/gate-report.ts";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "trans04-evidence-"));
  const git = (...args: string[]) => {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  };
  git("init", "-q");
  writeFileSync(join(root, ".gitignore"), "artifacts/\n");
  writeFileSync(join(root, "pnpm-lock.yaml"), "synthetic-lock-fixture\n");
  git("add", ".");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-qm", "fixture");
  const spawn = ((cmd: string, args: string[], options: object) => {
    if (cmd === "git") return spawnSync(cmd, args, options);
    return { status: 0, stdout: "# tests 2\n# pass 2\n# fail 0\n# skipped 0\n# cancelled 0\n# todo 0\n", stderr: "" };
  }) as typeof spawnSync;
  return { root, report: runGate({ root, spawn }), spawn };
}

test("full synthetic execution evidence validates; a test-only report cannot certify", () => {
  const { root, report, spawn } = fixture();
  assert.equal(validateExecutedGate(report, root).ok, true);
  assert.throws(() => validateExecutedGate(runGate({ root, spawn, only: ["test"] }), root), /full unique/);
  assert.throws(() => runGate({ root, spawn, only: [] }), /no selecciona/);
});

test("evidence rejects duplicate steps, stale commits and altered logs", () => {
  const { root, report } = fixture();
  const duplicate = structuredClone(report);
  duplicate.steps[0] = duplicate.steps[1];
  assert.throws(() => validateExecutedGate(duplicate, root), /full unique/);
  const stale = structuredClone(report);
  stale.git.head = "a".repeat(40);
  assert.throws(() => validateExecutedGate(stale, root), /stale/);
  const file = report.steps[0].logFile!;
  writeFileSync(file, readFileSync(file, "utf8") + "tampered\n");
  assert.throws(() => validateExecutedGate(report, root), /digest/);
});

test("untracked source and changed lockfile invalidate prior evidence", () => {
  const { root, report } = fixture();
  writeFileSync(join(root, "untracked.ts"), "export {};\n");
  assert.throws(() => validateExecutedGate(report, root), /dirty/);
});

test("zero-test output and invented verdict are rejected", () => {
  const { root, report } = fixture();
  const forged = structuredClone(report);
  forged.ok = false;
  assert.throws(() => validateExecutedGate(forged, root), /verdict/);
  const emptySpawn = ((cmd: string, args: string[], options: object) =>
    cmd === "git"
      ? spawnSync(cmd, args, options)
      : {
          status: 0,
          stdout: "# tests 0\n# pass 0\n# fail 0\n# skipped 0\n# cancelled 0\n# todo 0\n",
          stderr: "",
        }) as typeof spawnSync;
  assert.throws(() => validateExecutedGate(runGate({ root, spawn: emptySpawn }), root), /test counters/);
});
