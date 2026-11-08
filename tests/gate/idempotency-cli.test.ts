import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("el CLI indexa marcas únicas y falla por una huérfana sin justificar", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "idem-cli-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const reportDir = join(root, "report");
  await mkdir(join(root, "scripts"));
  await writeFile(
    join(root, "scripts", "fixture.ts"),
    "// IMPLEMENTADA_V1\nexport const value = 1;\n// HUERFANA_V1\n",
  );

  const script = fileURLToPath(new URL("../../scripts/audits/idempotency.ts", import.meta.url));
  const result = spawnSync(process.execPath, ["--experimental-strip-types", script], {
    cwd: root,
    env: { ...process.env, AUDIT_REPORT_DIR: reportDir },
    encoding: "utf8",
  });
  assert.ifError(result.error);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /1 defecto/);

  const report = JSON.parse(await readFile(join(reportDir, "idempotency.json"), "utf8"));
  const file = join("scripts", "fixture.ts");
  assert.deepEqual(report.defects.orphans, [{ name: "HUERFANA_V1", file, line: 3 }]);
  assert.deepEqual(report.index.locations, {
    HUERFANA_V1: [{ file, line: 3 }],
    IMPLEMENTADA_V1: [{ file, line: 1 }],
  });
});
