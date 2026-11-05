# Transversal de clientes — qué existe y qué falta

Auditoría leída del **código** de `origin/main` (`5490a49`), no de la documentación.
Fecha: 2026-11-05. Método: `grep`/lectura de `apps/server/src`, `packages/`, `scripts/`, `clientes/` y
`apps/web/src`. Cada afirmación lleva fichero y línea; lo que no se pudo verificar está marcado.

> Nota de alcance: el código de app de la rama auditada es idéntico a `origin/main`; la única
> diferencia en `apps/` es un re-export (`apps/server/src/kernel/authors/index.ts`).

## 0. Qué significa "transversal de clientes" aquí

Una agencia que vende automatizaciones con IA necesita, por cada cliente:

1. **Identidad y acceso** — usuario, sesión, empresa activa.
2. **Alta** — crear el cliente con su perfil, sus SOPs, sus agentes y sus canales.
3. **Aislamiento** — que ningún dato de un cliente se lea o escriba desde otro.
4. **Configuración** — modelo, capacidades y tiempos por cliente.
5. **Credenciales y canales** — Google, WhatsApp, email, pagos, cada uno con la identidad del cliente.
6. **Datos** — ficheros, memoria, pipeline, auditoría, backup, export.
7. **Operación** — salud, uso, cuotas, suspensión, soporte.
8. **Comercial** — plan, facturación, renovación.
9. **Salida** — export y borrado real del cliente.

## 1. Lo que YA existe (con su límite real)

### Identidad y aislamiento

| Pieza | Dónde | Qué hace | Límite |
|---|---|---|---|
| Store con clave compuesta | `apps/server/src/db-tenant.ts:11-24` | Todo acceso se compone `${tenantId}:${owner}` | Aislamiento por prefijo de clave; no por columna ni RLS salvo modo compartido |
| Resolver de tenant | `apps/server/src/engine/tenant.ts:56-100` | Membership → tenantId, cache configurable (`TENANT_CACHE_TTL_MS`), migración de fila legacy | Cache por proceso: un cambio administrativo tarda hasta el TTL |
| Multi-empresa | `engine/tenant.ts:113-134` | `addMembership` idempotente, kind `user-tenants`, rol `owner/admin/member` | El rol se guarda pero **no autoriza nada** (ver 3.3) |
| Scope por petición | `apps/server/src/tenant-scope.ts` + `app.ts:646` | `AsyncLocalStorage {tenantId, actorId}` para todo el handler | Nada obliga a los servicios a leerlo; los que no lo leen usan membership |
| Guard de tenant pedido | `app.ts:596-601` | `?tenantId=`/`x-tenant-id` distinto del resuelto → 403 `TENANT_MISMATCH` | Sólo cubre query/header, no bodies salvo `/api/agent` |
| Guard de body | `app.ts:69-80` | POST de `/api/agent` con `tenantId` ajeno → 403 + `http.cross_tenant_attempt` | Sólo esa familia de rutas |
| JWT con claim de tenant | `engine/actors/service.ts:36-60` | Claim obligatorio; sin membership → 403; primer acceso materializa membership | Requiere auth por JWT; el modo sesión pasa por otra vía |
| Cambio de empresa | `auth-routes.ts:205-262` | Valida `user-tenants`, emite sesión con `tenantId` | **Sin UI**: 0 referencias a `switch-tenant` en `apps/web` |
| RLS opcional | `db-rls.ts` + `index.ts:22-34` | Con `MULTI_TENANT_SHARED=true` + Postgres: columna, índice, política y `FORCE RLS`; aborta el arranque si no se pudo activar | Inactivo por defecto (un deployment por cliente) |
| Webhooks sin sesión | `whatsapp-routes.ts:109-140` | Fija el tenant de la conexión antes de procesar | Sólo WhatsApp |

### Registro, administración y operación

| Pieza | Dónde | Qué hace | Límite |
|---|---|---|---|
| Registro de tenants | `admin-tenants.ts:45-70,128-146` | Alta manual, listado con salud agregada (roles, tareas por estado, SOPs, builds, coste y tokens 30 d, última actividad, suspensión) | Lista leyendo `system/tenant-membership`; convivencia frágil con la membership de usuario (3.5) |
| Detalle y edición | `admin-tenants.ts:74-90,177-196` | `GET /:tenantId`, `PATCH displayName` | Sin validación de existencia en el listado |
| Kill switch | `admin-tenants.ts:89-121` | `POST /suspend` y `/resume` escriben `system/tenant-state` | **No se aplica en ninguna parte** (3.1) |
| Borrado | `admin-tenants.ts:149-166` | Borra registro y estado | No borra datos del tenant (comentado en el propio código) |
| Panel maestro de clientes | `admin-clients.ts:53-130` | Lista `clientes/*` con SOPs, skills, docs, agentes, usuarios, memorias y lo provisionado en DB | Sólo lectura; `clientes/_agntia` es un fichero de repo, no estado de negocio |
| Uso por cliente | `admin-routes.ts:38-46` | `GET /tenants/:id/usage` | Sólo lectura |
| Cuotas | `admin-routes.ts:277-291` + `engine/guardrails/service.ts:36,92` | Cuota por tenant leída y escrita; **se aplica** en guardrails | No hay planes ni renovación |
| Onboarding | `admin-routes.ts:161-179` | `hasIdentity`, `hasFiles`, `hasTasks`, `hasMemory` | Es un diagnóstico, no un flujo guiado |
| Auditoría exportable | `admin-routes.ts:180-199` | Export JSON del audit trail con firma sha256 | No incluye resto de datos |
| Roles por cliente | `admin-routes.ts:200-231` | CRUD de `agent-roles` por tenant y actividad | Son roles de agente, no permisos de personas |
| Salud de sistema | `admin-routes.ts:93-100,263-276` | Capacidades y estado | — |
| Backup por cliente | `apps/server/src/backup-tenant.ts:1-20,70` | `dataDir/tenants/<tenantId>/backups/<stamp>/` | Copia **sólo** `files` y `browser-profiles`; no las filas de DB |
| Personas por cliente al arrancar | `app.ts:117-135` | Carga `clientes/<tenant>/personas/*.json` con fail-soft | Sólo personas |
| Arranque consciente de tenants | `index.ts:73,101` | Lista tenants del registro al boot | — |

### Alta y provisión

| Pieza | Dónde | Qué hace | Límite |
|---|---|---|---|
| Bootstrap completo de agencia | `scripts/lib/agency-bootstrap.ts:120-231` | Registro + membership única + `user-tenants` + memorias de perfil + business-schema (lead/client/invoice/call) + pipeline + SOPs, todo idempotente y con prefijo de tenant | Perfil y SOPs vienen de `clientes/agntia`; no es genérico |
| CLI de bootstrap | `scripts/bootstrap-agency.ts:1-25` | `--admin`, `--profile`, `--dry-run`, `--force` | Exige owner ya creado |
| Provisión desde bundle | `scripts/provision-client.ts:30-190` | SOPs, skills, users y agentes vía API con un admin existente | **No crea el tenant ni el registro ni la membership** (3.4) |
| Canal WhatsApp por cliente | `scripts/provision-whatsapp.ts:1-20` | Plan/apply, credencial cifrada, rotación de generación | Un canal por tenant, sin UI |
| Signup público | `apps/server/src/auth-signup.ts:36-160` | Slug de organización, token de verificación, usuario + membership | `SIGNUP_ENABLED`, email es stub (3.6) y no crea registro de tenant |
| Migraciones de datos | `scripts/migrate-tenant-membership.ts`, `migrate-tenant-id.ts`, `migrate-tenant-scope.ts`, `backfill-task-tenant.ts`, `drop-tenant-id-column.ts` | Adoptan datos antiguos al modelo multi-tenant | — |

### Configuración, credenciales y canales

| Pieza | Dónde | Qué hace | Límite |
|---|---|---|---|
| Config por tenant | `kernel/config/tenant-config.ts:27-45` | fast/slow/embeddings, modelo por rol, 10 capabilities, tiempos, `maxSteps` | — |
| Resolver de config | `kernel/config/env-resolver.ts`, `database-resolver.ts:37` | Env y (sin usar) DB | `app.ts:252-260` devuelve **siempre** el env: las keys por cliente no existen de facto (3.7) |
| WhatsApp con identidad de tenant | `engine/whatsapp-outbound.ts:36-64` | Conexión, inbox, aprobaciones y borradores con `tenantId`; usa `currentTenantScope()` | Sólo WhatsApp |
| Credenciales cifradas | `config.ts` (`TOKEN_ENCRYPTION_KEY`), `credentials` con `connectionId` | Secreto cifrado y rotación por generación | **Google no está atado al tenant** (3.2) |
| Email saliente | `auth-signup.ts:176-182` | Lee `SMTP_API_KEY` | Stub: devuelve `skipped` y "Envío de email no cableado" |
| Facturación | `app.ts:654-679` + `packages/integrations/src/stubs/stripe.ts:36-45` | Customer, payment link, invoices | Sin `customerId` por tenant, sin suscripción, sin webhook de cobro |
| Canales por cliente | `whatsapp-routes.ts`, `google-*`, `gmb`, `social` | Integraciones existen | Sólo WhatsApp tiene binding por tenant verificado |

### Datos por cliente

- Ficheros: `dataDir/tenants/<tenantId>/files` (coherente con backup, `backup-tenant.ts:5`).
- Memoria, SOPs, tareas, business-records, audit: bajo la clave compuesta del `TenantScopedStore`.
- Bundle de cliente en repo: `clientes/_base`, `_example`, `agntia` (agency.json + sops.ts), `default`.
- Perfil de agencia como memorias: `scripts/lib/agency-bootstrap.ts:100-118`.

## 2. Lo que FALTA (lista completa)

### 2.1 Alta de cliente como operación única

1. **Un comando que cree un cliente entero** (registro + membership + perfil + schema + SOPs + roles + canal) desde `clientes/<nuevo>/`. Hoy: `bootstrap-agency` es sólo para `agntia`; `provision-client` asume que el tenant ya existe; el alta real es `POST /api/admin/tenants` a mano y luego tres pasos más.
2. **Validación del bundle antes de provisionar** (schema de `agency.json`, SOPs referenciando capacidades existentes, agentes con ids únicos). No hay `validateClientBundle`.
3. **Plantilla de cliente nueva** generada (`clientes/_base` no se copia ni se rellena automáticamente).
4. **Idempotencia y rollback de la provisión**: si falla el paso 4 de 7, hoy queda a medias sin marca de estado.

### 2.2 Personas y permisos dentro del cliente

5. **Invitaciones**: no existe flujo. Sólo el evento `portal.invited` (`engine/events/schemas.ts:943`) sin emisor ni consumidor.
6. **Membership con rol efectivo**: `role` se guarda (`engine/tenant.ts:113`) pero toda la administración exige `user.role === "admin"` global (`admin-tenants.ts:41`, `admin-clients.ts:64`, `auth-routes.ts:312-380`). Un `owner` de cliente no puede gestionar su empresa ni sus usuarios.
7. **Baja de un usuario de un cliente** (revocar membership sin borrar el usuario global).
8. **Auditoría de accesos por persona** dentro del cliente.

### 2.3 Aislamiento completo

9. **Google atado al tenant**: `app.ts:107` construye `new GoogleAuth(db, config)` con el store **crudo**; la credencial es por owner, así que el mismo usuario en dos empresas usa el mismo token. La versión tenant-aware existió en una rama cerrada, no en `main`.
10. **SMTP/remitente por cliente**: no hay identidad de envío por tenant; el signup usa una key global y ni siquiera envía.
11. **Stripe por cliente**: no hay `customerId` en el registro del tenant ni suscripción.
12. **Enrutado por dominio**: 0 referencias a `Host`/subdominio en el server; el campo `domain` del registro (`agency-bootstrap.ts:160`) se guarda y no se usa para resolver tenant.
13. **Corrección del `scan` del worker**: `TenantScopedStore.scan()` usa sólo el primer prefijo conocido (`db-tenant.ts:137`) y `scanByStatusWithCursor` filtra en memoria (`db-tenant.ts:188-210`). Con varios tenants vivos, el worker puede procesar de menos (o de más si el set está vacío).
14. **Aislamiento de datos fuera del Store**: búsqueda/embeddings, cache de browser por cliente y cualquier recurso en memoria no están cubiertos por la clave compuesta.

### 2.4 Configuración y credenciales por cliente

15. **Resolver de config en DB**: `DatabaseTenantConfigResolver` existe y **nadie lo instancia** (`database-resolver.ts:37`; `app.ts:252-260` devuelve env). Sin esto no hay modelos ni keys distintas por cliente.
16. **Credenciales por cliente gestionadas desde API/UI** (hoy: scripts y variables de entorno).
17. **Rotación y caducidad de credenciales de cliente** visible para el operador.

### 2.5 Operación

18. **Suspensión efectiva**: `tenant-state` se escribe y **no se lee** en ningún middleware. El kill switch no corta nada.
19. **Panel admin en la UI**: 0 referencias a `/api/admin` en `apps/web`. Todo es API/CLI.
20. **Onboarding guiado**: el endpoint es un diagnóstico de 4 booleanos.
21. **Aviso de cuota al cliente** (hoy la cuota se aplica en guardrails, sin comunicación ni histórico).
22. **Backup completo**: falta exportar/restaurar las filas de DB, no sólo ficheros y perfiles de browser.
23. **Restauración probada de un cliente completo** (existe restore de ficheros; no de datos).

### 2.6 Comercial

24. **Plan y precio por cliente** (el business-schema tiene `client.monthly_fee`, pero es un registro de negocio, no un plan que module cuotas).
25. **Facturación real**: Stripe stub, sin suscripción, sin webhook, sin conciliación con el tenant.
26. **Cobro y dunning** (impagos, aviso, suspensión automática).
27. **Medición facturable por cliente** (tokens y coste existen en `llm-usage` por tenant; no se convierten en línea de factura).

### 2.7 Salida

28. **Borrado real de un cliente**: `DELETE /api/admin/tenants/:id` borra sólo registro y estado; los datos quedan.
29. **Export completo por cliente** (datos + ficheros + audit en un paquete).
30. **Periodo de gracia y anonimización** antes del borrado.

## 3. Defectos concretos (no "faltantes": cosas que están y no funcionan)

1. **Kill switch inerte** — `admin-tenants.ts:89-121` escribe `system/tenant-state`; `grep -rn "tenant-state" apps/server/src` sólo devuelve `admin-tenants.ts`. Ninguna petición comprueba la suspensión.
2. **Google fuera del tenant** — `app.ts:107`: `new GoogleAuth(db, config)` con store crudo; `grep -n "tenantId" apps/server/src/google-auth.ts` no devuelve nada.
3. **Rol de membership decorativo** — `engine/tenant.ts:113-134` lo persiste; las rutas de administración comprueban `users.role`, no la membership.
4. **`provision-client` no crea clientes** — `scripts/provision-client.ts:30-190`: exige login de un admin existente y siembra SOPs/roles/usuarios; ni registro, ni membership, ni tenant.
5. **Registro y membership comparten kind** — `system/tenant-membership` (registro, id=tenantId) y `<userId>/tenant-membership` (membership única, id="default") usan el mismo `kind` con distinto owner/id. Funciona por convención, no por contrato.
6. **Signup a medias** — `auth-signup.ts:110-125` crea usuario y membership pero **no** el registro del tenant (no aparecerá en `/api/admin/tenants`), y `sendEmail` (`auth-signup.ts:176-182`) devuelve `skipped`: el flujo nunca entrega el enlace.
7. **Config por tenant inexistente de facto** — `app.ts:252-260` devuelve siempre `EnvTenantConfigResolver`.
8. **Backup incompleto** — `backup-tenant.ts:70` copia `files` y `browser-profiles`; las filas de `records` no entran.
9. **Sin UI de administración ni de cambio de empresa** — `switch-tenant` y `/api/admin/*` no tienen consumidor en `apps/web`.
10. **Sin dominio por cliente** — no hay resolución por `Host`/subdominio, aunque el registro guarde `domain`.

## 4. Matriz de cobertura

| Capacidad | Estado | Comentario |
|---|---|---|
| Identidad y sesión | **Existe** | JWT con claim de tenant, sesión con `tenantId`, fail-closed |
| Cambio de empresa | **Parcial** | Endpoint sí, UI no |
| Alta de cliente | **Parcial** | Manual + scripts; sin comando único ni bundle validado |
| Aislamiento de datos | **Parcial** | Clave compuesta sólida; Google, config y worker con huecos |
| RLS | **Existe (opcional)** | Sólo `MULTI_TENANT_SHARED=true` + Postgres |
| Config por cliente | **Parcial** | Modelo completo, resolver real no cableado |
| Credenciales por cliente | **Parcial** | WhatsApp sí; Google/Stripe/email no |
| Operación (salud, uso, cuota) | **Existe** | Cuota se aplica; suspensión no |
| Comercial | **No existe** | Stripe stub sin vínculo a tenant |
| Offboarding | **No existe** | Sin borrado real ni export completo |

## 5. Orden recomendado para cerrar la transversal

1. **Enforcement**: leer `tenant-state` en el middleware (403 `TENANT_SUSPENDED`) y autorizar administración por membership (`owner|admin`) además del rol global. Dos cambios pequeños, dos agujeros cerrados.
2. **Alta atómica**: un `provisionTenant(bundle)` único con validación previa, estado de provisión y rollback; `bootstrap-agency` pasa a ser un caso particular.
3. **Credenciales por cliente**: Google con `currentTenantScope()`, remitente por tenant, `customerId` de Stripe en el registro.
4. **Salida**: export completo (datos + ficheros + audit) y borrado con gracia.
5. **UI**: panel de clientes y selector de empresa sobre las rutas que ya existen.

## 6. Evidencia reproducible

```bash
git log -1 --format=%H origin/main            # 5490a49
grep -rn "tenant-state" apps/server/src        # sólo admin-tenants.ts
grep -n "tenantId" apps/server/src/google-auth.ts   # vacío
grep -rn "new GoogleAuth" apps/server/src      # app.ts:107 con store crudo
grep -rn "switch-tenant" apps/web/src          # vacío
grep -rln "api/admin" apps/web/src             # vacío
grep -rn "addMembership" apps/server/src scripts   # engine/tenant.ts, actors, agency-bootstrap
grep -rn "guardrail-quotas" apps/server/src    # escritura + lectura en guardrails
grep -n "files\", \"browser-profiles" apps/server/src/backup-tenant.ts  # backup parcial
```
