import assert from "node:assert/strict";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, beforeEach, test } from "node:test";
import { Hono } from "hono";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { AppError } from "../apps/server/src/errors.ts";
import { currentTenantScope } from "../apps/server/src/tenant-scope.ts";
import { whatsappWebhookRoutes } from "../apps/server/src/whatsapp-routes.ts";
import { extractIncomingMessages, type InboundService } from "../apps/server/src/engine/whatsapp-inbound.ts";

const SECRET = "app-secret-for-meta-tests";
const EVO_SECRET = "instance-secret-at-least-32-characters";
const envKeys = ["WHATSAPP_APP_SECRET", "WHATSAPP_VERIFY_TOKEN", "WHATSAPP_WEBHOOK_BINDINGS", "WHATSAPP_TEST_INBOUND_SECRET"];
const originalEnv = Object.fromEntries(envKeys.map((k) => [k, process.env[k]]));
let db: Store, directory: string;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "whatsapp-inbound-"));
  db = await createStore({ dataDir: join(directory, "db") });
});
after(async () => {
  await db?.close();
  if (directory) await rm(directory, { recursive: true, force: true });
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});
beforeEach(() => {
  process.env.WHATSAPP_APP_SECRET = SECRET;
  process.env.WHATSAPP_VERIFY_TOKEN = "verify-test";
  process.env.WHATSAPP_TEST_INBOUND_SECRET = EVO_SECRET;
});

function message(id = "msg-1", text = "Hola") { return { id, from: "34600111222", type: "text", text: { body: text } }; }
function meta(messages = [message()], phone = "111") {
  return { object: "whatsapp_business_account", entry: [{ changes: [{ value: { metadata: { phone_number_id: phone }, messages } }] }] };
}
function evolution(extra: Record<string, unknown> = {}) {
  return { event: "messages.upsert", instance: "agency-instance", data: { key: { id: "ev-1", remoteJid: "34600111222@s.whatsapp.net", fromMe: false }, message: { conversation: "Hola" } }, ...extra };
}

async function harness() {
  const ownerA = `a-${randomUUID()}`, ownerB = `b-${randomUUID()}`;
  const tenants = new Map([[ownerA, "tenant-a"], [ownerB, "tenant-b"]]);
  const buildScoped = () => new TenantScopedStore(db, async (owner) => currentTenantScope()?.tenantId ?? tenants.get(owner) ?? "default");
  let scoped = buildScoped();
  const sop = { id: "reply", name: "Review inbound", active: true, allowedTools: ["save_artifact"], steps: [{ id: "save", title: "Save", tool: "save_artifact", params: {} }] };
  for (const owner of [ownerA, ownerB]) await scoped.put(owner, "sops", sop);
  const bindings = [
    { provider: "meta", accountId: "111", tenantId: "tenant-a", owner: ownerA, sopId: "reply" },
    { provider: "meta", accountId: "222", tenantId: "tenant-b", owner: ownerB, sopId: "reply" },
    { provider: "evolution", accountId: "agency-instance", tenantId: "tenant-a", owner: ownerA, sopId: "reply", secretEnv: "WHATSAPP_TEST_INBOUND_SECRET" },
  ];
  process.env.WHATSAPP_WEBHOOK_BINDINGS = JSON.stringify(bindings);
  const failure = { beforeTask: false, afterTask: false, delay: false };
  const makeService = (): InboundService => ({
    db: scoped,
    tenantService: { tenantIdFor: async (owner: string) => tenants.get(owner) ?? "default" },
    createTask: async (owner: string, input: { input: unknown }, key: string) => {
      if (failure.beforeTask) { failure.beforeTask = false; throw new Error("crash before task"); }
      if (failure.delay) await new Promise((resolve) => setTimeout(resolve, 5));
      const id = createHash("sha256").update(`task:${key}`).digest("hex");
      const task = { id, tenantId: tenants.get(owner), input: input.input, status: "queued" };
      await scoped.insertIfAbsent(owner, "tasks", task);
      if (failure.afterTask) { failure.afterTask = false; throw new Error("crash after task"); }
      return scoped.get(owner, "tasks", id);
    },
  } as unknown as InboundService);
  const buildApp = () => {
    const app = new Hono();
    app.onError((error, c) => c.json({ error: error.message }, error instanceof AppError ? error.status : error instanceof SyntaxError ? 400 : 503));
    app.route("/api/whatsapp", whatsappWebhookRoutes(makeService()));
    return app;
  };
  let app = buildApp();
  const post = (body: unknown = meta(), headers?: Record<string, string>, route = "webhook") => {
    const raw = typeof body === "string" ? body : JSON.stringify(body);
    return app.request(`/api/whatsapp/${route}`, { method: "POST", body: raw, headers: {
      "Content-Type": "application/json",
      ...(headers ?? { "x-hub-signature-256": `sha256=${createHmac("sha256", SECRET).update(raw).digest("hex")}` }),
    } });
  };
  return { post, get: (url: string) => app.request(url), ownerA, ownerB, bindings, tenants, scoped, failure,
    restart: () => { app = buildApp(); },
    restartStore: async () => { await db.close(); db = await createStore({ dataDir: join(directory, "db") }); scoped = buildScoped(); app = buildApp(); },
    tasks: (owner = ownerA) => scoped.list<{ id: string; tenantId: string; input: Record<string, unknown> }>(owner, "tasks"),
    inbox: (owner = ownerA) => scoped.list<{ id: string; status: string; taskId?: string }>(owner, "whatsapp-inbox"),
  };
}

test("Meta requires a real raw-body signature and fails closed without its secret", async () => {
  const h = await harness();
  assert.equal((await h.post(meta(), {})).status, 401);
  assert.equal((await h.post(meta(), { "x-hub-signature-256": "sha256=" + "0".repeat(64) })).status, 401);
  assert.equal((await h.post(meta(), { "x-hub-signature-256": createHmac("sha256", SECRET).update(JSON.stringify(meta())).digest("base64") })).status, 401);
  delete process.env.WHATSAPP_APP_SECRET;
  assert.equal((await h.post()).status, 503);
  assert.equal((await h.tasks()).length, 0);
});
test("Meta handshake checks its own verify token", async () => {
  const h = await harness();
  const response = await h.get("/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-test&hub.challenge=123");
  assert.equal(response.status, 200); assert.equal(await response.text(), "123");
  assert.equal((await h.get("/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=bad")).status, 403);
});
test("a repeated message keeps one task and one durable inbox row", async () => {
  const h = await harness();
  const first = await (await h.post()).json();
  const replay = await (await h.post()).json();
  assert.equal(first.status, "queued"); assert.equal(replay.taskId, first.taskId);
  assert.equal((await h.tasks()).length, 1); assert.equal((await h.inbox()).length, 1);
});
test("concurrent redelivery has a single persisted task", async () => {
  const h = await harness(); h.failure.delay = true;
  const responses = await Promise.all(Array.from({ length: 6 }, () => h.post()));
  assert.ok(responses.every((r) => r.status === 200));
  const ids = await Promise.all(responses.map(async (r) => (await r.json()).taskId));
  assert.equal(new Set(ids).size, 1); assert.equal((await h.tasks()).length, 1);
});
test("a fresh router/service instance deduplicates from Store, not a process cache", async () => {
  const h = await harness(); const first = await (await h.post()).json(); h.restart();
  assert.equal((await (await h.post()).json()).taskId, first.taskId); assert.equal((await h.tasks()).length, 1);
});
test("closing and reopening the on-disk Store retains the inbox and operation identity", async () => {
  const h = await harness(); const first = await (await h.post()).json();
  await h.restartStore();
  assert.equal((await (await h.post()).json()).taskId, first.taskId);
  assert.equal((await h.tasks()).length, 1); assert.equal((await h.inbox()).length, 1);
});
test("a redelivery cannot replace the first persisted content", async () => {
  const h = await harness(); await h.post(meta([message("same", "Original")]));
  await h.post(meta([message("same", "Changed")]));
  assert.equal((await h.tasks())[0].input.text, "Original");
});
for (const point of ["beforeTask", "afterTask"] as const) {
  test(`redelivery recovers a crash ${point} without duplicating the operation`, async () => {
    const h = await harness(); h.failure[point] = true;
    assert.equal((await h.post()).status, 503);
    assert.equal((await h.inbox())[0].status, "received");
    h.restart(); assert.equal((await h.post()).status, 200);
    assert.equal((await h.tasks()).length, 1); assert.equal((await h.inbox())[0].status, "queued");
  });
}
test("every text message in multiple changes and entries is queued", async () => {
  const h = await harness();
  const body = { entry: [...meta([message("1"), message("2")]).entry, ...meta([message("3")]).entry] };
  const response = await h.post(body); assert.equal(response.status, 200);
  assert.equal((await response.json()).taskIds.length, 3); assert.equal((await h.tasks()).length, 3);
});
test("receiver identity separates equal sender and message ids in different tenants", async () => {
  const h = await harness();
  await h.post(meta()); await h.post(meta([message()], "222"));
  const [a] = await h.tasks(), [b] = await h.tasks(h.ownerB);
  assert.equal(a.tenantId, "tenant-a"); assert.equal(b.tenantId, "tenant-b"); assert.notEqual(a.id, b.id);
  assert.equal((await db.list("system", "tasks")).length, 0);
});
test("an unknown receiver or a bad message makes the full batch fail before writes", async () => {
  const h = await harness();
  const body = { entry: [...meta().entry, ...meta([message("bad")], "unknown").entry] };
  assert.equal((await h.post(body)).status, 403);
  assert.equal((await h.post(meta([{ ...message(), id: "" }]))).status, 422);
  assert.equal((await h.tasks()).length, 0); assert.equal((await h.inbox()).length, 0);
});
test("primary owner mismatch, missing SOP and inactive SOP cannot enqueue", async () => {
  const h = await harness(); h.tenants.set(h.ownerA, "wrong-tenant");
  assert.equal((await h.post()).status, 503); h.tenants.set(h.ownerA, "tenant-a");
  await h.scoped.remove(h.ownerA, "sops", "reply"); assert.equal((await h.post()).status, 503);
  await h.scoped.put(h.ownerA, "sops", { id: "reply", active: false }); assert.equal((await h.post()).status, 503);
  assert.equal((await h.tasks()).length, 0);
});
test("malformed or ambiguous bindings fail closed", async () => {
  const h = await harness();
  for (const config of ["[", "[]", JSON.stringify([...h.bindings, h.bindings[0]]), JSON.stringify([{ ...h.bindings[0], owner: "system" }]), JSON.stringify([h.bindings[0], { ...h.bindings[1], owner: h.ownerA }])]) {
    process.env.WHATSAPP_WEBHOOK_BINDINGS = config; assert.equal((await h.post()).status, 503);
  }
  assert.equal((await h.tasks()).length, 0);
});
test("status/media deliveries do not fabricate tasks; malformed signed JSON is rejected", async () => {
  const h = await harness();
  const response = await h.post({ entry: [{ changes: [{ value: { statuses: [{ id: "s", status: "read" }] } }] }] });
  assert.equal(response.status, 200); assert.equal((await response.json()).ignored, true);
  assert.equal((await h.post(meta([{ ...message(), type: "image" }]))).status, 200);
  assert.equal((await h.post("{")).status, 400); assert.equal((await h.tasks()).length, 0);
});
test("Evolution requires its dedicated custom header and keeps provider secrets out of inbox", async () => {
  const h = await harness(); const body = evolution({ apikey: "must-not-be-persisted" });
  assert.equal((await h.post(body, {}, "incoming")).status, 401);
  assert.equal((await h.post(body, { "x-webhook-secret": "verify-test" }, "incoming")).status, 401);
  assert.equal((await h.post(body, { "x-webhook-secret": EVO_SECRET }, "incoming")).status, 200);
  assert.equal((await h.tasks()).length, 1);
  const inbox = JSON.stringify(await h.inbox());
  assert.ok(!inbox.includes("must-not-be-persisted") && !inbox.includes(EVO_SECRET));
});
test("Evolution ignores outgoing/self and unrelated events", async () => {
  const h = await harness(); const body = evolution();
  body.data.key.fromMe = true;
  for (const payload of [body, evolution({ event: "send.message" })]) {
    const response = await h.post(payload, { "x-webhook-secret": EVO_SECRET }, "incoming");
    assert.equal(response.status, 200); assert.equal((await response.json()).ignored, true);
  }
  assert.equal((await h.tasks()).length, 0);
});
test("Evolution refuses an unknown instance and an absent/weak instance secret", async () => {
  const h = await harness();
  assert.equal((await h.post(evolution({ instance: "unknown" }), { "x-webhook-secret": EVO_SECRET }, "incoming")).status, 403);
  delete process.env.WHATSAPP_TEST_INBOUND_SECRET;
  assert.equal((await h.post(evolution(), {}, "incoming")).status, 503);
});
test("parser never invents a provider id and preserves all extended text messages", () => {
  assert.throws(() => extractIncomingMessages(meta([{ ...message(), id: "" }]), "meta"), /message id/);
  const body = evolution();
  assert.equal(extractIncomingMessages(body, "evolution").length, 1);
  assert.equal(extractIncomingMessages({ ...body, data: [body.data, { ...body.data, key: { ...body.data.key, id: "ev-2" }, message: { extendedTextMessage: { text: "Segundo" } } }] }, "evolution").length, 2);
});
