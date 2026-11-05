import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveTaskModels } from "../../../apps/server/src/engine/model.ts";
import type { AgentService } from "../../../apps/server/src/engine/service.ts";
import { runInTenantScope } from "../../../apps/server/src/tenant-scope.ts";
import type { AgentTask } from "../../../packages/domain/src/agent.ts";

test("task model credentials come from the authorized tenant and specialist", async () => {
  const owner = "same-user";
  const scope = { tenantId: "company-b", actorId: "requester" };
  const task = {
    id: "work",
    tenantId: scope.tenantId,
    requestedBy: scope.actorId,
    executionContext: { ...scope, owner },
    state: { roleId: "sales" },
  } as AgentTask;
  const endpoint = process.env.GOOGLE_GENERATIVE_AI_BASE_URL;
  const sales = { provider: "google", model: "sales-model", apiKey: "fixture-sales", baseUrl: endpoint };
  const slow = { provider: "google", model: "slow-model", apiKey: "fixture-slow", baseUrl: endpoint };
  let selectedTenant = scope.tenantId;
  const service = {
    config: { model: "openai/shared-model" },
    kernel: {
      config: async (ctx: { tenantId: string; owner: string; actorId: string }) => {
        assert.equal(ctx.tenantId, "company-b");
        assert.equal(ctx.owner, owner);
        assert.equal(ctx.actorId, "sales");
        return { tenantId: selectedTenant, roles: { sales }, slow };
      },
    },
  } as unknown as AgentService;

  await assert.rejects(resolveTaskModels(service, owner, task), /validated task scope/);
  await runInTenantScope(scope, async () => {
    const models = await resolveTaskModels(service, owner, task);
    assert.deepEqual(models.chain, ["google/sales-model", "google/slow-model", "openai/shared-model"]);
    assert.equal(models.keyFor("google/sales-model"), "fixture-sales");
    assert.equal(models.keyFor("google/slow-model"), "fixture-slow");
    assert.equal(models.keyFor("openai/shared-model"), undefined);

    selectedTenant = "company-a";
    await assert.rejects(resolveTaskModels(service, owner, task), /does not match the task tenant/);
    selectedTenant = scope.tenantId;
    sales.baseUrl = endpoint === "https://different.invalid" ? "https://elsewhere.invalid" : "https://different.invalid";
    await assert.rejects(resolveTaskModels(service, owner, task), /provider or endpoint cannot be used/);
  });
});
