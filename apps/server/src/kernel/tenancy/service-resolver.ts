// SERVICE_TENANT_RESOLVER_V1 - adapter que delega en TenantService.
//
// Por que existe:
//   Kernel.openTurn() y el resto de operaciones del kernel resuelven el tenantId
//   llamando a this.deps.tenants.resolve(ctx.owner). Si inyectamos
//   DefaultTenantResolver, siempre devuelve "default" e ignora el tenantId del
//   contexto. Eso tiraba a la basura el trabajo de TenantService.
//
// Este adapter delega directamente en TenantService.tenantIdFor(owner), que
// resuelve el tenant real desde la DB (o "default" si no hay membership).

import type { TenantResolver } from "./resolver.ts";
import type { TenantService } from "../../engine/tenant.ts";

export class ServiceTenantResolver implements TenantResolver {
  constructor(private readonly service: TenantService) {}

  async resolve(owner: string): Promise<string> {
    return this.service.tenantIdFor(owner);
  }
}
