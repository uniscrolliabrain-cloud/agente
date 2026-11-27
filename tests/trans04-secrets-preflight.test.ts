import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

function run(args: string[], input: Record<string, string> = {}) {
  const env = Object.fromEntries(
    ["PATH", "HOME", "TMPDIR", "LANG"].flatMap((name) => (process.env[name] ? [[name, process.env[name]!]] : [])),
  );
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/secrets-check.ts", ...args], {
    env: { ...env, ...input },
    encoding: "utf8",
    timeout: 15000,
  });
  assert.ifError(result.error);
  return { status: result.status, output: result.stdout + result.stderr };
}

test("preflight rejects misspelled modes, groups, profiles and options", () => {
  for (const args of [
    ["--mode=liv"],
    ["--only=unknown"],
    ["--only="],
    ["--profile=deply"],
    ["--strict=no"],
    ["--unknown"],
  ]) {
    assert.equal(run(args).status, 2, args.join(" "));
  }
});

test("informational preflight remains informational; strict coherence blocks configured partial channels", () => {
  const env = { RESEND_API_KEY: "synthetic-credential" };
  assert.equal(run(["--mode=sample", "--only=email"], env).status, 0);
  assert.equal(run(["--mode=sample", "--only=email", "--strict"], env).status, 1);
  assert.equal(run(["--mode=sample", "--only=leads", "--strict"], env).status, 0);
});

test("JSON and text reports never echo values, secret lengths or URL credentials", () => {
  const env = {
    MODEL: "private/model-canary",
    PUBLIC_API_URL: "bad-url-with-private-canary",
    FAST_LLM_API_KEY: "unique-canary-secret",
    AGENTE_ACCESS_KEY: "short-canary",
  };
  for (const args of [["--mode=live"], ["--mode=live", "--json"]]) {
    const report = run(args, env);
    assert.equal(report.status, 1);
    for (const value of Object.values(env)) assert.ok(!report.output.includes(value));
    assert.doesNotMatch(report.output, /^OK[^\n]*\d+ chars/m);
    if (args.includes("--json")) {
      const parsed = JSON.parse(report.output);
      assert.equal(parsed.ok, false);
      assert.ok(parsed.issues.length > 0);
    }
  }
});

test("campaign profiles require only their declared subset", () => {
  assert.equal(run(["--profile=leads", "--json"]).status, 0);
  const deploy = run(["--profile=deploy", "--json"]);
  assert.equal(deploy.status, 1);
  assert.ok(JSON.parse(deploy.output).missingRequired.includes("DATABASE_URL"));
});

test("strict lane validation respects real consumers and does not claim proposed integrations", () => {
  const args = ["--mode=sample", "--only=kernel", "--strict", "--json"];
  assert.equal(run(args, { FAST_LLM_API_KEY: "synthetic" }).status, 1);
  assert.equal(
    run(args, { FAST_LLM_API_KEY: "synthetic", FAST_LLM_PROVIDER: "google", FAST_LLM_MODEL: "fixture" }).status,
    0,
  );
  assert.equal(
    run(args, { FAST_LLM_API_KEY: "synthetic", FAST_LLM_PROVIDER: "unknown", FAST_LLM_MODEL: "fixture" }).status,
    1,
  );
});
