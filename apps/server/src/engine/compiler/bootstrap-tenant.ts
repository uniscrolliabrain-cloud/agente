// BOOTSTRAP_TENANT_V1 - registra capabilities, agentes, SOPs y canales en los registries reales.
// Hoy: stub. TODO(cline): implementar contra tests/compiler/bootstrap-tenant.test.ts.
import type { TenantBundle } from "../../../../../packages/domain/src/tenant-bundle.ts";

export interface BootstrapResult {
  tenantId: string;
  registered: { capabilities: number; agents: number; sops: number; channels: number };
}

export interface BootstrapDeps {
  capabilities: { register: (cap: unknown) => void; list: () => Promise<unknown[]> };
  personas: { register: (tenantId: string, persona: unknown) => void; list: (tenantId: string) => unknown[] };
  sops: { register: (tenantId: string, sop: unknown) => void; list: (tenantId: string) => unknown[] };
}

export async function bootstrapTenant(bundle: TenantBundle, _deps: BootstrapDeps): Promise<BootstrapResult> {
  // TODO(cline): registrar cada capability, agente, SOP y canal en los registries reales.
  return { tenantId: bundle.tenantId, registered: { capabilities: 0, agents: 0, sops: 0, channels: 0 } };
}