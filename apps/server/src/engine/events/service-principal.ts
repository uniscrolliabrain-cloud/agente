// SERVICE_PRINCIPAL_V1 - identidad de servicio autenticada por contexto.
//
// Una convencion de nombres (`service:*`) no autentica nada: cualquier llamador
// puede escribir ese prefijo en un campo. La identidad de servicio solo existe
// dentro de un scope de ejecucion que el propio kernel abre con
// `runAsServicePrincipal`, y el bus compara la identidad declarada con la
// identidad ambiente en vez de creerle al campo.
//
// El registro es estatico y vive en codigo del kernel: un servicio no puede
// registrarse a si mismo en tiempo de peticion ni elegir que tipos de fuente
// puede emitir.

import { AsyncLocalStorage } from "node:async_hooks";
import type { SystemEventSource } from "./types.ts";

export interface ServicePrincipal {
  /** Identidad estable del proceso interno. */
  id: string;
  /** Tipos de fuente que este servicio puede usar al emitir. */
  sources: readonly SystemEventSource["kind"][];
}

const SERVICE_ID = /^service:[a-z0-9][a-z0-9._-]*$/;
const principals = new Map<string, ServicePrincipal>();
const scope = new AsyncLocalStorage<ServicePrincipal>();

/**
 * SERVICE_PRINCIPAL_REGISTER_V1 - registra un principal del kernel. Solo se
 * llama desde la tabla estatica de abajo: un duplicado o un id invalido es un
 * error de programacion, no una entrada de usuario.
 */
export function registerServicePrincipal(principal: ServicePrincipal): void {
  if (!SERVICE_ID.test(principal.id))
    throw new Error(`SERVICE_PRINCIPAL_ID_INVALID: ${principal.id}`);
  if (principals.has(principal.id))
    throw new Error(`SERVICE_PRINCIPAL_DUPLICATE: ${principal.id}`);
  principals.set(principal.id, {
    id: principal.id,
    sources: Object.freeze([...principal.sources]),
  });
}

/** Principal de servicio activo en esta cadena asincrona, si lo hay. */
export function currentServicePrincipal(): ServicePrincipal | undefined {
  return scope.getStore();
}

/**
 * SERVICE_PRINCIPAL_SCOPE_V1 - abre el scope de un principal registrado.
 * Es la unica forma de que `currentServicePrincipal()` devuelva algo: el
 * llamador no puede inyectar la identidad por parametro.
 */
export async function runAsServicePrincipal<T>(
  id: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  const principal = principals.get(id);
  if (!principal) throw new Error(`SERVICE_PRINCIPAL_UNKNOWN: ${id}`);
  if (scope.getStore()) throw new Error("SERVICE_PRINCIPAL_NESTED");
  return scope.run(principal, async () => fn());
}

// SERVICE_PRINCIPALS_KERNEL_V1 - procesos internos que legitimamente emiten sin
// principal humano. Cada uno declara de que fuentes puede emitir; un evento de
// tarea, accion o persona nunca puede atribuirse a un servicio.
registerServicePrincipal({ id: "service:kernel", sources: ["kernel", "system"] });
registerServicePrincipal({
  id: "service:cognition-worker",
  sources: ["kernel", "system"],
});
registerServicePrincipal({ id: "service:monitor", sources: ["monitor", "system"] });
