import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runTenantBackup, runTenantRestore } from "../apps/server/src/backup-tenant.ts";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "trans04-backup-"));
  const tenant = join(root, "tenants", "fixture");
  await mkdir(join(tenant, "files"), { recursive: true });
  await writeFile(join(tenant, "files", "a.txt"), "original");
  const backup = await runTenantBackup({ dataDir: root, tenantId: "fixture" });
  const stamp = backup.outDir.split("/").at(-1)!;
  return {
    root,
    tenant,
    backup,
    stamp,
    restore: () => runTenantRestore({ dataDir: root, tenantId: "fixture", backupStamp: stamp }),
  };
}

test("verified tenant restore replaces roots, including roots absent from the snapshot", async () => {
  const f = await fixture();
  try {
    await writeFile(join(f.tenant, "files", "a.txt"), "changed");
    await mkdir(join(f.tenant, "browser-profiles"));
    await writeFile(join(f.tenant, "browser-profiles", "extra"), "post-backup");
    await f.restore();
    assert.equal(await readFile(join(f.tenant, "files", "a.txt"), "utf8"), "original");
    await assert.rejects(readFile(join(f.tenant, "browser-profiles", "extra")), { code: "ENOENT" });
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});

test("modified backup content and wrong tenant fail before changing live files", async () => {
  const f = await fixture();
  try {
    await writeFile(join(f.backup.outDir, "files", "a.txt"), "tampered");
    await assert.rejects(f.restore(), /integrity/);
    assert.equal(await readFile(join(f.tenant, "files", "a.txt"), "utf8"), "original");
    const path = join(f.backup.outDir, "manifest.json");
    const manifest = JSON.parse(await readFile(path, "utf8"));
    manifest.tenantId = "other";
    await writeFile(path, JSON.stringify(manifest));
    await assert.rejects(f.restore(), /mismatched/);
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});

test("tenant traversal and symlink content are rejected", async () => {
  const f = await fixture();
  try {
    await assert.rejects(runTenantBackup({ dataDir: f.root, tenantId: "../fixture" }), /path segment/);
    await assert.rejects(
      runTenantRestore({ dataDir: f.root, tenantId: "fixture", backupStamp: "../outside" }),
      /path segment/,
    );
    await symlink(join(f.tenant, "files", "a.txt"), join(f.tenant, "files", "link"));
    await assert.rejects(runTenantBackup({ dataDir: f.root, tenantId: "fixture" }), /Symlink/);
  } finally {
    await rm(f.root, { recursive: true, force: true });
  }
});
