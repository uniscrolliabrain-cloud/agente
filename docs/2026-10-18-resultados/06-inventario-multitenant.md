# 06 - Inventario multi-tenant

## Evidencia local

- `TenantScopedStore` compone `tenantId:owner`.
- `app.ts` construye `Files`, `RagService` y `WorkspaceService` sobre `tdbEarly`; coincide con el falso positivo D1 descrito por el solicitante.
- La clave `(owner, kind, id)` es visible en las definiciones de store; el D8 del prompt dice que el indice existe, pendiente de reconciliar con la fuente de cierre.
- `TenantService.setMembership` escribe la membership con id fijo `"default"` e invalida la cache local inmediatamente; coincide con D2 comunicado.
- Las pruebas de concurrencia para 50 tenants pasaron.

## Afirmaciones recibidas, pendientes de confirmar

El prompt enumera `APP_FILES_IMPORT_TENANT_V1`, `TENANT_SCAN_ALL_PREFIXES_V1`, `APP_TENANT_REQUEST_VALIDATE_V1`, `ROUTES_NOTIFICATIONS_TENANT_V1`, `DB_RLS_TX_CONTEXT_V1` y `TENANT_HTTP_E2E_V1`. El test E2E ahora existe en forma de escenario, pero no se ejecuto. Las demas marcas deben validarse contra los ficheros fuente originales, no disponibles en este checkout.

## Limites de lo comprobado

- No se valido RLS en una base PostgreSQL compartida.
- No se valido un request que intente falsificar tenantId.
- No se valido importacion HTTP de Files ni el flujo completo de notifications.
- El audit de tenant-default marca 16 referencias. Entre ellas hay ocurrencias de UI `"default"` y IDs de membership; no deben aceptarse o descartarse sin triage.
