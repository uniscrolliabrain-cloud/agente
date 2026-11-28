import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { Store } from "../apps/server/src/db.ts";
import { planProvision, readInstallation } from "../scripts/provision-vertical-slice.ts";

const bundle = JSON.parse(
  readFileSync(new URL("../clientes/_template/vertical-slice.example.json", import.meta.url), "utf8"),
);

test("installation read distinguishes a missing record from a storage failure", async () => {
  const unavailable = {
    get: async () => {
      throw Error("synthetic-storage-unavailable");
    },
  } as unknown as Store;
  await assert.rejects(readInstallation(unavailable, "synthetic-key"), /storage-unavailable/);
  const absent = { get: async () => null } as unknown as Store;
  assert.equal(await readInstallation(absent, "synthetic-key"), null);
});

test("plan fails on either registry or name-claim read failure without writes", async () => {
  for (const failAt of ["get", "list"]) {
    let writes = 0;
    const unavailable = {
      get: async () => {
        if (failAt === "get") throw Error("synthetic-read-unavailable");
        return null;
      },
      list: async () => {
        throw Error("synthetic-read-unavailable");
      },
      put: async () => {
        writes++;
      },
    } as unknown as Store;
    await assert.rejects(planProvision(unavailable, bundle), /read-unavailable/);
    assert.equal(writes, 0);
  }
});
