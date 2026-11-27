// TRANS06_TRUTH_CASES_V1 - los cuatro casos que definen la verdad, sobre el codigo vigente.
import assert from "node:assert/strict";
import { test } from "node:test";
import { TruthResolver } from "../apps/server/src/engine/business/truth-resolver.ts";
import {
  classificationV2Schema,
  cognitiveRecordSchema,
  slowOutputSchema,
} from "../packages/domain/src/cognition-v2.ts";
import { diagnose, render } from "../scripts/trans06-truth-diagnose.ts";

const NOW = Date.parse("2026-11-27T12:00:00Z");
const resolver = () => new TruthResolver(() => NOW);
const card = { tenantId: "tenant-a", kind: "card" as const, id: "card-1", revision: 1 };
const receipt = { tenantId: "tenant-a", kind: "receipt" as const, id: "receipt-1", revision: 1 };

function record(over: Record<string, unknown> = {}) {
  return {
    schemaVersion: "2.0" as const,
    id: "record-1",
    tenantId: "tenant-a",
    revision: 1,
    kind: "claim" as const,
    title: "Estado de la cuenta",
    body: "Dato sintetico de prueba.",
    epistemic: "inference" as const,
    evidence: [card],
    sourceEventId: "event-1",
    sourceRevision: 1,
    visibility: {
      tenantId: "tenant-a",
      ownerActorId: "owner-1",
      scope: "private" as const,
      allowedActorIds: [],
      policyRevision: "policy-1",
    },
    signals: { relevance: 0.5, confidence: 0.5, novelty: 0.5, urgency: 0.5, contradiction: 0 },
    lifecycle: "active" as const,
    createdAt: "2026-11-27T10:00:00Z",
    ...over,
  };
}

// --- Caso 1: contradiccion -------------------------------------------------
test("two disagreeing sources keep the loser visible instead of resolving in silence", () => {
  const crm = {
    field: "status",
    value: "active",
    source: "crm",
    observedAt: "2026-11-27T10:00:00Z",
    reliability: 0.9,
    confidence: 0.9,
    kind: "fact" as const,
  };
  const erp = { ...crm, value: "overdue", source: "erp", reliability: 0.7, confidence: 0.7 };
  const result = resolver().resolve("status", [crm, erp]);
  assert.equal(result.value, "active");
  assert.equal(result.wasConflict, true);
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].source, "erp");
  assert.equal(result.conflicts[0].value, "overdue");
  assert.equal(result.conflicts[0].observedAt, "2026-11-27T10:00:00Z");
  // el conflicto no se degrada a "hecho verificado" ni se oculta
  assert.equal(result.kind, "fact");
  assert.notEqual(result.value, result.conflicts[0].value);
  // el ganador no depende del orden de entrada
  assert.equal(resolver().resolve("status", [erp, crm]).value, "active");
});

test("agreement between the same value is not reported as a conflict", () => {
  const base = {
    field: "status",
    value: "active",
    source: "crm",
    observedAt: "2026-11-27T10:00:00Z",
    reliability: 0.9,
    confidence: 0.9,
    kind: "fact" as const,
  };
  const result = resolver().resolve("status", [base, { ...base, source: "erp", reliability: 0.6 }]);
  assert.equal(result.wasConflict, false);
  assert.equal(result.conflicts.length, 0);
});

// --- Caso 2: ambiguedad de proveedor --------------------------------------
test("an ambiguous provider answer cannot be promoted to a fact", () => {
  const ambiguous = classificationV2Schema.parse({
    classifier: "jev",
    version: "v1",
    labels: ["uncertain"],
    uncertainty: 0.9,
    review: "proposed",
    fallbackReason: "timeout",
  });
  assert.equal(ambiguous.review, "proposed");
  assert.equal(ambiguous.fallbackReason, "timeout");
  // la clasificacion ambigua puede viajar como inferencia...
  assert.equal(cognitiveRecordSchema.safeParse(record({ classification: ambiguous })).success, true);
  // ...pero no como hecho verificado: falta el receipt
  const promoted = cognitiveRecordSchema.safeParse(
    record({ classification: ambiguous, epistemic: "verified_fact" }),
  );
  assert.equal(promoted.success, false);
  assert.match(JSON.stringify(promoted.error?.issues), /verified fact requires receipt/);
});

test("provider output is limited to hypothesis, inference or unknown", () => {
  for (const epistemic of ["reported_fact", "verified_fact", "contradicted"]) {
    assert.equal(
      slowOutputSchema.safeParse({ title: "t", body: "b", epistemic, evidence: [card] }).success,
      false,
    );
  }
  for (const epistemic of ["hypothesis", "inference", "unknown"]) {
    assert.equal(
      slowOutputSchema.safeParse({ title: "t", body: "b", epistemic, evidence: [card] }).success,
      true,
    );
  }
});

// --- Caso 3: repeticion ----------------------------------------------------
test("the same inference repeated many times never becomes a fact", () => {
  const inference = {
    field: "status",
    value: "probablemente cancelada",
    source: "jev",
    observedAt: "2026-11-27T11:00:00Z",
    reliability: 0.8,
    confidence: 0.55,
    kind: "inference" as const,
  };
  const once = resolver().resolve("status", [inference]);
  const many = resolver().resolve("status", Array.from({ length: 50 }, () => ({ ...inference })));
  assert.equal(many.kind, "inference");
  assert.equal(many.value, once.value);
  assert.equal(many.source, "jev");
  // la repeticion no agrega certeza: la confianza es la declarada, no 1
  assert.equal(many.confidence, 0.55);
  assert.equal(many.wasConflict, false);
  assert.equal(many.conflicts.length, 0);
});

test("repetition from many sources is bounded conflict evidence, still not a fact", () => {
  const base = {
    field: "status",
    value: "probablemente cancelada",
    observedAt: "2026-11-27T11:00:00Z",
    reliability: 0.8,
    confidence: 0.55,
    kind: "inference" as const,
  };
  const many = resolver().resolve(
    "status",
    Array.from({ length: 30 }, (_, i) => ({
      ...base,
      source: `jev-${i}`,
      value: `probablemente cancelada (${i})`,
    })),
  );
  assert.equal(many.kind, "inference");
  // el resolver acota los conflictos y no acumula autoridad
  assert.equal(many.conflicts.length, 10);
  assert.equal(many.wasConflict, true);
});

// --- Caso 4: correccion ----------------------------------------------------
test("a corrected fact wins and the superseded value stays visible", () => {
  const old = {
    field: "status",
    value: "active",
    source: "crm",
    observedAt: "2026-11-01T00:00:00Z",
    reliability: 1,
    confidence: 1,
    kind: "fact" as const,
  };
  const corrected = {
    ...old,
    value: "cancelled",
    observedAt: "2026-11-26T00:00:00Z",
    reliability: 0.9,
    confidence: 0.9,
  };
  const result = resolver().resolve("status", [old, corrected]);
  assert.equal(result.value, "cancelled");
  assert.equal(result.wasConflict, true);
  assert.equal(result.conflicts[0].value, "active");
  assert.equal(result.conflicts[0].observedAt, "2026-11-01T00:00:00Z");
});

test("a stale inference cannot displace a fresh fact even at maximum reliability", () => {
  const fact = {
    field: "status",
    value: "active",
    source: "crm",
    observedAt: "2026-11-26T00:00:00Z",
    reliability: 0.9,
    confidence: 0.9,
    kind: "fact" as const,
  };
  const staleInference = {
    field: "status",
    value: "cancelada",
    source: "jev",
    observedAt: "2026-01-01T00:00:00Z",
    reliability: 1,
    confidence: 1,
    kind: "inference" as const,
  };
  const result = resolver().resolve("status", [fact, staleInference]);
  assert.equal(result.value, "active");
  assert.equal(result.kind, "fact");
  assert.equal(result.conflicts[0].value, "cancelada");
});

// --- Autoridad -------------------------------------------------------------
test("an inference never raises privileges: verified facts need their own receipt", () => {
  // sin receipt, ni una inferencia ni una propuesta pueden ser hecho verificado
  assert.equal(cognitiveRecordSchema.safeParse(record({ epistemic: "verified_fact" })).success, false);
  // con receipt el mismo registro si es un hecho verificado
  assert.equal(
    cognitiveRecordSchema.safeParse(record({ epistemic: "verified_fact", evidence: [receipt] })).success,
    true,
  );
  // el receipt debe ser del mismo tenant
  assert.equal(
    cognitiveRecordSchema.safeParse(
      record({
        epistemic: "verified_fact",
        evidence: [{ ...receipt, tenantId: "tenant-b" }],
      }),
    ).success,
    false,
  );
  // una inferencia conserva su estado epistémico al resolverse
  const inference = {
    field: "status",
    value: "probablemente cancelada",
    source: "jev",
    observedAt: "2026-11-27T11:00:00Z",
    reliability: 0.9,
    confidence: 0.9,
    kind: "inference" as const,
  };
  assert.equal(resolver().resolve("status", [inference]).kind, "inference");
});

// --- Diagnostico operativo -------------------------------------------------
test("diagnosis reports provenance, absence of receipt and no authority", () => {
  const candidates = [
    {
      field: "status",
      value: "active",
      source: "crm",
      observedAt: "2026-11-27T10:00:00Z",
      reliability: 0.9,
      confidence: 0.9,
      kind: "fact" as const,
    },
    {
      field: "status",
      value: "overdue",
      source: "erp",
      observedAt: "2026-11-27T09:00:00Z",
      reliability: 0.7,
      confidence: 0.7,
      kind: "inference" as const,
    },
  ];
  const diagnosis = diagnose("status", candidates, NOW);
  assert.equal(diagnosis.value, "active");
  assert.equal(diagnosis.source, "crm");
  assert.equal(diagnosis.observedAt, "2026-11-27T10:00:00Z");
  assert.equal(diagnosis.epistemic, "hecho_declarado");
  assert.equal(diagnosis.receipt, null);
  assert.equal(diagnosis.authority, "none");
  assert.equal(diagnosis.verifiedFact, false);
  assert.equal(diagnosis.wasConflict, true);
  assert.equal(diagnosis.conflicts[0].source, "erp");
  assert.equal(diagnosis.conflicts[0].epistemic, "inferencia");
  // el texto humano no vuelca el candidato completo ni datos personales
  const text = render(diagnosis);
  assert.match(text, /Receipt: ausente/);
  assert.match(text, /Autoridad: ninguna/);
  assert.equal(text.includes("owner"), false);
});

test("diagnosis rejects malformed candidates instead of scoring them", () => {
  assert.throws(() =>
    diagnose(
      "status",
      [
        {
          field: "status",
          value: "active",
          source: "crm",
          observedAt: "no-es-fecha",
          reliability: 0.9,
          confidence: 0.9,
          kind: "fact",
        },
      ],
      NOW,
    ),
  );
});
