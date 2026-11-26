import assert from "node:assert/strict";
import { test } from "node:test";
import { anchorAnnotationSchema, narrativeDraftSchema } from "../packages/domain/src/longitudinal.ts";
import {
  cognitiveSkillCatalog,
  cognitiveSkillCatalogDigest,
  selectSkills,
} from "../apps/server/src/engine/cognition/v2/longitudinal/selector.ts";
import { segmentText } from "../apps/server/src/engine/cognition/v2/longitudinal/segments.ts";
import { packLongitudinalContext } from "../apps/server/src/engine/cognition/v2/longitudinal/pack.ts";
import { validateLongitudinalProposal } from "../apps/server/src/engine/cognition/v2/longitudinal/proposal.ts";

const identity = { tenantId: "a", actorId: "actor", owner: "owner", policyRevision: "p1", purpose: "chat" as const };
const source = { tenantId: "a", kind: "event" as const, id: "journal-1", revision: 1 };
const card = { tenantId: "a", kind: "card" as const, id: "axiom-1", revision: 1 };
const anchor = {
  scope: { identity, threadId: "thread-a" },
  cardRef: card,
  kind: "axiom" as const,
  authority: "user_stated" as const,
  state: "active" as const,
  sourceRefs: [source],
};
const unknown = { explore: null, apply: null, generate: null, verify: null, expand: null, protect: null };

test("catalog has twelve information skills and one bounded composite; correction precedes scoring", () => {
  assert.equal(cognitiveSkillCatalog.length, 13);
  assert.match(cognitiveSkillCatalogDigest, /^[a-f0-9]{64}$/);
  const result = selectSkills(cognitiveSkillCatalog, {
    triggers: ["correction", "contradiction", "checkpoint"],
    poles: unknown,
    remaining: 1,
  });
  assert.equal(result[0].id, "feedback");
  assert.equal(
    selectSkills(cognitiveSkillCatalog, { triggers: ["contradiction", "axiom"], poles: unknown, remaining: 1 })[0].id,
    "contradiction",
  );
  assert.deepEqual(selectSkills(cognitiveSkillCatalog, { triggers: [], poles: unknown, remaining: 1 }), []);
  assert.deepEqual(selectSkills(cognitiveSkillCatalog, { triggers: ["correction"], poles: unknown, remaining: 0 }), []);
});

test("selector preserves null, validates bounds and rejects duplicate IDs", () => {
  const custom = cognitiveSkillCatalog
    .filter((s) => ["strategy", "synthesis"].includes(s.id))
    .map((s) => ({ ...s, triggers: ["checkpoint" as const], weights: { verify: s.id === "strategy" ? 1 : 0 } }));
  assert.equal(selectSkills(custom, { triggers: ["checkpoint"], poles: unknown, remaining: 1 })[0].id, "strategy");
  assert.throws(
    () => selectSkills([...custom, custom[0]], { triggers: [], poles: unknown, remaining: 1 }),
    /duplicate/,
  );
  assert.throws(() => selectSkills(custom, { triggers: [], poles: { ...unknown, verify: NaN }, remaining: 1 }));
  assert.deepEqual(selectSkills(custom, { triggers: ["correction", "checkpoint"], poles: unknown, remaining: 1 }), []);
});

test("source segmentation preserves exact UTF16 offsets, Unicode and complete coverage", () => {
  const source = "Inicio 😀 no prometas entrega.\nFinal áé 🧠.";
  const segments = segmentText(source, 12, 3);
  const covered = new Set<number>();
  for (const segment of segments) {
    assert.equal(segment.text, source.slice(segment.start, segment.end));
    assert.equal(segment.text.isWellFormed(), true);
    assert.match(segment.digest, /^[a-f0-9]{64}$/);
    for (let i = segment.start; i < segment.end; i++) covered.add(i);
  }
  assert.equal(covered.size, source.length);
  assert.deepEqual(segmentText(source, 12, 3), segments);
  assert.throws(() => segmentText("bad\ud800", 12, 3), /UNICODE/);
  assert.throws(() => segmentText(source, 2, 1), /CONFIG/);
});

test("packing counts full JSON overhead, retains whole clauses and reports missing mandatory anchors", () => {
  const items = [
    { ref: card, text: "No prometas entrega sin evidencia.", priority: 1, group: "anchor" as const, mandatory: true },
    {
      ref: { ...card, id: "general" },
      text: "Distractor".repeat(50),
      priority: 100,
      group: "general" as const,
      mandatory: false,
    },
  ];
  const packed = packLongitudinalContext(items, 400, { anchor: 400, brief: 0, narrative: 0, general: 400 });
  assert.equal(packed.items[0].text, items[0].text);
  assert.equal(packed.bytes, Buffer.byteLength(packed.serialized));
  assert.ok(packed.bytes <= 400);
  assert.equal(packed.degraded, false);
  const small = packLongitudinalContext(items, 10, { anchor: 10, brief: 0, narrative: 0, general: 0 });
  assert.equal(small.degraded, true);
  assert.deepEqual(small.omittedMandatory, [card]);
  assert.throws(
    () =>
      packLongitudinalContext([items[0], { ...items[0], text: "opposite" }], 400, {
        anchor: 400,
        brief: 0,
        narrative: 0,
        general: 0,
      }),
    /CONFLICTING/,
  );
});

test("model proposal cannot change bindings, invent evidence, cross threads or supersede a user premise", () => {
  const binding = {
    scope: anchor.scope,
    expectedRevision: 0,
    watermark: "90071992547409930",
    skillId: "feedback",
    skillVersion: "1.0.0",
    evidence: [source],
    anchors: [anchor],
  };
  const proposal = {
    expectedRevision: 0,
    watermark: binding.watermark,
    skillId: "feedback",
    skillVersion: "1.0.0",
    proposals: [{ op: "dispute", target: card, body: "Proposed contradiction", evidence: [source] }],
  };
  assert.equal(validateLongitudinalProposal(proposal, binding).watermark, binding.watermark);
  assert.throws(() => validateLongitudinalProposal({ ...proposal, expectedRevision: 1 }, binding), /BINDING/);
  assert.throws(
    () =>
      validateLongitudinalProposal(
        { ...proposal, proposals: [{ ...proposal.proposals[0], evidence: [{ ...source, revision: 2 }] }] },
        binding,
      ),
    /UNANCHORED/,
  );
  assert.throws(
    () =>
      validateLongitudinalProposal(
        { ...proposal, proposals: [{ ...proposal.proposals[0], op: "supersede" }] },
        binding,
      ),
    /PREMISE_PROTECTED/,
  );
  assert.throws(
    () => validateLongitudinalProposal(proposal, { ...binding, scope: { ...binding.scope, threadId: "thread-b" } }),
    /SCOPE/,
  );
});

test("strict sidecars reject cross-tenant refs and model publication assertions", () => {
  assert.equal(
    anchorAnnotationSchema.safeParse({ ...anchor, sourceRefs: [{ ...source, tenantId: "b" }] }).success,
    false,
  );
  const draft = {
    id: "draft",
    revision: 1,
    tenantId: "a",
    sectionId: "section",
    roleIds: ["member"],
    sourceRefs: [source],
    origin: "source_extraction",
    communicativeIntent: "explain",
    semanticTriggers: ["explain"],
    runtimePredicates: [],
    mandatoryPoints: ["No guarantee"],
    optionalExamples: [],
    prohibitedClaims: ["delivered"],
    factualRefs: [],
    locale: "es",
    tone: "clear",
    expiresAt: "2027-01-01T00:00:00Z",
    reviewStatus: "draft",
  };
  assert.equal(narrativeDraftSchema.safeParse(draft).success, true);
  assert.equal(
    narrativeDraftSchema.safeParse({ ...draft, reviewStatus: "published", approvedBy: "model" }).success,
    false,
  );
  assert.equal(
    narrativeDraftSchema.safeParse({
      ...draft,
      runtimePredicates: [{ receiptRef: { ...source, kind: "receipt" }, state: "delivered" }],
    }).success,
    false,
  );
});
