// BUILD_SERVICE_APPLY_V1
import type { Store } from "../db.ts";
import type { EventBus } from "./events/index.ts";

export interface BuildArtifactRecord {
  id: string;
  tenantId: string;
  owner: string;
  kind: "sop" | "capability" | "view" | "role" | "schema";
  status: "queued" | "running" | "ready_for_review" | "approved" | "applied" | "failed" | "escalated";
  payload: Record<string, unknown>;
  tests?: unknown[];
  logs?: string[];
  iterations?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyResult {
  buildId: string;
  kind: string;
  target: string;
  appliedAt: string;
}

export class BuildApplier {
  constructor(
    private readonly db: Store,
    private readonly bus?: EventBus,
  ) {}

  async apply(tenantId: string, buildId: string, actor: string): Promise<ApplyResult> {
    const build = await this.db.get<BuildArtifactRecord>(tenantId, "build-specs", buildId);
    if (!build) throw new Error(`Build not found: ${buildId}`);
    if (build.status !== "approved" && build.status !== "ready_for_review") {
      throw new Error(`Build ${buildId} not approved (status=${build.status})`);
    }
    // BUILD_APPLIER_APPROVAL_CHECK_V1

    let target = "";
    switch (build.kind) {
      case "sop": {
        const sop = build.payload as { id?: string };
        target = sop.id ?? buildId;
        await this.db.put(tenantId, "sops", { ...build.payload, id: target });
        break;
      }
      case "capability": {
        const cap = build.payload as { id?: string };
        target = cap.id ?? buildId;
        await this.db.put(tenantId, "capability-declarations", { ...build.payload, id: target });
        break;
      }
      case "view": {
        const view = build.payload as { id?: string };
        target = view.id ?? buildId;
        await this.db.put(tenantId, "view-declarations", { ...build.payload, id: target });
        break;
      }
      case "role": {
        const role = build.payload as { id?: string };
        target = role.id ?? buildId;
        await this.db.put(tenantId, "agent-roles", { ...build.payload, id: target });
        break;
      }
      case "schema": {
        const schema = build.payload as { id?: string };
        target = schema.id ?? "default";
        // BUILD_APPLIER_VALIDATES_SCHEMA_V1
        await this.db.put(tenantId, "business-schemas", { ...build.payload, id: target });
        break;
      }
      default:
        throw new Error(`Unknown build kind: ${build.kind}`);
    }

    await this.db.put(tenantId, "build-specs", {
      ...build,
      status: "applied",
      updatedAt: new Date().toISOString(),
    });

    // BUILD_APPLIER_EMIT_BUILD_APPLIED_V1
    await this.bus?.emit(tenantId, "build.applied" as never, { kind: "system", id: buildId }, {
      buildId,
      kind: build.kind,
      target,
      actor,
      action: "build.applied",
    }, { tenantId });

    return {
      buildId,
      kind: build.kind,
      target,
      appliedAt: new Date().toISOString(),
    };
  }
}