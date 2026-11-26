import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { GoogleAuth } from "../apps/server/src/google-auth.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { encryptSecret, decryptSecret } from "../packages/integrations/src/vault.ts";
import { testConfig } from "./helpers/config.ts";

const tokens = {
  connectionId: "connection",
  account: "alice@example.test",
  accessToken: "synthetic-access",
  refreshToken: "synthetic-refresh",
  expiresAt: 0,
  scopes: ["read", "send"],
};

test("a fresh attributed token revalidates both authorizer and caller", async () => {
  const db = await createStore();
  const config = testConfig({ encryptionKey: randomBytes(32).toString("base64") });
  try {
    await db.put("owner", "credentials", {
      id: "google",
      connectionId: tokens.connectionId,
      secret: encryptSecret(
        JSON.stringify({ ...tokens, expiresAt: Date.now() + 3600000, tenantId: "A", authorizer: "authorizer" }),
        config.encryptionKey!,
      ),
    });
    const members = new Set(["authorizer", "caller"]);
    const auth = new GoogleAuth(db, config, db, {
      membership: async (actor, tenant) => tenant === "A" && members.has(actor),
    });
    const read = () => runInTenantScope({ tenantId: "A", actorId: "caller" }, () => auth.accessToken("owner"));
    assert.equal(await read(), tokens.accessToken);
    members.delete("authorizer");
    await assert.rejects(read, { status: 403 });
    members.add("authorizer");
    members.delete("caller");
    await assert.rejects(read, { status: 403 });
    await assert.rejects(() => auth.accessToken("owner"), { status: 403 });
    await assert.rejects(
      () =>
        runInTenantScope({ tenantId: "A", actorId: "caller" }, () => new GoogleAuth(db, config).accessToken("owner")),
      { status: 403 },
    );
  } finally {
    await db.close();
  }
});

test("refresh preserves the rotated refresh token and narrows the recorded grant", async (t) => {
  const db = await createStore();
  const config = testConfig({ encryptionKey: randomBytes(32).toString("base64") });
  try {
    await db.put("owner", "credentials", {
      id: "google",
      connectionId: tokens.connectionId,
      secret: encryptSecret(JSON.stringify(tokens), config.encryptionKey!),
    });
    t.mock.method(globalThis, "fetch", async () =>
      Response.json({ access_token: "renewed", refresh_token: "rotated", expires_in: 3600, scope: "read unexpected" }),
    );
    const auth = new GoogleAuth(db, config);
    assert.equal(await auth.accessToken("owner"), "renewed");
    const saved = await auth.tokens("owner");
    assert.equal(saved?.refreshToken, "rotated");
    assert.deepEqual(saved?.scopes, ["read"]);
  } finally {
    await db.close();
  }
});

test("two refreshers cannot overwrite a winning credential and ambiguous rotation requires reconnection", async (t) => {
  const db = await createStore();
  const config = testConfig({ encryptionKey: randomBytes(32).toString("base64") });
  try {
    await db.put("owner", "credentials", {
      id: "google",
      connectionId: tokens.connectionId,
      secret: encryptSecret(JSON.stringify(tokens), config.encryptionKey!),
    });
    let entered!: () => void,
      release!: () => void,
      calls = 0;
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });
    t.mock.method(globalThis, "fetch", async () => {
      const index = ++calls;
      if (calls === 2) entered();
      await waiting;
      return Response.json({ access_token: `access-${index}`, refresh_token: `refresh-${index}`, expires_in: 3600 });
    });
    const first = new GoogleAuth(db, config).accessToken("owner");
    const second = new GoogleAuth(db, config).accessToken("owner");
    await ready;
    release();
    const results = await Promise.allSettled([first, second]);
    assert.ok(results.some((result) => result.status === "rejected"));
    const credential = await db.get<{ secret: string; requiresReconnect: boolean }>("owner", "credentials", "google");
    assert.equal(credential?.requiresReconnect, true);
    const saved = JSON.parse(decryptSecret(credential!.secret, config.encryptionKey!));
    assert.ok(["access-1", "access-2"].includes(saved.accessToken));
    await assert.rejects(() => new GoogleAuth(db, config).accessToken("owner"), { status: 401 });
    assert.equal(calls, 2);
    t.mock.restoreAll();
    t.mock.method(globalThis, "fetch", async (input) =>
      String(input).includes("/token")
        ? Response.json({ access_token: "fresh-consent", refresh_token: "fresh-refresh", expires_in: 3600 })
        : Response.json({ emailAddress: "alice@example.test" }),
    );
    const reconnect = new GoogleAuth(db, {
      ...config,
      googleClientId: "synthetic",
      googleClientSecret: "synthetic",
    });
    const authorization = await reconnect.connect("owner", false);
    const state = new URL(authorization.url).searchParams.get("state")!;
    await reconnect.callback(state, "synthetic-code");
    assert.equal((await reconnect.tokens("owner"))?.refreshToken, "fresh-refresh");
    assert.equal(
      (await db.get<{ requiresReconnect: boolean }>("owner", "credentials", "google"))?.requiresReconnect,
      false,
    );
  } finally {
    await db.close();
  }
});
