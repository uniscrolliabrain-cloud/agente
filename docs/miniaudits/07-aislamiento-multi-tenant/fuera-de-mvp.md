<!-- FUERA_MVP_07_V1 -->
# Fuera del MVP — aislamiento multi-tenant

> v1 · 
2026-10-21
 · Creado por la campaña. Aspectos del miniaudit que NO cierra esta campaña.

## Criterio

El MVP cierra clone-por-cliente. Todo lo que requiere SaaS compartido (membresías, RLS activa, cuotas, billing, switcher) queda fuera.

## Aspectos fuera del MVP

| ID | Aspecto | Motivo | Fase futura |
|---|---|---|---|
| D4 | collectActiveTenants escanea 5000 filas | service.ts no verificado | Fase 3 |
| D5 | maintainTenant secuencial | service.ts no verificado | Fase 3 |
| D6 | takeForTenant solo en createTask | pendiente cablear chat/RAG/files | Fase 3 |
| D9 | RLS opcional, no por defecto | requiere Postgres real + MULTI_TENANT_SHARED=true | Fase 4 |
| D11 | Sin auditoría cross-tenant | requiere logContext.tenantId | Fase 2 |
| D12 | onboarding sin verificar tenant | onboarding*.ts no verificado | Fase 2 |
| D13 | Sin tenantId en respuestas HTTP | parcial en /notifications | Fase 2 |
| D14 | Sin elegir tenant activo | requiere /api/auth/switch-tenant | Fase 2 |
| D15 | Migración owner→tenant sin transacción | requiere scripts/migrate-tenant-scope.ts | Fase 1 |
| D17 | audit-entries sin tenant check | requiere kernel/audit/ | Fase 2 |
| D20 | Sin tenant switcher frontend | requiere useAuth.ts + UI | Fase 5 |
| D21 | Scans globales en service.ts | service.ts no verificado | Fase 3 |
| D23 | records.owner es string, no tenant_id columna | requiere migración de esquema | Fase 1 |
| D24 | tenant_members/tenant_configs no existen | requiere tablas nuevas | Fase 1 |
| D25 | logContext sin tenantId | requiere request-logger.ts | Fase 2 |
| D26 | DatabaseTenantConfigResolver no inyectado | requiere tenant_configs | Fase 2 |
| D27 | backup-tenant.ts busca ruta incorrecta | requiere alinear dataDir | Fase 3 |
| D28 | computer-routes/computer-tools hardcodean default | requiere computer*.ts | Fase 2 |
| D29 | Sin usage_events/tenant_quotas | requiere billing | Fase 4 |

## Decisiones pendientes

1. ¿SaaS compartido o clone-por-cliente permanente?
2. ¿Supabase Auth o auth propia?
3. ¿Postgres con RLS o store propio?
4. ¿Billing el día 1 o después?

