<!-- MISSED_FASE4_DEFERRED_V1 -->
# Fase 4 — fixes del doc 05 no aplicados o parciales

> Generado tras la revisión del chat de Fase 4 contra el documento 05
> (`campaña1-fase4.txt`). **La Fase 4 no se puede declarar cerrada hasta
> que estos 4 puntos estén resueltos o explícitamente aparcados a Fase 5/6/7.**
> Los misses de ejecución de los patchsets van en `_multitenant_pendientes.md`;
> este fichero es el resumen de **cobertura**, no de errores de patchset.

## Estado de los 6 fixes que pide el doc 05

| Fix | Marca | Doc 05 §10 | Estado real (chat) |
|---|---|---|---|
| F03.30 | `RLS_TX_REQUIRED_V1` | `withTenantRls` transaccional | **Throw ruidoso, no fix**. `store.transaction` no comparte conexión con `store.select` (pg.Pool max:5). Pendiente refactor de `db.ts` para `transactionWithConnection`. |
| F03.38 | `RLS_REQUIRED_IN_SHARED_V1` | throw si shared+pglite | ✅ Aplicado en BLOQUE 02. |
| F03.11 | `AUDIT_STORE_TENANT_V1` | guard en `StoreAuditStore.append` | ❌ **No aplicado.** No hay ningún `Select-String` con la marca en el chat. |
| F03.35 | `TENANT_BODY_VALIDATE_V1` | 4 middlewares `app.use("/api/<ruta>/*")` + path en admin | **Parcial**: solo path en `admin-routes.ts` y `admin-tenants.ts`. Los 4 middlewares de body no existen. Guarda preventiva, deuda reconocida. |
| F03.31 | `TENANT_CROSS_AUDIT_V1` | `auditCrossTenant` en 3 handlers de `admin-routes.ts` + hook en `app.onError` | ❌ **No aplicado.** No hay ningún `Select-String` con la marca en el chat. |
| F04.21 | `TENANT_HEADER_RESPONSE_V1` | middleware `app.ts` con `X-Tenant-Id` + `logContext.tenantId` | ❌ **No aplicado.** No hay ningún `Select-String` con la marca en el chat. **La deuda de N08 (Fase 3) sigue abierta.** |

## Misses concretos

### [2026-10-21] [Fase 4] [F03.11] `AUDIT_STORE_TENANT_V1` no aplicado

- **Síntoma:** no hay `Select-String` de `AUDIT_STORE_TENANT_V1` en `apps/server/src/kernel/audit/store-store.ts` en el chat de Fase 4.
- **Esperado:** guard `if (process.env.MULTI_TENANT_SHARED === "true") assertNotHardcodedTenantId(input.tenantId, "StoreAuditStore.append")` al principio de `append()`.
- **Real:** `append()` sigue aceptando `tenantId="default"` en shared sin lanzar.
- **Bloquea:** auditoría SOC 2 con tenantId real; un audit con `"default"` en shared contamina el namespace.
- **Acción pendiente:** aplicar BLOQUE 04-bis (definido en el chat de revisión). Requiere `store-store.ts` (no está en el Repomix actual, se puede pasar en un Repomix de 1 fichero).
- **Fichero/línea:** `apps/server/src/kernel/audit/store-store.ts`, `async append(input: AuditAppendInput): Promise<AuditEntry> {`.

### [2026-10-21] [Fase 4] [F03.31] `TENANT_CROSS_AUDIT_V1` no aplicado

- **Síntoma:** no hay `Select-String` de `TENANT_CROSS_AUDIT_V1` en `apps/server/src/admin-routes.ts` en el chat de Fase 4.
- **Esperado:** `auditCrossTenant(adminOwner, tenantId, action)` que escribe en `audit-entries` bajo el `tenantId` objetivo; 3 llamadas en `GET /tenants/:tenantId/usage`, `GET /tenants/:tenantId/audit-export`, `PUT /tenants/:tenantId/business-schema`.
- **Real:** los 3 handlers no dejan traza de acceso cross-tenant.
- **Bloquea:** auditoría SOC 2 de accesos admin a tenants ajenos; sin esto no hay evidencia de quién miró qué.
- **Acción pendiente:** aplicar BLOQUE 04 (definido en el chat de Fase 4).
- **Fichero/línea:** `apps/server/src/admin-routes.ts`, handlers de `usage`, `audit-export`, `business-schema`.

### [2026-10-21] [Fase 4] [F04.21] `TENANT_HEADER_RESPONSE_V1` no aplicado

- **Síntoma:** no hay `Select-String` de `TENANT_HEADER_RESPONSE_V1` en `apps/server/src/app.ts` en el chat de Fase 4.
- **Esperado:** middleware de auth que resuelve `tenantId` con `tenantService.tenantIdFor(owner)` y añade `X-Tenant-Id` al response + `logContext.enterWith({ ..., tenantId })`.
- **Real:** el cliente no recibe `X-Tenant-Id`. La deuda de N08 (Fase 3) sigue abierta: `requestLogger` corre antes del auth, así que `tenantId` no se resuelve en logs hasta que Fase 4 lo cierre.
- **Bloquea:** observabilidad multi-tenant real y cliente informado del tenant activo.
- **Acción pendiente:** aplicar BLOQUE 05 (definido en el chat de Fase 4).
- **Fichero/línea:** `apps/server/src/app.ts`, middleware `app.use("/api/*", async (c, next) => { ... })`.

### [2026-10-21] [Fase 4] [F03.35] middlewares de body no aplicados (parcial)

- **Síntoma:** el doc 05 §10 define 4 middlewares `app.use("/api/agent/*")`, `/api/rag/*`, `/api/threads/*`, `/api/projects/*` que clonan el body y llaman a `validateTenantInBody`. En el chat solo se aplicó la validación de path en admin.
- **Esperado:** los 4 middlewares existen en `app.ts` y devuelven 403 `TENANT_MISMATCH` si el body trae `tenantId` y no coincide con el del owner.
- **Real:** ningún handler de agent/rag/threads/projects valida `tenantId` del body. `engine/routes.ts` no parsea `tenantId` en `createTaskSchema`, así que hoy ningún body lo lleva; el helper sería guarda preventiva.
- **Bloquea:** si en el futuro un cliente envía `tenantId` en el body (p. ej. script o curl manual), no se valida contra el owner. Aceptable como deuda si el modelo es clone-por-cliente; **no aceptable si se arranca SaaS compartido**.
- **Acción pendiente:** aplicar los 4 middlewares cuando el modelo pase a shared (Fase 5 o Campaña 2). En clone-por-cliente se queda como deuda documentada.
- **Fichero/línea:** `apps/server/src/app.ts`, antes de `app.route("/api/agent", ...)`, `/api/rag`, `/api/threads`, `/api/projects`.

### [2026-10-21] [Fase 4] [F03.30] fix real pendiente (throw es parada, no arreglo)

- **Síntoma:** `RLS_TX_REQUIRED_V1` lanza error en `withTenantRls` en lugar de arreglar la transacción. El propio comentario del bloque lo reconoce.
- **Esperado:** `set_config` y la query comparten conexión (`transactionWithConnection(conn, fn)` en `Store`).
- **Real:** `store.transaction()` hace `BEGIN` sobre `this.db` (pg.Pool max:5) y `store.select()` dentro del callback coge otra conexión del pool. `set_config(..., is_local=true)` se pierde.
- **Bloquea:** RLS activa de verdad en shared. Sin esto, `RLS_REQUIRED_IN_SHARED_V1` puede pasar en el arranque pero las queries no respetan el tenant.
- **Acción pendiente:** refactor de `apps/server/src/db.ts` para exponer `transactionWithConnection`. Va a Campaña 2 (Fase 6 de Campaña 2 si se arranca) o a un hotfix si se necesita RLS antes.
- **Fichero/línea:** `apps/server/src/db.ts` (`transaction`) + `apps/server/src/db-rls.ts` (`withTenantRls`).

## Lo que NO es miss (aplicado o justificado)

- **F03.38** `RLS_REQUIRED_IN_SHARED_V1`: aplicado y verificado.
- **F03.35 path** (`TENANT_BODY_VALIDATE_V1` en `admin-routes.ts` y `admin-tenants.ts`): aplicado; solo la parte de body es miss.
- **F04.16d** (browser/computer rate limit): pospuesto explícitamente a Fase 6, no es miss.
- **N06** (`Config.multiTenantShared`): opcional, Fase 8, no es miss.
- **F02.10** (tests): congelado por instrucción, no es miss.

## Cómo cerrar este fichero

Cuando se apliquen F03.11, F03.31 y F04.21 (y opcionalmente los middlewares de F03.35 y el refactor de F03.30), este fichero se actualiza con la marca `MISSED_FASE4_RESOLVED_V1` y una tabla de estado. Hasta entonces, **Fase 4 no está cerrada**; está en estado "aplicada la parte segura, pendiente la parte cross-tenant y el header".