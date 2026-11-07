import assert from "node:assert/strict";
import { test } from "node:test";
import { renderFixedCard } from "../apps/server/src/engine/context/fixed-card-renderer.ts";

const card = {
  mode: "fixed",
  status: "approved",
  channels: ["panel", "email", "whatsapp", "voice"],
  requiredFacts: ["reference"],
  template: "Referencia: {{reference}}",
  missingFactScript: "Necesito una referencia verificada.",
  fallback: "ask",
} as const;

test("HTML text escapes slot markup and never evaluates an injected placeholder", () => {
  const result = renderFixedCard(card, "panel", {
    reference: '<img src=x onerror="alert(1)">&{{extra}}',
    extra: "must not be interpolated",
  });
  assert.deepEqual(result, {
    status: "rendered",
    format: "html-text",
    text: "Referencia: &lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;{{extra}}",
  });
  assert.equal(renderFixedCard(card, "email", { reference: "<script>" }).text, "Referencia: &lt;script&gt;");
});

test("WhatsApp and voice neutralize markup in interpolated text", () => {
  assert.equal(renderFixedCard(card, "whatsapp", { reference: "*link*_`<a>" }).text,
    "Referencia: ＊link＊＿｀＜a＞");
  assert.equal(renderFixedCard(card, "voice", { reference: "<break/>" }).text, "Referencia: ＜break/＞");
  assert.throws(() => renderFixedCard(card, "whatsapp", { reference: "ok\n*extra*" }), RangeError);
});

test("missing facts fall back without reading inherited properties", () => {
  assert.deepEqual(renderFixedCard(card, "panel", Object.create({ reference: "untrusted" })), {
    status: "missing-facts",
    format: "html-text",
    text: card.missingFactScript,
    missing: ["reference"],
    fallback: "ask",
  });
  assert.equal(renderFixedCard(card, "voice", { reference: 0 }).text, "Referencia: 0");
  assert.throws(() => renderFixedCard(card, "voice", { reference: { nested: "text" } }), TypeError);
});

test("channel limits apply after escaping and invalid cards fail closed", () => {
  for (const [channel, limit] of [["panel", 1200], ["email", 4000], ["whatsapp", 1024], ["voice", 600]] as const) {
    const slotOnly = { ...card, template: "{{reference}}" };
    assert.equal(renderFixedCard(slotOnly, channel, { reference: "x".repeat(limit) }).text.length, limit);
    assert.throws(() => renderFixedCard(slotOnly, channel, { reference: "x".repeat(limit + 1) }), RangeError);
  }
  assert.throws(() => renderFixedCard(card, "panel", { reference: "<".repeat(350) }), RangeError);
  assert.throws(() => renderFixedCard({ ...card, template: "{{unknown}}" }, "voice", {}), /Undeclared/);
  assert.throws(() => renderFixedCard({ ...card, template: "{{reference }" }, "voice", {}), /syntax/);
  assert.throws(() => renderFixedCard({ ...card, status: "draft" }, "voice", {}), /approved/);
  assert.throws(() => renderFixedCard({ ...card, channels: ["email"] }, "voice", {}), /channel/);
  const invalidChannel = "__proto__" as never;
  assert.throws(() => renderFixedCard({ ...card, channels: [invalidChannel] }, invalidChannel, {}), /channel/);
});
