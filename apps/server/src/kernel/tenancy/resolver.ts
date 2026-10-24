// KERNEL_TENANT_RESOLVER_V1 — como se resuelve el tenant de un owner.
//
// Hoy: siempre "default". Manana: lectura de la DB, del token o del
// subdominio. El kernel no sabe como se resuelve; solo pide el tenant
// y usa el resultado. Esa frontera es lo que permite migrar a multi-tenant
// sin tocar el kernel.

export interface TenantResolver {
  resolve(owner: string): Promise<string>;
}