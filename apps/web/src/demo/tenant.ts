// DEMO_TENANT_V1 - tenant de ejemplo "Interfaz".
//
// El demo vive entero en el navegador: fixtures sinteticos + un adaptador que
// responde a los mismos endpoints que la API real. No hay backend detras y no
// se toca ningun dato del usuario. Se activa con un token marcado y se sale
// borrando la sesion, asi que no hay estado que limpiar en el servidor.
//
// Este modulo no importa nada a proposito: lo usan tanto el cliente HTTP como
// los componentes, y asi no se crea un ciclo de imports.

export const DEMO_TENANT_ID = "interfaz";
export const DEMO_TENANT_NAME = "Interfaz";
export const DEMO_TOKEN = "demo:interfaz";

/** Mismas claves que usa api/client.ts y api/auth.ts. */
export const DEMO_AUTH_KEY = "agente_auth";
export const DEMO_USER_KEY = "agente_user";

export function isDemoToken(token: string | null | undefined): boolean {
  return token === DEMO_TOKEN;
}
