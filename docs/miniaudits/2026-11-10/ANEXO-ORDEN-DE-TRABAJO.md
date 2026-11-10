# Anexo · Orden de trabajo de los 321 hallazgos restantes

> Complementa al [README](README.md) de los miniaudits del 2026-11-10. No reordena por gravedad
> —eso ya está en cada informe— sino por **lo que hace falta tener para poder cerrar cada arreglo**:
> servicios, credenciales, permisos y comprobaciones.

## Cómo se lee

- La unidad de trabajo es el **arreglo**, no el hallazgo: el techo de intentos aparecía en 04 y en 06,
  y el tenant del envelope en 08 y en 14. Cerrar un arreglo cierra varias filas.
- Cada fase tiene una **puerta**: si la puerta no está abierta (un permiso que no tengo, una cuenta que
  no existe), no se empieza la fase. No se simula con mocks lo que luego hay que verificar de verdad.
- Las fases A y B se pueden hacer sin que consigas nada. Son las de mañana.
- **Nada de esto autoriza a tocar `agntia-gestoria/` ni `agente-integration.patch`, ni a relajar
  `views.ts`/`view-envelope.ts`, ni a escribir fuera del tenant `acme` en la demo.**

## Resumen

| Fase | Contenido | Bloques | Puerta (lo que hace falta) |
|---|---|---|---|
| **A** | Kernel, aprobaciones, policy, tests | 25, 10, 07, 14, 08, 04, 06, 13, 12, 09, 02 | Nada. Sólo dos decisiones de diseño |
| **B** | Datos reales, RLS, migraciones, backup | 18, 19, 20, 06, 05, 25 | Postgres con rol de migración + bucket de dumps + entorno de restore |
| **C** | Sesión, cookies, transporte | 17, 16, 18, 12, 23 | Dominio + TLS + IdP con redirect URIs |
| **D** | Dinero | 24 | Cuenta Stripe (test) + endpoint público + signing secret |
| **E** | Google | 23, 07 | Proyecto GCP, consent screen, verificación de marca y CASA |
| **F** | WhatsApp y GMB | 24 | Meta Business verificado + acceso a la API de GMB |
| **G** | Multi-instancia, observabilidad, navegador | 05, 03, 19, 21, 22 | Segunda instancia, colector de métricas, KMS |
| **H** | Producto y UI | 01, 15, 16, 11 | Decisiones de producto, no permisos |

## Fase A · Lo que se puede cerrar sin pedir nada

**Por qué primero:** son los arreglos que cambian comportamiento del núcleo (aprobaciones, verificación,
tenant del envelope) y no dependen de ninguna cuenta externa. Todo se prueba con la suite y la demo de
ACME, que ya existen.

**Arreglos**

1. **25 · El ciclo del Business OS termina en dato.** Verificador sin criterios (ya hecho, `b148961`),
   persistir el `Outcome` en la tarea y llevar el goal a `completed`/`failed`. Sin esto el kernel
   "funciona" y no deja rastro.
2. **10 · Estado del goal y rol.** `roleId` inexistente ya devuelve `blocked` (`d009dee`); falta que el
   goal pase a `failed` en vez de quedarse en `draft` y unificar el ensamblador de contexto.
3. **07 · Aprobaciones que garantizan lo aprobado.** Persistir antes de reclamar, CAS en `scheduled`
   para que dos workers no ejecuten dos veces, `provider` desde la acción y `decide()` con 409 en
   conflicto de estado.
4. **14+08 · PolicyEngine.** `permissions: { canView: true }` y `permissions: []` dejan de ser mentira:
   el envelope calcula permisos efectivos del actor y las rutas los respetan; 404 —no 403— cuando el
   recurso es de otro tenant.
5. **04/06 · Resiliencia restante.** Clasificar el error del reintento (no todo es transitorio),
   antigüedad de cola y `scanByStatusWithTenant` en todos los caminos.
6. **13 · El `rag` no puede devolver `[]` cuando falla.** Un fallo de búsqueda se propaga como error.
7. **12 · Un fallo no se disfraza de respuesta**, y el hilo lleva versión.
8. **09 · Semántica de `delivered`** en el bus, para que la traza del kernel no mienta.
9. **02 · Quitar los 9 `test.skip`** convirtiéndolos en pruebas reales (es el S0 que queda abierto).

**Qué hay que checkear**

```bash
node_modules/.bin/tsc --noEmit
node_modules/.bin/tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests
node_modules/.bin/tsx scripts/gate-report.ts
DATA_DIR=artifacts/demo/acme   # la demo sigue pintando lo mismo
```

- Dos tenants en el mismo proceso: el envelope de uno no lleva ids ni nombres del otro.
- Aprobación: dos workers sobre el mismo `scheduled` → una sola ejecución y un 409 en el segundo `decide`.
- Goal sin criterios: no se firma `verified`; con criterios que fallan: `failed`, no `completed`.
- ACME: las 21 vistas de los 3 módulos siguen resolviendo con su tenant.

**Criterio de hecho:** suite completa en verde sin `skip` nuevos, `tsc` en 0, y ningún cambio de forma
en el envelope que rompa `views.ts`.

## Fase B · Cuando haya base de datos de verdad

**Por qué aquí:** RLS, migraciones y backup sólo se pueden verificar contra Postgres real con un rol sin
`BYPASSRLS`. Con PGlite se prueba el código, no la garantía.

**Arreglos:** 18 (RLS obligatorio cuando `MULTI_TENANT_SHARED`, no condicionado a `backend`), 19
(migraciones en `release_command`, worker separado, health sin topología), 20 (`pg_dump` o el backup se
declara incompleto; nunca éxito con un `logWarn`), 25-12 (`BUSINESS_DATABASE_URL` con rol de sólo
lectura y SQL parametrizado), 06/05 (lease y cuota en la base, no en memoria del proceso).

**Qué hay que checkear**

- Migraciones dos veces seguidas sobre la misma base (idempotencia) y sobre una copia de producción.
- Dos conexiones con `app.tenant_id` distinto: `SELECT` cruzado devuelve 0 filas, no error.
- Un rol de aplicación sin `BYPASSRLS` no ve nada sin contexto de tenant.
- Restore completo en un entorno aparte y comparación de conteos por tabla.
- `pg_dump` programado: que un fallo del dump haga fallar el job, no que lo esconda.

**Criterio de hecho:** restore ensayado una vez de principio a fin, con hora y resultado anotados.

## Fase C · Sesión que se puede revocar

**Puerta:** dominio con TLS y un IdP con redirect URIs reales. Sin dominio no hay cookie `Secure` ni
`SameSite` que valga, y probar revocación en `localhost` no prueba nada.

**Arreglos:** 17 (época/versión de sesión que invalida tokens al cambiar contraseña o salir de la
empresa), 16 (token fuera de `localStorage`, SSE con ticket de un solo uso en vez de token en query),
18 (HSTS, `X-Frame-Options`, `Permissions-Policy`), 23-6 (`state` con nonce y caducidad, ligado al
tenant), 12 (historial con versión).

**Qué hay que checkear:** login en dos navegadores, revocar en uno y que el otro caiga en la siguiente
petición; cambio de contraseña invalida lo anterior; SSE sin token en la URL; CORS con origen exacto;
`Set-Cookie` con `HttpOnly`, `Secure`, `SameSite=Lax`.

## Fase D · Stripe

**Puerta:** cuenta Stripe en modo test, endpoint público con TLS y `STRIPE_WEBHOOK_SECRET`.

**Arreglos (24):** montar el webhook **antes** de `authzMiddleware` y autenticarlo por firma; ventana
temporal en la firma; idempotencia por `event.id`; que el webhook actualice suscripción, cliente y cuota,
no sólo guarde el evento; permiso de facturación para crear enlaces de pago (hoy cualquier autenticado
puede); no devolver el cuerpo del proveedor al cliente.

**Qué hay que checkear:** `stripe listen` con el CLI, evento duplicado (una sola aplicación), evento con
firma vieja (rechazo), usuario sin rol (403), usuario de otro tenant (404/403, no el link).

## Fase E · Google con scopes mínimos

**Puerta:** proyecto en Google Cloud, pantalla de consentimiento, dominio verificado, política de
privacidad pública. `gmail.send` es un scope **restringido**: exige evaluación de seguridad (CASA) antes
de abrirlo a clientes que no sean test users. Es la puerta más lenta de todo el anexo; conviene lanzarla
en paralelo a la fase A, no cuando lleguemos aquí.

**Arreglos (23):** `gmail.send` en vez de `mail.google.com`, `drive.file` en vez de `auth/drive`,
comparación de scopes **por conjunto**, `assertMembership` obligatorio, credencial legacy sin empresa
rechazada, revocación sin 502.

**Qué hay que checkear:** consent con el conjunto mínimo; reconectar con un scope degradado y que se
detecte; token revocado desde la cuenta de Google; envío real a un buzón de prueba; que la UI no prometa
"leer todo el correo" si el scope no lo permite.

**Coste honesto:** mientras CASA no esté, el producto sólo se puede probar con test users. Decidir si el
piloto va con eso o si se limita a Calendar/Drive (`drive.file` no es restringido).

## Fase F · Meta y GMB

**Puerta:** Meta Business verificado, número de WhatsApp, token permanente y `app secret`; para GMB, la
API es de acceso restringido y hay que pedirla por formulario con la cuenta que gestiona las fichas.

**Arreglos (24):** ventana de 24 h, plantillas aprobadas, verificación de firma del webhook, cuota por
tenant; GMB: reseñas y publicaciones con permiso explícito del tenant.

**Qué hay que checkear:** mensaje dentro y fuera de ventana (plantilla obligatoria), firma inválida,
número de otro tenant.

## Fase G · Multi-instancia, observabilidad y navegador

**Puerta:** segunda instancia contra la misma base, colector de métricas (OTel o Sentry) y una clave de
cifrado gestionada para los perfiles de navegador.

**Arreglos:** 05 (límites y semáforos compartidos, hoy por proceso), 03 (labels con tenant, `health-deep`
sin topología pública, sonda que no escribe, métricas de producto), 19 (release, worker, región y
volumen), 21 (computer: dejarlo apagado o aislar el socket de Docker), 22 (tenant en el navegador y
perfiles cifrados — hoy las cookies de clientes están en claro en el volumen).

**Qué hay que checkear:** dos instancias, cuota compartida (la suma no se duplica); matar el worker a
mitad de tarea y que el lease se recupere; `health-deep` sin exponer nombres de kernel ni DSN;
`pgrep`-free apagado ordenado.

## Fase H · Producto y UI

**Bloques 01, 15, 16, 11.** No dependen de permisos sino de decisiones: qué módulos se anuncian como
listos, cuál es la acción vertical que se demuestra, y qué significa "rápido/lento" en la traza. Se
aborda cuando A esté cerrada, porque varias de estas filas se caen solas al arreglar el envelope y el
kernel.

## Permisos y accesos que necesito de ti

Nada de esto se pega en el chat: va a `.env` local no versionado o a Secrets del hosting.

| Qué | Para qué fase | Quién lo concede | Tiempo | Dónde se guarda |
|---|---|---|---|---|
| DSN de Postgres con rol capaz de crear políticas (o `CREATEROLE`) | B | tu proveedor de DB | inmediato | `DATABASE_URL` |
| Rol Postgres de sólo lectura para el negocio | B | tú, en la misma DB | inmediato | `BUSINESS_DATABASE_URL` |
| Bucket S3/R2 + credenciales para dumps | B | tu nube | inmediato | `BACKUP_*` |
| Entorno de restore separado (aunque sea una DB vacía) | B | tú | inmediato | `.env.restore` local |
| Dominio + DNS + certificado | C | registrador | horas | panel del hosting |
| Cliente OIDC/OAuth del IdP con redirect URIs | C | tú | horas | `OIDC_*` |
| Stripe test: secret key, restricted key, webhook signing secret | D | tú, en el dashboard | horas | `STRIPE_*` |
| Proyecto GCP + consent screen + dominio verificado + política de privacidad | E | tú / Google | días | `GOOGLE_*` |
| Evaluación CASA para `gmail.send` (si se quiere correo real) | E | Google (auditor) | semanas y coste | — |
| Meta Business verificado + número + token permanente + app secret | F | tú / Meta | días–semanas | `WHATSAPP_*` |
| Acceso a la API de GMB | F | Google (formulario) | días | `GMB_*` |
| Segunda instancia + Redis o cola (o decisión de usar Postgres) | G | tú | horas | `REDIS_URL` o equivalente |
| Colector OTel / DSN de Sentry + destino de alertas | G | tú | horas | `OTEL_*` / `SENTRY_DSN` |
| Clave de cifrado (KMS o `age`) para perfiles de navegador | G | tú | horas | `PROFILE_ENC_KEY` |

## Decisiones que necesito de ti (no son permisos)

1. **PolicyEngine:** ¿permisos por rol declarados en el catálogo de módulos o calculados por recurso?
   La primera es una semana menos; la segunda es la que aguanta auditoría.
2. **404 o 403** cuando el recurso es de otro tenant. Recomiendo 404 siempre, salvo en rutas de admin.
3. **¿Se vende el navegador?** Si no, 22 queda en P2 y no se toca el cifrado de perfiles hasta que se venda.
4. **¿Computer sigue apagado?** Si sigue apagado, 21 no es P1 y el socket de Docker se queda como está.
5. **¿El piloto usa Gmail o sólo Calendar/Drive?** Cambia por completo la fase E y su calendario.

## Estado a día de hoy

- Cerrados con código y prueba: tenant de `/api/views/resolve` (`b148961`), techo de intentos y
  dead-letter (`b148961`), verificador sin criterios (`b148961`), contexto del orquestador como `blocked`
  (`d009dee`).
- Descartados con motivo, escritos en el README: `provider: "google"` en `actions.ts` y el backup por
  tenant (ya copia `files` y `browser-profiles`; lo que falta es el dump, que es fase B).
- Todo lo demás son las fases A–H de arriba. **Mañana: fase A**, que no necesita nada de nadie.
