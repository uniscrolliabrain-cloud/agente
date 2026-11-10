# E02 · Auditoría de aislamiento

**Etapa**: E02 de `ACME_CAMPAIGN_V1`
**Rama**: `feat/acme-tenant`
**Estado**: completada (auditoría, sin cambios de código)
**Método**: lectura de `app.ts` (middleware), `tenant-principal.ts`, `engine/tenant.ts`, `db-tenant.ts`, `db-rls.ts`, `admin-tenants.ts` y barrido de `c.get("tenantId")` en todo `apps/server/src`.

---

## 1. Cómo se resuelve el tenant

Precedencia en `apps/server/src/app.ts` (middleware, ~L610–L700):

| Orden | Fuente | Condición | `source` |
|---|---|---|---|
| 1 | JWT (`actor.tenantId`) | solo si el usuario tiene membership en ese tenant | `jwt` |
| 2 | Tenant elegido en sesión (`/api/auth/switch-tenant`) | solo si sigue siendo miembro | `session` |
| 3 | Membership durable (`tenant-membership` / `user-tenants`) | — | `membership` |
| 4 | `"default"` | solo con `legacyFallbackAllowed` (`mode === "sample"` o `authProvider === "session"`) | `legacy-default` |

- `legacyFallbackAllowed` se calcula en el middleware como `config.mode === "sample" || config.authProvider === "session"`.
- El tenant resuelto se publica en el contexto (`c.set("ctx", { tenantId })`), en la cabecera de respuesta `X-Tenant-Id` y en `runInTenantScope({ tenantId, actorId })` (`tenant-scope.ts`, `AsyncLocalStorage`).
- La resolución es única: `resolveTenantPrincipal` (`tenant-principal.ts`) concentra tenant, actor, membership y requestId.

## 2. Códigos de fallo (y cuándo)

| Código | HTTP | Cuándo |
|---|---|---|
| `NO_MEMBERSHIP` | 403 | Hay tenant resuelto solo por fallback legacy y el despliegue no lo permite |
| `TENANT_MISMATCH` | 403 | El JWT declara un tenant del que no es miembro, o se pide un `tenantId` distinto del resuelto |
| `TENANT_SUSPENDED` | 403 | `system/tenant-state/<tenantId>` marca `suspended: true` |
| `DB_UNAVAILABLE` | 503 | Fallo del store al resolver membership o al comprobar el estado |

Reglas verificadas en `tenant-principal.ts`:
- Un fallo de DB **nunca** cae a `default` (era el bug de `FALLBACK_TENANT_V1`).
- El tenant de sesión solo se acepta si sigue habiendo membership (`SESSION_TENANT_CHOICE_V1`).
- El kill switch se consulta sobre el tenant ya elegido, también con JWT (`TENANT_SUSPENSION_GUARD_V1`).

## 3. Dónde puede venir el tenant del cliente

| Punto | Validación | Estado |
|---|---|---|
| `?tenantId=` en query | entra como `requestedTenant` → `TENANT_QUERY_GUARD_V1` (403 si difiere) | Seguro |
| Cabecera `x-tenant-id` | igual que el anterior | Seguro |
| `X-Tenant-Id` de respuesta | se emite desde el ctx resuelto, no desde la petición | Seguro (permite verificar) |
| Cuerpo de la petición (`tenantId`) | `validateTenantInBody` (`APP_TENANT_REQUEST_VALIDATE_BODY_V1`, `app.ts:68`): compara con `tenantIdFor(owner)`, registra `http.cross_tenant_attempt` y lanza 403. **Solo se aplica en `/api/agent/*`** (`app.ts:726`) | Parcial → **H17** |
| `WorkspaceContext` en rutas de workspace | `tenantId` sale de `c.get("tenantId")` | **Hallazgo H11** |

## 4. Almacenamiento

`db-tenant.ts` (`TENANT_SCOPED_STORE_V1`):
- Clave compuesta `${tenantId}:${owner}`; `tenantPrefix()` **lanza** si el tenant está vacío o contiene `:`.
- `get/list/put/remove/compareAndSwap/insertIfAbsent/claim/take` pasan todos por `key(owner)`.
- `scanByPrefix(kind, tenantId, limit)` filtra por prefijo en SQL; `scan()` recorre los prefijos vistos (`TENANT_SCAN_ALL_PREFIXES_V1`) y hace `peel` del owner.

Consecuencia para ACME: cualquier escritura con owner de ACME queda bajo `acme:<owner>` **solo si** la membership ya existe en el momento del `put`. En `sample` el fallback a `default` está permitido, así que sembrar antes de crear la membership escribiría en el tenant equivocado.

## 5. RLS

`db-rls.ts`:
- `enableRls` solo actúa si `store.backend === "postgres"` **y** `MULTI_TENANT_SHARED === "true"`.
- Añade `tenant_id` con backfill `'default'`, índice compuesto, política `tenant_id = current_setting('app.tenant_id', true)` y `FORCE ROW LEVEL SECURITY`.
- `withTenantRls` hace `set_config('app.tenant_id', $1, true)` dentro de `store.transaction()` (`TENANT_RLS_TX_V1`); fuera de postgres+shared es un pass-through.

Consecuencia: en desarrollo (PGlite) **no hay RLS**, el aislamiento depende del prefijo del store. Los tests de E05 deben probar el store, no confiar en RLS.

## 6. Suspensión y administración

`admin-tenants.ts`:
- Registro de tenants en `system/tenant-membership` (namespace global, no datos de tenant).
- Kill switch en `system/tenant-state` con motivo, autor y fecha.
- `tenantId` validado con `^[a-z0-9-]{1,64}$`.

`engine/tenant.ts`:
- `setMembership(owner, tenantId)` escribe la membership única e invalida **toda** la caché (`MEMBERSHIP_CACHE_INVALIDATE_V1`).
- `addMembership(userId, tenantId, role)` da de alta `(user, tenant)` idempotente e invalida la caché del usuario; no toca la membership única.
- `resolve()` cachea el fallback a `default` con TTL (5 min por defecto, `TENANT_CACHE_TTL_MS`); `resolveStrict()` es la que usa el principal.
- `assertNotHardcodedTenantId` prohíbe `"default"` fuera de su constante.

## 7. Hallazgos de esta etapa

| # | Hallazgo | Impacto en ACME | Etapa |
|---|---|---|---|
| H11 | `routes/workspaces.ts` usa `tenantId = c.get("tenantId") ?? owner` en **tres** endpoints (`/view`, `/command`, `/query`), no solo en `/view` | Si el contexto no trae tenant, el owner se usa como tenant: scope incorrecto en las vistas ACME | E17 |
| H12 | En `sample`, el fallback legacy a `default` está permitido | Sembrar ACME antes de crear membership escribiría en `default` | E06 antes de E07 |
| H13 | Sin `MULTI_TENANT_SHARED=true` o en PGlite, RLS no aplica | El aislamiento en dev depende solo del prefijo del store | E05 (tests de store) |
| H14 | `resolve()` cachea el fallback a `default` durante el TTL | Tras crear la membership hay que invalidar (ya lo hace `setMembership`/`addMembership`, pero el seed debe usar el mismo camino) | E06 |
| H15 | `leads-routes.ts` y `voice-routes.ts` leen `c.get("tenantId")` sin fallback a owner | Correcto; sirve de patrón para E15 | — |
| H16 | La cabecera `X-Tenant-Id` de respuesta sale del ctx, no de la petición | Permite que el cliente web verifique el tenant de cada respuesta | E17, E18 |
| H17 | `validateTenantInBody` solo cubre el prefijo `/api/agent` | Un `tenantId` cruzado en el body de otras rutas no se rechaza explícitamente; los handlers de workspace deben leer el tenant del ctx y nunca del body | E17 |

## 8. Guardas que hereda la campaña

- **G1** La membership de `acme` existe antes de cualquier `put` del seed (E06 → E07).
- **G2** Ningún owner compartido entre `acme` y `default`; owners con prefijo `acme-`.
- **G3** Cada escritura del seed asserta que el tenant resuelto es `acme` antes de escribir.
- **G4** Los handlers de workspace usan `ctx.tenantId` y lo validan con Zod de entrada (`tenantId` del body, si aparece, se compara y se rechaza si no cuadra — el guard `validateTenantInBody` de `app.ts` no cubre `/api/workspaces`).
- **G5** Test de no fuga bidireccional (store y HTTP) en E05.
- **G6** Documentar si el entorno de verificación corre con o sin RLS, y no apoyarse en ella.
- **G7** Probar la suspensión de `acme` al cierre (E20).
- **G8** Cero literales `"default"` fuera de `DEFAULT_TENANT_ID`.

## 9. Conclusión

El aislamiento del repo es sólido: resolución única, códigos explícitos, store con prefijo validado, RLS transaccional y kill switch. El único punto de scope dudoso es el fallback `tenantId ?? owner` de las rutas de workspace (H11), que la campaña cierra en E17 con test HTTP. Con las guardas G1–G8, ACME puede añadirse sin tocar la lógica existente.
