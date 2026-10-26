// TENANT_SCOPE_V1 - tenant activo de la peticion en curso.
//
// El TenantScopedStore resuelve el tenant por owner (membership). Eso vale para
// un usuario con un solo tenant, pero no para multitenant real: el mismo owner
// puede actuar en dos empresas y la peticion debe escribir SOLO en la que el
// token declara. Sin este scope, el store resolvia siempre el tenant de
// membership y una sesion de la empresa B escribia en la A.
//
// AsyncLocalStorage y no un campo del proceso: dos peticiones concurrentes de
// tenants distintos no pueden pisarse.
import { AsyncLocalStorage } from "node:async_hooks";

export interface TenantScope {
  tenantId: string;
  actorId: string;
}

const storage = new AsyncLocalStorage<TenantScope>();

/** Ejecuta `fn` con el tenant de la peticion fijado. */
export function runInTenantScope<T>(scope: TenantScope, fn: () => T): T {
  return storage.run(scope, fn);
}

/** Tenant fijado por la peticion actual, si lo hay. */
export function currentTenantScope(): TenantScope | undefined {
  return storage.getStore();
}
