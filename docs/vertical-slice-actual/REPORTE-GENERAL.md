# Vertical slice A/B · Reporte general de pendientes

**Fecha:** 9 de noviembre de 2026 · **Código:** `9358d80` (main al consolidar) · **Alcance:** campañas 01–20.

## Resumen ejecutivo

Las 20 campañas están implementadas y sus gates de producto están en verde sobre fixtures, con una excepción declarada: **la campaña 20 no se acredita** porque su aserción de cierre exige seis humanos y cuatro agentes recorriendo el flujo con dos cuentas reales. Ninguna campaña se ha ejecutado contra staging real: no hay cuentas de Google, clave de Places, LLM ni Postgres multitenant en este entorno.

Quedan tres familias de pendientes:

1. **Acreditación real** (bloqueo externo): staging, proveedores y Docker.
2. **Cableado que quedó fuera de superficie**: rutas y `index.ts` que exigen tocar `app.ts`, y que se repiten en varias campañas.
3. **Deuda heredada**: `audit:contracts` en rojo, tests saltados y la migración de datos legacy.

Nada de lo pendiente se ha maquillado: no se subieron timeouts, no se añadieron `skip` nuevos ni se relajaron aserciones.

## Pendientes por campaña

| # | Campaña | Entregado y verificado | Qué faltó o quedó abierto | Bloqueo |
|---|---|---|---|---|
| 01 | Baseline ejecutable | Arranque, typecheck, suite y smoke HTTP con exit real | Imagen Docker sin construir/arrancar; live con credenciales reales | Docker, staging |
| 02 | Principal y selección de empresa | Tenant ajeno 403, scope alterado 403, DB caída 503; dos pestañas A/B por test | A/B contra Postgres de staging; `AUTH_PROVIDER=supabase` de punta a punta | Staging, Supabase |
| 03 | Permisos por actor | Matriz cerrada, revocación en caliente, alta pública sin rol de plataforma | `actions.approve` existe probado pero ninguna ruta lo exige (llega en 14); la UI no muestra permisos; signup sigue tras `SIGNUP_ENABLED` | Decisión de operación |
| 04 | Propiedad de registros | Contrato de acceso y migración probados | `MemoryService`, `BusinessGraph`, `ContextEngine` y `app.ts` siguen usando la clave legacy del `Store`; migración de owners no aplicada | Superficie, datos |
| 05 | Postgres, SQL, SSE y enlaces | Filtros por principal y SQL arbitrario bloqueado | RLS con rol real de staging; retirar `x-user-id` en presencia/locks (lo consumen 13 y 20) | Staging |
| 06 | Identidad durable y diferidos | Contrato de identidad y recibos sin éxito falso | Acreditación con dos workers reales y reinicio | Postgres staging |
| 07 | Bundle versionado | Plan puro, duplicado bloqueado, referencias inválidas rechazadas | Aplicación real del plan (consumida por 08/14); versionado de imagen del computer | Superficie |
| 08 | Instalador reanudable | Alta A/B con seis actores, doble apply y reanudación | Reserva con CAS (hoy hay ventana entre writers); prueba con dos cuentas reales; runner HTTP y botón de instalar en el panel | Store, staging, UI |
| 09 | Laia y Marcos | Cuatro instancias resueltas desde el store; Marcos deshabilitado no inicia | Imagen Docker (sin socket); selector de persona en la UI; cuentas reales | Docker, UI, staging |
| 10 | Hechos compartidos | Recall acreditado por tenant y visor | Dos cuentas reales; UI de hechos con versión y origen; olvido/TTL de `profile-facts` | Staging, UI |
| 11 | OAuth Google | Ciclo con `fetch` interceptado, revocación y rotación por CAS | Dos cuentas reales; rotación de `state` con dos pestañas en navegador | Credenciales, navegador |
| 12 | Drive | Ingesta, actualización y revocación con store real | Prueba con Drive real | Credenciales |
| 13 | Hilo y hechos de ejecución | Hilo ajeno rechazado; cita de ejecución correcta | A/B con Google real; los cinco `test.todo` de `laia-vertical-acceptance` | Credenciales |
| 14 | Aprobación exacta | Doble firma, timeout ambiguo y conciliación | Proveedor real; **despacho diferido sin cablear en `index.ts`** | Credenciales, superficie |
| 15 | Gmail real | Hilo, cuenta y recibo con el cliente de producción | Smoke real de Gmail; hereda el despacho diferido sin cablear | Credenciales, superficie |
| 16 | Calendar | Reserva, DST, conflicto y timeout sin duplicado | Smoke real; disponibilidad de invitados externos (free/busy) fuera de alcance; despacho diferido sin cablear | Credenciales, superficie |
| 17 | Places y ficha | Búsqueda de solo lectura, aceptación idempotente y ficha compartida | Smoke real de Places; edición, descarte o fusión de fichas; despacho diferido sin cablear | Clave Maps, superficie |
| 18 | Marcos tipado | Rol deshabilitado rechazado; solicitante y agente conservados; sin contacto inventado | Registry de personas no cableada en `AgentService` (hay que sembrar el rol al instalar); LLM/Places reales | Superficie, staging |
| 19 | Seguimiento y baja | Pasos durables, respuesta por hilo, baja durante espera y cita con recibo | **Sin ruta HTTP/chat para programar el seguimiento**; detección solo en el tick de triggers; Gmail/Calendar reales | Superficie, staging |
| 20 | Panel y gate A/B | Panel de operaciones, tarjetas versionadas con permisos y briefing con registros reales | **Aserción de cierre A/B no ejecutada** (seis humanos, cuatro agentes, dos cuentas); la campaña sigue abierta | Staging, credenciales |

## Bloqueos transversales

### 1. Acreditación real (P0)

- **Sin staging**: no hay `DATABASE_URL` de staging, ni dos cuentas de Google, ni `GOOGLE_MAPS_API_KEY`, ni LLM configurado. Todo el aislamiento A/B se acredita con PGlite, scopes y fixtures.
- **Docker**: el CLI está, pero el socket da `permission denied`; la aserción de imagen de la 09 y el recorrido contenedorizado no se pueden ejecutar.
- Consecuencia: los gates 09, 11–17 y 20 quedan «cumplidos en lo verificable», no acreditados de extremo a extremo. La 20 queda formalmente abierta por su propia regla.

### 2. Cableado excluido por superficie (P1)

- **Despacho diferido de la 14** sin cablear en `index.ts`, declarado también en 15, 16 y 17. Es el pendiente más repetido y el que más afecta a una demo real.
- **Ruta de alta de seguimiento (19)**: el dominio y el borrador están probados, pero no hay endpoint ni acción de chat para programarlo; exigía `app.ts` o `leads-routes.ts`.
- **Registry de personas (18)**: `canStartWork` resuelve en la registry para UI/chat, pero `AgentService` autoriza contra `agent-roles`; una persona sin rol equivalente se rechaza.
- **UI de permisos (03), selector de persona (09), hechos con versión (10) y botón de instalar cliente (08)**: contratos listos, superficie pendiente.

### 3. Datos y migración (P1)

- **04**: cuatro consumidores siguen con la clave legacy; migrar `<tenant>:<userId>` a `<tenant>:u:<userId>` exige decidir actor por fila y no se aplicó.
- **05**: RLS no probado con rol real; retirar `x-user-id` toca UI y API que consumen 13 y 20.
- **08**: reserva con CAS pendiente; hoy hay ventana entre dos writers concurrentes.

### 4. Deuda heredada (P2)

- `audit:contracts`: **79 contratos huérfanos**; `coherence` 6/7 solo por eso. Es rojo heredado, no una regresión de las campañas.
- **12 tests permanentemente saltados** (9 E2E vacíos de `campaign-3` y 2 con `skip: "TODO"`), más los **5 `test.todo`** de `laia-vertical-acceptance`.
- 219 `console.*` fuera de la superficie del audit (advisory).
- Aviso de Vite por `actions.ts` importado estática y dinámicamente (`ApprovalModal`); no afecta al build.

## Qué haría falta para cerrar el slice

1. **Staging real** con dos empresas, seis humanos y cuatro agentes por empresa, Postgres multitenant y las dos conexiones de Google; ejecutar el runbook de la 20 y guardar solo ids de proveedor.
2. **Cablear el despacho diferido** de la 14 en `index.ts` y la ruta de alta de seguimiento de la 19.
3. **Sembrar roles al instalar** para que la registry de personas y `agent-roles` coincidan (18).
4. **Resolver la deuda de datos**: consumidores legacy (04), RLS (05) y CAS (08).
5. **Limpiar la deuda heredada**: decidir los 79 contratos huérfanos y sustituir los tests saltados por pruebas reales o por su retirada explícita.

## Estado de ramas y publicación

- `main` = `1762e49` con este reporte; todo el trabajo de las campañas 01–20 está integrado en `main` (base del reporte: `9358d80`).
- `pendiente/no-integrable` = `dc0bc47` («Initial cloud project»), rama local no ancestral de `main` y sin trabajo del slice: **eliminada** (SHA registrado aquí).
- `origin/campaign/conexiones-doppler` = `2a475e9`, **ya contenido en `main`** (`merge-base --is-ancestor` = 0), así que borrarla no pierde commits. **Sigue en el remoto**: el `git` del terminal no tiene credenciales y `gh` no está autenticado; `cloud_git` no borra refs. Para cerrarla, usar la UI de GitHub (Branches → delete) o ejecutar `git push origin --delete campaign/conexiones-doppler` en un entorno autenticado.
- No se toca ninguna rama de otro chat ni configuración compartida de Git.

## Cómo verificar este reporte

- Los detalles por campaña están en `docs/vertical-slice-actual/<nn>-<slug>/REPORTE.md`.
- La secuencia y los gates, en `docs/vertical-slice-actual/README.md`.
- El estado de cada pendiente se puede reproducir con los comandos citados en cada reporte; este documento no sustituye esa evidencia.
