// WHATSAPP_WEBHOOK_SECURITY_V1 — el webhook de Meta/Evolution no puede mandar un
// sesion de usuario. Meta usa HMAC y Evolution una cabecera dedicada por instancia.
// Ambas rutas se montan ANTES del middleware de auth de usuarios.
// Estos tests fijan las cuatro reglas:
//   1. sin WHATSAPP_APP_SECRET no se procesa nada (fail-closed, 503);
//   2. sin firma o con firma invalida -> 401 y ninguna tarea creada;
//   3. con autenticacion valida y binding/SOP provisionados -> 200 y una tarea;
//   4. los eventos que no son mensajes (statuses de Meta) se ignoran, no revientan.
// Ver: apps/server/src/whatsapp-routes.ts (WHATSAPP_WEBHOOK_HMAC_V2/V3).
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, beforeEach, test } from "node:test";
import { createApp } from "../apps/server/src/app.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { extractIncomingMessage } from "../apps/server/src/whatsapp-routes.ts";
import { testConfig } from "./helpers/config.ts";
import { sopSchema } from "../packages/domain/src/sop.ts";

const APP_SECRET = "test-app-secret-para-hmac";
let app: Awaited<ReturnType<typeof createApp>>["app"],
  agent: Awaited<ReturnType<typeof createApp>>["agent"],
  db: Store,
  directory: string,
  baselineTasks = 0;
const owner = "webhook-owner", tenant = "webhook-test";
const evolutionSecret = "dedicated-evolution-secret-at-least-32-chars";

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-whatsapp-"));
  db = await createStore();
  await db.put(owner, "tenant-membership", { id: "default", tenantId: tenant });
  await db.put(`${tenant}:${owner}`, "sops", sopSchema.parse({
    id: "responder-whatsapp", name: "Revisar entrante", allowedTools: ["ask_user"],
    steps: [{ id: "review", title: "Revisar", tool: "ask_user" }],
  }));
  process.env.WHATSAPP_WEBHOOK_BINDINGS = JSON.stringify([
    { provider: "meta", accountId: "999", tenantId: tenant, owner, sopId: "responder-whatsapp" },
    { provider: "evolution", accountId: "test-instance", tenantId: tenant, owner, sopId: "responder-whatsapp", secretEnv: "WHATSAPP_INBOUND_TEST_SECRET" },
  ]);
  process.env.WHATSAPP_INBOUND_TEST_SECRET = evolutionSecret;
  ({ app, agent } = await createApp(db, testConfig({ dataDir: directory })));
  // Linea base: arrancar la app puede dejar tareas propias del modo sample.
  baselineTasks = (await db.list(`${tenant}:${owner}`, "tasks")).length;
});
after(async () => {
  await agent?.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
  delete process.env.WHATSAPP_APP_SECRET;
  delete process.env.WHATSAPP_VERIFY_TOKEN;
  delete process.env.WHATSAPP_WEBHOOK_BINDINGS;
  delete process.env.WHATSAPP_INBOUND_TEST_SECRET;
});
beforeEach(() => {
  process.env.WHATSAPP_APP_SECRET = APP_SECRET;
});

// Cuerpo con la forma de la Cloud API de Meta.
const metaBody = JSON.stringify({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "1234",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: { phone_number_id: "999" },
            messages: [{ from: "34600111222", id: "wamid.ABC", timestamp: "1", text: { body: "Hola" } }],
          },
        },
      ],
    },
  ],
});
// Cuerpo con la forma de Evolution API.
const evolutionBody = JSON.stringify({
  event: "messages.upsert", instance: "test-instance",
  data: { key: { id: "ev-1", remoteJid: "34600333444@s.whatsapp.net" }, message: { conversation: "Hola" } },
});

/** Firma como la manda cada proveedor: Meta en hex con prefijo, Evolution en base64. */
function signed(body: string, encoding: "hex" | "base64") {
  const digest = createHmac("sha256", APP_SECRET).update(body).digest();
  return encoding === "hex" ? `sha256=${digest.toString("hex")}` : digest.toString("base64");
}

function post(body: string, headers: Record<string, string> = {}, route = "webhook") {
  // Sin Authorization a proposito: si la ruta quedara detras del middleware de
  // auth, el proveedor recibiria 401 y el webhook seria inutil en produccion.
  return app.request(`/api/whatsapp/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}

test("sin WHATSAPP_APP_SECRET el webhook falla cerrado", async () => {
  delete process.env.WHATSAPP_APP_SECRET;
  const response = await post(evolutionBody, { "x-hub-signature-256": signed(evolutionBody, "base64") });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /WHATSAPP_APP_SECRET/);
});

test("sin firma no se procesa el mensaje", async () => {
  const response = await post(evolutionBody);
  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /signature/i);
});

test("una firma invalida no crea tareas", async () => {
  const forged = createHmac("sha256", "otro-secreto").update(evolutionBody).digest("base64");
  const response = await post(evolutionBody, { "x-hub-signature-256": forged });
  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /Invalid webhook signature/);
  assert.equal((await db.list(`${tenant}:${owner}`, "tasks")).length, baselineTasks);
});

test("una firma valida de Meta (hex) crea una tarea de SOP", async () => {
  const response = await post(metaBody, { "x-hub-signature-256": signed(metaBody, "hex") });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.taskId, "el webhook debe devolver la tarea creada");
  const task = await db.get<{ tenantId: string }>(`${tenant}:${owner}`, "tasks", body.taskId);
  assert.equal(task?.tenantId, tenant);
  assert.equal(await db.get("system", "tasks", body.taskId), null);
});

test("reintentos concurrentes usan una tarea y emiten task.created una sola vez", async () => {
  const parsed = JSON.parse(metaBody);
  parsed.entry[0].changes[0].value.messages[0].id = "wamid.CONCURRENT";
  const raw = JSON.stringify(parsed);
  const responses = await Promise.all(Array.from({ length: 4 }, () => post(raw, { "x-hub-signature-256": signed(raw, "hex") })));
  assert.ok(responses.every((response) => response.status === 200));
  const bodies = await Promise.all(responses.map((response) => response.json()));
  assert.equal(new Set(bodies.map((body) => body.taskId)).size, 1);
  const events = await db.list<{ type: string; payload: { taskId?: string } }>(`${tenant}:${owner}`, "system-events");
  assert.equal(events.filter((event) => event.type === "task.created" && event.payload.taskId === bodies[0].taskId).length, 1);
});

test("Evolution usa su cabecera dedicada y la misma cola aislada", async () => {
  const response = await post(evolutionBody, { "x-webhook-secret": evolutionSecret }, "incoming");
  assert.equal(response.status, 200);
  assert.ok((await response.json()).taskId);
});

test("el handshake GET de Meta devuelve el challenge solo con el verify token correcto", async () => {
  process.env.WHATSAPP_VERIFY_TOKEN = "verify-me";
  const ok = await app.request(
    "/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345",
  );
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), "12345");
  const wrong = await app.request("/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=otro&hub.challenge=12345");
  assert.equal(wrong.status, 403);
});

test("los eventos que no son mensajes se ignoran", async () => {
  const statuses = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [{ changes: [{ field: "messages", value: { statuses: [{ id: "wamid.ABC", status: "delivered" }] } }] }],
  });
  const response = await post(statuses, { "x-hub-signature-256": signed(statuses, "hex") });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ignored, true);
});

test("extractIncomingMessage entiende las dos formas y no inventa datos", () => {
  assert.deepEqual(extractIncomingMessage(JSON.parse(metaBody)), {
    id: "wamid.ABC",
    from: "34600111222",
    text: "Hola",
  });
  assert.deepEqual(extractIncomingMessage(JSON.parse(evolutionBody)), {
    id: "ev-1",
    from: "34600333444@s.whatsapp.net",
    text: "Hola",
  });
  assert.equal(extractIncomingMessage(null), null);
  assert.equal(extractIncomingMessage("texto suelto"), null);
  assert.equal(extractIncomingMessage({ entry: [] }), null);
});
