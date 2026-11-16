import { z } from "zod";
import { actorSchema, type Actor } from "../../../../../../packages/domain/src/actor.ts";
import { executionContextSchema } from "../../../../../../packages/domain/src/execution-context.ts";
import { capabilityContractSchema } from "../../../../../../packages/domain/src/capability.ts";
import { planStepSchema } from "../../../../../../packages/domain/src/plan.ts";
import { approvalRequestSchema, type ApprovalRequest } from "../../../../../../packages/domain/src/messaging.ts";
import type { CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { TenantScopedStore } from "../../../db-tenant.ts";
import { runInTenantScope } from "../../../tenant-scope.ts";
import type { PolicyDecisionPoint } from "../../authz/pdp.ts";
import { CapabilityRegistry } from "../../capabilities/registry.ts";
import { CapabilityRunner } from "../../execution/capability-runner.ts";
import type { ToolExecutor } from "../../execution/tool-executors.ts";
import { digest } from "./storage.ts";

const requestSchema = z.strictObject({
  operationId: z.string().min(1).max(100),
  capability: z.string().min(1).max(200),
  approvalId: z.string().min(1).max(100),
  input: z.record(z.string(), z.unknown()),
});
type Receipt = { id: string; tenantId: string; actorId: string; capability: string; binding: string; state: "started" | "completed" | "unknown" };

/** Internal opt-in seam for approved business writes. Not a chat tool or public endpoint.
 * Only capabilities named in `allowed` are admitted; an approved, unexpired and
 * payload-bound ApprovalRequest is consumed exactly once. */
export class CognitionBusinessWrite {
  constructor(private readonly records: TenantScopedStore,
    private readonly resolveIdentity: (identity: CognitiveIdentity) => Promise<CognitiveIdentity>,
    private readonly resolveActor: (identity: CognitiveIdentity) => Promise<Actor | null>,
    private readonly pdp: PolicyDecisionPoint, private readonly registry: CapabilityRegistry,
    private readonly executors: Map<string, ToolExecutor>, private readonly allowed: ReadonlySet<string>) {}

  async run(identity: CognitiveIdentity, raw: unknown): Promise<{ receiptId: string; state: "completed" }> {
    const request = requestSchema.parse(raw);
    if (!this.allowed.has(request.capability)) throw Error("BUSINESS_CAPABILITY_DENIED");
    return runInTenantScope({ tenantId: identity.tenantId, actorId: identity.actorId }, async () => {
      const authorize = async () => {
        const current = await this.resolveIdentity(identity);
        if (digest(current) !== digest(identity) || identity.owner !== identity.actorId) throw Error("BUSINESS_IDENTITY_DENIED");
        const actor = actorSchema.parse(await this.resolveActor(identity));
        if (!actor.active || actor.kind !== "human" || actor.id !== identity.actorId || actor.userId !== identity.actorId || actor.tenantId !== identity.tenantId) throw Error("BUSINESS_ACTOR_DENIED");
        if (await this.pdp.can({ tenantId: identity.tenantId, actor }, "execute", "project", undefined, { ownerId: identity.owner }) !== "allow") throw Error("BUSINESS_PDP_DENIED");
        const capability = capabilityContractSchema.parse(await this.registry.get(request.capability));
        if (capability.kind !== "tool" || !capability.requiresApproval || capability.risk === "low" || capability.sideEffects.length !== 1 ||
          !["write", "external_write"].includes(capability.sideEffects[0].kind) || !this.executors.has(request.capability)) throw Error("BUSINESS_CAPABILITY_DENIED");
        return capability;
      };
      const capability = await authorize();
      const id = digest([identity.tenantId, identity.actorId, request.operationId]);
      const binding = digest([identity, request, capability, request.approvalId]);
      const receipt: Receipt = { id, tenantId: identity.tenantId, actorId: identity.actorId, capability: capability.id, binding, state: "started" };
      // A repeated operationId is answered from its receipt before approval state:
      // the effect already happened, so a spent approval is not a new denial.
      const existing = await this.records.insertIfAbsent(identity.actorId, "cognition-v2-business-receipts", receipt);
      if (!existing) {
        const previous = await this.records.get<Receipt>(identity.actorId, "cognition-v2-business-receipts", id);
        if (!previous || previous.binding !== binding) throw Error("BUSINESS_OPERATION_CONFLICT");
        if (previous.state === "completed") return { receiptId: id, state: "completed" as const };
        throw Error("BUSINESS_OUTCOME_UNKNOWN");
      }
      let approval: ApprovalRequest, consumed: ApprovalRequest;
      try {
        const payloadHash = digest([request.capability, request.input]);
        approval = approvalRequestSchema.parse(await this.records.get(identity.actorId, "approval-requests", request.approvalId));
        // An approval only authorizes the exact payload and capability it reviewed.
        if (approval.tenantId !== identity.tenantId || approval.owner !== identity.owner ||
          approval.capabilityId !== request.capability || approval.payload.hash !== payloadHash) throw Error("BUSINESS_APPROVAL_MISMATCH");
        if (approval.status !== "approved" || Date.parse(approval.expiresAt) <= Date.now()) throw Error("BUSINESS_APPROVAL_INVALID");
        // ApprovalRequest.status stays within its own schema; single use is bound in
        // the payload. Approvals without the marker are refused rather than assumed fresh.
        if (!("consumedBy" in approval.payload)) throw Error("BUSINESS_APPROVAL_UNBOUND");
        if (approval.payload.consumedBy !== null) throw Error("BUSINESS_APPROVAL_CONSUMED");
        // Consume before the effect: a crash after execution must not leave the
        // approval reusable for a second write.
        const spent = await this.records.compareAndSwap<ApprovalRequest>(identity.actorId, "approval-requests", approval.id,
          { status: "approved", payload: { hash: payloadHash, consumedBy: null } }, { payload: { ...approval.payload, consumedBy: id } });
        if (!spent) throw Error("BUSINESS_APPROVAL_CONSUMED");
        consumed = spent;
      } catch (error) {
        // Nothing executed yet, so release the claim instead of reporting an
        // uncertain effect the caller could never retry.
        await this.records.remove(identity.actorId, "cognition-v2-business-receipts", id).catch(() => {});
        throw error;
      }
      try {
        const checked = await authorize();
        if (digest(checked) !== digest(capability)) throw Error("BUSINESS_POLICY_CHANGED");
        const ctx = executionContextSchema.parse({ tenantId: identity.tenantId, owner: identity.owner, actorId: identity.actorId, role: "user", requestId: request.operationId, sessionId: approval.id });
        const step = planStepSchema.parse({ id: request.operationId, title: `Write ${request.capability}`, capabilityId: request.capability, inputs: request.input, dependsOn: [] });
        // Pin the checked contract: a mutable global registry cannot swap it after authorization.
        const pinned = new CapabilityRegistry();
        pinned.register(checked);
        const executor = this.executors.get(request.capability);
        if (!executor) throw Error("BUSINESS_CAPABILITY_DENIED");
        // The runner's own approval gate reads `actions`; expose the consumed
        // ApprovalRequest there so both checks resolve to the same decision.
        const gate = {
          // The consumed approval is presented in the runner's execution vocabulary;
          // it is the same record, re-read, not a second approval.
          get: async (_tenant: string, kind: string, id: string) => kind === "actions" && id === approval.id
            ? { id: approval.id, status: "executing" }
            : await this.records.get(identity.actorId, kind, id),
          insertIfAbsent: (tenant: string, kind: string, value: { id: string } & Record<string, unknown>) => this.records.insertIfAbsent(identity.actorId, kind, value),
          put: (tenant: string, kind: string, value: { id: string } & Record<string, unknown>) => this.records.put(identity.actorId, kind, value),
        };
        await new CapabilityRunner(pinned, new Map([[request.capability, executor]]), undefined, undefined, gate).run(ctx, step);
        await this.records.put(identity.actorId, "cognition-v2-business-receipts", { ...receipt, state: "completed" });
        await this.records.put(identity.actorId, "approval-requests", { ...consumed, payload: { ...consumed.payload, outcome: "succeeded" } });
        return { receiptId: id, state: "completed" as const };
      } catch (error) {
        // The effect may already have landed: reconcile manually, never auto-retry.
        await this.records.put(identity.actorId, "cognition-v2-business-receipts", { ...receipt, state: "unknown" }).catch(() => {});
        await this.records.put(identity.actorId, "approval-requests", { ...consumed, payload: { ...consumed.payload, outcome: "unknown" } }).catch(() => {});
        throw error;
      }
    });
  }
}
