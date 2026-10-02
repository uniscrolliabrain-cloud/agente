// CAPABILITY_REGISTRY_V1 - registro de capacidades del sistema.

import type { CapabilityContract } from "../../../../../packages/domain/src/capability.ts";

export interface CapabilityProvider {
  list(tenantId: string): Promise<CapabilityContract[]>;
  get(tenantId: string, id: string): Promise<CapabilityContract | undefined>;
}

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityContract>();

  register(capability: CapabilityContract): void {
    this.capabilities.set(capability.id, capability);
  }

  async get(id: string): Promise<CapabilityContract | undefined> {
    return this.capabilities.get(id);
  }

  async list(filter?: { kind?: string; tag?: string; risk?: string }): Promise<CapabilityContract[]> {
    let all = [...this.capabilities.values()];
    if (filter?.kind) all = all.filter((c) => c.kind === filter.kind);
    if (filter?.tag) all = all.filter((c) => c.tags.includes(filter.tag!));
    if (filter?.risk) all = all.filter((c) => c.risk === filter.risk);
    return all;
  }
}