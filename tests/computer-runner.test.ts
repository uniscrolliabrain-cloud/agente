import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runDocker } from "../apps/server/src/computer.ts";

// This test exercises `spawn("docker", ..., { shell: false })` with a fake `docker`
// binary on PATH. On Windows, spawn with shell:false only resolves `.exe` files and
// ignores `.cmd`/`.bat`/shebangs, so the fake binary cannot be located. The behaviour
// under test (literal argv, credential stripping, output cap, timeout) is
// platform-independent, so we rely on the Linux CI job for coverage.
const skipOnWindows =
  process.platform === "win32"
    ? "Node spawn with shell:false cannot execute .cmd shims on Windows; run on Linux CI"
    : false;

const scriptBody = [
  'const mode = process.argv[2];',
  'if (mode === "hang") setInterval(() => {}, 1000);',
  'else if (mode === "output") { process.stdout.write("x".repeat(500000)); process.stderr.write("y".repeat(500000)); }',
  'else if (mode === "fail") { process.stderr.write("failure"); process.exitCode = 17; }',
  'else process.stdout.write(JSON.stringify({ args: process.argv.slice(2), secret: process.env.OPENMUSE_TEST_SECRET }));',
].join("\n");

test(
  "Docker subprocess uses literal argv, strips provider credentials, caps output and bounds hangs",
  { skip: skipOnWindows },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "openmuse-docker-runner-"));
    const previousPath = process.env.PATH;
    const previousKey = process.env.OPENMUSE_TEST_SECRET;
    // POSIX only. A shebang script is directly executable there.
    await writeFile(join(directory, "docker"), `#!${process.execPath}\n${scriptBody}\n`, {
      mode: 0o700,
    });
    const sep = ":";
    process.env.PATH = previousPath ? `${directory}${sep}${previousPath}` : directory;
    process.env.OPENMUSE_TEST_SECRET = "must-not-reach-docker-process";
    try {
      const literal = "$(touch /must-not-run) ; echo $HOME";
      const args = await runDocker(["exec", literal], { timeoutMs: 3000 });
      assert.equal(args.exitCode, 0);
      assert.deepEqual(JSON.parse(args.stdout), { args: ["exec", literal] });
      const failed = await runDocker(["fail"], { timeoutMs: 3000 });
      assert.equal(failed.exitCode, 17);
      assert.equal(failed.stderr, "failure");
      const output = await runDocker(["output"], { timeoutMs: 3000, maxOutputBytes: 1000 });
      assert.equal(output.truncated, true);
      assert.equal(Buffer.byteLength(output.stdout) + Buffer.byteLength(output.stderr), 1000);
      const started = Date.now();
      assert.equal((await runDocker(["hang"], { timeoutMs: 100 })).timedOut, true);
      assert.ok(Date.now() - started < 1500);
      const controller = new AbortController();
      const interrupted = runDocker(["hang"], { timeoutMs: 3000, signal: controller.signal });
      controller.abort();
      assert.equal((await interrupted).interrupted, true);
    } finally {
      if (previousPath === undefined) delete process.env.PATH;
      else process.env.PATH = previousPath;
      if (previousKey === undefined) delete process.env.OPENMUSE_TEST_SECRET;
      else process.env.OPENMUSE_TEST_SECRET = previousKey;
      await rm(directory, { recursive: true, force: true });
    }
  },
);