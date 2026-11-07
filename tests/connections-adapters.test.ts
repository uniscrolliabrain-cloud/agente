// CONNECTIONS_ADAPTERS_V1 - el minimo que hay que fijar de los tres canales
// nuevos: sin credencial no hay exito falso, la validacion rechaza antes de
// salir a la red y un 5xx NO se trata como rechazo definitivo.
import assert from "node:assert/strict";
import { test } from "node:test";
import { OutcomeUnknownError } from "../packages/domain/src/errors.ts";
import { GoogleMapsClient } from "../packages/integrations/src/google-maps.ts";
import { MetaWhatsAppClient } from "../packages/integrations/src/meta-whatsapp.ts";
import { ResendClient } from "../packages/integrations/src/resend.ts";
import { VapiClient } from "../packages/integrations/src/vapi.ts";

function fakeFetch(status: number, payload: unknown, calls: { url?: string; init?: RequestInit }[] = []) {
  return (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

test("Resend sin credencial responde 503 y no simula el envio", async () => {
  const client = new ResendClient({ apiKey: "", from: "hola@agntia.test" });
  assert.equal(client.configured, false);
  await assert.rejects(
    () => client.send({ to: "lead@example.com", subject: "Hola", html: "<p>Hola</p>" }),
    (error: { status?: number }) => error.status === 503,
  );
});

test("Resend valida el destinatario antes de llamar a la API", async () => {
  let called = false;
  const client = new ResendClient({
    apiKey: "re_test",
    from: "hola@agntia.test",
    fetch: (async () => {
      called = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch,
  });
  await assert.rejects(
    () => client.send({ to: "no-es-un-email", subject: "Hola", html: "<p>x</p>" }),
    (error: { status?: number }) => error.status === 422,
  );
  assert.equal(called, false);
});

test("Resend devuelve el id y envia la clave de idempotencia", async () => {
  const calls: { url?: string; init?: RequestInit }[] = [];
  const client = new ResendClient({
    apiKey: "re_test",
    from: "hola@agntia.test",
    fetch: fakeFetch(200, { id: "msg_123" }, calls),
  });
  const result = await client.send({
    to: "lead@example.com",
    subject: "Descubrimiento",
    html: "<p>Hola</p>",
    idempotencyKey: "signup-verify-1",
  });
  assert.equal(result.id, "msg_123");
  const headers = calls[0]?.init?.headers as Record<string, string>;
  assert.equal(headers["Idempotency-Key"], "signup-verify-1");
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)).to, ["lead@example.com"]);
});

test("Resend trata un 5xx como resultado desconocido, no como rechazo", async () => {
  const client = new ResendClient({
    apiKey: "re_test",
    from: "hola@agntia.test",
    fetch: fakeFetch(502, { message: "bad gateway" }),
  });
  await assert.rejects(
    () => client.send({ to: "lead@example.com", subject: "Hola", html: "<p>x</p>" }),
    (error: unknown) => error instanceof OutcomeUnknownError,
  );
});

test("Vapi sin key responde 503 y exige E.164 antes de marcar", async () => {
  const client = new VapiClient({ apiKey: "", assistantId: "asst_1" });
  assert.equal(client.configured, false);
  await assert.rejects(
    () => client.createCall({ customer: { number: "+34600111222" } }),
    (error: { status?: number }) => error.status === 503,
  );

  const keyed = new VapiClient({ apiKey: "vapi_test", assistantId: "asst_1" });
  await assert.rejects(
    () => keyed.createCall({ customer: { number: "600111222" } }),
    (error: { status?: number }) => error.status === 422,
  );
});

test("Vapi crea la llamada con asistente, telefono y metadata del tenant", async () => {
  const calls: { url?: string; init?: RequestInit }[] = [];
  const client = new VapiClient({
    apiKey: "vapi_test",
    assistantId: "asst_1",
    fetch: fakeFetch(201, { id: "call_9", status: "queued" }, calls),
  });
  const call = await client.createCall({
    customer: { number: "+34600111222", name: "Ana" },
    metadata: { tenantId: "agntia" },
  });
  assert.equal(call.id, "call_9");
  assert.equal(calls[0]?.url, "https://api.vapi.ai/call");
  const body = JSON.parse(String(calls[0]?.init?.body));
  assert.equal(body.assistantId, "asst_1");
  assert.equal(body.customer.number, "+34600111222");
  assert.equal(body.metadata.tenantId, "agntia");
});

test("Places normaliza el negocio y descarta lo que no tiene id o nombre", async () => {
  const calls: { url?: string; init?: RequestInit }[] = [];
  const places = {
    places: [
      {
        id: "ChIJ_1",
        displayName: { text: "Clinica Dental Sol" },
        formattedAddress: "Calle Mayor 1, Madrid",
        internationalPhoneNumber: "+34 910 000 000",
        websiteUri: "https://dental.example",
        rating: 4.6,
        userRatingCount: 120,
        googleMapsUri: "https://maps.google.com/?cid=1",
      },
      { id: "ChIJ_2" },
      { displayName: { text: "Sin id" } },
    ],
  };
  const client = new GoogleMapsClient({ apiKey: "maps_test", fetch: fakeFetch(200, places, calls) });
  const leads = await client.searchLeads({ query: "clinicas dentales en Madrid", limit: 99 });
  assert.equal(leads.length, 1);
  assert.equal(leads[0]?.placeId, "ChIJ_1");
  assert.equal(leads[0]?.phone, "+34 910 000 000");
  const body = JSON.parse(String(calls[0]?.init?.body));
  assert.equal(body.maxResultCount, 20, "Places no admite mas de 20 por pagina");
  const headers = calls[0]?.init?.headers as Record<string, string>;
  assert.ok(headers["X-Goog-FieldMask"].includes("places.displayName"));
});

test("Places convierte la API desactivada en un 502 con el motivo de Google", async () => {
  const client = new GoogleMapsClient({
    apiKey: "maps_test",
    fetch: fakeFetch(403, { error: { message: "This API is not activated on your API project." } }),
  });
  await assert.rejects(
    () => client.searchLeads({ query: "clinicas en Madrid" }),
    (error: { status?: number; message?: string }) =>
      error.status === 502 && Boolean(error.message?.includes("not activated")),
  );
});

test("Places sin key responde 503 y no consulta", async () => {
  await assert.rejects(
    () => new GoogleMapsClient({}).searchLeads({ query: "clinicas en Madrid" }),
    (error: { status?: number }) => error.status === 503,
  );
});

test("Meta WhatsApp normaliza el numero y devuelve el id del mensaje", async () => {
  const calls: { url?: string; init?: RequestInit }[] = [];
  const client = new MetaWhatsAppClient({
    token: "EAAG_test",
    phoneNumberId: "123456",
    fetch: fakeFetch(200, { messages: [{ id: "wamid.1" }] }, calls),
  });
  const result = await client.sendText("+34600111222", "Hola");
  assert.equal(result.id, "wamid.1");
  assert.equal(calls[0]?.url, "https://graph.facebook.com/v21.0/123456/messages");
  const body = JSON.parse(String(calls[0]?.init?.body));
  assert.equal(body.to, "34600111222");
  assert.equal(body.text.body, "Hola");
});

test("Meta WhatsApp sin token responde 503 y un 401 es rechazo visible", async () => {
  await assert.rejects(
    () => new MetaWhatsAppClient({ phoneNumberId: "1" }).sendText("+34600111222", "Hola"),
    (error: { status?: number }) => error.status === 503,
  );
  const rejected = new MetaWhatsAppClient({
    token: "EAAG_test",
    phoneNumberId: "123456",
    fetch: fakeFetch(401, { error: { message: "Invalid OAuth access token" } }),
  });
  await assert.rejects(
    () => rejected.sendText("+34600111222", "Hola"),
    (error: { status?: number; message?: string }) =>
      error.status === 422 && Boolean(error.message?.includes("Invalid OAuth")),
  );
});
