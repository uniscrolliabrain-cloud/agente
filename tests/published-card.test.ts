import assert from "node:assert/strict";
import { test } from "node:test";
import { makePublishedCard } from "../apps/server/src/engine/published-card.ts";

test("PublishedCard records approval and hashes a stable snapshot of its content", () => {
  const approval = { tenantId: "tenant-a", approvedBy: "operator", approvedAt: new Date("2026-11-07T12:00:00Z") };
  const card = { id: "welcome", content: { template: "Hola", channels: ["panel", "email"] } };
  const published = makePublishedCard(card, approval);
  const reordered = makePublishedCard({ content: { channels: ["panel", "email"], template: "Hola" }, id: "welcome" }, approval);
  assert.equal(published.tenantId, approval.tenantId);
  assert.equal(published.approvedBy, approval.approvedBy);
  assert.equal(published.approvedAt, approval.approvedAt.toISOString());
  assert.match(published.contentHash, /^[a-f0-9]{64}$/);
  assert.equal(published.contentHash, reordered.contentHash);
  assert.notEqual(published.contentHash, makePublishedCard({
    ...card, content: { ...card.content, channels: ["email", "panel"] },
  }, approval).contentHash);
  card.content.template = "Adiós";
  assert.equal(published.card.content.template, "Hola");
  assert.notEqual(published.contentHash, makePublishedCard(card, approval).contentHash);
});
