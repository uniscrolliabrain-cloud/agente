// WHATSAPP_WEBHOOK_SECURITY_V1 — el webhook de Meta/Evolution no puede mandar un
// Bearer (lo llama el proveedor, no un usuario), asi que la firma HMAC es toda su
// autenticacion y la ruta tiene que estar montada ANTES del middleware de auth.
// Estos tests fijan las cuatro reglas:
//   1. sin WHATSAPP_APP_SECRET no se procesa nada (fail-closed, 503);
//   2. sin firma o con firma invalida -> 401 y ninguna tarea creada;
//   3. con firma valida (hex de Meta y base64 de Evolution) -> 200 y una tarea;
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

const APP_SECRET = "test-app-secret-para-hmac";
let app: Awaited<ReturnType<typeof createApp>>["app"],
  db: Store,
  directory: string,
  baselineTasks = 0;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "openmuse-whatsapp-"));
  db = await createStore();
  ({ app } = await createApp(db, testConfig({ dataDir: directory })));
  // Linea base: arrancar la app puede dejar tareas propias del modo sample.
  baselineTasks = (await db.list("system", "tasks")).length;
});
after(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
  delete process.env.WHATSAPP_APP_SECRET;
  delete process.env.WHATSAPP_VERIFY_TOKEN;
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
  data: { key: { id: "ev-1", remoteJid: "34600333444@s.whatsapp.net" }, message: { conversation: "Hola" } },
});

/** Firma como la manda cada proveedor: Meta en hex con prefijo, Evolution en base64. */
function signed(body: string, encoding: "hex" | "base64") {
  const digest = createHmac("sha256", APP_SECRET).update(body).digest();
  return encoding === "hex" ? `sha256=${digest.toString("hex")}` : digest.toString("base64");
}

function post(body: string, headers: Record<string, string> = {}) {
  // Sin Authorization a proposito: si la ruta quedara detras del middleware de
  // auth, el proveedor recibiria 401 y el webhook seria inutil en produccion.
  return app.request("/api/whatsapp/webhook", {
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
  assert.equal((await db.list("system", "tasks")).length, baselineTasks);
});

test("una firma valida de Meta (hex) crea una tarea de SOP", async () => {
  const response = await post(metaBody, { "x-hub-signature-256": signed(metaBody, "hex") });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.taskId, "el webhook debe devolver la tarea creada");
});

test("una firma valida de Evolution (base64) tambien se acepta", async () => {
  const response = await post(evolutionBody, { "x-hub-signature-256": signed(evolutionBody, "base64") });
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
