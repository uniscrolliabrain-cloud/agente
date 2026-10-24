<!-- FUERA_MVP_07_V1 -->
# Fuera del MVP — aislamiento multi-tenant

> v1 · 2026-10-17
> Documenta los 21 aspectos del miniaudit que NO se cierran en esta campaña.
> Los documentos previos están archivados en `old/`.

## Criterio

El MVP cierra el modelo **clone-por-cliente** con 6 fixes y 1 test. Todo lo que
requiere SaaS compartido (membresías, RLS activa, cuotas, billing, switcher) queda fuera.

## Aspectos fuera del MVP

| ID | Aspecto | Motivo | Fase futura | Dependencia |
|---|---|---|---|---|
| D4 | `collectActiveTenants` escanea 5000 filas | Requiere `service.ts`, no incluido en Repomix | Fase 3 | benchmark |
| D5 | `maintainTenant` secuencial | Requiere `service.ts` | Fase 3 | benchmark |
| D6 | `takeForTenant` solo en `createTask` | Requiere cablear chat/RAG/files | Fase 3 | rate-limit |
| D7 | `scanByOwnerPrefix` sin índice | Requiere medir plan de consulta real | Fase 6 | benchmark |
| D9 | RLS opcional, no por defecto | Requiere Postgres real + `MULTI_TENANT_SHARED=true` | Fase 4 | decisión DB |
| D11 | Sin auditoría cross-tenant | Requiere `logContext.tenantId` | Fase 2 | observabilidad |
| D12 | `onboarding` sin verificar tenant | Requiere `onboarding*.ts`, no incluido | Fase 2 | membresías |
| D13 | Sin `tenantId` en respuestas HTTP | Parcialmente cubierto por PS06 en `/notifications` | Fase 2 | contrato HTTP |
| D14 | Sin elegir tenant activo | Requiere `/api/auth/switch-tenant` | Fase 2 | membresías |
| D15 | Migración `owner→tenant` sin transacción | Requiere `scripts/migrate-tenant-scope.ts` | Fase 1 | migración |
| D17 | `audit-entries` sin tenant check | Requiere `kernel/audit/` | Fase 2 | kernel |
| D20 | Sin tenant switcher frontend | Requiere `useAuth.ts` + UI | Fase 5 | D14 |
| D21 | Scans globales en `service.ts` | Requiere `service.ts` | Fase 3 | D4+D5 |
| D23 | `records.owner` es string, no `tenant_id` columna | Requiere migración de esquema | Fase 1 | D15 |
| D24 | `tenant_members`/`tenant_configs` no existen | Requiere tablas nuevas | Fase 1 | migración |
| D25 | `logContext` sin `tenantId` | Requiere `request-logger.ts` | Fase 2 | observabilidad |
| D26 | `DatabaseTenantConfigResolver` no inyectado | Requiere `tenant_configs` | Fase 2 | D24 |
| D27 | `backup-tenant.ts` busca ruta incorrecta | Requiere alinear `dataDir` | Fase 3 | operaciones |
| D28 | `computer-routes`/`computer-tools` hardcodean `default` | Requiere `computer*.ts`, no incluido | Fase 2 | membresías |
| D29 | Sin `usage_events`/`tenant_quotas` | Requiere billing | Fase 4 | cuotas |

## Decisiones pendientes

1. ¿SaaS compartido o clone-por-cliente permanente? (define si D9/D14/D24 se implementan).
2. ¿Supabase Auth o auth propia? Ver `estado-supabase.md` generado por PS01.
3. ¿Postgres con RLS o store propio? Define si D9 es aplicable.
4. ¿Billing el día 1 o después? Define D29.
