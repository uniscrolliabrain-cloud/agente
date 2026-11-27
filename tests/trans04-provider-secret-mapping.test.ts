import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { CONNECTIONS } from "../scripts/lib/connections.ts";
function merge(doppler: unknown, bindings: Record<string, string> = {}) {
  return spawnSync("python3", ["scripts/merge-runtime-secrets.py"], {
    input: JSON.stringify(doppler),
    encoding: "utf8",
    env: { PATH: process.env.PATH, ...bindings },
    timeout: 10000,
  });
}
const context = (values: Record<string, string>) => ({
  read: (...names: string[]) => names.map((name) => values[name]).find(Boolean),
});

test("named GitHub settings override only nonempty application bindings and keep the two OpenRouter accounts distinct", () => {
  const result = merge(
    {
      DATABASE_URL: "existing-dsn",
      TOKEN_ENCRYPTION_KEY: "existing-cipher",
      MUSE_API_KEY: "doppler-muse",
      OPENROUTER_API_KEY: "doppler-jev",
      OPEN_ROUTER_API_KEY: "doppler-slow",
    },
    {
      RUNTIME_GH_OPENROUTER_API_KEY: "github-jev",
      RUNTIME_GH_OPEN_ROUTER_API_KEY: "github-slow",
      RUNTIME_GH_SUPABASE_SECRET: "github-service-key",
      RUNTIME_GH_SENTRY_DSN: "",
      GITHUB_TOKEN: "never-runtime",
      SENTRY_AUTH_TOKEN: "ci-only",
    },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.deepEqual(JSON.parse(result.stdout), {
    DATABASE_URL: "existing-dsn",
    TOKEN_ENCRYPTION_KEY: "existing-cipher",
    MUSE_API_KEY: "doppler-muse",
    OPENROUTER_API_KEY: "github-jev",
    OPEN_ROUTER_API_KEY: "github-slow",
    SUPABASE_SECRET_KEY: "github-service-key",
  });
  assert.ok(!result.stdout.includes("never-runtime"));
  assert.ok(!result.stdout.includes("ci-only"));
  assert.equal(
    merge({ OPENROUTER_API_KEY: "existing" }, { RUNTIME_GH_OPENROUTER_API_KEY: "   " }).stdout,
    '{"OPENROUTER_API_KEY": "existing"}',
  );
});

test("invalid runtime secret input fails without leaking the received data", () => {
  const result = merge({ private_canary: { nested: "must-not-log" } });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.ok(!result.stderr.includes("must-not-log"));
  assert.ok(!result.stderr.includes("private_canary"));
});

test("deploy workflow names GitHub secrets explicitly, preserves legal gate and keeps admin Sentry tokens out of runtime import", () => {
  const source = readFileSync(".github/workflows/deploy.yml", "utf8");
  for (const name of [
    "OPENROUTER_API_KEY",
    "OPEN_ROUTER_API_KEY",
    "SUPABASE_SECRET",
    "GRAFANA_SERVICE_ACCOUNT_TOKEN",
    "GRAFANA_CLOUD_TOKEN",
    "SENTRY_DSN",
  ])
    assert.equal(source.split(`secrets.${name} }}`).length - 1, 2, name);
  assert.match(source, /check-legal-site\.mjs --release/);
  assert.equal(source.split("python3 scripts/merge-runtime-secrets.py").length - 1, 2);
  assert.match(source, /type: choice\s+options: \[preview, production\]/);
  assert.equal(source.split('IN("SENTRY_AUTH_TOKEN", "SENTRY_CLIENT_SECRET", "SENTRY_API_TOKEN")').length - 1, 2);
});

test("OpenRouter account probes choose their own keys and do not echo provider errors", async () => {
  const original = globalThis.fetch,
    seen: string[] = [];
  try {
    globalThis.fetch = async (_url, options) => {
      seen.push(new Headers(options?.headers).get("authorization")!);
      return Response.json({ error: "private-provider-canary" }, { status: 401 });
    };
    const values = context({ OPENROUTER_API_KEY: "jev", OPEN_ROUTER_API_KEY: "slow" });
    const results = await Promise.all(
      ["openrouter", "openrouter-slow"].map((id) => CONNECTIONS.find((spec) => spec.id === id)!.probe!(values)),
    );
    assert.deepEqual(seen, ["Bearer jev", "Bearer slow"]);
    assert.ok(results.every((result) => !result.ok && !result.detail.includes("private-provider-canary")));
  } finally {
    globalThis.fetch = original;
  }
});

test("Grafana verifies service account authentication and does not substitute its Cloud token", async () => {
  const spec = CONNECTIONS.find((spec) => spec.id === "grafana")!,
    original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(String(url), "https://grafana.invalid.example/api/org");
      assert.equal(new Headers(options?.headers).get("authorization"), "Bearer service-only");
      return Response.json({ id: 1 });
    };
    assert.equal(
      (
        await spec.probe!(
          context({ GRAFANA_URL: "https://grafana.invalid.example", GRAFANA_CLOUD_TOKEN: "cloud-only" }),
        )
      ).ok,
      false,
    );
    assert.equal(calls, 0);
    assert.equal(
      (
        await spec.probe!(
          context({ GRAFANA_URL: "https://grafana.invalid.example", GRAFANA_SERVICE_ACCOUNT_TOKEN: "service-only" }),
        )
      ).ok,
      true,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("Sentry DSN validation remains explicit about ingestion not being verified", async () => {
  const probe = CONNECTIONS.find((spec) => spec.id === "sentry")!.probe!;
  const valid = await probe(context({ SENTRY_DSN: "https://public-key@synthetic.invalid/123" }));
  assert.equal(valid.ok, true);
  assert.match(valid.detail, /no acredita SDK/);
  const invalid = await probe(context({ SENTRY_DSN: "private-invalid-canary" }));
  assert.equal(invalid.ok, false);
  assert.ok(!invalid.detail.includes("private-invalid-canary"));
});

function importRun(name: string): string {
  const lines = readFileSync(".github/workflows/deploy.yml", "utf8").split("\n");
  const start = lines.findIndex((line) => line === `      - name: ${name}`);
  assert.ok(start >= 0);
  const run = lines.findIndex((line, index) => index > start && line === "        run: |");
  assert.ok(run > start);
  const out: string[] = [];
  for (const line of lines.slice(run + 1)) {
    if (line.trim() && !line.startsWith("          ")) break;
    out.push(line.slice(10));
  }
  return out.join("\n");
}

test("both actual workflow import scripts stage only synthetic credentials with correct GitHub precedence", () => {
  const directory = mkdtempSync(join(tmpdir(), "provider-workflow-"));
  try {
    const bin = join(directory, "bin");
    mkdirSync(bin);
    writeFileSync(join(bin, "doppler"), '#!/bin/sh\ncat "$DOPPLER_FIXTURE"\n', { mode: 0o700 });
    writeFileSync(
      join(bin, "flyctl"),
      '#!/bin/sh\n[ "$1" = secrets ] && [ "$2" = import ] && [ "$5" = --stage ] || exit 9\ncat > "$CAPTURE"\n',
      { mode: 0o700 },
    );
    const fixture = join(directory, "doppler.json"),
      capture = join(directory, "staged.env");
    writeFileSync(
      fixture,
      JSON.stringify({
        DATABASE_URL: "preserved-dsn",
        TOKEN_ENCRYPTION_KEY: "preserved-cipher",
        MUSE_API_KEY: "doppler-muse",
        OPENROUTER_API_KEY: "doppler-jev",
        OPEN_ROUTER_API_KEY: "doppler-slow",
        FLY_API_TOKEN: "infra-not-runtime",
        SENTRY_AUTH_TOKEN: "ci-not-runtime",
      }),
    );
    for (const name of ["importar secretos en la api", "importar secretos en el worker"]) {
      const result = spawnSync("bash", ["-c", importRun(name)], {
        encoding: "utf8",
        timeout: 10000,
        env: {
          PATH: `${bin}:${process.env.PATH}`,
          DEPLOY_ENVIRONMENT: "preview",
          APP: "synthetic-api",
          WORKER: "synthetic-worker",
          DOPPLER_CONFIG: "synthetic",
          DOPPLER_FIXTURE: fixture,
          CAPTURE: capture,
          RUNTIME_GH_OPENROUTER_API_KEY: "github-jev",
          RUNTIME_GH_OPEN_ROUTER_API_KEY: "github-slow",
          RUNTIME_GH_SUPABASE_SECRET: "github-service",
        },
      });
      assert.equal(result.status, 0, result.stderr);
      const staged = Object.fromEntries(
        readFileSync(capture, "utf8")
          .trim()
          .split("\n")
          .map((line) => {
            const equal = line.indexOf("=");
            return [line.slice(0, equal), line.slice(equal + 1)];
          }),
      );
      assert.deepEqual(staged, {
        DATABASE_URL: "preserved-dsn",
        TOKEN_ENCRYPTION_KEY: "preserved-cipher",
        MUSE_API_KEY: "doppler-muse",
        OPENROUTER_API_KEY: "github-jev",
        OPEN_ROUTER_API_KEY: "github-slow",
        SUPABASE_SECRET_KEY: "github-service",
      });
      assert.equal(result.stdout, "");
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
