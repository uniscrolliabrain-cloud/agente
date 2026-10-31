import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, beforeEach, test } from "node:test";
import { Hono } from "hono";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { AppError } from "../apps/server/src/errors.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { whatsappBindings } from "../apps/server/src/engine/whatsapp-inbound.ts";
import { whatsappRoutes, type WhatsAppDraft } from "../apps/server/src/whatsapp-routes.ts";
import type { AgentService } from "../apps/server/src/engine/service.ts";

// WHATSAPP_OUTBOUND_CHANNEL_TEST_V1: el defecto que se prueba aqui es que el panel
// respondia con un unico cliente global. Con dos empresas, el borrador de B
// salia por el numero de A y no habia nada que lo impidiera.

const envKeys = [
  "WHATSAPP_WEBHOOK_BINDINGS",
  "WHATSAPP_API_KEY",
  "WHATSAPP_BASE_URL",
  "WHATSAPP_A_KEY",
  "WHATSAPP_B_KEY",
  "WHATSAPP_C1_KEY",
  "WHATSAPP_C2_KEY",
  "WHATSAPP_INBOUND_A",
];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

let db: Store;
let directory: string;
let requests: { url: string; apiKey: string | null }[] = [];

const owners = {
  a: `owner-a-${randomUUID()}`,
  b: `owner-b-${randomUUID()}`,
  c: `owner-c-${randomUUID()}`,
  meta: `owner-meta-${randomUUID()}`,
  none: `owner-none-${randomUUID()}`,
};

function bindings() {
  return [
    { provider: "evolution", accountId: "inst-a", tenantId: "tenant-a", owner: owners.a, sopId: "reply", secretEnv: "WHATSAPP_INBOUND_A", apiKeyEnv: "WHATSAPP_A_KEY" },
    { provider: "evolution", accountId: "inst-b", tenantId: "tenant-b", owner: owners.b, sopId: "reply", secretEnv: "WHATSAPP_INBOUND_A", apiKeyEnv: "WHATSAPP_B_KEY" },
    { provider: "evolution", accountId: "inst-c1", tenantId: "tenant-c", owner: owners.c, sopId: "reply", secretEnv: "WHATSAPP_INBOUND_A", apiKeyEnv: "WHATSAPP_C1_KEY" },
    { provider: "evolution", accountId: "inst-c2", tenantId: "tenant-c", owner: owners.c, sopId: "reply", secretEnv: "WHATSAPP_INBOUND_A", apiKeyEnv: "WHATSAPP_C2_KEY" },
    { provider: "meta", accountId: "111", tenantId: "tenant-meta", owner: owners.meta, sopId: "reply" },
  ];
}

function client() {
  const service = {
    db,
    tenantService: { tenantIdFor: async () => "default" },
  } as unknown as AgentService;
  const app = new Hono<{ Variables: { owner: string } }>();
  // El panel monta este router detras del middleware que fija owner y tenant
  // (app.ts:651). Reproducimos ese contrato y no la resolucion interna.
  app.use("*", async (c, next) => {
    const owner = c.req.header("x-owner");
    if (!owner) throw new AppError("sin owner", 401);
    c.set("owner", owner);
    const tenantId = c.req.header("x-tenant");
    await runInTenantScope({ tenantId: tenantId ?? "default", actorId: owner }, () => next());
  });
  app.onError((error, c) =>
    c.json({ error: error.message }, error instanceof AppError ? error.status : 503),
  );
  app.route("/api/whatsapp", whatsappRoutes(service));
  return app;
}

async function draft(owner: string, record: Partial<WhatsAppDraft> = {}) {
  const value: WhatsAppDraft = { id: "draft-1", to: "34600111000", text: "Hola", status: "awaiting_review", ...record };
  await db.put(owner, "whatsapp-drafts", value);
  return value;
}

function send(owner: string, tenantId: string, id = "draft-1") {
  return client().request(`/api/whatsapp/drafts/${id}/send`, {
    method: "POST",
    headers: { "x-owner": owner, "x-tenant": tenantId },
  });
}

async function reload(owner: string) {
  return db.get<WhatsAppDraft>(owner, "whatsapp-drafts", "draft-1");
}

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "whatsapp-outbound-"));
  db = await createStore({ dataDir: join(directory, "db") });
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const headers = new Headers(init?.headers);
    requests.push({ url, apiKey: headers.get("apikey") });
    return new Response(JSON.stringify({ key: { id: `wamid-${requests.length}` } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
});

after(async () => {
  globalThis.fetch = originalFetch;
  await db?.close();
  if (directory) await rm(directory, { recursive: true, force: true });
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

beforeEach(() => {
  requests = [];
  process.env.WHATSAPP_WEBHOOK_BINDINGS = JSON.stringify(bindings());
  process.env.WHATSAPP_BASE_URL = "http://evolution.test";
  process.env.WHATSAPP_API_KEY = "global-key-del-proceso";
  process.env.WHATSAPP_A_KEY = "key-a";
  process.env.WHATSAPP_B_KEY = "key-b";
  process.env.WHATSAPP_C1_KEY = "key-c1";
  process.env.WHATSAPP_C2_KEY = "key-c2";
  process.env.WHATSAPP_INBOUND_A = "inbound-secret-al-menos-32-caracteres";
});

test("la respuesta de cada empresa sale por su propio canal y con su propia clave", async () => {
  await draft(owners.a);
  await draft(owners.b);
  assert.equal((await send(owners.a, "tenant-a")).status, 200);
  assert.equal((await send(owners.b, "tenant-b")).status, 200);
  assert.deepEqual(requests, [
    { url: "http://evolution.test/message/sendText/inst-a", apiKey: "key-a" },
    { url: "http://evolution.test/message/sendText/inst-b", apiKey: "key-b" },
  ]);
  assert.ok(!requests.some((request) => request.apiKey === "global-key-del-proceso"));
  const sent = await reload(owners.b);
  assert.equal(sent?.status, "sent");
  assert.equal(sent?.channelId, "inst-b");
  assert.equal(sent?.tenantId, "tenant-b");
  assert.equal(sent?.providerId, "wamid-2");
});

test("un canal de otra empresa se rechaza sin enviar y sin tocar el borrador", async () => {
  await draft(owners.a, { channelId: "inst-b" });
  assert.equal((await send(owners.a, "tenant-a")).status, 403);
  assert.equal(requests.length, 0);
  assert.equal((await reload(owners.a))?.status, "awaiting_review");
});

test("con varios canales se exige channelId; con el, se usa ese", async () => {
  await draft(owners.c);
  assert.equal((await send(owners.c, "tenant-c")).status, 409);
  assert.equal(requests.length, 0);
  assert.equal((await reload(owners.c))?.status, "awaiting_review");

  await draft(owners.c, { channelId: "inst-c2" });
  assert.equal((await send(owners.c, "tenant-c")).status, 200);
  assert.deepEqual(requests, [
    { url: "http://evolution.test/message/sendText/inst-c2", apiKey: "key-c2" },
  ]);
});

test("una empresa sin canal, un canal Meta y una clave ausente fallan en cerrado", async () => {
  await draft(owners.none);
  assert.equal((await send(owners.none, "tenant-sin-canal")).status, 503);

  await draft(owners.meta);
  assert.equal((await send(owners.meta, "tenant-meta")).status, 503);

  await draft(owners.a);
  delete process.env.WHATSAPP_A_KEY;
  const response = await send(owners.a, "tenant-a");
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /WHATSAPP_A_KEY/);

  assert.equal(requests.length, 0);
  assert.equal((await reload(owners.a))?.status, "awaiting_review");
});

test("un borrador de otro tenant no puede usar el canal de esta empresa", async () => {
  await draft(owners.b, { channelId: "inst-a" });
  assert.equal((await send(owners.b, "tenant-b")).status, 403);
  assert.equal(requests.length, 0);
});

test("el binding rechaza reutilizar el secreto de entrada como apikey de salida", () => {
  const [first] = bindings();
  for (const apiKeyEnv of ["WHATSAPP_APP_SECRET", "WHATSAPP_VERIFY_TOKEN", "WHATSAPP_INBOUND_A"]) {
    process.env.WHATSAPP_WEBHOOK_BINDINGS = JSON.stringify([{ ...first, apiKeyEnv }]);
    assert.throws(() => whatsappBindings(), AppError);
  }
  process.env.WHATSAPP_WEBHOOK_BINDINGS = JSON.stringify([first]);
  assert.equal(whatsappBindings()[0].apiKeyEnv, "WHATSAPP_A_KEY");
});
