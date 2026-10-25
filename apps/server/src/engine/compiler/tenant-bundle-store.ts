// TENANT_BUNDLE_STORE_V1 - lee/escribe bundles en tenant_bundles.
// Hoy: stub en memoria. Los proximos dias: Supabase client real.
import type { SupabaseClient } from "@supabase/supabase-js";
import { tenantBundleSchema, type TenantBundle } from "../../../../../packages/domain/src/tenant-bundle.ts";

export interface TenantBundleStoreDeps {
  supabase?: SupabaseClient;
  ttlMs?: number;
}

export class TenantBundleStore {
  private readonly cache = new Map<string, { bundle: TenantBundle; at: number }>();
  private readonly memory = new Map<string, { bundle: TenantBundle; version: number; compiledAt: string; compiledBy: string }>();
  private readonly ttlMs: number;
  constructor(private readonly deps: TenantBundleStoreDeps = {}) {
    this.ttlMs = deps.ttlMs ?? 5 * 60 * 1000;
  }

  async loadBundle(tenantId: string): Promise<TenantBundle | undefined> {
    const cached = this.cache.get(tenantId);
    if (cached && Date.now() - cached.at < this.ttlMs) return cached.bundle;
    // TODO(cline): si deps.supabase, leer de tenant_bundles. Hoy: memoria.
    const row = this.memory.get(tenantId);
    if (!row) return undefined;
    const bundle = tenantBundleSchema.parse(row.bundle);
    this.cache.set(tenantId, { bundle, at: Date.now() });
    return bundle;
  }

  async saveBundle(tenantId: string, bundle: TenantBundle, compiledBy: string): Promise<void> {
    const parsed = tenantBundleSchema.parse(bundle);
    const current = this.memory.get(tenantId);
    const nextVersion = (current?.version ?? 0) + 1;
    this.memory.set(tenantId, { bundle: parsed, version: nextVersion, compiledAt: new Date().toISOString(), compiledBy });
    this.cache.set(tenantId, { bundle: parsed, at: Date.now() });
    // TODO(cline): si deps.supabase, upsert en tenant_bundles con version y compiled_at.
  }

  invalidate(tenantId: string): void {
    this.cache.delete(tenantId);
  }

  /** Solo para tests. */
  clear(): void {
    this.cache.clear();
    this.memory.clear();
  }
}