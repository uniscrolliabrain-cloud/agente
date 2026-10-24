// ASSIGNMENT_SERVICE_V1 - delegacion controlada con PDP y withWrite.
import type { PolicyContext, PolicyDecisionPoint, PolicyTarget } from "../authz/pdp.ts";
import type { Assignment, AssignmentKind } from "../../../../../../packages/domain/src/assignment.ts";
import type { Store } from "../../db.ts";
import type { EventBus } from "../events/index.ts";
import { AppError } from "../../errors.ts";
import { withWrite } from "../authz/with-write.ts";
import type { AssignmentRegistry } from "./registry.ts";

export interface AssignmentServiceDeps {
  pdp: PolicyDecisionPoint;
  db: Store;
  registry: AssignmentRegistry;
  bus?: EventBus;
}

export class AssignmentService {
  constructor(private readonly deps: AssignmentServiceDeps) {}

  async assign(ctx: PolicyContext, kind: AssignmentKind, recordId: string, assignedTo: string | null, assignedBy: string): Promise<Assignment> {
    if (assignedBy !== ctx.actor.id) {
      throw new AppError("assignedBy must equal ctx.actor.id", 403);
    }
    const adapter = this.deps.registry.get(kind);
    const target: PolicyTarget = { ownerId: ctx.actor.id, assignedBy };
    const d1 = await this.deps.pdp.can(ctx, "assign", kind as never, undefined, target);
    if (d1 === "deny") throw new AppError("Forbidden: assign", 403);
    const updated = await withWrite(
      { pdp: this.deps.pdp, db: this.deps.db },
      ctx,
      kind,
      recordId,
      (record) => {
        if (!record) throw new AppError("Not found", 404);
        return adapter.applyAssignment(record as never, { assignedTo, assignedBy } as never);
      },
    );
    return adapter.toAssignment(updated as never, ctx.tenantId);
  }

  async accept(ctx: PolicyContext, kind: AssignmentKind, recordId: string): Promise<Assignment> {
    return this.transition(ctx, kind, recordId, "running");
  }
  async reject(ctx: PolicyContext, kind: AssignmentKind, recordId: string): Promise<Assignment> {
    return this.transition(ctx, kind, recordId, "cancelled");
  }
  async approve(ctx: PolicyContext, kind: AssignmentKind, recordId: string): Promise<Assignment> {
    return this.transition(ctx, kind, recordId, "succeeded");
  }
  async complete(ctx: PolicyContext, kind: AssignmentKind, recordId: string): Promise<Assignment> {
    const d = await this.deps.pdp.can(ctx, "execute", kind as never, undefined, { ownerId: ctx.actor.id });
    if (d === "deny") throw new AppError("Forbidden: execute", 403);
    return this.transition(ctx, kind, recordId, "succeeded");
  }
  async escalate(ctx: PolicyContext, kind: AssignmentKind, recordId: string, toActorId: string, reason: string): Promise<Assignment> {
    const d = await this.deps.pdp.can(ctx, "escalate", kind as never, undefined, { ownerId: ctx.actor.id, assignedBy: toActorId });
    if (d === "deny") throw new AppError("Forbidden: escalate", 403);
    if (!toActorId || !reason) throw new AppError("toActorId and reason required", 422);
    return this.transition(ctx, kind, recordId, "running");
  }
  async reassign(ctx: PolicyContext, kind: AssignmentKind, recordId: string, newAssignedTo: string | null): Promise<Assignment> {
    return this.assign(ctx, kind, recordId, newAssignedTo, ctx.actor.id);
  }

  private async transition(ctx: PolicyContext, kind: AssignmentKind, recordId: string, status: string): Promise<Assignment> {
    const adapter = this.deps.registry.get(kind);
    const updated = await withWrite(
      { pdp: this.deps.pdp, db: this.deps.db },
      ctx,
      kind,
      recordId,
      (record) => {
        if (!record) throw new AppError("Not found", 404);
        return adapter.applyStatus(record as never, status as never);
      },
    );
    return adapter.toAssignment(updated as never, ctx.tenantId);
  }
}
