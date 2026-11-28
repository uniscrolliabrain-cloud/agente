import assert from "node:assert/strict";
import { test } from "node:test";
import { GoogleMapsClient } from "../packages/integrations/src/google-maps.ts";
import { ResendClient } from "../packages/integrations/src/resend.ts";
import { detectFollowUpReply, looksLikeOptOut, type LeadFollowUp } from "../apps/server/src/engine/leads.ts";

test("Places rejects malformed responses and invalid limits while deduplicating valid results", async () => {
  for (const body of ["{", "null", "[]", '{"places":"invalid"}']) {
    const client = new GoogleMapsClient({ apiKey: "local", fetch: async () => new Response(body) });
    await assert.rejects(() => client.searchLeads({ query: "consulta" }), { status: 502 });
  }
  let calls = 0;
  const client = new GoogleMapsClient({
    apiKey: "local",
    fetch: async () => {
      calls++;
      return Response.json({
        places: [
          { id: "p1", displayName: { text: "Taller" } },
          { id: " p1 ", displayName: { text: "Taller" } },
        ],
      });
    },
  });
  for (const limit of [NaN, Infinity, 1.5])
    await assert.rejects(() => client.searchLeads({ query: "consulta", limit }), { status: 422 });
  assert.equal(calls, 0);
  assert.equal((await client.searchLeads({ query: "consulta" })).length, 1);
  const empty = new GoogleMapsClient({ apiKey: "local", fetch: async () => Response.json({}) });
  assert.deepEqual(await empty.searchLeads({ query: "consulta" }), []);
});

test("Resend classifies a malformed success as unknown and handles non-string errors", async () => {
  const message = { to: "ana@example.test", subject: "Local", html: "Synthetic" };
  for (const id of [42, {}, [], null]) {
    const client = new ResendClient({
      apiKey: "local",
      from: "local@example.test",
      fetch: async () => Response.json({ id }),
    });
    await assert.rejects(() => client.send(message), { code: "outcome_unknown" });
  }
  const rejected = new ResendClient({
    apiKey: "local",
    from: "local@example.test",
    fetch: async () => Response.json({ message: { unexpected: true }, name: 42 }, { status: 422 }),
  });
  await assert.rejects(() => rejected.send(message), { status: 422 });
});

test("opposition recognizes an explicit request and survives a later acknowledgement", () => {
  assert.equal(looksLikeOptOut("No me escribas más"), true);
  assert.equal(looksLikeOptOut("¿El precio baja en junio?"), false);
  assert.equal(looksLikeOptOut("No quiero darme de baja"), false);
  const followUp = { threadId: "thread", to: "ana@example.test", sentAt: "2026-11-24T10:00:00Z" } as LeadFollowUp;
  const messages = [
    {
      id: "opt-out",
      threadId: "thread",
      from: "Ana <ana@example.test>",
      date: "2026-11-24T11:00:00Z",
      body: "Quiero darme de baja",
    },
    { id: "later", threadId: "thread", from: "ana@example.test", date: "2026-11-24T12:00:00Z", body: "Gracias" },
    {
      id: "foreign",
      threadId: "thread",
      from: "other@example.test",
      date: "2026-11-24T13:00:00Z",
      body: "unsubscribe",
    },
  ];
  assert.equal(detectFollowUpReply(followUp, messages)?.id, "opt-out");
});
