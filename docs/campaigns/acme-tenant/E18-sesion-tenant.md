# E18 · Sesión real de ACME

**Etapa**: E18 de `ACME_CAMPAIGN_V1`
**Estado**: completada
**Verificación**: `tsc --noEmit` 0 · `tests/auth-me-tenant.test.ts` 2 pass / 0 fail · `auth.test.ts` 5 pass · `workspaces-tenant` 5 pass · `tenant-acme-isolation` 6 pass · build de `@agente/web` → `vite build` OK (1783 módulos, exit 0).

---

## 1. El problema

La UI decidía el espacio activo con `isDemoSession()`: si el token era `demo:interfaz` pintaba "Interfaz" y, en cualquier otro caso, "MI". No había forma de saber en qué empresa estaba la sesión: entrar como Carlos con su contraseña real mostraba el menú completo pero sin identidad de empresa, y la única prueba de tenant era la cabecera HTTP.

## 2. Cambios

**Servidor — `GET /api/auth/me`** (`apps/server/src/auth-routes.ts`):

```ts
const tenantId = c.get("ctx")?.tenantId ?? null;
return c.json({ id, email, name, role, setup, tenantId });
```

`ctx.tenantId` es el que resuelve el middleware de `app.ts` para toda `/api/*` (JWT → tenant de sesión → membership). Es el mismo valor con el que se atendió la petición y con el que se escribe en el store: la UI no deduce nada. El tipo local de `Variables` gana `ctx?: { tenantId?: string }`.

**Web:**

- `AuthUser` (`apps/web/src/api/auth.ts`) gana `tenantId?: string | null`.
- `App.tsx` calcula `contextLabel` de la sesión: `Interfaz` si es el sandbox, `TENANT.toUpperCase()` si `/api/auth/me` devolvió tenant, `MI` si todavía no lo sabe. El `TopBarV2` no cambia.
- `SidebarV2` gana `tenant?: { id } | null` y muestra el aviso "Empresa · ACME / Sesión verificada" cuando la sesión es real. El aviso del sandbox (`demo.active`) se mantiene tal cual y tiene prioridad.

`useAuth` ya refrescaba el usuario con `me()` al arrancar, así que el dato llega sin hooks nuevos ni estado duplicado.

## 3. Guardas

- **No se toca `apps/web/src/demo/*`** ni `demo/tenant.ts`: `DEMO_TOKEN`, fixtures y router siguen igual.
- **No se añaden excepciones en `apiFetch`**: el atajo del demo (`isDemoSession()` → `demoRequest`) es el que había.
- **El sandbox sigue aislado por construcción**: en demo, `apiFetch` responde desde fixtures del navegador y no llega al backend, así que no puede ver datos de ACME. En real, todo pasa por el servidor y por el store con scope.
- **La etiqueta no se deriva del token**: sólo `tenantId` de `/me`; el sandbox se reconoce por su token porque es un tenant sintético que no existe en el backend, y eso es una decisión explícita, no una heurística sobre el nombre.

## 4. Verificación

- `tests/auth-me-tenant.test.ts`:
  - modo sesión: login real → `/api/auth/me` devuelve `tenantId: "default"` (fallback single-tenant) y **no** el uuid del usuario;
  - modo supabase: usuario con membership `acme` + JWT con claim `acme` → `/api/auth/me` devuelve `tenantId: "acme"` y la respuesta trae `X-Tenant-Id: acme`.
- `auth.test.ts` sigue verde: login, workspace sembrado y `/me` sin regresiones.
- `vite build` de la web compila con los cambios de `App.tsx`, `SidebarV2` y `AuthUser`.

## 5. Pendiente

- El menú no se filtra por tenant: el catálogo es global a propósito (E14), así que una sesión de `default` ve los tres módulos de ACME con listas vacías. Ocultarlos por tenant sería una regla de producto que hoy nadie ha pedido.
- El render de las 7 vistas con datos reales y el Centro de Mando con importes (E19) no se han tocado en esta etapa.
