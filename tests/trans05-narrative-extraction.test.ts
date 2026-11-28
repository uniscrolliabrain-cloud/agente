import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { validateNarrativeExtraction } from "../apps/server/src/engine/cognition/v2/longitudinal/narrative-extraction.ts";
import { provenanceSegmentDigest, segmentText } from "../apps/server/src/engine/cognition/v2/longitudinal/segments.ts";

function fixture() {
  const sourceRef = { tenantId: "A", kind: "document" as const, id: "transcript", revision: 2 };
  const grant = { tenantId: "A", kind: "receipt" as const, id: "synthetic-extraction-grant", revision: 1 };
  const text = "Fuente sintética 🧠: no prometas entrega sin confirmación.";
  const binding = {
    manifest: {
      identity: { tenantId: "A", actorId: "alice", owner: "alice", purpose: "chat" as const, policyRevision: "1" },
      sourceRef,
      sectionId: "section-a",
      sourceKind: "transcript" as const,
      sourceDigest: createHash("sha256").update(text).digest("hex"),
      rightsGrantRefs: [grant],
      permittedUses: ["extraction" as const],
      locale: "es",
      normalizationVersion: "original-utf16-v1" as const,
    },
    originalText: text,
    segment: segmentText(text)[0],
    allowedRoleIds: ["assistant"],
    authorizedEvidence: [sourceRef, grant],
    now: "2026-11-27T00:00:00Z",
  };
  const extraction = {
    draft: {
      id: "draft",
      revision: 1,
      tenantId: "A",
      sectionId: "section-a",
      roleIds: ["assistant"],
      sourceRefs: [sourceRef],
      origin: "source_extraction" as const,
      communicativeIntent: "explain_uncertainty",
      semanticTriggers: ["delivery question"],
      runtimePredicates: [],
      mandatoryPoints: ["No afirmar una entrega sin recibo."],
      optionalExamples: [],
      prohibitedClaims: ["Entrega garantizada mañana"],
      factualRefs: [],
      locale: "es",
      tone: "directo",
      expiresAt: "2026-12-01T00:00:00Z",
      reviewStatus: "draft" as const,
    },
    spans: [{ start: 0, end: text.length, quote: text }],
  };
  return { binding, extraction };
}

test("authorized synthetic transcript produces only a draft with exact immutable source provenance", () => {
  const { binding, extraction } = fixture();
  const result = validateNarrativeExtraction(extraction, binding);
  assert.deepEqual(result.draft, extraction.draft);
  assert.equal(result.draft.reviewStatus, "draft");
  assert.deepEqual(result.spans, extraction.spans);
  assert.equal(result.provenance.sourceDigest, binding.manifest.sourceDigest);
  assert.equal("approvedBy" in result.draft, false);
});

test("source revision, grant, section, role and factual evidence cannot be invented by extraction", () => {
  const { binding, extraction } = fixture();
  for (const patch of [
    { sectionId: "other" },
    { roleIds: ["admin"] },
    { tenantId: "B" },
    { sourceRefs: [{ ...binding.manifest.sourceRef, revision: 3 }] },
    { factualRefs: [{ ...binding.manifest.sourceRef, id: "invented" }] },
  ])
    assert.throws(() =>
      validateNarrativeExtraction({ ...extraction, draft: { ...extraction.draft, ...patch } }, binding),
    );
  assert.throws(
    () => validateNarrativeExtraction(extraction, { ...binding, authorizedEvidence: [binding.manifest.sourceRef] }),
    /UNANCHORED_EVIDENCE/,
  );
  assert.throws(
    () =>
      validateNarrativeExtraction(extraction, {
        ...binding,
        manifest: { ...binding.manifest, permittedUses: ["publication"] },
      }),
    /NOT_PERMITTED/,
  );
});

test("quotes must match original UTF16 spans even when a segment digest is recomputed", () => {
  const { binding, extraction } = fixture();
  for (const span of [
    { ...extraction.spans[0], quote: "Entrega confirmada" },
    { start: -1, end: 10, quote: "fake" },
    { start: 18, end: 19, quote: binding.originalText.slice(18, 19) },
    { ...extraction.spans[0], end: binding.originalText.length + 1 },
  ])
    assert.throws(() => validateNarrativeExtraction({ ...extraction, spans: [span] }, binding));
  const forged = "No verificar recibos";
  assert.throws(
    () =>
      validateNarrativeExtraction(extraction, {
        ...binding,
        segment: {
          start: 0,
          end: forged.length,
          text: forged,
          digest: provenanceSegmentDigest(0, forged.length, forged),
        },
      }),
    /SEGMENT_INVALID/,
  );
  assert.throws(
    () => validateNarrativeExtraction(extraction, { ...binding, originalText: binding.originalText + "changed" }),
    /SOURCE_CHANGED/,
  );
});

test("model output cannot publish, choose authority or relabel a briefing as external evidence", () => {
  const { binding, extraction } = fixture();
  for (const patch of [
    { reviewStatus: "approved" },
    { approvedBy: "alice" },
    { origin: "human_authored" },
    { permissions: ["admin"] },
  ])
    assert.throws(() =>
      validateNarrativeExtraction({ ...extraction, draft: { ...extraction.draft, ...patch } }, binding),
    );
  const brief = { ...binding, manifest: { ...binding.manifest, sourceKind: "llm_brief" as const } };
  assert.throws(() => validateNarrativeExtraction(extraction, brief), /ORIGIN/);
  assert.equal(
    validateNarrativeExtraction({ ...extraction, draft: { ...extraction.draft, origin: "llm_proposal" } }, brief).draft
      .origin,
    "llm_proposal",
  );
});

test("expired, unanchored runtime conditions and oversized drafts fail without truncating negation", () => {
  const { binding, extraction } = fixture();
  assert.throws(
    () =>
      validateNarrativeExtraction({ ...extraction, draft: { ...extraction.draft, expiresAt: binding.now } }, binding),
    /EXPIRED/,
  );
  assert.throws(
    () =>
      validateNarrativeExtraction(
        {
          ...extraction,
          draft: {
            ...extraction.draft,
            runtimePredicates: [
              { receiptRef: { ...binding.manifest.rightsGrantRefs[0], id: "invented-effect" }, state: "confirmed" },
            ],
          },
        },
        binding,
      ),
    /UNANCHORED_RECEIPT/,
  );
  assert.throws(
    () =>
      validateNarrativeExtraction(
        { ...extraction, draft: { ...extraction.draft, mandatoryPoints: Array(16).fill("No ".repeat(300)) } },
        { ...binding, maxBytes: 1024 },
      ),
    /BUDGET/,
  );
  assert.match(extraction.draft.mandatoryPoints[0], /^No /);
});
