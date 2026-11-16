import { z } from "zod";
import { actorSchema, type Actor } from "../../../../../../packages/domain/src/actor.ts";
import { executionContextSchema } from "../../../../../../packages/domain/src/execution-context.ts";
import { capabilityContractSchema } from "../../../../../../packages/domain/src/capability.ts";
import { planStepSchema } from "../../../../../../packages/domain/src/plan.ts";
import type { CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { TenantScopedStore } from "../../../db-tenant.ts";
import { runInTenantScope } from "../../../tenant-scope.ts";
import type { PolicyDecisionPoint } from "../../authz/pdp.ts";
import { CapabilityRegistry } from "../../capabilities/registry.ts";
import { CapabilityRunner } from "../../execution/capability-runner.ts";
import type { ToolExecutor } from "../../execution/tool-executors.ts";
import { digest } from "./storage.ts";

const requestSchema = z.strictObject({ operationId: z.string().min(1).max(100), capability: z.literal("read_workspace"), input: z.strictObject({}) });
type Receipt = { id: string; tenantId: string; actorId: string; capability: string; binding: string; state: "started" | "completed" | "unknown" };

/** Internal opt-in seam, not a chat tool or public endpoint. Only read_workspace is admitted. */
export class CognitionBusinessRead {
  constructor(private readonly records: TenantScopedStore,
    private readonly resolveIdentity: (identity: CognitiveIdentity) => Promise<CognitiveIdentity>,
    private readonly resolveActor: (identity: CognitiveIdentity) => Promise<Actor | null>,
    private readonly pdp: PolicyDecisionPoint, private readonly registry: CapabilityRegistry,
    private readonly executors: Map<string, ToolExecutor>) {}

  async run(identity: CognitiveIdentity, raw: unknown): Promise<{ receiptId: string; state: "completed" }> {
    const request = requestSchema.parse(raw);
    return runInTenantScope({ tenantId: identity.tenantId, actorId: identity.actorId }, async () => {
      const authorize = async () => {
        const current = await this.resolveIdentity(identity);
        if (digest(current) !== digest(identity) || identity.owner !== identity.actorId) throw Error("BUSINESS_IDENTITY_DENIED");
        const actor = actorSchema.parse(await this.resolveActor(identity));
        if (!actor.active || actor.kind !== "human" || actor.id !== identity.actorId || actor.userId !== identity.actorId || actor.tenantId !== identity.tenantId) throw Error("BUSINESS_ACTOR_DENIED");
        if (await this.pdp.can({ tenantId: identity.tenantId, actor }, "read", "project", undefined, { ownerId: identity.owner }) !== "allow") throw Error("BUSINESS_PDP_DENIED");
        const capability = capabilityContractSchema.parse(await this.registry.get(request.capability));
        if (capability.kind !== "tool" || capability.requiresApproval || capability.risk !== "low" || capability.sideEffects.length !== 1 ||
          capability.sideEffects[0].kind !== "read" || capability.sideEffects[0].target !== "workspace" || !this.executors.has(request.capability)) throw Error("BUSINESS_CAPABILITY_DENIED");
        return capability;
      };
      const capability = await authorize();
      const id = digest([identity.tenantId, identity.actorId, request.operationId]);
      const binding = digest([identity, request, capability]);
      const receipt: Receipt = { id, tenantId: identity.tenantId, actorId: identity.actorId, capability: capability.id, binding, state: "started" };
      const existing = await this.records.insertIfAbsent(identity.actorId, "cognition-v2-business-receipts", receipt);
      if (!existing) {
        const previous = await this.records.get<Receipt>(identity.actorId, "cognition-v2-business-receipts", id);
        if (!previous || previous.binding !== binding) throw Error("BUSINESS_OPERATION_CONFLICT");
        if (previous.state === "completed") return { receiptId: id, state: "completed" as const };
        throw Error("BUSINESS_OUTCOME_UNKNOWN");
      }
      try {
        const checked = await authorize();
        if (digest(checked) !== digest(capability)) throw Error("BUSINESS_POLICY_CHANGED");
        const ctx = executionContextSchema.parse({ tenantId: identity.tenantId, owner: identity.owner, actorId: identity.actorId, role: "user", requestId: request.operationId });
        const step = planStepSchema.parse({ id: request.operationId, title: "Read workspace", capabilityId: request.capability, inputs: {}, dependsOn: [] });
        // Pin the checked contract: a mutable global registry cannot swap it after authorization.
        const pinned = new CapabilityRegistry();
        pinned.register(checked);
        const executor = this.executors.get(request.capability);
        if (!executor) throw Error("BUSINESS_CAPABILITY_DENIED");
        await new CapabilityRunner(pinned, new Map([[request.capability, executor]])).run(ctx, step);
        await this.records.put(identity.actorId, "cognition-v2-business-receipts", { ...receipt, state: "completed" });
        return { receiptId: id, state: "completed" as const };
      } catch (error) {
        // Failure can follow execution or a lost commit ACK: never auto-retry.
        await this.records.put(identity.actorId, "cognition-v2-business-receipts", { ...receipt, state: "unknown" }).catch(() => {});
        throw error;
      }
    });
  }
}
