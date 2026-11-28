import assert from "node:assert/strict";
import { test } from "node:test";
import {
  organizationalAssessmentDraftSchema,
  describePair,
  summarizeChecks,
  candidateRank,
} from "../packages/domain/src/organizational-primitives.ts";
const ref = { tenantId: "a", kind: "entity" as const, id: "resource", revision: 1 };
const draft = {
  subject: ref,
  whole: { ...ref, id: "company" },
  goal: { ...ref, id: "goal" },
  axis: { ontologyId: "synthetic-only", version: "1", definitionDigest: "a".repeat(64), id: "explore-apply" },
  positive: 0.9,
  negative: 0.9,
  evidence: [{ ...ref, kind: "event" as const, id: "evidence" }],
};

test("independent poles preserve high balance, zero balance and unknown", () => {
  assert.deepEqual(describePair({ positive: 0.9, negative: 0.9 }), {
    direction: "balanced",
    intensity: 0.9,
    balance: 0,
  });
  assert.deepEqual(describePair({ positive: 0, negative: 0 }), { direction: "balanced", intensity: 0, balance: 0 });
  assert.deepEqual(describePair({ positive: 0.9, negative: null }), {
    direction: "unknown",
    intensity: null,
    balance: null,
  });
  for (const value of [NaN, Infinity, -0.1, 1.1]) assert.throws(() => describePair({ positive: value, negative: 0 }));
});

test("tri-state checks require a complete unique server-owned set and never return allow", () => {
  assert.equal(summarizeChecks([], []), "unknown");
  assert.equal(summarizeChecks([{ id: "scope", state: "satisfied" }], ["scope", "revision"]), "unknown");
  assert.equal(summarizeChecks([{ id: "scope", state: "violated" }], ["scope"]), "violated");
  assert.equal(summarizeChecks([{ id: "scope", state: "satisfied" }], ["scope"]), "satisfied");
  assert.equal(
    summarizeChecks(
      [
        { id: "scope", state: "satisfied" },
        { id: "scope", state: "satisfied" },
      ],
      ["scope"],
    ),
    "unknown",
  );
  assert.equal(summarizeChecks([{ id: "scope", state: "unknown" }], ["scope"]), "unknown");
});

test("drafts reject foreign references, unsafe revisions and injected context authority", () => {
  assert.equal(organizationalAssessmentDraftSchema.safeParse(draft).success, true);
  assert.equal(
    organizationalAssessmentDraftSchema.safeParse({ ...draft, whole: { ...ref, tenantId: "b" } }).success,
    false,
  );
  assert.equal(
    organizationalAssessmentDraftSchema.safeParse({
      ...draft,
      subject: { ...ref, revision: Number.MAX_SAFE_INTEGER + 1 },
    }).success,
    false,
  );
  assert.equal(
    organizationalAssessmentDraftSchema.safeParse({ ...draft, contextDigest: "b".repeat(64), authorized: true })
      .success,
    false,
  );
  assert.equal(
    organizationalAssessmentDraftSchema.safeParse({ ...draft, evidence: [...draft.evidence, ...draft.evidence] })
      .success,
    false,
  );
});

test("rank experiment remains exactly unchanged when disabled or unknown", () => {
  for (let i = 0; i <= 100; i++) {
    const base = i / 100;
    assert.equal(candidateRank(base, { positive: 1, negative: 0 }, false), base);
    assert.equal(candidateRank(base, { positive: null, negative: 1 }, true), base);
  }
  assert.equal(candidateRank(0.6, undefined, true), 0.6);
  assert.throws(() => candidateRank(0.6, { positive: 1, negative: 0 }, true, 0.2));
});

test("three synthetic enterprise perspectives stay independent across seeds and holdouts", () => {
  // Independent scenario oracle, no provider output or factual/production claim.
  const scenarios = [
    {
      tenant: "synthetic-admin",
      local: { positive: 0.1, negative: 0.8 },
      global: { positive: 0.8, negative: 0.1 },
      directions: ["negative", "positive"],
    },
    {
      tenant: "synthetic-agency",
      local: { positive: 0.2, negative: 0.9 },
      global: { positive: null, negative: null },
      directions: ["negative", "unknown"],
    },
    {
      tenant: "synthetic-studio",
      local: { positive: 0.9, negative: 0.9 },
      global: { positive: 0.9, negative: 0.9 },
      directions: ["balanced", "balanced"],
    },
  ];
  for (const seed of [11, 23, 47, 59, 71, 89])
    for (const scenario of scenarios) {
      const make = (whole: string, pair: typeof scenario.local | typeof scenario.global) =>
        organizationalAssessmentDraftSchema.parse({
          ...draft,
          subject: { ...ref, tenantId: scenario.tenant, id: "resource-" + seed },
          whole: { ...ref, tenantId: scenario.tenant, id: whole },
          goal: { ...ref, tenantId: scenario.tenant, id: "goal-" + whole },
          evidence: [{ ...draft.evidence[0], tenantId: scenario.tenant }],
          ...pair,
        });
      const local = make("department", scenario.local),
        global = make("company", scenario.global);
      assert.equal(
        describePair({ positive: local.positive, negative: local.negative }).direction,
        scenario.directions[0],
      );
      assert.equal(
        describePair({ positive: global.positive, negative: global.negative }).direction,
        scenario.directions[1],
      );
      assert.notDeepEqual(local.whole, global.whole);
    }
});
