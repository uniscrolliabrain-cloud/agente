// KERNEL_DEFAULT_TENANT_RESOLVER_V1 — single-tenant.
//
// Hoy todo el deployment es un unico tenant logico. Este resolver lo
// declara explicitamente para que el kernel no lo asuma.
//
// TODO(KERNEL_TENANT_DB_V1): cuando el repo pase a multi-tenant,
// DatabaseTenantResolver leera records kind "tenant-membership".

import type { TenantResolver } from "./resolver.ts";

export const DEFAULT_TENANT_ID = "default";

export class DefaultTenantResolver implements TenantResolver {
  async resolve(_owner: string): Promise<string> {
    return DEFAULT_TENANT_ID;
  }
}