// WORKSPACES_ENGINE_BRIDGE_V1 - registra las capacidades de los 34 workspaces.
import type { WorkspaceModule } from "@openmuse/workspaces";
import type { CapabilityRegistry } from "../capabilities/registry.ts";

export function bridgeWorkspaceCapabilities(
  registry: CapabilityRegistry,
  modules: readonly WorkspaceModule[],
): number {
  let count = 0;
  for (const m of modules) {
    for (const c of m.capabilities) {
      registry.register({
        id: c.id,
        version: "1.0.0",
        name: c.title,
        description: c.description ?? c.title,
        kind: "tool",
        inputs: {},
        outputs: {},
        preconditions: [],
        sideEffects: [],
        permissions: [],
        risk: c.risk,
        cost: {},
        idempotency: "idempotent",
        retryable: false,
        compensatable: false,
        requiresApproval: c.requiresApproval ?? false,
        tags: ["workspace", m.manifest.family, m.manifest.id],
      } as never);
      count += 1;
    }
  }
  return count;
}
