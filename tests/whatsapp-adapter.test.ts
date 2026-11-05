import assert from "node:assert/strict";
import { test } from "node:test";
import { WhatsAppClient } from "../packages/integrations/src/stubs/whatsapp.ts";
import { AppError, OutcomeUnknownError } from "../packages/domain/src/errors.ts";
const client = () => new WhatsAppClient({ baseUrl: "https://example.test", apiKey: "private-test-key", instance: "agency-one" });

test("WhatsApp adapter accepts E.164 digits and sends the exact approved payload once", async (t) => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  t.mock.method(globalThis, "fetch", async (url: string, init?: RequestInit) => { calls.push({ url, init }); return Response.json({ key: { id: "wamid-test" } }); });
  const result = await client().sendText("+34600111222", "Texto aprobado");
  assert.equal(result.id, "wamid-test"); assert.equal(result.accepted, true); assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.test/message/sendText/agency-one");
  assert.deepEqual(JSON.parse(calls[0].init!.body as string), { number: "+34600111222", text: "Texto aprobado" });
  assert.equal(calls[0].init!.redirect, "error");
});
test("WhatsApp validation fails before network for invalid numbers, text or missing configuration", async (t) => {
  let calls = 0; t.mock.method(globalThis, "fetch", async () => { calls++; throw new Error("Must not send"); });
  for (const number of ["abc", "123", "\\34600111222", "34600111222@s.whatsapp.net"]) await assert.rejects(client().sendText(number, "Hola"), (e) => e instanceof AppError && e.status === 422);
  await assert.rejects(client().sendText("34600111222", " "), /vacio/);
  await assert.rejects(new WhatsAppClient().sendText("34600111222", "Hola"), (e) => e instanceof AppError && e.status === 503);
  assert.equal(calls, 0);
});
test("transport errors, provider 5xx/408 and invalid confirmations have unknown outcome", async (t) => {
  for (const response of [new Error("network secret"), new Response("private failure", { status: 500 }), new Response("timeout", { status: 408 }),
    new Response("not json"), Response.json({}), Response.json(null), Response.json({ key: { id: 123 } })]) {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => { if (response instanceof Error) throw response; return response; });
    await assert.rejects(client().sendText("34600111222", "Hola"), (e) => e instanceof OutcomeUnknownError);
    fetchMock.mock.restore();
  }
});
test("provider rejection is definite and its private response body is not exposed", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("apikey=private-test-key", { status: 401 }));
  await assert.rejects(client().sendText("34600111222", "Hola"), (e) => e instanceof AppError && e.status === 422 && !e.message.includes("private-test-key"));
});
