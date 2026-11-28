import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { createApp } from "../apps/server/src/app.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { testConfig } from "./helpers/config.ts";
import { record } from "./fixtures/cognition-v2/record.ts";

test("createApp mounts supplied JEV tenant policy into the existing Slow pipeline", async () => {
  const saved = { tenants: process.env.COGNITION_V2_TENANTS, key: process.env.OPENROUTER_API_KEY };
  process.env.COGNITION_V2_TENANTS = "A";
  process.env.OPENROUTER_API_KEY = "synthetic-jev-key";
  const db = await createStore(),
    dataDir = await mkdtemp(join(tmpdir(), "jev-app-"));
  let server: Awaited<ReturnType<typeof createApp>> | undefined,
    calls = 0;
  try {
    const config = testConfig({ dataDir });
    server = await createApp(db, config, {
      jevEgressPolicies: new Map([
        [
          "A",
          {
            authorize: async () => ({
              consentId: "synthetic-consent",
              revision: "1",
              expiresAt: "2099-01-01T00:00:00Z",
              maxDailyRequests: 5,
              maxInFlight: 1,
            }),
            minimize: async () => "MINIMIZED SYNTHETIC CANDIDATE",
          },
        ],
      ]),
      jevTransport: async (url, options) => {
        calls++;
        assert.equal(String(url), "https://openrouter.ai/api/alpha/decisions");
        assert.equal(new Headers(options?.headers).get("authorization"), "Bearer synthetic-jev-key");
        const request = JSON.parse(String(options?.body));
        return Response.json({
          model: request.model,
          answers: Object.fromEntries(
            Object.entries(request.questions).map(([name, question]) => {
              const choice = name === "family" ? "risk" : "unknown";
              return [
                name,
                {
                  type: "choice",
                  choice,
                  confidence: 0.8,
                  probabilities: Object.fromEntries(
                    Object.keys((question as { criteria: object }).criteria).map((key) => [
                      key,
                      Number(key === choice),
                    ]),
                  ),
                },
              ];
            }),
          ),
          usage: { input_tokens: 1, output_tokens: 1, cost: 0.00001 },
        });
      },
    });
    const user = await server.users.create({
      email: "jev@synthetic.invalid",
      password: "synthetic-password-long",
      name: "Synthetic",
      role: "admin",
    });
    await new TenantService(db, config).addMembership(user.id, "A", "member");
    const runtime = server.agent.cognitionV2!;
    const identity = await runtime.identity("A", user.id, user.id, "chat");
    const source = record("A", user.id, "synthetic-source");
    source.visibility.policyRevision = identity.policyRevision;
    await runtime.context.projections.apply(source, "1");
    runtime.provider.infer = async (input) => ({
      title: "Synthetic",
      body: "Possible risk",
      epistemic: "hypothesis",
      evidence: input.evidence,
    });
    const job = await runtime.slow.enqueue(
      { identity, prompt: "Assess fixture", evidence: [{ tenantId: "A", kind: "card", id: source.id, revision: 1 }] },
      "app-router",
    );
    await runtime.slow.tick("A");
    await runtime.projector.tick("A");
    const card = await runtime.context.resolve(identity, `slow:${job.id}`);
    assert.equal(calls, 1);
    assert.equal(card?.classification?.providerEvidence?.provider, "openrouter");
    assert.equal(card?.epistemic, "hypothesis");
  } finally {
    await server?.agent.stop();
    await db.close();
    await rm(dataDir, { recursive: true, force: true });
    for (const [name, value] of [
      ["COGNITION_V2_TENANTS", saved.tenants],
      ["OPENROUTER_API_KEY", saved.key],
    ]) {
      if (value === undefined) delete process.env[name!];
      else process.env[name!] = value;
    }
  }
});
