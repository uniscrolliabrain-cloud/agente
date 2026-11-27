import assert from "node:assert/strict";
import { test } from "node:test";
import {
  OpenRouterJevClassifier,
  openRouterJevFromEnvironment,
  type JevEgressGate,
  type JevEgressGrant,
} from "../apps/server/src/engine/cognition/v2/jev-classifier.ts";
import type { SemanticEvaluationContext } from "../apps/server/src/engine/cognition/v2/slow.ts";
import { classificationV2Schema } from "../packages/domain/src/cognition-v2.ts";
import { digest } from "../apps/server/src/engine/cognition/v2/storage.ts";
const scope: SemanticEvaluationContext = {
  identity: { tenantId: "A", actorId: "alice", owner: "alice", purpose: "chat", policyRevision: "1" },
  evidence: [{ tenantId: "A", kind: "card", id: "private-source", revision: 1 }],
  contextDigest: "private-context",
  ontologyId: "agntiapro.cards",
  ontologyVersion: "1.0.0",
  operationId: "operation",
};
class Gate implements JevEgressGate {
  results: Parameters<JevEgressGate["record"]>[1][] = [];
  revoked = false;
  async prepare(
    body: string,
    s: SemanticEvaluationContext,
    _signal: AbortSignal,
    target: Parameters<JevEgressGate["prepare"]>[3],
  ): Promise<JevEgressGrant> {
    return {
      ...target,
      receiptId: "synthetic-egress",
      text: "MINIMIZED FIXTURE",
      sourceDigest: digest(body),
      contextDigest: s.contextDigest,
      evidenceDigest: digest(s.evidence),
      policyRevision: s.identity.policyRevision,
      expiresAt: "2099-01-01T00:00:00Z",
    };
  }
  async isCurrent() {
    return !this.revoked;
  }
  async record(_grant: JevEgressGrant, result: Parameters<JevEgressGate["record"]>[1]) {
    this.results.push(result);
  }
}
function answer(request: { questions: Record<string, { criteria: Record<string, string> }> }) {
  return {
    id: "synthetic-generation",
    provider: "TypeSafe",
    model: "typesafe/jev-1.14-20261101",
    answers: Object.fromEntries(
      Object.entries(request.questions).map(([name, q]) => {
        const choice = name === "family" ? "risk" : "unknown";
        return [
          name,
          {
            type: "choice",
            choice,
            confidence: 0.8,
            probabilities: Object.fromEntries(Object.keys(q.criteria).map((key) => [key, Number(key === choice)])),
          },
        ];
      }),
    ),
    usage: {
      input_tokens: 42,
      output_tokens: 7,
      cost: 0.00001,
      is_byok: false,
      input_tokens_details: { cached_tokens: 0 },
    },
  };
}

test("OpenRouter Decisions keeps the JEV contract, minimized source, canonical model and actual billed cost", async () => {
  const gate = new Gate();
  let calls = 0;
  const adapter = new OpenRouterJevClassifier(
    { apiKey: "jev-only-key", allowedTenants: new Set(["A"]) },
    gate,
    async (url, options) => {
      calls++;
      assert.equal(String(url), "https://openrouter.ai/api/alpha/decisions");
      assert.equal(options?.redirect, "error");
      assert.equal(new Headers(options?.headers).get("Authorization"), "Bearer jev-only-key");
      const payload = JSON.parse(String(options?.body));
      assert.equal(payload.model, "typesafe/jev-1.14");
      assert.deepEqual(payload.state, { candidate: "MINIMIZED FIXTURE" });
      assert.equal(Object.keys(payload.questions).length, 7);
      for (const privateValue of ["PRIVATE BODY", "private-source", "private-context", "alice", "jev-only-key"])
        assert.ok(!String(options?.body).includes(privateValue));
      return Response.json(answer(payload));
    },
  );
  const result = classificationV2Schema.parse(
    await adapter.classify("PRIVATE BODY", new AbortController().signal, scope),
  );
  assert.equal(calls, 1);
  assert.equal(result.providerEvidence?.provider, "openrouter");
  assert.equal(result.providerEvidence?.model, "typesafe/jev-1.14-20261101");
  assert.equal(result.providerEvidence?.usage.cost, 0.00001);
  assert.equal(result.review, "proposed");
  assert.equal(result.uncertainty, 1);
  assert.equal(result.ontology?.profile.business_orientation.expand, null);
  assert.equal(gate.results[0].usage?.cost, 0.00001);
  assert.ok(!JSON.stringify(adapter).includes("jev-only-key"));
});

test("old underscored OpenRouter key never silently funds JEV", async () => {
  const gate = new Gate();
  assert.throws(
    () => openRouterJevFromEnvironment(gate, new Set(["A"]), { OPEN_ROUTER_API_KEY: "slow-key" }),
    /UNCONFIGURED/,
  );
  const adapter = openRouterJevFromEnvironment(
    gate,
    new Set(["A"]),
    { OPENROUTER_API_KEY: "jev-key", OPEN_ROUTER_API_KEY: "slow-key" },
    async (_url, options) => {
      assert.equal(new Headers(options?.headers).get("Authorization"), "Bearer jev-key");
      return Response.json(answer(JSON.parse(String(options?.body))));
    },
  );
  await adapter.classify("fixture", new AbortController().signal, scope);
});

test("cross-provider grant, model drift, refusal and invalid probabilities fail closed", async () => {
  let calls = 0;
  const forged = new (class extends Gate {
    override async prepare(...args: Parameters<Gate["prepare"]>) {
      return { ...(await super.prepare(...args)), provider: "typesafe" as const };
    }
  })();
  await assert.rejects(
    new OpenRouterJevClassifier({ apiKey: "synthetic", allowedTenants: new Set(["A"]) }, forged, async () => {
      calls++;
      throw Error("no call");
    }).classify("fixture", new AbortController().signal, scope),
    /EGRESS_DENIED/,
  );
  assert.equal(calls, 0);
  for (const mutate of [
    (result: ReturnType<typeof answer>) => ({ ...result, model: "typesafe/jev-1.13-20260917" }),
    (result: ReturnType<typeof answer>) => ({ ...result, answers: { ...result.answers, family: { type: "refusal" } } }),
    (result: ReturnType<typeof answer>) => ({ ...result, usage: { ...result.usage, cost: -1 } }),
  ]) {
    const gate = new Gate();
    const adapter = new OpenRouterJevClassifier(
      { apiKey: "synthetic", allowedTenants: new Set(["A"]) },
      gate,
      async (_url, options) => Response.json(mutate(answer(JSON.parse(String(options?.body))))),
    );
    await assert.rejects(adapter.classify("fixture", new AbortController().signal, scope));
    assert.equal(gate.results[0].state, "failed");
  }
});

test("revocation and HTTP 429 do not retry, and credentials cannot enter failure receipts", async () => {
  const gate = new Gate();
  let calls = 0;
  const adapter = new OpenRouterJevClassifier(
    { apiKey: "synthetic-private", allowedTenants: new Set(["A"]) },
    gate,
    async () => {
      calls++;
      return new Response("synthetic-private", { status: 429 });
    },
  );
  await assert.rejects(adapter.classify("fixture", new AbortController().signal, scope), /JEV_HTTP_429/);
  assert.equal(calls, 1);
  assert.ok(!JSON.stringify(gate.results).includes("synthetic-private"));
  const revoked = new Gate();
  await assert.rejects(
    new OpenRouterJevClassifier(
      { apiKey: "synthetic", allowedTenants: new Set(["A"]) },
      revoked,
      async (_url, options) => {
        revoked.revoked = true;
        return Response.json(answer(JSON.parse(String(options?.body))));
      },
    ).classify("fixture", new AbortController().signal, scope),
    /EGRESS_REVOKED/,
  );
});

test("OpenRouter uses the existing durable gate and replay never bills the same operation twice", async () => {
  const { createStore } = await import("../apps/server/src/db.ts");
  const { installCognitionV2, CognitiveProjectionStore } = await import(
    "../apps/server/src/engine/cognition/v2/storage.ts"
  );
  const { ContextServingFacade } = await import("../apps/server/src/engine/cognition/v2/context.ts");
  const { DurableJevEgressGate } = await import("../apps/server/src/engine/cognition/v2/jev-egress.ts");
  const { record } = await import("./fixtures/cognition-v2/record.ts");
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const store = new CognitiveProjectionStore(db);
    await store.apply(record(), "1");
    const context = new ContextServingFacade(store, { authorize: async () => true });
    const gate = new DurableJevEgressGate(db, context, "A", {
      authorize: async (_scope, target) => {
        assert.equal(target.provider, "openrouter");
        return {
          consentId: "synthetic-consent",
          revision: "1",
          expiresAt: "2099-01-01T00:00:00Z",
          maxDailyRequests: 10,
          maxInFlight: 1,
        };
      },
      minimize: async () => "MINIMIZED FIXTURE",
    });
    const scoped = { ...scope, evidence: [{ tenantId: "A", kind: "card" as const, id: "card-1", revision: 1 }] };
    let calls = 0;
    const adapter = new OpenRouterJevClassifier(
      { apiKey: "synthetic", allowedTenants: new Set(["A"]) },
      gate,
      async (_url, options) => {
        calls++;
        return Response.json(answer(JSON.parse(String(options?.body))));
      },
    );
    await adapter.classify("fixture", new AbortController().signal, scoped);
    await assert.rejects(adapter.classify("fixture", new AbortController().signal, scoped), /EGRESS_DENIED/);
    assert.equal(calls, 1);
    const [row] = await db.rawQuery<{ state: string; result: { usage: { cost: number } } }>(
      "SELECT state,result FROM cognition_v2_egress_receipts WHERE tenant='A'",
    );
    assert.equal(row.state, "succeeded");
    assert.equal(row.result.usage.cost, 0.00001);
  } finally {
    await db.close();
  }
});

test("runtime composition invokes OpenRouter only through the supplied tenant consent policy", async () => {
  const { createStore } = await import("../apps/server/src/db.ts");
  const { CognitionV2Runtime } = await import("../apps/server/src/engine/cognition/v2/runtime.ts");
  const { installCognitionV2 } = await import("../apps/server/src/engine/cognition/v2/storage.ts");
  const { openRouterJevFactory } = await import("../apps/server/src/engine/cognition/v2/jev-composition.ts");
  const { TenantService } = await import("../apps/server/src/engine/tenant.ts");
  const { testConfig } = await import("./helpers/config.ts");
  const { record } = await import("./fixtures/cognition-v2/record.ts");
  const { persistentKernel } = await import("./fixtures/cognition-v2/kernel.ts");
  const db = await createStore();
  try {
    await installCognitionV2(db);
    const memberships = new TenantService(db, testConfig());
    await memberships.addMembership("alice", "A", "member");
    await db.put("system", "users", { id: "alice", data: { active: true } });
    let calls = 0;
    const factory = openRouterJevFactory(
      new Map([
        [
          "A",
          {
            authorize: async () => ({
              consentId: "synthetic-consent",
              revision: "1",
              expiresAt: "2099-01-01T00:00:00Z",
              maxDailyRequests: 10,
              maxInFlight: 1,
            }),
            minimize: async () => "MINIMIZED FIXTURE",
          },
        ],
      ]),
      { OPENROUTER_API_KEY: "jev-only-key" },
      async (_url, options) => {
        calls++;
        return Response.json(answer(JSON.parse(String(options?.body))));
      },
    );
    const runtime = new CognitionV2Runtime(
      db,
      db,
      new Set(["A"]),
      memberships,
      {
        stream: async () => {
          throw Error("UNEXPECTED_FAST_CALL");
        },
        infer: async (input) => ({
          title: "Synthetic hypothesis",
          body: "A possible risk",
          epistemic: "hypothesis",
          evidence: input.evidence,
        }),
      },
      factory,
    );
    const identity = await runtime.identity("A", "alice", "alice", "chat");
    const source = record();
    source.visibility.policyRevision = identity.policyRevision;
    await runtime.context.projections.apply(source, "1");
    const kernel = persistentKernel(db);
    runtime.slow.capture = (id, input) =>
      kernel.captureAsyncResult(
        { tenantId: id.tenantId, owner: id.owner, actorId: id.actorId, role: "system", requestId: input.operationId },
        input,
      );
    const job = await runtime.slow.enqueue(
      {
        identity,
        prompt: "Assess synthetic source",
        evidence: [{ tenantId: "A", kind: "card", id: source.id, revision: source.revision }],
      },
      "router-composition",
    );
    await runtime.slow.tick("A");
    await runtime.projector.tick("A");
    const card = await runtime.context.resolve(identity, `slow:${job.id}`);
    assert.equal(calls, 1);
    assert.equal(card?.classification?.providerEvidence?.provider, "openrouter");
    assert.equal(card?.epistemic, "hypothesis");
    const unconfigured = openRouterJevFactory(new Map(), {})(runtime.context);
    await assert.rejects(
      unconfigured.classify("fixture", new AbortController().signal, { ...scope, identity }),
      /EGRESS_DENIED/,
    );
  } finally {
    await db.close();
  }
});
