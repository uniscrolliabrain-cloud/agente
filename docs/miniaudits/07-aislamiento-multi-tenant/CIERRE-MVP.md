<!-- CIERRE_MVP_07_V1 -->
# Cierre MVP — aislamiento multi-tenant (clone-por-cliente)

> v1 · 
2026-10-21
 · Creado por la campaña. Verifica M1–M6 contra el código real, no contra el plan.

## Condiciones del MVP y evidencia

| # | Condición | Marca | Estado |
|---|---|---|---|
| M1 | files.import no hardcodea default | APP_FILES_IMPORT_TENANT_V1: NO | verificado en vivo |
| M2 | scan() no filtra por un solo tenant | TENANT_SCAN_ALL_PREFIXES_V1: NO | verificado en vivo |
| M3 | tenantId de request validado contra owner | APP_TENANT_REQUEST_VALIDATE_V1: NO | verificado en vivo |
| M4 | /notifications incluye tenantId | ROUTES_NOTIFICATIONS_TENANT_V1: NO | verificado en vivo |
| M5 | withTenantRls usa misma transacción | DB_RLS_TX_CONTEXT_V1: NO | verificado en vivo |
| M6 | Test E2E multi-tenant | TENANT_HTTP_E2E_V1: NO | verificado en vivo |

## Qué se puede afirmar

- Solo lo que la columna Estado diga. Si dice NO, la condición NO se cumple.

## Qué NO se puede afirmar

- SaaS compartido listo.
- RLS protegiendo en producción.
- Cuotas aplicadas a chat/RAG/files.
- Tenant switcher existe.

