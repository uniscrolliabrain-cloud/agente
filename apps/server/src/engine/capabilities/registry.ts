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
// TENANT_SCOPED_CAPABILITY_REGISTRY_V1 - registry por tenant con cache TTL.
// Ver: docs/audits/09-kernel-cognitivo/09z-fundamentos.md
export interface CapabilityBundleResolver {
  resolve(tenantId: string): Promise<{
    capabilities: CapabilityContract[];
    version: number;
  }>;
}

export class TenantScopedCapabilityRegistry {
  private readonly cache = new Map<string, { at: number; value: CapabilityContract[] }>();
  private readonly ttlMs: number;

  constructor(
    private readonly resolver: CapabilityBundleResolver,
    ttlMs = 5 * 60 * 1000,
  ) {
    this.ttlMs = ttlMs;
  }

  async list(tenantId: string): Promise<CapabilityContract[]> {
    const cached = this.cache.get(tenantId);
    if (cached && Date.now() - cached.at < this.ttlMs) return cached.value;
    const resolved = await this.resolver.resolve(tenantId);
    this.cache.set(tenantId, { at: Date.now(), value: resolved.capabilities });
    return resolved.capabilities;
  }

  async get(tenantId: string, id: string): Promise<CapabilityContract | undefined> {
    const all = await this.list(tenantId);
    return all.find((c) => c.id === id);
  }

  invalidate(tenantId: string): void {
    this.cache.delete(tenantId);
  }

  clear(): void {
    this.cache.clear();
  }
}