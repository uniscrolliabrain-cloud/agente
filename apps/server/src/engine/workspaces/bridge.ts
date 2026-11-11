// WORKSPACES_ENGINE_BRIDGE_V1 - registra las capacidades de los 34 workspaces.
import type { WorkspaceModule } from "@agente/workspaces";
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
        // BRIDGE_SIDE_EFFECTS_V1 - el puente declaraba `sideEffects: []` e
        // `idempotent` para TODA capability de workspace, aunque la declaracion
        // dijera que escribe: el runner no pedia claim ni clave de idempotencia
        // y una capacidad con efectos se anunciaba como pura. Se respeta la
        // declaracion; sin saber si el efecto es externo se declara `write`.
        sideEffects: c.sideEffects
          ? [{ kind: "write" as const, target: c.id, reversible: false }]
          : [],
        permissions: [],
        risk: c.risk,
        cost: {},
        idempotency: c.sideEffects ? "at-most-once" : "idempotent",
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
