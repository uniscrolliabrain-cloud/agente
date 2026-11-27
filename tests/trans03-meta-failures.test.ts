// TRANS03_META_FAILURES_V1 - un fallo de Meta se declara: rechazo visible o resultado desconocido.
import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError, OutcomeUnknownError } from "../packages/domain/src/errors.ts";
import { MetaWhatsAppClient } from "../packages/integrations/src/meta-whatsapp.ts";

function client(response: Response | (() => Promise<Response>)) {
  return new MetaWhatsAppClient({
    token: "EAAG_synthetic",
    phoneNumberId: "123456",
    fetch: (async () => (typeof response === "function" ? response() : response)) as typeof fetch,
  });
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("408, 429 and 5xx stay outcome-unknown: never a silent success and never a definite rejection", async () => {
  for (const status of [408, 429, 500, 502, 503]) {
    await assert.rejects(
      () => client(json(status, { error: { message: "synthetic" } })).sendText("+34600111222", "Hola"),
      (error: unknown) => error instanceof OutcomeUnknownError && Boolean((error as Error).message.includes("no confirmo")),
      `HTTP ${status}`,
    );
  }
});

test("a transport failure or timeout is outcome-unknown, not a rejection", async () => {
  await assert.rejects(
    () =>
      client(async () => {
        throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
      }).sendText("+34600111222", "Hola"),
    (error: unknown) => error instanceof OutcomeUnknownError,
  );
  await assert.rejects(
    () =>
      client(async () => {
        throw Error("ECONNRESET");
      }).sendText("+34600111222", "Hola"),
    (error: unknown) => error instanceof OutcomeUnknownError,
  );
});

test("a 2xx without a message id is outcome-unknown instead of accepted", async () => {
  for (const body of [{}, { messages: [] }, { messages: [{ id: "   " }] }, { messages: [{}] }, null]) {
    await assert.rejects(
      () => client(json(200, body)).sendText("+34600111222", "Hola"),
      (error: unknown) => error instanceof OutcomeUnknownError,
    );
  }
});

test("a definite rejection is visible, classified as failed without effect and never echoes the provider body", async () => {
  const rejected = client(json(400, { error: { message: "Recipient 34600111222 not allowed (EAAG_synthetic)" } }));
  await assert.rejects(
    () => rejected.sendText("+34600111222", "Hola"),
    (error: unknown) => {
      const app = error as AppError & { outcome?: string };
      assert.ok(error instanceof AppError);
      assert.equal(app.status, 422);
      assert.equal(app.outcome, "failed_without_effect");
      assert.match(app.message, /HTTP 400/);
      assert.equal(app.message.includes("EAAG_synthetic"), false);
      assert.equal(app.message.includes("not allowed"), false);
      return true;
    },
  );
});

test("input validation rejects before any network call", async () => {
  let calls = 0;
  const validated = new MetaWhatsAppClient({
    token: "EAAG_synthetic",
    phoneNumberId: "123456",
    fetch: (async () => {
      calls++;
      return json(200, { messages: [{ id: "wamid.1" }] });
    }) as typeof fetch,
  });
  for (const [to, text] of [
    ["no-es-un-numero", "Hola"],
    ["12345", "Hola"],
    ["+34600111222", "   "],
    ["+34600111222", "x".repeat(4097)],
  ] as const) {
    await assert.rejects(
      () => validated.sendText(to, text),
      (error: { status?: number }) => error.status === 422,
    );
  }
  assert.equal(calls, 0);
});

test("markRead accepts only a bounded provider id and never invents one", async () => {
  await assert.rejects(() => client(json(200, {})).markRead("bad id with spaces"), (error: { status?: number }) => error.status === 422);
  let body: Record<string, unknown> | undefined;
  const ok = new MetaWhatsAppClient({
    token: "EAAG_synthetic",
    phoneNumberId: "123456",
    fetch: (async (_url: string, options: RequestInit) => {
      body = JSON.parse(String(options.body));
      return json(200, {});
    }) as unknown as typeof fetch,
  });
  await ok.markRead("wamid.HBgM6MDAx");
  assert.deepEqual(body, { messaging_product: "whatsapp", status: "read", message_id: "wamid.HBgM6MDAx" });
});
