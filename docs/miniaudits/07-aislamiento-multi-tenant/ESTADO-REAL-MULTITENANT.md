# ESTADO REAL MULTITENANT

Marca: ESTADO_REAL_MULTITENANT_V1

## Marcas (27)

| Marca | Existe |
|---|---|
| APP_FILES_IMPORT_TENANT_V1 | NO |
| TENANT_SCAN_ALL_PREFIXES_V1 | NO |
| TENANT_SCAN_ALL_PREFIXES_FIX_V1 | NO |
| TENANT_SCAN_STATUS_ISOLATION_V1 | NO |
| TENANT_SCAN_STATUS_CURSOR_ISOLATION_V1 | NO |
| APP_TENANT_REQUEST_VALIDATE_V1 | NO |
| ROUTES_NOTIFICATIONS_TENANT_V1 | NO |
| DB_RLS_TX_CONTEXT_V1 | NO |
| DB_RLS_ENABLED_FLAG_V1 | NO |
| DB_RLS_TENANT_CTX_V1 | NO |
| TENANT_HTTP_E2E_V1 | NO |
| TENANT_DEFAULT_STRICT_V1 | NO |
| TENANT_ASSERT_NOT_DEFAULT_V1 | NO |
| ADMIN_TENANTS_MEMBERSHIP_CACHE_V1 | NO |
| TENANT_PEEL_GUARD_V1 | NO |
| LOG_CONTEXT_TENANT_V1 | NO |
| TENANT_RATE_LIMITER_FIELD_V1 | NO |
| TENANT_RATE_LIMITER_WIRE_V1 | NO |
| TAKE_FOR_TENANT_CHAT_V1 | NO |
| TAKE_FOR_TENANT_RAG_V1 | NO |
| TAKE_FOR_TENANT_THREADS_V1 | NO |
| TENANT_RLS_TX_V1 | NO |
| RLS_REQUIRED_IN_SHARED_V1 | NO |
| AUDIT_STORE_TENANT_V1 | NO |
| COMPUTER_IDENTITY_TENANT_V1 | NO |
| COMPUTER_ROUTES_TENANT_V1 | NO |
| COMPUTER_TOOLS_TENANT_V1 | NO |

Resumen: 0 presentes, 27 ausentes.
## Fase 0 - marcas de verificacion

- ESTADO_REAL_PS01B_V1 (Git verificado)
- ESTADO_REAL_PS01C_V1 (Entorno verificado)
- ESTADO_REAL_PS01D_V1 (Ficheros clave)
<!-- ESTADO_REAL_FINAL_V1 -->
## Confirmación final de la Campaña 1 (Fase 8)

### Marcas aplicadas (confirmadas en código)

| Marca | Fichero | Estado |
|---|---|---|
| `LOG_CONTEXT_TENANT_V1` | `middleware/request-logger.ts` | Confirmada (Fase 3) |
| `TENANT_RATE_LIMIT_PUBLIC_V1` | `engine/service.ts` | Confirmada (Fase 3) |
| `TENANT_RATE_LIMITER_WIRE_V1` | `app.ts` | Confirmada (Fase 3) |
| `TENANT_RATE_LIMITER_WIRE_ROUTES_V1` | `app.ts` | Confirmada (Fase 3) |
| `TAKE_FOR_TENANT_RAG_V1` | `rag-routes.ts` | Confirmada (Fase 3) |
| `TAKE_FOR_TENANT_THREADS_V1` | `threads-routes.ts` | Confirmada (Fase 3) |
| `DB_TENANT_PEEL_V1` | `db-tenant.ts` | Confirmada (Fase 2) |
| `TENANT_SCAN_PEEL_V1` | `db-tenant.ts` | Confirmada (Fase 2) |
| `TENANT_RLS_TX_V1` | `db-rls.ts` | Confirmada (Fase 4) |
| `RLS_REQUIRED_IN_SHARED_V1` | `index.ts` | Confirmada (Fase 4) |
| `AUDIT_STORE_TENANT_V1` | `kernel/audit/store-store.ts` | Confirmada (Fase 4) |
| `APP_TENANT_REQUEST_VALIDATE_BODY_V1` | `app.ts` | Confirmada (Fase 4) |
| `TENANT_CROSS_AUDIT_V1` | `admin-routes.ts` | Confirmada (Fase 4) |
| `RESPONSE_TENANT_HEADER_V1` | `app.ts` | Confirmada (Fase 4) |
| `COMPUTER_IDENTITY_TENANT_V1` | `computer.ts` | Confirmada (Fase 5) |
| `COMPUTER_ROUTES_TENANT_V1` | `computer-routes.ts` | Confirmada (Fase 5) |
| `COMPUTER_TOOLS_TENANT_V1` | `computer-tools.ts` | Confirmada (Fase 5) |
| `COMPUTER_ROUTES_WIRE_V1` | `app.ts` | Confirmada (Fase 5) |
| `COMPUTER_TOOLS_WIRE_V1` | `engine/conversation.ts` | Confirmada (Fase 5) |
| `BACKUP_TENANT_PATH_V1` | `backup-tenant.ts` | Confirmada (Fase 5) |
| `TAKE_FOR_TENANT_BROWSER_V1` | `browser.ts` | Confirmada (Fase 6) |
| `BROWSER_IMPORTS_TENANT_V1` | `browser.ts` | Confirmada (Fase 6) |
| `TAKE_FOR_TENANT_COMPUTER_V1` | `computer.ts` | Confirmada (Fase 6) |
| `METRICS_TENANT_LABEL_V1` | `request-logger.ts` + `metrics/registry.ts` | Confirmada (Fase 6) |
| `METRICS_EXPORTER_TENANT_V1` | `metrics/registry.ts` + `metrics-exporter.ts` | Confirmada (Fase 6) |
| `NOTIFICATION_PREFS_TENANT_V1` | `notification-prefs.ts` | Confirmada (Fase 6) |
| `NOTIFICATIONS_STREAM_TENANT_V1` | `notifications-stream.ts` | Confirmada (Fase 6) |
| `TENANT_ASSERT_NOT_DEFAULT_WIRED_V1` | `computer-routes.ts`, `computer-tools.ts`, `notification-prefs.ts` | Confirmada (Fase 6) |
| `TAKE_FOR_TENANT_TENANTID_V1` | `conversation.ts`, `rag-routes.ts`, `threads-routes.ts` | Confirmada (Fase 6) |
| `TENANT_LIMITER_WIRE_BROWSER_COMPUTER_V1` | `app.ts` | Confirmada (Fase 6) |
| `TENANT_WIRE_NOTIFICATIONS_V1` | `app.ts` | Confirmada (Fase 6) |
| `TENANT_LIMITER_ORDER_V1` | `app.ts` | Confirmada (Fase 6) |
| `MEMBERSHIP_CACHE_INVALIDATE_V1` | `engine/tenant.ts` | Confirmada parcial (Fase 7; evento pospuesto) |
| `SWITCH_TENANT_ENDPOINT_V1` | `auth-routes.ts` | Confirmada (Fase 7) |
| `ADMIN_TENANTS_CRUD_V1` | `admin-tenants.ts` | Confirmada (Fase 7) |
| `MIGRATE_SCOPE_TX_V1` | `scripts/migrate-tenant-scope.ts` | Confirmada (Fase 7) |

### `"default"` residual

- **`DEFAULT_TENANT_ID = "default"`**: legítimo, es la constante.
- **`.default("default")` en `views.ts`**: legítimo, es `action.kind` (UI).
- **`FALLBACK_TENANT_V1` en `app.ts` `/api/files`**: deuda documentada en `-pendientes.md`.
- **`catch(() => "default")`**: legítimo, es fallback de resolución.

No hay `"default"` hardcodeado fuera de los usos legítimos.

### Estado de las deudas

Ver `MULTITENANT_PENDIENTES_FINAL_V1` en `-pendientes.md`. Las deudas principales están clasificadas por bloqueante (Campaña 2) o por fase de limpieza.